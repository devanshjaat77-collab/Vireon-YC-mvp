# VIREON Investigation Console

A focused frontend MVP for an AI-assisted industrial machine fault investigation workflow.

## Architecture

- **React + TypeScript + Vite** provides the responsive investigation console.
- **React Three Fiber + Drei** render an inspectable digital twin of a process pump skid. Sensor markers identify selectable components and reflect the selected fault focus.
- `src/services/investigation.ts` is a deliberately explicit **demo-only decision layer**. It has no AI claims and is the intended replacement seam for a backend endpoint backed by machine telemetry and technical-document retrieval.
- The complete MVP workflow is asset selection → fault input → demo triage → synchronized 3D component focus → action outcome → next diagnostic step → timeline. UI session state stays in `App.tsx` for the fast MVP; a production backend would persist investigations, actions, telemetry, and operator feedback.

## Run

```bash
npm install
npm run dev
```

## Checks

```bash
npm run lint
npm run build
```
