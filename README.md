# 🧠 Half Circuit

### _A modern, AI-powered web explorer built with React + FastAPI_

Half Circuit lets you explore any topic by automating Google searches, scraping real content, organizing it into structured sections (headings, subheadings, and links), and generating intelligent summaries — all within a clean, dark, glass-themed UI.

---

## 🚀 Features

- 🔍 **Smart Search** – Enter any topic (e.g., “DSA Linked List”) and get live scraped search results.  
- 🧾 **Web Scraping** – Explore full website content, organized by headings, subheadings, and media.  
- 🤖 **GenAI Summarization** – Instantly summarize scraped content for quick insights.  
- ⚙️ **Automation Engine** – Automates scraping and organizes everything dynamically.  
- 💎 **Modern UI** – Beautiful dark, glass-effect interface built with TailwindCSS.  
- 🧩 **Modular Architecture** – FastAPI backend + React frontend for scalability.  

---

## 🏗️ Tech Stack

| Layer | Tech |
|:------|:-----|
| **Frontend** | React, Vite, TailwindCSS, React Router, Axios, React Icons, React Scroll |
| **Backend** | FastAPI, Uvicorn, BeautifulSoup4, Requests, HTTPX |
| **AI / Automation** | OpenAI API or Hugging Face (for summarization) |
| **Web Scraping** | Requests, beautifulsoup4 |




## ⚙️ Setup Instructions

### **1️⃣ Clone the Repository**

```bash
git clone https://github.com/yourusername/half-circuit.git
cd half-circuit
```
Frontend
```

cd frontend
npm install
npm install react-router-dom axios react-icons react-scroll
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm run dev

```
Backend
```

cd ../backend
python -m venv venv
source venv/bin/activate        # (Windows: venv\Scripts\activate)
pip install -r requirements.txt
