from google.generativeai import GenerativeModel
import google.generativeai as genai
import cv2
import numpy as np

def encode_img_for_gemini(image_np):
    success, encoded_img = cv2.imencode(".jpg", image_np)
    if not success:
        raise ValueError("Failed to encode image")
    return {
        "mime_type": "image/jpeg",
        "data": encoded_img.tobytes()
    }

def analyze_images_with_gemini(image_list, api_key):
    genai.configure(api_key=api_key)
    model = GenerativeModel("gemini-1.5-flash")

    contents = [
        {"text": "what is this bottle/can/drink? only give a short response to name the bottle/can/drink. The response will be added to a database as a value"}
    ]
    for img in image_list:
        contents.append({"inline_data": encode_img_for_gemini(img)})

    response = model.generate_content(contents)
    return response.text
