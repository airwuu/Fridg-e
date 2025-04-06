import cv2
import streamlit as st
import time
import numpy as np
from ultralytics import YOLO
from collections import Counter

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
        if not doorOpen:
            print("Door just closed")
            buffer.clear()
            new_data_added = False
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
