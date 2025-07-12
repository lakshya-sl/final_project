import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from tools.get_top_by_metric import get_top_by_metric
from tools.get_sentiment import get_sentiment
from llm_config import llm

def get_recommendation(_: str = "") -> str:
    """
    Recommend top 2-3 U.S. stocks to buy today based on high return, ROE, and positive sentiment.
    Only global stocks are considered (not Indian tickers ending in .NS).
    """
    try:
        # Step 1: Get top stocks by return and ROE
        top_return = get_top_by_metric("return")
        top_roe = get_top_by_metric("roe")

        # Step 2: Combine, deduplicate, and filter U.S. stocks only
        combined = list(set(top_return + top_roe))
        global_stocks = [stock for stock in combined if not stock.endswith(".NS")]

        # Limit to top 5 candidates for efficiency
        candidates = global_stocks[:5]

        if not candidates:
            return "❌ No eligible U.S. stocks found to recommend today."

        # Step 3: Fetch sentiment and prepare LLM prompt
        context = ""
        for stock in candidates:
            sentiment = get_sentiment(stock)
            context += f"\nStock: {stock}\nSentiment: {sentiment}\n"

        # Step 4: Ask LLM for best buy recommendations
        prompt = f"""
        Based on the following U.S. stocks and their news sentiment, recommend the top 2-3 stocks to buy today.
        Justify your recommendation briefly.

        {context}

        Give answer in this format:
        Recommendation:
        - Stock 1: reason
        - Stock 2: reason
        """

        response = llm.invoke(prompt)
        return response.content.strip()

    except Exception as e:
        return f"❌ Error generating stock recommendation: {e}"

if __name__ == "__main__":
    print(get_recommendation())