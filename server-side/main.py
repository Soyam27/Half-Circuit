from fastapi import FastAPI, Request, Query
from pydantic import BaseModel
from services.google_searcher import search_google
from services.scrape_a_link import scrape_website
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from google import genai
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY)

from utils.firebase_manager import (
    store_bookmark,
    get_bookmarks,
    get_recent_searches,
    delete_recent_search,
    clear_recent_searches,
    delete_bookmark,
)

import requests

load_dotenv()
app = FastAPI()

frontend_origin = os.getenv("FRONTEND_ORIGIN")
origins = [o for o in [frontend_origin,"https://half-circuit.vercel.app" ,"http://localhost:5173", "http://127.0.0.1:3000","https://zenobia-sublunated-eighthly.ngrok-free.dev"] if o]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SearchRequest(BaseModel):
    query: str
    user_id: str | None = None  # optional user id so we can persist recent searches


class SummarizeRequest(BaseModel):
    text: str
    summary_type: str = "concise"  # optional: can define multiple styles

# Example prompt styles

@app.post("/summarize")
async def summarize(req: SummarizeRequest):
    text = (req.text or "").strip()
    if not text:
        return {"status_code": 400, "error": "No text provided"}
    prompt_style = {
        "concise": "Summarize in 80-100 words (plain, factual, concise):\n\n",
        "detailed": f"Summarize with more context and details in 100 to 150 words:{text[:15000]}"
    }

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=f"{prompt_style["detailed"]}"
        )
        return {"summary": response.text}
    except Exception as e:
        return f"Error generating summary: {str(e)}"


@app.post("/search")
def google_search(request: SearchRequest):
    """POST endpoint to search Google by keyword (and persist recent searches if user_id provided)."""
    response = search_google(request)
    return response

@app.post("/bookmark")
async def bookmark(request: Request):
    data = await request.json()
    user_id = data.get("user_id")
    result = data.get("result")  # result dict from your frontend
    if not user_id or not result:
        return {"status_code": 400, "detail": "Missing user_id or result data."}

    try:
        store_bookmark(user_id, result)
        return {"status_code": 200, "detail": "Bookmarked successfully."}
    except Exception as e:
        return {"status_code": 202, "detail": f"Bookmark accepted but not persisted: {e}"}


@app.get("/bookmarks/{user_id}")
async def get_user_bookmarks(user_id: str):
    bookmarks = get_bookmarks(user_id)
    return {"user_id": user_id, "bookmarks": bookmarks}

@app.get("/saved/{user_id}")
async def get_saved_hits(user_id: str):
    """
    Get all saved (bookmarked) search results for a user.
    """
    try:
        bookmarks = get_bookmarks(user_id)
        return {
            "status_code": 200,
            "user_id": user_id,
            "count": len(bookmarks),
            "saved": bookmarks
        }
    except Exception as e:
        return {
            "status_code": 500,
            "detail": f"Error fetching saved results: {e}"
        }
@app.get("/recent/{user_id}")
async def recent_searches(user_id: str, limit: int = 10):
    """Return recent search queries for a user (most recent first)."""
    try:
        items = get_recent_searches(user_id, limit=limit)
        return {"status_code": 200, "user_id": user_id, "count": len(items), "recent": items}
    except Exception as e:
        return {"status_code": 500, "detail": f"Error fetching recent searches: {e}"}

@app.delete("/recent/{user_id}/{doc_id}")
async def delete_recent(user_id: str, doc_id: str):
    try:
        delete_recent_search(user_id, doc_id)
        return {"status_code": 200, "detail": "Recent search deleted", "id": doc_id}
    except Exception as e:
        return {"status_code": 500, "detail": f"Failed to delete recent search: {e}"}

@app.delete("/recent/{user_id}")
async def clear_recent(user_id: str):
    try:
        clear_recent_searches(user_id)
        return {"status_code": 200, "detail": "All recent searches cleared"}
    except Exception as e:
        return {"status_code": 500, "detail": f"Failed to clear recent searches: {e}"}

@app.delete("/bookmark/{user_id}/{bookmark_id}")
async def delete_user_bookmark(user_id: str, bookmark_id: str):
    try:
        delete_bookmark(user_id, bookmark_id)
        return {"status_code": 200, "detail": "Bookmark deleted", "id": bookmark_id}
    except Exception as e:
        return {"status_code": 500, "detail": f"Failed to delete bookmark: {e}"}

@app.get("/content")
async def get_content(url: str = Query(..., description="URL to scrape")):
    """Scrape and return structured content for a given URL."""
    try:
        # Validate URL
        if not url or not url.startswith(('http://', 'https://')):
            return {"status_code": 400, "error": "Invalid URL format"}
        
        print(f"Content request for: {url}")
        result = scrape_website(url)
        print(f"Scraping completed with status: {result.get('status_code', 'unknown')}")
        return result
    except Exception as e:
        print(f"Content endpoint error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"status_code": 500, "error": f"Server error: {str(e)}"}
