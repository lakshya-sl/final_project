import os
import requests
from datetime import datetime, timedelta
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))  # Add parent dir

from llm_config import llm  # Your LLM config (e.g., Mistral/Groq)

# Ticker mapping for fuzzy resolution
TICKER_MAP = {
    "apple": "AAPL", "microsoft": "MSFT", "google": "GOOGL", "amazon": "AMZN", "meta": "META",
    "tesla": "TSLA", "nvidia": "NVDA", "netflix": "NFLX", "adobe": "ADBE", "intel": "INTC",
    "amd": "AMD", "salesforce": "CRM", "paypal": "PYPL", "shopify": "SHOP", "snowflake": "SNOW",
    "palantir": "PLTR", "alibaba": "BABA", "disney": "DIS", "johnson": "JNJ", "pfizer": "PFE",
    
    # Indian stocks (if supported by future plan or LLM fallback)
    "reliance": "RELIANCE.NS", "tcs": "TCS.NS", "infosys": "INFY.NS", "itc": "ITC.NS",
    "hdfc": "HDFCBANK.NS", "icici": "ICICIBANK.NS", "sbi": "SBIN.NS", "bajaj finance": "BAJFINANCE.NS",
    "sun pharma": "SUNPHARMA.NS", "maruti": "MARUTI.NS", "tata motors": "TATAMOTORS.NS", "irctc": "IRCTC.NS"
}

def resolve_company_name(user_input: str) -> str:
    cleaned = user_input.strip().lower()
    if cleaned in TICKER_MAP:
        return TICKER_MAP[cleaned]

    # Let LLM match fuzzy names
    prompt = f"""
The user entered this company name: "{user_input}"

Choose the closest valid match from this list:
{list(TICKER_MAP.keys())}

Just reply with the closest name from the list.
"""
    try:
        match = llm.invoke(prompt).content.strip().lower()
        return TICKER_MAP.get(match, user_input.upper())
    except Exception:
        return user_input.upper()

def get_company_news(ticker: str) -> str:
    if ticker.endswith(".NS"):
        return f"❌ News for Indian stock `{ticker}` is not available under the current plan."

    api_key = os.getenv("FINNHUB_API_KEY")
    if not api_key:
        return "❌ Missing FINNHUB_API_KEY in .env"

    today = datetime.now().date()
    three_days_ago = today - timedelta(days=3)

    url = "https://finnhub.io/api/v1/company-news"
    params = {
        "symbol": ticker,
        "from": three_days_ago.strftime("%Y-%m-%d"),
        "to": today.strftime("%Y-%m-%d"),
        "token": api_key
    }

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        news = response.json()

        if not news:
            return f"⚠️ No recent news found for {ticker}."

        top_articles = news[:5]
        text = ""
        for item in top_articles:
            date = datetime.fromtimestamp(item['datetime']).strftime("%Y-%m-%d")
            text += f"📅 {date} | 🏢 {item['source']}\n🔹 {item['headline']}\n\n"

        # Summarize using LLM
        prompt = f"Summarize the following news headlines for {ticker}:\n\n{text}"
        summary = llm.invoke(prompt)
        return summary.content.strip()

    except Exception as e:
        return f"❌ Error fetching news: {str(e)}"

# ✅ CLI usage
if __name__ == "__main__":
    user_input = input("Enter company name (e.g., Apple, Microsoft, Reliance): ")
    ticker = resolve_company_name(user_input)
    print(get_company_news(ticker))
