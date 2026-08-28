# 📱 Aegis AI — Expo React Native Mobile App

This is the native mobile companion app for **Aegis AI**, built with **Expo (React Native)**. It connects seamlessly with your FastAPI backend server, supporting persistent memory recall, multi-user isolation, and tone customization.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or higher) installed on your laptop.
- **Expo Go** app installed on your phone:
  - [Expo Go for Android (Play Store)](https://play.google.com/store/apps/details?id=host.exp.exponent)
  - [Expo Go for iOS (App Store)](https://apps.apple.com/app/expo-go/id982107779)

---

### 2. Start the Backend Server First
In your project root folder:
```bash
python run.py
```
Note your local Wi-Fi IP (e.g. `http://192.168.1.15:8000`).

---

### 3. Install & Start the Mobile App
Open a new terminal window in the `mobile/` directory:

```bash
cd mobile
npm install
npx expo start
```

---

### 4. Run on Your Phone
1. A **QR code** will appear in your terminal.
2. Open **Expo Go** on your Android/iPhone.
3. Scan the QR code with your phone camera or Expo Go scanner.
4. The app will bundle and open natively on your device!

---

### 5. Connect App to Your Backend
1. In the app, tap the **Settings** tab at the bottom right.
2. Under **Backend Server Connection**, enter:
   - If running locally: `http://<your-laptop-wifi-ip>:8000` (e.g. `http://192.168.1.15:8000`)
   - If deployed on Railway / Render: `https://your-app.up.railway.app`
3. Tap **Connect Server** $\rightarrow$ Status turns **Connected**!

---

## 🎨 Screens Included
- 💬 **Chat Screen**: Real-time companion conversation, cartoon companion avatar, starter suggestion chips.
- 🧠 **Memory Vault**: Search, view, filter by category, add and delete persistent memory facts.
- 🎭 **Persona Studio**: Archetype selectors (Empathetic Companion, Tech Mentor, etc.), warmth/humor/directness sliders.
- 👤 **User Identity**: Core identity card, name editor, and personalized traits.
- ⚙️ **Settings & Switcher**: Server URL manager, multi-user profile switcher, and Groq API key configuration.
