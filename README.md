# folio-tui

A terminal writing environment for Folio. Zen-first, keyboard-driven.

## Requirements

- [Bun](https://bun.sh) v1.0+

## Setup

```bash
bun install
bun run dev
```

## Keybindings

| Key | Action |
|-----|--------|
| `Ctrl+B` | Toggle navigator sidebar |
| `Ctrl+S` | Save |
| `j / ↓` | Navigate down (sidebar) |
| `k / ↑` | Navigate up (sidebar) |
| `Enter` | Open selected scene |
| `Esc` | Return focus to editor |
| `Ctrl+Q` | Quit |

## Project files

Projects are stored as JSON in `~/folio/`:

```
~/folio/
  my-novel.folio.json
  another-story.folio.json
```

### Schema

```json
{
  "id": "uuid",
  "title": "My Novel",
  "createdAt": "ISO 8601",
  "updatedAt": "ISO 8601",
  "chapters": [
    {
      "id": "uuid",
      "title": "Chapter 1",
      "order": 0,
      "scenes": [
        {
          "id": "uuid",
          "title": "Scene 1",
          "order": 0,
          "content": "Plain text content.",
          "wordCount": 3,
          "updatedAt": "ISO 8601"
        }
      ]
    }
  ]
}
```

## Layout

**Zen mode** (default — sidebar hidden):
```
┌─────────────────────────────────────────┐
│  FOLIO     Chapter 1 · Scene 1          │
│─────────────────────────────────────────│
│                                         │
│       Your writing here, centered       │
│       at 72 chars max width.            │
│                                         │
│                   412 words   saved ✓  │
└─────────────────────────────────────────┘
```

**Navigator open** (`Ctrl+B`):
```
┌────────┬────────────────────────────────┐
│NAVIGATOR│  FOLIO    Chapter 1 · Scene 1 │
│────────│────────────────────────────────│
│CHAPTER 1│                               │
│  ▶ Sc 1 │   Your writing here...        │
│  Sc 2   │                               │
│CHAPTER 2│                               │
│  Sc 1   │         412 words   saved ✓  │
└────────┴────────────────────────────────┘
```
