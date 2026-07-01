# SimpleTerms Website

SimpleTerms is a full-stack React application that analyzes legal contracts using AI. Users upload a PDF or DOCX file, the backend extracts the text and sends it to Gemini for structured analysis, and the frontend displays a plain-English report covering risks, obligations, key dates, important clauses, and a pre-signing checklist.

## Run Locally

```bash
npm install
cp .env.example .env      # Add your GEMINI_API_KEY
npm run dev                # Starts both Vite frontend and Express API
```

The Vite dev server proxies `/api/*` requests to the Express backend on port 3001.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start frontend + backend concurrently |
| `npm run dev:client` | Start Vite frontend only |
| `npm run dev:server` | Start Express API only |
| `npm run build` | Typecheck + production Vite build |
| `npm run start:server` | Run the API server (production) |
| `npm run typecheck` | Check frontend types |
| `npm run typecheck:server` | Check server types |

## Architecture

```text
src/                     React frontend (Vite)
  components/            Shared layout and UI components
  data/                  Static demo data (fallback report)
  features/
    upload/              File upload with real API integration
    report/              Contract analysis report renderer
  lib/                   Reusable utilities (file validation)
  types/                 Shared TypeScript types

server/                  Express backend
  index.ts               API server with multer file upload
  extractText.ts         PDF (pdf-parse) and DOCX (mammoth) text extraction
  analyzeContract.ts     Gemini AI structured output integration
```

## Security Notes

- The Gemini API key is stored in `.env` (gitignored) and only used server-side.
- Secrets must never use the `VITE_` prefix because Vite exposes those values to the browser.
- Uploaded files are stored temporarily in `uploads/` and deleted immediately after processing.
- The app does not use `dangerouslySetInnerHTML`; all strings are rendered as text nodes.
- File validation runs on both client and server.
- Gemini responses are enforced via `responseSchema` to guarantee predictable JSON output.

## Project Structure

```text
.env.example             Environment variable template
index.html               Entry HTML with Content Security Policy
vite.config.ts           Vite config with API proxy
tsconfig.json            Frontend TypeScript config
tsconfig.server.json     Backend TypeScript config
```
