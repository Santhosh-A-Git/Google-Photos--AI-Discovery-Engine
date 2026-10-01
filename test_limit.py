import os
from groq import Groq

from dotenv import load_dotenv
load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
try:
    response = client.chat.completions.create(
        messages=[{"role": "user", "content": "hello"}],
        model="openai/gpt-oss-20b"
    )
    print(response.choices[0].message.content)
except Exception as e:
    print(f"Error: {e}")
    if hasattr(e, 'response'):
        print(f"Response body: {e.response.json()}")
