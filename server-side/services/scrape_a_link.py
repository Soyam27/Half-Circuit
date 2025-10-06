import requests
from bs4 import BeautifulSoup, NavigableString, Tag
from urllib.parse import urlparse, urljoin
import uuid
import re

def clean_text(text: str) -> str:
    """Clean and normalize text."""
    return re.sub(r"\s+", " ", text).strip()

def is_valid_text(text: str) -> bool:
    """Basic sanity filter: allow most paragraph/list text, block obvious boilerplate."""
    if not text:
        return False
    lowered = text.lower()
    # Block extremely short fragments (1-2 words) that are likely nav items
    if len(lowered.split()) < 2:
        return False
    boilerplate = [
        'cookie', 'subscribe', 'accept', 'terms', 'login', 'register', 'signup',
        'copyright', 'advert', 'policy', 'menu', 'share', 'edit', 'feedback'
    ]
    if any(b in lowered for b in boilerplate):
        return False
    return True

def extract_content(elements, url):
    """Extract grouped textual content plus media/links from given elements.

    Returns a dict with:
      content: a single string (paragraphs separated by two newlines)
      images: list[{src, alt, caption}]
      links: list[{href, text}]
    """
    SKIP_TAGS = {"script", "style", "nav", "footer", "header", "form", "noscript", "svg", "iframe", "button"}
    paragraphs, images, links = [], [], []
    last_para = None

    def add_para(text: str):
        nonlocal last_para
        if not text:
            return
        # Always collect paragraph-ish content; light filtering only
        if is_valid_text(text) and text != last_para:
            paragraphs.append(text)
            last_para = text

    for root in elements:
        if not getattr(root, 'name', None):
            continue
        for node in root.descendants:
            if isinstance(node, NavigableString):
                continue
            name = getattr(node, 'name', '').lower()
            if not name or name in SKIP_TAGS:
                continue
            if name == 'img' and node.get('src'):
                images.append({
                    'src': urljoin(url, node.get('src')),
                    'alt': node.get('alt', ''),
                    'caption': node.get('title', '')
                })
                continue
            if name == 'a' and node.get('href'):
                ltxt = clean_text(node.get_text(' '))
                if is_valid_text(ltxt):
                    links.append({'href': urljoin(url, node.get('href')), 'text': ltxt})
                continue
            if name in {'p','li'}:
                add_para(clean_text(node.get_text(' ')))
                continue
            if name in {'ul','ol'}:
                for li in node.find_all('li', recursive=False):
                    add_para(clean_text(li.get_text(' ')))
                continue
            if name in {'h1','h2','h3','h4','h5','h6'}:
                heading_text = clean_text(node.get_text(' '))
                if heading_text and len(heading_text) > 2:
                    add_para(heading_text)
                continue

    return {
        'content': '\n\n'.join(paragraphs),
        'images': images,
        'links': links
    }

