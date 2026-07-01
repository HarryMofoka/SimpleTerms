# SimpleTerms Website

SimpleTerms is a React website for a contract-understanding product. The current build includes a polished marketing surface, secure upload validation, progress states, and a typed sample analysis report that mirrors the future backend response shape.

## Run Locally

```bash
npm install
npm run dev
```

## Quality Checks

```bash
npm run typecheck
npm run build
```

## Security Notes

- The frontend never stores uploaded files or reads document contents in this demo.
- File validation is intentionally limited to obvious client-side checks. Production must repeat all checks on the backend.
- Secrets must never use the `VITE_` prefix because Vite exposes those values to the browser.
- The app does not use `dangerouslySetInnerHTML`; user-provided strings should continue to be rendered as text only.

## Project Structure

```text
src/
  components/      Shared layout and UI components
  data/            Static demo data
  features/        Product features grouped by responsibility
  lib/             Small reusable utilities
  types/           Shared TypeScript types
```
