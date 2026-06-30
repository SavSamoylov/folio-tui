import { useState } from "react";
import { useKeyboard } from "@opentui/react";

interface ProjectPickerProps {
  projects: { name: string; path: string }[];
  onSelect: (path: string) => void;
  onCreate: (title: string) => void;
  width: number;
  height: number;
}

const COLS      = 2;
const CARD_W    = 22;
const CARD_H    = 4;
const CARD_GAP  = 2;  // horizontal gap between cards
const ROW_GAP   = 1;  // vertical gap between rows
const SIDE_PAD  = 2;
const HEADER_H  = 5;  // blank + title + subtitle + divider + blank

export function ProjectPicker({ projects, onSelect, onCreate, width, height }: ProjectPickerProps) {
  const [cursor,    setCursor]    = useState(0);
  const [scrollRow, setScrollRow] = useState(0);
  const [creating,  setCreating]  = useState(false);
  const [newTitle,  setNewTitle]  = useState("");

  const items    = [...projects, { name: "+ New project", path: "__new__" }];
  const gridRows = Math.ceil(items.length / COLS);

  // How many card rows fit without overflowing the terminal.
  // panel = HEADER_H + rows*(CARD_H+ROW_GAP) - ROW_GAP + 2 (padding rows)
  // solve for rows such that panel <= height - 2 (1 margin each side)
  const maxVisibleRows = Math.max(1, Math.floor((height - 2 - HEADER_H - 2 + ROW_GAP) / (CARD_H + ROW_GAP)));
  const visibleRows    = Math.min(gridRows, maxVisibleRows);

  const panelWidth  = SIDE_PAD * 2 + CARD_W * COLS + CARD_GAP * (COLS - 1);
  const panelHeight = HEADER_H + visibleRows * CARD_H + (visibleRows - 1) * ROW_GAP + 2;
  const panelX = Math.floor((width  - panelWidth)  / 2);
  const panelY = Math.max(1, Math.floor((height - panelHeight) / 2));

  const showScrollUp   = scrollRow > 0;
  const showScrollDown = scrollRow + visibleRows < gridRows;

  function moveCursor(next: number) {
    const nextRow = Math.floor(next / COLS);
    setCursor(next);
    setScrollRow((sr) => {
      if (nextRow < sr) return nextRow;
      if (nextRow >= sr + maxVisibleRows) return nextRow - maxVisibleRows + 1;
      return sr;
    });
  }

  function select(i: number) {
    const item = items[i];
    if (item.path === "__new__") setCreating(true);
    else onSelect(item.path);
  }

  useKeyboard((key) => {
    if (creating) {
      if (key.name === "return" && newTitle.trim()) {
        onCreate(newTitle.trim());
      } else if (key.name === "backspace") {
        setNewTitle((t) => t.slice(0, -1));
      } else if (key.name === "escape") {
        setCreating(false);
        setNewTitle("");
      } else if (key.sequence.length === 1 && !key.ctrl && !key.meta && key.sequence.charCodeAt(0) >= 32) {
        setNewTitle((t) => t + key.sequence);
      }
      return;
    }

    if (key.name === "return") { select(cursor); return; }

    const col = cursor % COLS;
    const row = Math.floor(cursor / COLS);

    if (key.name === "right" || key.name === "l") {
      moveCursor(Math.min(cursor + 1, items.length - 1));
    } else if (key.name === "left" || key.name === "h") {
      moveCursor(Math.max(cursor - 1, 0));
    } else if (key.name === "down" || key.name === "j") {
      moveCursor(Math.min(Math.min(row + 1, gridRows - 1) * COLS + col, items.length - 1));
    } else if (key.name === "up" || key.name === "k") {
      moveCursor(Math.max(row - 1, 0) * COLS + col);
    }
  });

  const accentRed  = "#E63946";
  const mutedText  = "#666666";
  const activeText = "#F5F5F0";
  const dimText    = "#2E2E2E";

  if (creating) {
    return (
      <box width={width} height={height} bg="#0D0D0D">
        <box x={panelX} y={panelY} width={panelWidth} height={6} bg="#111111">
          <text content="  NEW PROJECT" fg={accentRed} bold y={1} x={2} />
          <text content={"─".repeat(panelWidth)} fg="#222222" y={2} />
          <text content="  Title:" fg={mutedText} y={3} x={2} />
          <text content={`  ${newTitle}_`} fg={activeText} y={4} x={2} />
        </box>
      </box>
    );
  }

  const dividerLine =
    (showScrollUp ? "↑ " : "  ") +
    "─".repeat(panelWidth - 4) +
    (showScrollDown ? " ↓" : "  ");

  return (
    <box width={width} height={height} bg="#0D0D0D">
      <box
        x={panelX}
        y={panelY}
        width={panelWidth}
        height={panelHeight}
        backgroundColor="#111111"
        flexDirection="column"
      >
        {/* Header */}
        <box width={panelWidth} height={1} />
        <box width={panelWidth} height={1}>
          <text content="  FOLIO" fg={accentRed} bold />
        </box>
        <box width={panelWidth} height={1}>
          <text content="  Open a project" fg={mutedText} />
        </box>
        <box width={panelWidth} height={1}>
          <text content={dividerLine} fg={showScrollUp || showScrollDown ? mutedText : "#222222"} />
        </box>
        <box width={panelWidth} height={1} />

        {/* Visible card rows only */}
        {Array.from({ length: visibleRows }).map((_, vi) => {
          const rowIdx   = scrollRow + vi;
          const rowItems = items.slice(rowIdx * COLS, (rowIdx + 1) * COLS);

          return (
            <box
              key={rowIdx}
              width={panelWidth}
              height={CARD_H}
              flexDirection="row"
              paddingLeft={SIDE_PAD}
              marginBottom={vi < visibleRows - 1 ? ROW_GAP : 0}
            >
              {rowItems.map((item, colIdx) => {
                const i          = rowIdx * COLS + colIdx;
                const isSelected = cursor === i;
                const isNew      = item.path === "__new__";
                const nameFg     = isNew
                  ? (isSelected ? mutedText : dimText)
                  : (isSelected ? activeText : mutedText);

                return (
                  <box
                    key={item.path}
                    width={CARD_W}
                    height={CARD_H}
                    marginRight={colIdx < rowItems.length - 1 ? CARD_GAP : 0}
                    backgroundColor={isSelected ? "#1E1E1E" : "#181818"}
                    flexDirection="column"
                    paddingTop={1}
                    paddingLeft={2}
                    onMouseDown={() => { moveCursor(i); select(i); }}
                  >
                    <text
                      content={`${isSelected ? "▶ " : "  "}${isNew ? "+ New project" : item.name}`.slice(0, CARD_W - 2)}
                      fg={nameFg}
                    />
                  </box>
                );
              })}
            </box>
          );
        })}
      </box>
    </box>
  );
}
