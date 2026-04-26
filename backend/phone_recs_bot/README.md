# Phone Recommendation Chatbot

This is a first chatbot backend:
- Conversational input
- Preference extraction (rules-based)
- MongoDB retrieval from your scraped docs (gsmarena/kimovil later)
- Ranking + conversational response

## Setup
```bash
cd phone_recs_bot
python -m venv .venv
# Windows: .venv\Scripts\activate
# Mac/Linux: source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env   # Windows
# cp .env.example .env   # Mac/Linux