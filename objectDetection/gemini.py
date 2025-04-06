from google import genai
from google.genai import types

import pathlib
import requests
import PIL.Image

def analyze_images_with_gemini(image_path_1, image_path_2, image_path_3, api_key):
  pil_image1 = PIL.Image.open(image_path_1)
  pil_image2 = PIL.Image.open(image_path_2)
  pil_image3 = PIL.Image.open(image_path_3)

  client = genai.Client(api_key=api_key)

  response = client.models.generate_content(
      model="gemini-2.0-flash-exp",
      contents=[
          "what is this? what is the differtence between the three images?",
          pil_image1,
          pil_image2,
          pil_image3
      ]
  )

  return response.text


if __name__ == "__main__":
    api_key = "AIzaSyCBDG2I1hdiCD8zGT7lZkGAil0dNr6Cx8M"
    result = analyze_images_with_gemini(
        "biags1.jpg",
        "biags2.jpg",
        "biags3.jpg",
        api_key
    )
    print(result)