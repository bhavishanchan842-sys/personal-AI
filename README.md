# ViberAI — Personal AI Companion & Persistent Memory System

> **Created and Developed by Bhavish**  
> *Official Repository for ViberAI (Aegis)*

**ViberAI** is an autonomous personal AI companion designed to never forget you. Created and architected by **Bhavish**, ViberAI continuously extracts facts, preferences, life updates, and projects from your conversations, storing them in an isolated, private memory vault to provide authentic, highly contextual, and personalized interactions over time.

---

## 👨‍💻 Creator & Author
- **Creator**: **Bhavish**
- **GitHub**: [@bhavishanchan842-sys](https://github.com/bhavishanchan842-sys)
- **Live Web App**: [https://viberai.onrender.com](https://viberai.onrender.com)
- **Android APK Release**: [Download ViberAI v1.0.0 APK](https://github.com/bhavishanchan842-sys/personal-AI/releases/latest)

---

## 🌟 Key Features

1. **Multi-Tier Persistent Memory**:
   - **Continuous Memory Extraction**: Automatically extracts facts, preferences, habits, goals, and personal milestones in the background.
   - **Hybrid Retrieval**: Combines semantic embeddings, keyword overlap, recency decay, and importance weighting to retrieve the most relevant past memories for each conversation.
   - **Memory Vault UI**: Full transparency to view, search, categorize, add, edit, or delete any memories.

2. **Multi-User Privacy Isolation**:
   - Complete multi-tenant privacy separation. Multiple people can use ViberAI on web or mobile with 100% isolated memory vaults, identities, and chat threads.

3. **Persona Studio & Personal Touch**:
   - Customizable archetypes (*Empathetic Companion*, *Tech Mentor*, *Candid Best Friend*, *Executive Assistant*, *Philosopher*).
   - Fine-tuning sliders for *Warmth*, *Humor*, *Directness*, and *Formality*.

4. **Multi-Provider High-Speed LLM Engine**:
   - **Groq** (`openai/gpt-oss-120b`, `llama-3.3-70b-versatile`) for ultra-fast 500+ tok/s real-time streaming.
   - Google Gemini (`gemini-3.6-flash`, `gemini-1.5-pro`).
   - OpenAI (`gpt-4o`, `gpt-4o-mini`).

5. **Cross-Platform Native Experience**:
   - **Web / PWA**: Mobile-responsive web dashboard with 1-click home screen install.
   - **Mobile App**: Native Expo (React Native) app with downloadable Android APK.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
python -m pip install -r requirements.txt
```

### 2. Launch the System
```bash
python run.py
```
Open your browser at **http://127.0.0.1:8000** or access on mobile via local Wi-Fi IP!

---

## 📱 Mobile App (Expo / React Native)
```bash
cd mobile
npm install
npx expo start
```

---

## 📄 License
Created and developed by **Bhavish**. Open source for personal AI companion research and deployment.
