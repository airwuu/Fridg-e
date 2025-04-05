import cv2
import streamlit as st
from ultralytics import YOLO

# Load YOLO model
model = YOLO("yolov8n.pt")  # You can change to your custom model if needed

# Open loopback webcam
cap = cv2.VideoCapture('/dev/video2')

st.title("YOLO Real-Time Inference from /dev/video2")

frame_placeholder = st.empty()

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        st.warning("Failed to read from /dev/video2")
        break

    # Run YOLO inference
    results = model(frame)

    # Plot results on frame
    annotated_frame = results[0].plot()

    # Convert BGR to RGB for Streamlit
    annotated_frame = cv2.cvtColor(annotated_frame, cv2.COLOR_BGR2RGB)

    # Show frame in Streamlit
    frame_placeholder.image(annotated_frame, channels="RGB")

cap.release()

