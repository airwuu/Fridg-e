from io import BytesIO
from google import genai
from google.genai import types
import cv2
import os
from dotenv import load_dotenv


load_dotenv()

API_KEY = os.getenv("NEXT_PUBLIC_GEMINI_API_KEY")
previous_drinks =[]
client = genai.Client(api_key=API_KEY)


def encode_img_for_gemini(image):
    _, encoded_img = cv2.imencode(".jpg", image)
    return types.Part.from_bytes(data=encoded_img.tobytes(), mime_type="image/jpeg")


            


def analyze_images_with_gemini(image_list,isadd):

    encoded_parts = [encode_img_for_gemini(img) for img in image_list]

    if isadd:
        prompt = "what is this bottle/can/drink? only give a short response to name the bottle/can/drink. The response will be added to a database as a value. If you are really unsure give the response: bottle"
    else:
        prompt = f"what is this bottle/can/drink? only give a short response to name of the bottle/can/drink. pick from the following that best matches the image: {previous_drinks}"

    contents= [prompt] + encoded_parts

    #LSP error is fake
    response = client.models.generate_content(model='gemini-2.0-flash', contents=contents)
    
    response = response.text
    #This LSP error is also fake
    response = response.strip()


    if isadd:
        previous_drinks.append(response)
    else:
        if response in previous_drinks:
            previous_drinks.remove(response)

    return response