def scrape_website(url: str):
    try:
        # Add timeout and better headers
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1"
        }
        print(f"Scraping URL: {url}")
        r = requests.get(url, headers=headers, timeout=30, allow_redirects=True)
        r.raise_for_status()
        print(f"Successfully fetched {len(r.content)} bytes")
        soup = BeautifulSoup(r.text, "html.parser")

        title = soup.title.string if soup.title else "Untitled"
        domain = urlparse(url).netloc
        favicon = f"https://www.google.com/s2/favicons?sz=64&domain_url=https://{domain}"

        # Attempt to extract publish date & author from meta tags
        publish_date = None
        author = None
        date_meta_selectors = [
            ("meta", {"property": "article:published_time"}),
            ("meta", {"name": "pubdate"}),
            ("meta", {"name": "date"}),
            ("meta", {"itemprop": "datePublished"}),
            ("time", {"itemprop": "datePublished"})
        ]
        for tag_name, attrs in date_meta_selectors:
            tag = soup.find(tag_name, attrs=attrs)
            if tag:
                publish_date = tag.get('content') or clean_text(tag.get_text())
                if publish_date:
                    break
        author_meta_selectors = [
            ("meta", {"name": "author"}),
            ("meta", {"property": "article:author"}),
            ("meta", {"name": "dc.creator"}),
            ("meta", {"name": "byl"})
        ]
        for tag_name, attrs in author_meta_selectors:
            tag = soup.find(tag_name, attrs=attrs)
            if tag:
                author = tag.get('content') or clean_text(tag.get_text())
                if author:
                    break
        if not author:
            # fallback: look for class patterns
            author_candidate = soup.find(class_=re.compile(r"author|byline", re.I))
            if author_candidate:
                author_text = clean_text(author_candidate.get_text())
                if 3 < len(author_text) < 120:
                    author = author_text
        if not author:
            author = "Unknown Author"

        # Try Wikipedia-specific selectors first, then general selectors
        main_content = (soup.select_one(".mw-parser-output") or 
                       soup.select_one("#mw-content-text") or 
                       soup.select_one(".mw-body-content") or 
                       soup.select_one("main") or 
                       soup.select_one("article") or 
                       soup.body)
        if not main_content:
            return {"status_code": 404, "error": "No main content found."}

        # ---------- Multi-Level Heading Stack Parser ----------
        # Generic algorithm: on encountering heading hN, pop stack until top has level < N, then push new node.
        # Non-heading content attaches to the current (deepest) heading node; if no heading yet, becomes preface.

        preface_elements = []
        heading_stack = []  # stack of nodes
        all_nodes = []      # flat list for later traversal (optional)

        def new_heading_node(level: int, title: str):
            return {
                'id': str(uuid.uuid4())[:8],
                'title': title,
                'level': level,
                'content_elements': [],  # raw bs4 elements (non heading) belonging directly to this heading
                'children': []
            }

        for el in main_content.descendants:  # traverse all descendants to catch nested headings
            if not isinstance(el, Tag):
                continue
            if el.name is None:
                continue
            tag = el.name.lower()
            # Skip script/style and nav/footer/header/forms to reduce noise
            if tag in {"script", "style", "nav", "footer", "header", "form", "noscript", "svg", "iframe"}:
                continue
            if re.fullmatch(r'h[1-6]', tag):
                level = int(tag[1])
                heading_text = clean_text(el.get_text())
                if not heading_text:
                    continue
                # Pop until stack top has smaller level
                while heading_stack and heading_stack[-1]['level'] >= level:
                    heading_stack.pop()
                node = new_heading_node(level, heading_text)
                if heading_stack:
                    heading_stack[-1]['children'].append(node)
                else:
                    all_nodes.append(node)
                heading_stack.append(node)
            else:
                # Content element
                if heading_stack:
                    heading_stack[-1]['content_elements'].append(el)
                else:
                    preface_elements.append(el)

        # Helper to gather all descendant content under a node (including headings as textual markers)
        def gather_descendant_elements(node, soup_ref):
            elements = list(node['content_elements'])
            for child in node['children']:
                # create a synthetic heading tag to preserve hierarchy info inside content
                h_tag = soup_ref.new_tag(f"h{child['level']}")
                h_tag.string = child['title']
                elements.append(h_tag)
                elements.extend(gather_descendant_elements(child, soup_ref))
            return elements

        # Build sections/subsections (two-level) for backward compatibility
        sections = []
        if all_nodes:
            min_level = min(n['level'] for n in all_nodes)
            for top in [n for n in all_nodes if n['level'] == min_level]:
                section = {
                    'id': top['id'],
                    'title': top['title'],
                    'subsections': []
                }
                # If top has direct content before any child, create an Overview subsection
                if top['content_elements']:
                    top_content = extract_content(top['content_elements'], url)
                    if top_content['content'] or top_content['images'] or top_content['links']:
                        section['subsections'].append({
                            'id': str(uuid.uuid4())[:8],
                            'title': 'Overview',
                            **top_content
                        })
                for child in top['children']:
                    # Aggregate child's own content + all descendant content
                    aggregated_elements = child['content_elements'][:]
                    # include deeper descendants' heading tags & content
                    for gc in child['children']:
                        h_tag = soup.new_tag(f"h{gc['level']}")
                        h_tag.string = gc['title']
                        aggregated_elements.append(h_tag)
                        aggregated_elements.extend(gather_descendant_elements(gc, soup))
                    child_content = extract_content(aggregated_elements, url)
                    if child_content['content'] or child_content['images'] or child_content['links']:
                        section['subsections'].append({
                            'id': child['id'],
                            'title': child['title'],
                            **child_content
                        })
                if section['subsections']:
                    sections.append(section)

        # Introduction from preface
        if sections and preface_elements:
            intro_content = extract_content(preface_elements, url)
            if intro_content['content'] or intro_content['images'] or intro_content['links']:
                sections.insert(0, {
                    'id': str(uuid.uuid4())[:8],
                    'title': 'Introduction',
                    'subsections': [{
                        'id': str(uuid.uuid4())[:8],
                        'title': 'Overview',
                        **intro_content
                    }]
                })

        # Fallback if no headings at all
        if not sections:
            body_content = extract_content([main_content], url)
            if body_content['content'] or body_content['images'] or body_content['links']:
                sections.append({
                    'id': str(uuid.uuid4())[:8],
                    'title': title,
                    'subsections': [{
                        'id': str(uuid.uuid4())[:8],
                        'title': title,
                        **body_content
                    }]
                })

        # Provide full hierarchical outline as well
        def serialize_node(node):
            node_content = extract_content(node['content_elements'], url)
            return {
                'id': node['id'],
                'title': node['title'],
                'level': node['level'],
                'content': node_content['content'],
                'images': node_content['images'],
                'links': node_content['links'],
                'children': [serialize_node(c) for c in node['children']]
            }
        outline = [serialize_node(n) for n in all_nodes]

        # Add preface content as Introduction if exists and at least one section
        # Protect against duplicate Introduction insertion by checking existing titles
        if sections and preface_elements:
            existing_intro = next((s for s in sections if isinstance(s.get('title'), str) and s.get('title').strip().lower() == 'introduction'), None)
            if not existing_intro:
                intro_content = extract_content(preface_elements, url)
                if intro_content['content'] or intro_content['images'] or intro_content['links']:
                    sections.insert(0, {
                        'id': str(uuid.uuid4())[:8],
                        'title': 'Introduction',
                        'subsections': [{
                            'id': str(uuid.uuid4())[:8],
                            'title': 'Overview',
                            **intro_content
                        }]
                    })

        # Fallback if no sections created: treat whole body as one section
        if not sections:
            body_content = extract_content([main_content], url)
            if body_content['content'] or body_content['images']:
                sections.append({
                    'id': str(uuid.uuid4())[:8],
                    'title': title,
                    'subsections': [{
                        'id': str(uuid.uuid4())[:8],
                        'title': title,
                        **body_content
                    }]
                })

        return {
            "status_code": 200,
            "data": {
                "id": str(uuid.uuid4())[:10],
                "url": url,
                "title": title,
                "domain": domain,
                "favicon": favicon,
                "publishDate": publish_date,
                "readTime": f"{max(1,len(main_content.get_text().split())//200)} min read",
                "author": author,
                "sections": sections,
                "outline": outline  # full multi-level hierarchy
            }
        }

    except requests.exceptions.Timeout:
        print(f"Timeout error for URL: {url}")
        return {"status_code": 408, "error": "Request timeout - the website took too long to respond"}
    except requests.exceptions.ConnectionError:
        print(f"Connection error for URL: {url}")
        return {"status_code": 502, "error": "Could not connect to the website"}
    except requests.exceptions.HTTPError as e:
        print(f"HTTP error for URL: {url} - {e.response.status_code}")
        return {"status_code": e.response.status_code, "error": f"Website returned error: {e.response.status_code}"}
    except requests.exceptions.RequestException as e:
        print(f"Request error for URL: {url} - {str(e)}")
        return {"status_code": 500, "error": f"Network error: {str(e)}"}
    except Exception as e:
        print(f"Unexpected error for URL: {url} - {str(e)}")
        import traceback
        traceback.print_exc()
        return {"status_code": 500, "error": f"Scraping failed: {str(e)}"}

# Example usage
if __name__ == "__main__":
    from pprint import pprint
    result = scrape_website("https://en.wikipedia.org/wiki/Python_(programming_language)")
    pprint(result)
