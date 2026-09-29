# Google Photos - AI Discovery Engine

Welcome to the **Google Photos AI Discovery Engine**, an advanced full-stack analytical platform designed to parse, synthesize, and extract product management insights from qualitative user feedback. 

This project aims to solve the "Retrieval Journey Drop-off" problem in Google Photos by analyzing user complaints, understanding how human memory degrades over time, and identifying the friction points when users try to retrieve old visual memories using incomplete search queries.

## 🚀 Features

- **Semantic Problem Clustering:** Uses an AI-powered pipeline to cluster raw qualitative feedback into actionable problem statements.
- **Evidence-Based Prioritization:** Employs a weighted logarithmic confidence formula to prioritize problems based on the volume of evidence and source diversity.
- **Memory Drop-off Funnel:** Visualizes the "Retrieval Journey" (Memory Trigger -> Search Attempt -> Failure Point -> Abandonment) to understand exact user drop-off metrics.
- **RAG (Retrieval-Augmented Generation) Assistant:** Ask questions in natural language and get synthesized insights sourced directly from vectorized user feedback.
- **Global Executive Report:** One-click AI synthesis using Groq's LLM (`llama3-70b`) to generate comprehensive product summaries.
- **Glassmorphic & Brand-Aligned UI:** Fully responsive dashboard styled with Tailwind CSS, utilizing a premium glassmorphic aesthetic perfectly aligned with Google's core color guidelines.

## 🛠️ Technology Stack

**Frontend:**
- React (Vite)
- Tailwind CSS
- Lucide React (Icons)
- Recharts (Data Visualization)

**Backend / AI:**
- FastAPI (Python)
- SQLAlchemy (Database ORM)
- ChromaDB (Vector Database for RAG)
- Groq API (LLM Synthesis & Natural Language Processing)
- Sentence Transformers (Embeddings)

## 📁 Project Structure

```
├── api/
│   └── main.py                 # FastAPI backend server
├── dashboard/                  # React frontend application
│   ├── src/
│   │   ├── App.jsx             # Main Navigation & Routing
│   │   └── pages/              # UI Views (PMQueries, ProblemLandscape, etc.)
├── src/
│   ├── database/               # SQLAlchemy models and local SQLite DB management
│   └── processing/             # AI processing logic (Groq API, ChromaDB, pipelines)
└── README.md
```

## ⚙️ Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/Santhosh-A-Git/Google-Photos--AI-Discovery-Engine.git
cd Google-Photos--AI-Discovery-Engine
```

### 2. Backend Setup
Make sure you have Python 3.9+ installed.
```bash
# Create a virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies (Assuming a requirements.txt exists or install manually)
pip install fastapi uvicorn sqlalchemy chromadb groq sentence-transformers pydantic python-dotenv

# Set up environment variables
# Create a .env file in the root directory and add your Groq API key:
echo "GROQ_API_KEY=your_groq_api_key_here" > .env

# Run the FastAPI server
python -m uvicorn api.main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Frontend Setup
Make sure you have Node.js installed.
```bash
cd dashboard
npm install

# Start the Vite development server
npm run dev
```

## 🛡️ Robustness & Fault Tolerance
The system is built end-to-end to be robust and fail-safe:
- The backend wraps all endpoints in comprehensive `try...except` blocks, returning fallback schemas on failure instead of 500 crashes.
- The AI Integration features self-healing JSON parsers that can interpret unstructured LLM outputs.
- The UI handles undefined states, failed fetches, and missing data gracefully without interrupting the user experience.
