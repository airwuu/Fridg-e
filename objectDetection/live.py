import cv2
import streamlit as st
from ultralytics import YOLO
import time

# Load YOLO model
model = YOLO("yolo11x.pt")  # You can change to your custom model if needed

camera = '/dev/video0'

# Open loopback webcam
cap = cv2.VideoCapture(camera)


stframe = st.empty()
st.title("YOLO Real-Time Inference from /dev/video2")

whitelist = [
    "banana",      # 46
    "apple",       # 47
    "sandwich",    # 48
    "orange",      # 49
    "broccoli",    # 50
    "carrot",      # 51
    "hot dog",     # 52
    "pizza",       # 53
    "donut",       # 54
    "cake",        # 55
    "bottle",      # 39 (can be food-related, e.g., drinks)
    "cup",         # 41
]


frame_placeholder = st.empty()

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        st.warning("Failed to read from /dev/video0")
        break


    # Run YOLO inference
    results = model.predict(frame, conf=0.35, verbose=False)
    with open("detections.txt", "a") as f: 
      for r in results:
          boxes = r.boxes
          for box in boxes:
              cls_id = int(box.cls)
              conf = box.conf.item()

              label = model.names[cls_id]

              if label not in whitelist:
                continue

              coords = box.xyxy[0].tolist()


              detection_str = f"Detected: {label} with {conf:.2f} confidence at {coords}\n"
              f.write(detection_str)


              x1, y1, x2, y2 = map(int, box.xyxy[0])
              cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
              cv2.circle(frame, (x1,y1), 50, (0,255,0),-1)
              cv2.putText(frame, f"{label} {conf:.2f}", (x1, y1 - 10),
                          cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

    stframe.image(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB), channels="RGB")


cap.release()

