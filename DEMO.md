# PalMind — 3-Minute Hackathon Demonstration Script

This script walks judges through a complete, live, end-to-end demonstration of **PalMind**.

---

## Pre-Demo Quick Setup (30 Seconds)

Ensure backend and frontend are running:
```bash
# Terminal 1: Ollama
ollama serve

# Terminal 2: PalMind
# On Windows:
start_all.bat
# On Linux/macOS:
./start.sh
```

Optional: To preload realistic student demonstration data:
```bash
python scripts/seed_demo.py
```

Open your browser to: **`http://localhost:5173`**

---

## Step 1: Introduce the Human Story (30 Seconds)

1. Open the **Our Story** tab from the sidebar.
2. Share the narrative:
   > *"I built PalMind for a real friend, Alex, who was overwhelmed by keeping track of exams, scattered lecture PDFs, daily tasks, and promises made to teammates. Commercial AI apps charge fees and send private notes to external cloud servers. PalMind solves this with 100% private, local open-source AI."*

---

## Step 2: The Dashboard & AI Focus (30 Seconds)

1. Navigate to **Dashboard**.
2. Point out:
   - Dynamic time-aware greeting: *"Good morning / afternoon, Alex"*.
   - The AI-generated card: **FOCUS FOR TODAY**. Notice how it synthesizes active deadlines, pending promises, and exam dates from the local database.
   - Live study analytics and upcoming deadlines widget.

---

## Step 3: Natural Language Smart Task (20 Seconds)

1. Navigate to **Smart Tasks** (or press `Ctrl+K` and select *Add Task*).
2. Type in the AI Natural Language bar:
   ```text
   Finish MongoDB assignment by Friday at 5 PM with High priority
   ```
3. Click **Add**.
4. Observe:
   - PalMind parses the title, computes the Friday deadline, assigns High priority.
   - Notice the **AI Priority Score** (e.g. `75.0 pts`). Click the score badge to reveal the explainable rationale breakdown!

---

## Step 4: The Memory Vault (30 Seconds)

1. Navigate to **My Memory**.
2. Click **Record Memory** and enter:
   ```text
   Professor said ARQ and Hamming Code are guaranteed to appear on the CN exam.
   ```
3. Save it. Notice that PalMind auto-categorizes it under `[Academic]` and generates dense vector embeddings.
4. Try typing in the Semantic Search bar:
   ```text
   What did professor say about the exam?
   ```
5. Watch PalMind instantly return the exact note with a semantic match badge, even though the exact wording differs!

---

## Step 5: Document Intelligence & Grounded RAG (40 Seconds)

1. Navigate to **Documents**.
2. Click **Upload Document** and select `uploads/CN_Exam_Revision_Guide.txt` (or any PDF/DOCX file).
3. Watch the local parser extract text, split it into chunks, generate embeddings, and display the AI summary.
4. Navigate to **Ask PalMind** (AI Chat) and ask:
   ```text
   What should I study first tonight?
   ```
5. Point out how PalMind reasons across:
   - The upcoming Computer Networks exam deadline
   - The professor's memory note about Hamming Code
   - The uploaded revision guide
6. Click the **Grounded Sources** dropdown beneath the answer:
   - Shows the exact document name, page number, and quoted excerpt.
   - Shows the exact memory note retrieved.
   - **Zero hallucination, 100% verifiable.**

---

## Step 6: Study Mode & Real Timer (20 Seconds)

1. Navigate to **Study Mode**.
2. Select **25 min (Pomodoro)** for *Computer Networks*.
3. Click **Generate Plan**: show the AI-tailored breakdown (e.g., *0–15m review, 15–25m active recall*).
4. Click **Start Focus**: the timer begins counting down in real-time.
5. Click **Finish Early**: show the session save and how the analytics (sessions completed, study minutes) update live in the database!

---

## Step 7: Privacy Center & Conclusion (20 Seconds)

1. Navigate to **Privacy Center**.
2. Highlight the 4 local pillars:
   - Local SQLite database
   - Local Ollama LLM (`qwen2.5`)
   - Local Sentence Transformers embeddings (`all-MiniLM-L6-v2`)
   - Zero telemetry / zero cloud API dependencies
---

## Step 8: Google & Gmail Sign In / Account Switch (15 Seconds)

1. Click **Sign In** in the top header (or press `Ctrl+K` and choose *Sign In / Switch Account*).
2. Choose **Continue with Google** for instantaneous one-click Google profile login, or enter a manual Gmail address and password under **Create Account**.
3. Point out the authenticated avatar, user pill, and account menu with seamless local session tokens.

---

## Conclusion

> *"PalMind doesn't just answer questions. It remembers what matters to one person — quietly, privately, and completely offline."*
