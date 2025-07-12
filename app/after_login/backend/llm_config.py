from langchain_groq import ChatGroq
import os
from dotenv import load_dotenv

load_dotenv()  # Loads your .env file with GROQ_API_KEY

llm = ChatGroq(
    temperature=0.5,
    model_name="mistral-saba-24b",  
    groq_api_key=os.getenv("GROQ_API_KEY")
)
# print('Hello')
