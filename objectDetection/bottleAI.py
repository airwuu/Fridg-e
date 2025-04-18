from io import BytesIO
from google import genai
import cv2
from google.genai import files
import numpy as np
import os
from dotenv import load_dotenv


load_dotenv()

API_KEY = os.getenv("NEXT_PUBLIC_GEMINI_API_KEY")
previous_drinks =[]
client = genai.Client(api_key=API_KEY)


def encode_img_for_gemini(image_np):
    _, encoded_img = cv2.imencode(".jpg", image_np)
    return encoded_img.tobytes() 
            


async def analyze_images_with_gemini(image_list,isadd):

    imgs = []
    prompt = ""

    for i in range(len(image_list)):
        imgFile = BytesIO(encode_img_for_gemini(image_list[i]))
        imgFile.name = f"image{i}.jpg"
        imgs.append(client.files.upload(file = imgFile))



    contents = []


    if isadd:
        prompt = "what is this bottle/can/drink? only give a short response to name the bottle/can/drink. The response will be added to a database as a value. If you are really unsure give the response: bottle"
    else:
        prompt = f"what is this bottle/can/drink? only give a short response to name of the bottle/can/drink. pick from the following that best matches the image: {previous_drinks}"


    response = client.models.generate_content(model='gemini-2.0-flash', contents=[imgs, prompt])
    
    response = response.text.strip()

    client.files.delete(name="image1.jpg")
    client.files.delete(name="image2.jpg")
    client.files.delete(name="image3.jpg")

    if isadd:
        previous_drinks.append(response)
    else:
        if response in previous_drinks:
            previous_drinks.remove(response)

    return response

