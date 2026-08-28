# Aegis — Personal AI Companion & Persistent Memory System

A personal AI assistant designed to never forget you. It continuously extracts facts, preferences, life updates, and projects from your conversations, storing them in a local SQLite + vector memory vault to provide authentic, highly contextual, and personalized interactions over time.

---

## 🌟 Key Features

1. **Multi-Tier Persistent Memory**:
   - **Continuous Memory Extraction**: Automatically extracts facts, preferences, habits, goals, and personal milestones in the background.
   - **Hybrid Retrieval**: Combines semantic embeddings, keyword overlap, recency decay, and importance weighting to retrieve the most relevant past memories for each conversation.
   - **Memory Vault UI**: Full transparency to view, search, categorize, add, edit, or delete any memories.
   - **Memory Triggers**: In-chat visual badges showing which memories were activated to answer each question.

2. **Persona Studio & Personal Touch**:
   - Customizable archetypes (*Empathetic Companion*, *Tech Mentor*, *Candid Best Friend*, *Executive Assistant*, *Philosopher*).
   - Fine-tuning sliders for *Warmth*, *Humor*, *Directness*, *Formality*, and *Emojis*.
   - Dynamic prompt synthesis that fuses your core identity, active memories, and persona directives.

3. **Multi-Provider LLM Engine**:
   - Google Gemini (`gemini-2.0-flash`, `gemini-1.5-pro`).
   - OpenAI (`gpt-4o`, `gpt-4o-mini`).
   - Ollama / Local LLM endpoints.
   - Offline fallback simulation mode for testing.

4. **Modern Glassmorphic Dark UI**:
   - Real-time SSE token streaming.
   - Rich Markdown & Code syntax highlighting.
   - Export & Import JSON snapshots of all memories, profile data, and chat history.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
python -m pip install -r requirements.txt
```

### 2. Configure API Key (Optional)
Copy `.env.example` to `.env` and add your API key, or set it directly inside the web UI's **Settings** tab:
```bash
copy .env.example .env
```

### 3. Launch the System
```bash
python run.py
```
Open your browser at **http://127.0.0.1:8000** to start chatting with your personal AI!

---

## 📂 Project Structure

```
├── backend/
│   ├── config.py           # Paths, settings, default persona values
│   ├── database.py         # SQLite DB schemas and CRUD operations
│   ├── embeddings.py       # Deterministic semantic vectorization & cosine similarity
│   ├── memory_engine.py    # Fact extractor, hybrid search, and deduplication
│   ├── persona_engine.py   # Personality synthesis and system prompt builder
│   ├── llm_client.py       # Streaming SSE adapters for Gemini, OpenAI, Ollama
│   └── main.py             # FastAPI REST and SSE endpoints
├── static/
│   ├── index.html          # Single-page dashboard UI
│   ├── css/style.css       # Dark glassmorphic styling
│   └── js/app.js           # Frontend reactive state & streaming client
├── run.py                  # Single-command launcher
├── requirements.txt        # Python dependencies
└── tests/                  # Automated test suite
```
