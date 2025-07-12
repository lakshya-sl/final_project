# tools/general.py
import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))  # Add parent dir

from llm_config import llm  # Import your configured LLM

def general_llm_response(question: str) -> str:
    """
    📌 General Purpose Tool Function

    - Detects greetings like 'hello', 'hi' and responds with a friendly welcome message.
    - For all other questions, returns the LLM-generated response.

    Parameters:
        question (str): The user's input query.

    Returns:
        str: Custom message or LLM response with `\n` line breaks (not HTML).
    """

    q_lower = question.strip().lower()
    greetings = ["hello", "hi", "hey", "hii", "helo"]

    if any(greet in q_lower for greet in greetings):
        return (
            "👋 Hello! I’m your Smart Stock Assistant.\n"
            "Here’s what I can help you with:\n"
            "1. 📈 Show trending or top-performing stocks\n"
            "2. 📊 Compare two companies\n"
            "3. 💡 Tell you whether to buy a stock\n"
            "4. 📰 Summarize today’s market news\n"
            "5. 💬 Analyze stock sentiment (US only)\n"
            "6. 🔍 Get safe or low-risk stocks\n"
            "7. ❓ Answer general stock market questions\n"
            "8. 📈 Get U.S. stock buy recommendations\n\n"
            "Just ask me anything!"
        )

    # Fallback to LLM for general questions
    try:
        response = llm.invoke(question)
        return response.content
    except Exception as e:
        return f"❌ Error: {str(e)}"
