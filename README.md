# 🧠 AI Study Companion

![React](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white)

An intelligent, full-stack web application that transforms your study materials (uploaded PDFs or pasted notes) into interactive flashcards and quizzes using advanced AI. Built with a modern, type-safe stack for high performance and reliability.

## ✨ Features

- **📄 Document Parsing:** Extract text directly from uploaded PDFs using `unpdf`.
- **🤖 AI-Powered Generation:** Automatically generate high-quality flashcards and quizzes from your notes utilizing Google's Gemini 2.5 Flash via the Lovable AI Gateway.
- **🔒 Strict Data Privacy:** The AI is strictly context-bound. It *only* uses facts extracted from your uploaded or pasted notes to generate study materials, ensuring zero hallucination from outside sources.
- **🧠 Interactive Study Modes:** Dedicated interfaces for Flashcard review and Quiz taking to test your knowledge.
- **🔐 Authentication & Profiles:** Secure user login and profile management powered by Lovable Cloud (Supabase).
- **💾 Session Persistence:** Local study progress is temporarily saved using `sessionStorage` so you don't lose track of your current session.

## 🛠 Tech Stack

- **Frontend Framework:** TanStack Start (React 19)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **AI Integration:** Lovable AI Gateway (google/gemini-2.5-flash)
- **Backend & Auth:** Lovable Cloud (Supabase)
- **PDF Processing:** `unpdf`

## 📂 Architecture & Project Structure

The project follows a clean, route-based architecture using TanStack Router conventions:

```text
src/
├── routes/
│   ├── index.tsx                        # Landing page
│   ├── flashcards.tsx                   # Flashcard study mode UI
│   ├── quiz.tsx                         # Quiz study mode UI
│   ├── auth.tsx                         # Authentication pages (Login/Signup)
│   └── _authenticated/
│       └── profile.tsx                  # Protected user profile page
├── lib/
│   ├── generate.functions.ts            # Server-side functions securely calling AI Gateway
│   └── study-store.ts                   # sessionStorage persistence logic
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- A Lovable AI Gateway API Key
- A Supabase Project (URL and Publishable Key)

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Itz-Sudip/QuiZone-project.git](https://github.com/Itz-Sudip/QuiZone-project.git)
   cd QuiZone-project
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or yarn / pnpm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add the following keys:
   ```env
   # Server-side Secret (NEVER expose to the frontend)
   LOVABLE_API_KEY=your_lovable_api_key_here

   # Public Client-side Variables
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000` (or the port specified by Vite).

5. **Build for production:**
   ```bash
   npm run build
   ```

## 📖 Usage Guide & Data Privacy

1. **Upload/Paste:** Navigate to the main dashboard and upload a PDF or paste your raw text notes.
2. **Generate:** Select whether you want Flashcards or a Quiz. The server functions (`src/lib/generate.functions.ts`) will securely send your text to the Gemini model.
3. **Study:** Use the generated materials.
4. **Data Privacy Note:** Your data is secure. The AI prompt is strictly engineered to *only* extract and reformat information present in your provided text. No external internet searches or pre-trained world knowledge are used to answer the questions.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 
Feel free to check the [issues page](https://github.com/Itz-Sudip/QuiZone-project/issues) if you want to contribute.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
