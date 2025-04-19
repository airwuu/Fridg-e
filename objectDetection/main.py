import asyncio
import cv2
import streamlit as st
import time
import numpy as np
from ultralytics import YOLO
from collections import Counter
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore 
import shelfLifeAI
import bottleAI
import os
from dotenv import load_dotenv

load_dotenv()
GEM_API_KEY = os.getenv('NEXT_PUBLIC_GEMINI_API_KEY')
FIREBASE_CRED = "./fridge.json"  


model = YOLO("./model/yolo11m.pt")
camera = '/dev/video0'
cap = cv2.VideoCapture(camera)
DOOR_DELAY = 2
experimental_bottle_recognition = True
whitelist = {
    "banana", "apple", "sandwich", "orange", "carrot",
    "pizza", "cake", "bottle", "cup"
}


## firebase loging things
try:
    cred = credentials.Certificate(FIREBASE_CRED)
    firebase_admin.initialize_app(cred)
    print("Firebase Admin SDK initialized successfully.")

    db_client = firestore.client()
    print("Firestore client obtained.")

    fridge_collection_name = 'fridges'
    door_doc_ref = db_client.collection(fridge_collection_name).document(fridge_document_id)
    print(f"Firestore document reference created for: {door_doc_ref.path}")
    door_status_field = 'door_is_open'

except ValueError as e:
    if "The default Firebase app already exists" in str(e):
        print("Firebase Admin SDK already initialized.")
        db_client = firestore.client()
        fridge_collection_name = 'fridges'
        fridge_document_id = 'main_fridge'
        door_doc_ref = db_client.collection(fridge_collection_name).document(fridge_document_id)
        door_status_field = 'door_is_open'
    else:
        print(f"Error initializing Firebase Admin SDK: {e}")
        st.error(f"Error initializing Firebase: {e}")
        exit()
except Exception as e:
    print(f"An unexpected error occurred during Firebase initialization: {e}")
    st.error(f"Firebase initialization failed: {e}")
    exit()


# =================================== stuff here now



def isClosed(frame, threshold=2, required_black_ratio=0.7):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    black_pixels = np.sum(gray <= threshold)
    total_pixels = gray.size
    black_ratio = black_pixels / total_pixels
    return black_ratio >= required_black_ratio

def get_top_3_images(data):
    if not data:
        return []

    sorted_data = sorted(data, key=lambda item: item[2], reverse=True)

    top_3 = sorted_data[:3]

    top_3_images = [entry[3] for entry in top_3]
    return top_3_images

def processBuffer(data):
    print("Processing buffer:", data)
    if not data:
        print("Buffer is empty.")
        return

    labels = [label for label, _, _, _ in data]
    most_common_label, _ = Counter(labels).most_common(1)[0]

    filtered = [(cx, cy) for label, (cx, cy), _, _ in data if label == most_common_label]

    if len(filtered) < 2:
        print(f"Not enough data for '{most_common_label}' to calculate movement.")
        return

    top_imgs =0
    if experimental_bottle_recognition and (most_common_label in {"cup", "bottle"}):
        top_imgs = get_top_3_images(data)

    deltas = [filtered[i+1][0] - filtered[i][0] for i in range(len(filtered)-1)]
    avg_delta_x = sum(deltas) / len(deltas)

    print(f"Most common item: {most_common_label}")
    print(f"avg_delta_x: {avg_delta_x:.2f}")

    if avg_delta_x > 0:
        if top_imgs:
            result = bottleAI.analyze_images_with_gemini(top_imgs, True)
            most_common_label = result
            print(f"gem say : {result}")
        print(f"{most_common_label} has moved INTO the fridge")
        asyncio.create_task(shelfLifeAI.add_item(most_common_label))
    elif avg_delta_x < 0:
        if top_imgs:
            result = bottleAI.analyze_images_with_gemini(top_imgs, False)
            most_common_label = result
            print(f"gem say : {result}")
        print(f"{most_common_label} has moved OUT of the fridge")
        asyncio.create_task(shelfLifeAI.delete_oldest_item(most_common_label))
    else:
        print("Movement inconclusive")
    

def update_firestore_door_status(is_open):
    try:
        door_doc_ref.set({door_status_field: is_open}, merge=True)
        print(f"Firestore updated: Document '{door_doc_ref.id}' set {door_status_field} = {is_open}")
    except Exception as e:
        print(f"Error updating Firestore: {e}")


async def main():
    doorOpen = False
    buffer =[]
    last_buffer_update = time.time()
    new_data_added =False


    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            st.warning("Failed to read from /dev/video0")
            break

        new_status = not isClosed(frame)  
        if new_status != doorOpen:
            doorOpen = new_status
            update_firestore_door_status(new_status)
            if not doorOpen:    
                print("Door just closed")
                buffer.clear()
                new_data_added = False
                update_firestore_door_status(doorOpen)
                continue
            else:
                print("Door just opened")
                time.sleep(DOOR_DELAY)  
                continue
                
        if not doorOpen:
            continue  

        result = model.predict(frame, conf=0.45, verbose=False)
        new_data_added = False

        for r in result:
            boxes = [box for box in r.boxes if model.names[int(box.cls)] in whitelist]
            if not boxes:
                continue
            new_data_added = True
            best_box = max(boxes, key=lambda b: b.conf.item())

            cls_id = int(best_box.cls.item())
            label = model.names[cls_id]
            conf = best_box.conf.item()
            cx, cy, _, _ = best_box.xywh.squeeze().tolist()
            coords = best_box.xyxy[0].tolist()

            x1, y1, x2, y2 = map(int, coords)
            cropped_img = frame[y1:y2, x1:x2]  # Make sure x2 > x1 and y2 > y1

            detection_str = f"BEST: {label} with {conf:.2f} confidence at {coords} (center: {cx:.1f}, {cy:.1f})"
            print(detection_str)

            buffer.append((label, (cx, cy), conf, cropped_img))

            print(f"test {(label, (cx, cy))}")
            print(detection_str)

        if new_data_added:
            last_buffer_update = time.time()

        elif buffer and (time.time() - last_buffer_update) > 1.0:
            processBuffer(buffer)
            buffer.clear()
     

    print("cap was closed")
    cap.release()

asyncio.run(main())
