# Argumentation Game (prototype)

Requirements:
- Node 18+
- An OpenAI-compatible API key in environment variable OPENAI_API_KEY

Run:
1. Install root deps:
   npm install
2. Create a `frontend` folder and run `npm init` + install react/vite or use the example scaffolding:
   cd frontend
   npm init vite@latest . --template react
   npm install
3. Start the backend:
   OPENAI_API_KEY=your_key node server/index.js
4. Start frontend dev server:
   cd frontend
   npm run dev
5. Open mobile browser to the frontend dev URL (or use ngrok if testing on a real phone).

Notes:
- This prototype uses the LLM to both parse opinions and evaluate code. For production use, sandbox any user code before running.
- Tune the prompts in server/promptTemplates.js to match the style and strictness you want.