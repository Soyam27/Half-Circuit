import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse

def get_category_from_meta(link: str) -> str:
    
    try:
        # Fetch the homepage (timeout to avoid hanging)
        response = requests.get(link, timeout=5)
        html = response.text
        soup = BeautifulSoup(html, "html.parser")

        # Extract site domain
        parsed_url = urlparse(link)
        domain = parsed_url.netloc
        if domain.startswith("www."):
            domain = domain[4:]
        site_name_tag = domain  # Use domain as site name

        # Look for meta keywords or description``
        keywords_tag = soup.find("meta", attrs={"name": "keywords"})
        description_tag = soup.find("meta", attrs={"name": "description"})
        og_desc_tag = soup.find("meta", attrs={"property": "og:description"})
        publish_date_tag = soup.find("meta", attrs={"property": "article:published_time"})

        publish_date_tag = publish_date_tag["content"] if publish_date_tag and publish_date_tag.get("content") else None

        text = ""
        if keywords_tag and keywords_tag.get("content"):
            text += keywords_tag["content"].lower() + " "
        if description_tag and description_tag.get("content"):
            text += description_tag["content"].lower() + " "
        if og_desc_tag and og_desc_tag.get("content"):
            text += og_desc_tag["content"].lower()

        # Simple heuristic classification based on meta content
        if any(k in text for k in [
            "news", "media", "journal", "press", "report", "broadcast", "headline", "magazine", "publication"
        ]):
            category = "News"

        elif any(k in text for k in [
            "shop", "product", "buy", "ecommerce", "store", "sale", "retail", "marketplace", "shopping", "deal"
        ]):
            category = "E-Commerce"

        elif any(k in text for k in [
            "university", "education", "learning", "school", "college", "academy", "training", "tutorial", "course", "class"
        ]):
            category = "Education"

        elif any(k in text for k in [
            "tech", "software", "ai", "startup", "developer", "programming", "app", "website", "innovation", "technology"
        ]):
            category = "Technology"

        elif any(k in text for k in [
            "government", "ministry", "state", "policy", "law", "official", "public sector", "regulation", "bureau"
        ]):
            category = "Government"

        elif any(k in text for k in [
            "health", "clinic", "doctor", "medicine", "hospital", "wellness", "treatment", "medical", "disease", "pharmacy"
        ]):
            category = "Health"

        elif any(k in text for k in [
            "movie", "film", "music", "entertainment", "tv", "celebrity", "show", "series", "concert", "game"
        ]):
            category = "Entertainment"

        elif any(k in text for k in [
            "sport", "football", "cricket", "basketball", "tennis", "athlete", "tournament", "league", "match", "olympics"
        ]):
            category = "Sports"

        elif any(k in text for k in [
            "science", "research", "study", "experiment", "physics", "chemistry", "biology", "lab", "discovery", "experiment"
        ]):
            category = "Science"

        else:
            category = "General"

        # Return both domain and category
        return {"site": site_name_tag, "category": category, "published_date": publish_date_tag}

    except Exception as e:
        return {"site": "!site", "category": "Unknown", "published_date": None}
