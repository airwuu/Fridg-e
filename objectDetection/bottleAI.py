from google.generativeai import GenerativeModel
import google.generativeai as genai
import cv2
import numpy as np


previous_drinks =[]

def encode_img_for_gemini(image_np):
    success, encoded_img = cv2.imencode(".jpg", image_np)
    if not success:
        raise ValueError("Failed to encode image")
    return {
        "mime_type": "image/jpeg",
        "data": encoded_img.tobytes()
    }

def analyze_images_with_gemini(image_list, api_key, isadd):
    genai.configure(api_key=api_key)
    model = GenerativeModel("gemini-1.5-flash")

    if isadd:
         contents = [
                 {"text": "what is this bottle/can/drink? only give a short response to name the bottle/can/drink. The response will be added to a database as a value. If you are really unsure give the response: bottle"}
            ]
    else:
        contents = [
                {"text": f"what is this bottle/can/drink? only give a short response to name of the bottle/can/drink. pick from the following that best matches the image: {previous_drinks}"}
            ]



    for img in image_list:
        contents.append({"inline_data": encode_img_for_gemini(img)})

    response = model.generate_content(contents)
    response_text = response.text.strip()

    if isadd:
        previous_drinks.append(response_text)
    else:
        if response_text in previous_drinks:
            previous_drinks.remove(response_text)

    return response_text
