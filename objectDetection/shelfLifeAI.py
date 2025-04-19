# no idea how this works I did made the call async but idk if this is how you do it - owen

import asyncio
import time
import datetime
import random
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import google.generativeai as genai
import os
import re           
import json      
from dotenv import load_dotenv

# --- Configuration ---
# Path to your Service Account Key JSON file
CRED_PATH = "./fridge.json"  # <-- !! VERIFY THIS PATH !!
# Firestore details
FRIDGE_COLLECTION_NAME = 'fridges'
FRIDGE_DOCUMENT_ID = 'main_fridge' # ID for THIS specific fridge
DOOR_STATUS_FIELD = 'door_is_open' # Field name within the document
TOGGLE_DELAY_SECONDS = 5 # How long to wait between toggles
load_dotenv()
GEMINI_API_KEY = os.getenv("NEXT_PUBLIC_GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("ERROR: GEMINI_API_KEY environment variable not set.")
    print("Please set the environment variable and restart.")
    # Optionally exit, or continue with fallbacks if desired
    # exit(1)

# Configure the Gemini client (only if API key is found)
if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        # Create the model instance
        # See https://ai.google.dev/models/gemini for model options
        gemini_model = genai.GenerativeModel('gemini-1.5-flash') # Or another suitable model
        print("Gemini AI client configured successfully.")
    except Exception as e:
        print(f"Error configuring Gemini AI: {e}")
        gemini_model = None # Ensure model is None if config fails
else:
    gemini_model = None # Ensure model is None if no API key

db_client = None
door_doc_ref = None

# --- Firestore Initialization ---
try:
    print(f"Attempting to initialize Firebase with key: {CRED_PATH}")
    cred = credentials.Certificate(CRED_PATH)
    firebase_admin.initialize_app(cred)
    print("Firebase Admin SDK initialized successfully.")
    db_client = firestore.client()
    print("Firestore client obtained.")
    door_doc_ref = db_client.collection(FRIDGE_COLLECTION_NAME).document(FRIDGE_DOCUMENT_ID)
    print(f"Firestore document reference created for: {door_doc_ref.path}")
    # items_ref = db_client.collection('users').document('mLdjn5pE3ehCbSiT36Ihiu0u7Un2').collection('items')
    

except ValueError as e:
    if "The default Firebase app already exists" in str(e):
        print("Firebase Admin SDK already initialized.")
        if not db_client:
            db_client = firestore.client()
            print("Firestore client obtained (post-init check).")
        if not door_doc_ref:
             door_doc_ref = db_client.collection(FRIDGE_COLLECTION_NAME).document(FRIDGE_DOCUMENT_ID)
             print(f"Firestore document reference obtained (post-init check): {door_doc_ref.path}")
    else:
        print(f"Error initializing Firebase Admin SDK: {e}")
        exit(1) 
except FileNotFoundError:
    print(f"ERROR: Service account key file not found at: {CRED_PATH}")
    print("Please ensure the path is correct and the file exists.")
    exit(1) 
except Exception as e:
    print(f"An unexpected error occurred during Firebase initialization: {e}")
    exit(1) 

# --- Firestore Update Function ---
def update_firestore_door_status(is_open):
    """Updates the specified field in the Firestore document."""
    if not door_doc_ref:
        print("Error: Firestore document reference is not available.")
        return False

    try:
        print(f"Attempting to set '{DOOR_STATUS_FIELD}' to {is_open} in document '{door_doc_ref.id}'...")
        door_doc_ref.set({DOOR_STATUS_FIELD: is_open}, merge=True)
        print(f"Firestore updated successfully: Document '{door_doc_ref.id}' set {DOOR_STATUS_FIELD} = {is_open}")
        return True
    except Exception as e:
        print(f"Error updating Firestore: {e}")
        return False

def get_food_data_from_gemini(item_name):
    # print("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
    if not gemini_model:
        print("Gemini model not available. Skipping API call.")
        return None, None

    print(f"  Querying Gemini for '{item_name}'...")

    prompt = f"""
    Provide the estimated average nutritional information for "{item_name}".
    Specifically, I need:
    1. Calories: The average total calories (kcal).
    2. Carbon Footprint: Average carbon footprint in kilograms of CO2 equivalent per product (kg CO2e).

    Please format the response ONLY as a JSON object with the keys "cals" and "carbon_kg_co2e".
    For example:
    {{
      "cals": 52,
      "carbon_kg_co2e": 0.7
    }}
    If you cannot find reliable data for either value for "{item_name}", use "N/A" as the value for that specific key.
    Provide only the JSON object in your response, nothing else.
    """

    try:
        response = gemini_model.generate_content(prompt)
        response_text = response.text.strip()
        print(f"  Gemini Raw Response: {response_text}")
        try:
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            response_text = response_text.strip()

            data = json.loads(response_text)
            calories = data.get("cals")
            carbon = data.get("carbon_kg_co2e")

            calories_str = str(calories) if calories != "N/A" and calories is not None else "N/A"
            carbon_str = str(carbon) if carbon != "N/A" and carbon is not None else "N/A"

            print(f"  Parsed Data - Calories: {calories_str}, Carbon: {carbon_str}")
            return calories_str, carbon_str

        except (json.JSONDecodeError, AttributeError, KeyError) as e:
            print(f"  Error parsing Gemini JSON response: {e}. Response was: {response_text}")
            calories_match = re.search(r'calories.*?[:\s]*([\d\.]+)', response_text, re.IGNORECASE)
            carbon_match = re.search(r'carbon.*?[:\s]*([\d\.]+)', response_text, re.IGNORECASE)
            calories_str = calories_match.group(1) if calories_match else "N/A"
            carbon_str = carbon_match.group(1) if carbon_match else "N/A"
            print(f"  Fallback Regex Parsing - Calories: {calories_str}, Carbon: {carbon_str}")
            if calories_str != "N/A" or carbon_str != "N/A":
                 return calories_str, carbon_str
            else:
                return "N/A", "N/A" # Return "N/A" if parsing failed

    except Exception as e:
        print(f"  Error calling Gemini API: {e}")
        return "N/A", "N/A" # Return "N/A" in case of API errors


def get_food_shelf_life_from_gemini(item_name):
    if not gemini_model:
        print("Gemini model not available. Skipping API call for shelf life.")
        return None

    print(f"  Querying Gemini for shelf life of '{item_name}'...")

    prompt = f"""
    Provide the estimated typical shelf life for "{item_name}" in days, after purchase or opening, assuming appropriate storage (e.g., refrigeration if needed).
    I need just the number of days.

    Please format the response ONLY as a JSON object with the key "shelf_life_days".
    For example, for "Fresh Milk":
    {{
      "shelf_life_days": 7
    }}
    For "Banana":
    {{
      "shelf_life_days": 5
    }}
    If you cannot find a typical shelf life in days for "{item_name}", use "N/A" as the value.
    Provide only the JSON object in your response, nothing else.
    """

    try:
        response = gemini_model.generate_content(prompt)
        response_text = response.text.strip()
        print(f"  Gemini Raw Response (Shelf Life): {response_text}")

        try:
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            response_text = response_text.strip()

            data = json.loads(response_text)
            shelf_life = data.get("shelf_life_days")

            if shelf_life is not None and shelf_life != "N/A":
                try:
                    shelf_life_days = int(shelf_life)
                    print(f"  Parsed Shelf Life: {shelf_life_days} days")
                    # Add a basic sanity check (e.g., shelf life shouldn't be negative or excessively long)
                    if 0 < shelf_life_days < 1000: # Adjust range as needed
                         return shelf_life_days
                    else:
                        print(f"  Parsed shelf life ({shelf_life_days}) out of reasonable range. Using fallback.")
                        return None
                except (ValueError, TypeError):
                    print(f"  Could not convert shelf life '{shelf_life}' to integer. Using fallback.")
                    return None
            else:
                print("  Shelf life not found or marked N/A by Gemini. Using fallback.")
                return None

        except (json.JSONDecodeError, AttributeError, KeyError) as e:
            print(f"  Error parsing Gemini JSON response for shelf life: {e}. Response was: {response_text}")
            return None

    except Exception as e:
        print(f"  Error calling Gemini API for shelf life: {e}")
        return None

async def add_item(name):
    try:
        db = firestore.client()
        user_id = "mLdjn5pE3ehCbSiT36Ihiu0u7Un2"
        db_client.collection('users').document(user_id).collection('items')
        items_ref = db.collection('users').document(user_id).collection('items')
        item_name = name
        calories_val, carbon_val = get_food_data_from_gemini(item_name)
        # calories_val = str(random.randint(50, 800))
        # carbon_val = str(random.randint(1, 100))
        now = datetime.datetime.now(datetime.timezone.utc)
        date_added_str = now.isoformat()
        # expiration_days = random.randint(7, 90)
        # expiration_date = now + datetime.timedelta(days=expiration_days)
        # expiration_str = expiration_date.isoformat()
        shelf_life_days = get_food_shelf_life_from_gemini(item_name)

        now = datetime.datetime.now(datetime.timezone.utc)
        date_added_str = now.isoformat()
        expiration_date = None

        if shelf_life_days is not None:
            print(f"  Using Gemini shelf life: {shelf_life_days} days for '{item_name}'.")
            expiration_date = now + datetime.timedelta(days=shelf_life_days)
        else:
            print(f"  Using random fallback for expiration days for '{item_name}'.")
            random_days = random.randint(7, 90) # Default random range
            expiration_date = now + datetime.timedelta(days=random_days)

        expiration_str = expiration_date.isoformat()
        item_data = {
                    "name": item_name,
                    "calories": calories_val,
                    "carbon": carbon_val,
                    "date_added": date_added_str,
                    "expiration": expiration_str,
                }
        try:
            update_time, doc_ref = items_ref.add(item_data)
            print(f"  Added item: '{item_name}' with ID: {doc_ref.id} (Timestamp: {update_time})")

        except Exception as item_error:
            print(f"  Error adding item")
    except Exception as e:
        print(f"An error occurred while adding items")
async def delete_oldest_item(name):
    try:
        db = firestore.client()
        user_id = "mLdjn5pE3ehCbSiT36Ihiu0u7Un2" 
        item_name_to_delete = name 
        items_ref = db.collection('users').document(user_id).collection('items')
        print(f"Searching for the oldest item named '{item_name_to_delete}' for user {user_id}...")
        query = items_ref.where('name', '==', item_name_to_delete) \
                         .order_by('date_added', direction=firestore.Query.ASCENDING) \
                         .limit(1)
        docs = list(query.stream()) 
        if not docs:
            print(f"  No item named '{item_name_to_delete}' found for user {user_id}.")
            return 
        doc_to_delete = docs[0]
        doc_id = doc_to_delete.id
        doc_data = doc_to_delete.to_dict() 
        item_actual_name = doc_data.get('name', 'N/A')
        date_added = doc_data.get('date_added', 'N/A')
        print(f"  Found oldest item: Name='{item_actual_name}', ID='{doc_id}', Added='{date_added}'.")
        print(f"  Attempting to delete item with ID: {doc_id}...")
        try:
            doc_to_delete.reference.delete()
            print(f"  Successfully deleted item with ID: {doc_id}")

        except Exception as delete_error:
            print(f"  Error deleting item with ID {doc_id}: {delete_error}")
    except Exception as e:
        print(f"An error occurred during the delete process for item '{name}': {e}")

