import os
import requests
from dotenv import load_dotenv
from urllib.parse import urlparse
from services.category_finder import get_category_from_meta
from utils.firebase_manager import store_recent_search
# Load environment variables
load_dotenv()

GOOGLE_CSE_URL = "https://www.googleapis.com/customsearch/v1"

def load_env_credentials():
    """Load all available CSE credentials from environment variables."""
    credentials = []
    i = 1
    while True:
        api_key = os.getenv(f"CSE_API_KEY_{i}")
        engine_id = os.getenv(f"CSE_ENGINE_ID_{i}")
        if not api_key or not engine_id:
            break
        credentials.append({"CSE_API_KEY": api_key, "CSE_ENGINE_ID": engine_id})
        i += 1

    if not credentials:
        # fallback for single set
        key = os.getenv("CSE_API_KEY")
        cx = os.getenv("CSE_ENGINE_ID")
        if key and cx:
            credentials.append({"CSE_API_KEY": key, "CSE_ENGINE_ID": cx})

    if not credentials:
        raise EnvironmentError("❌ No valid CSE_API_KEY_x / CSE_ENGINE_ID_x found in environment variables.")
    print(f"✅ Loaded {len(credentials)} CSE credentials.")
    return credentials


def get_favicon_url(link: str):
    """Generate favicon URL from a page link."""
    domain = urlparse(link).netloc
    return f"https://www.google.com/s2/favicons?sz=64&domain_url=https://{domain}"


def search_google(request):
    """Search a keyword using Google Custom Search API with automatic fallback + Firebase.

    Returns up to 10 search results including all domains (Wikipedia now included).
    Uses pagination to fetch results across multiple pages if needed.
    """
    query = getattr(request, "query", "").strip()
    user_id = getattr(request, "user_id", None)
    if not query:
        return {"status_code": 400, "detail": "Query cannot be empty."}

    TARGET_COUNT = 10

    credentials = load_env_credentials()
    collected = []

    for idx, cred in enumerate(credentials, start=1):
        start_index = 1  # Google CSE start index (1-based)
        # We'll attempt up to 5 pages per credential (max 50 results) or until filled
        while len(collected) < TARGET_COUNT and start_index <= 50:
            params = {
                "key": cred["CSE_API_KEY"],
                "cx": cred["CSE_ENGINE_ID"],
                "q": query,
                "start": start_index
            }
            try:
                response = requests.get(GOOGLE_CSE_URL, params=params, timeout=10)
            except requests.exceptions.RequestException as e:
                print(f"⚠️ Network error for key #{idx} (start={start_index}): {e}")
                break

            if response.status_code == 200:
                data = response.json()

                # Store recent search once per successful credential
                if user_id and start_index == 1:
                    try:
                        store_recent_search(user_id, query)
                    except Exception as e:
                        print(f"⚠️ Failed to store recent search for user {user_id}: {e}")

                items = data.get("items", [])
                if not items:
                    # No more results in this credential
                    break
                for item in items:
                    link = item.get("link")
                    if not link:
                        continue
                    # Exclude Wikipedia domains (both en.wikipedia.org and other language subdomains)
                    try:
                        host = urlparse(link).hostname or ""
                    except Exception:
                        host = ""
                    if host.endswith("wikipedia.org"):
                        # Skip but do NOT count toward quota so we still attempt to fill TARGET_COUNT
                        continue
                    favicon = get_favicon_url(link)
                    category = get_category_from_meta(link)
                    collected.append({
                        "title": item.get("title"),
                        "link": link,
                        "snippet": item.get("snippet"),
                        "favicon": favicon,
                        **category,
                    })
                    if len(collected) >= TARGET_COUNT:
                        break

                # Advance to next page (Google CSE returns up to 10 results per page)
                start_index += 10
            elif response.status_code == 403 and "quota" in response.text.lower():
                print(f"🚫 Quota exceeded for API key #{idx}, switching to next credential...")
                break
            else:
                print(f"❌ API key #{idx} failed (start={start_index}): {response.status_code} -> {response.text[:160]}")
                break

        if len(collected) >= TARGET_COUNT:
            break

    if not collected:
        return {"status_code": 429, "detail": "All Google API keys exhausted or no results."}

    return {"query": query, "results": collected[:TARGET_COUNT]}
