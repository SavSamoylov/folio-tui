# Folio TUI — Copilot Instructions

## Project

Terminal writing application built with OpenTUI + React bindings. Zen-first, keyboard-driven. Part of the Folio ecosystem.

## Stack

- Runtime: Bun
- UI: OpenTUI (`@opentui/core`, `@opentui/react`)
- Language: TypeScript with React JSX
- Storage: JSON files in `~/folio/*.folio.json`

## Design principles (Bauhaus, adapted for terminal)

- **No decoration that doesn't inform.** Every character on screen earns its place.
- **Color palette:** Background `#0D0D0D`, surface `#111111`, border/divider `#1A1A1A–#222222`, muted text `#555555–#666666`, active text `#F5F5F0`, accent red `#E63946`, accent blue `#4361EE`, accent yellow `#F4A261`.
- **Zen by default.** The editor is the only thing on screen unless the user explicitly opens a panel.
- **Sidebar width:** 24 chars. Fixed. Never resize dynamically.
- **Editor max width:** 72 chars, horizontally centered in the available width.
- **Status bar:** Bottom 1 row only. Word count + save status, right-aligned.
- **Top bar:** 1 row. App name left, breadcrumb center, hints right.

## File structure

```
src/
  index.tsx         # Entry point
  App.tsx           # Root component, state, routing between screens
  types.ts          # Project/Chapter/Scene/NavNode types
  components/
    Editor.tsx      # Textarea + auto-save + keybindings
    Sidebar.tsx     # Chapter/scene tree navigation
    ProjectPicker.tsx # Launch screen, project list + new project
  utils/
    fs.ts           # File I/O, project CRUD, word count
```

## Conventions

- Components receive width/height as props derived from terminal dimensions via `useOnResize`.
- All keyboard handling via `useKeyboard` from `@opentui/react`.
- Auto-save: debounce 1200ms on content change, write via `Bun.write`.
- Never use browser APIs (localStorage, fetch, DOM). Bun APIs only.
- UUID generation via the `uuid` package.
- Keep components focused. App.tsx owns all state; components are pure renderers + local key handlers.

## Keybindings

| Key | Effect |
|-----|--------|
| `Ctrl+B` | Toggle sidebar |
| `Ctrl+S` | Manual save |
| `j / ↓` | Down in sidebar |
| `k / ↑` | Up in sidebar |
| `Enter` | Open selected scene, close sidebar |
| `Esc` | Return focus to editor |
| `Ctrl+Q` | Quit |
