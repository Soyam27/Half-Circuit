import json
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize Firebase once
if not firebase_admin._apps:
    service_account_info = json.loads(os.environ["FIREBASE_CREDENTIALS_PATH"])
    cred = credentials.Certificate(service_account_info)
    firebase_admin.initialize_app(cred)

db = firestore.client()

def store_recent_search(user_id: str, query: str):
    """Store a recent search for a given user. Returns document id."""
    ref = db.collection("users").document(user_id).collection("recent_searches").document()
    ref.set({
        "query": query,
        "timestamp": datetime.utcnow(),
    })
    return ref.id

def store_bookmark(user_id: str, result: dict):
    """Save a bookmarked search result. Returns document id."""
    ref = db.collection("users").document(user_id).collection("bookmarks").document()
    ref.set({
        "title": result.get("title"),
        "link": result.get("link"),
        "snippet": result.get("snippet"),
        "favicon": result.get("favicon"),
        "category": result.get("category"),
        "site": result.get("site"),
        "saved_at": datetime.utcnow(),
    })
    return ref.id

def get_recent_searches(user_id: str, limit=10):
    """Fetch recent searches including document ids."""
    ref = db.collection("users").document(user_id).collection("recent_searches")
    docs = ref.order_by("timestamp", direction=firestore.Query.DESCENDING).limit(limit).stream()
    items = []
    for doc in docs:
        d = doc.to_dict()
        d["id"] = doc.id
        items.append(d)
    return items

def get_bookmarks(user_id: str):
    """Fetch all bookmarks including document ids."""
    ref = db.collection("users").document(user_id).collection("bookmarks")
    docs = ref.order_by("saved_at", direction=firestore.Query.DESCENDING).stream()
    items = []
    for doc in docs:
        d = doc.to_dict()
        d["id"] = doc.id
        items.append(d)
    return items

def delete_recent_search(user_id: str, doc_id: str):
    db.collection("users").document(user_id).collection("recent_searches").document(doc_id).delete()

def clear_recent_searches(user_id: str):
    ref = db.collection("users").document(user_id).collection("recent_searches")
    docs = ref.stream()
    for d in docs:
        d.reference.delete()

def delete_bookmark(user_id: str, doc_id: str):
    db.collection("users").document(user_id).collection("bookmarks").document(doc_id).delete()
