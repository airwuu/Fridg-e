import cv2
import streamlit as st
import time
import numpy as np
from ultralytics import YOLO
from collections import Counter
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore 
import test
from dotenv import load_dotenv
import os




# gemini firebase thing
try:
    # Path to your Service Account Key JSON file
    load_dotenv()
    cred = os.getenv('NEXT_PUBLIC_FIREBASE_API_KEY')

    # Initialize the app (no databaseURL needed for Firestore)
    firebase_admin.initialize_app(cred)
    print("Firebase Admin SDK initialized successfully.")

    # Get the Firestore client
    db_client = firestore.client()
    print("Firestore client obtained.")

    # Define the collection and document for your fridge status
    # You can change 'fridges' and 'main_fridge' if you like
    fridge_collection_name = 'fridges'
    fridge_document_id = 'main_fridge' # ID for THIS specific fridge
    # Get a reference to the specific document
    door_doc_ref = db_client.collection(fridge_collection_name).document(fridge_document_id)
    print(f"Firestore document reference created for: {door_doc_ref.path}")
    # Define the field name within the document
    door_status_field = 'door_is_open'

except ValueError as e:
    if "The default Firebase app already exists" in str(e):
        print("Firebase Admin SDK already initialized.")
        # If already initialized, just get the client and reference again
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


model = YOLO("./model/yolo11m.pt")
camera = '/dev/video0'
cap = cv2.VideoCapture(camera)
DOOR_DELAY = 3

whitelist = {
    "banana", "apple", "sandwich", "orange", "broccoli", "carrot",
    "hot dog", "pizza", "donut", "cake", "bottle", "cup"
}

def isClosed(frame, threshold=2, required_black_ratio=0.7):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    black_pixels = np.sum(gray <= threshold)
    total_pixels = gray.size
    black_ratio = black_pixels / total_pixels
    return black_ratio >= required_black_ratio

def processBuffer(data):
    print("Processing buffer:", data)

    

def update_firestore_door_status(is_open):
    try:
        # Use set with merge=True: Creates the document if it doesn't exist,
        # or updates the specified field if it does exist without overwriting other fields.
        door_doc_ref.set({door_status_field: is_open}, merge=True)
        print(f"Firestore updated: Document '{door_doc_ref.id}' set {door_status_field} = {is_open}")
    except Exception as e:
        print(f"Error updating Firestore: {e}")


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

        best_box = max(boxes, key=lambda b: b.conf.item())

        cls_id = int(best_box.cls.item())
        label = model.names[cls_id]
        conf = best_box.conf.item()
        cx, cy, _, _ = best_box.xywh.squeeze().tolist()
        coords = best_box.xyxy[0].tolist()

        detection_str = f"BEST: {label} with {conf:.2f} confidence at {coords} (center: {cx:.1f}, {cy:.1f})"
        buffer.append((label, (cx, cy)))
        new_data_added = True

        print(f"test{(label, (cx, cy))}")
        print(detection_str)

    # Update the last update time if new data was added
    if new_data_added:
        last_buffer_update = time.time()

    # Check if it's been over 1 second since last update
    elif buffer and (time.time() - last_buffer_update) > 1.0:
        processBuffer(buffer)
        buffer.clear()
 
cap.release()
