import time
import datetime
import random
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

# --- Configuration ---
# Path to your Service Account Key JSON file
CRED_PATH = "./fridge.json"  # <-- !! VERIFY THIS PATH !!
# Firestore details
FRIDGE_COLLECTION_NAME = 'fridges'
FRIDGE_DOCUMENT_ID = 'main_fridge' # ID for THIS specific fridge
DOOR_STATUS_FIELD = 'door_is_open' # Field name within the document
TOGGLE_DELAY_SECONDS = 5 # How long to wait between toggles

# Global variables for Firebase refs (to handle potential re-init)
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
        exit(1) # Exit if initialization fails critically
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

def add_item(name):
    try:
        db = firestore.client()
        user_id = "mLdjn5pE3ehCbSiT36Ihiu0u7Un2"
        db_client.collection('users').document(user_id).collection('items')
        items_ref = db.collection('users').document(user_id).collection('items')
        
        item_name = name
        calories_val = str(random.randint(50, 800))
        carbon_val = str(random.randint(1, 100))
        now = datetime.datetime.now(datetime.timezone.utc)
        date_added_str = now.isoformat()
        expiration_days = random.randint(7, 90)
        expiration_date = now + datetime.timedelta(days=expiration_days)
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
