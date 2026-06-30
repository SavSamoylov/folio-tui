import { useState } from "react";
import { useKeyboard } from "@opentui/react";

interface ProjectPickerProps {
  projects: { name: string; path: string }[];
  onSelect: (path: string) => void;
  onCreate: (title: string) => void;
  width: number;
  height: number;
}

export function ProjectPicker({ projects, onSelect, onCreate, width, height }: ProjectPickerProps) {
  const [cursor, setCursor] = useState(0);
  const [creating, setCreating] = useState(projects.length === 0);
  const [newTitle, setNewTitle] = useState("");

  const items = [...projects, { name: "+ New project", path: "__new__" }];

  useKeyboard((key) => {
    if (creating) {
      if (key.name === "return" && newTitle.trim()) {
        onCreate(newTitle.trim());
      } else if (key.name === "backspace") {
        setNewTitle((t) => t.slice(0, -1));
      } else if (key.name === "escape" && projects.length > 0) {
        setCreating(false);
      } else if (key.sequence.length === 1 && !key.ctrl && !key.meta && key.sequence.charCodeAt(0) >= 32) {
        setNewTitle((t) => t + key.sequence);
      }
      return;
    }

    if (key.name === "j" || key.name === "down") {
      setCursor((c) => Math.min(c + 1, items.length - 1));
    } else if (key.name === "k" || key.name === "up") {
      setCursor((c) => Math.max(c - 1, 0));
    } else if (key.name === "return") {
      const item = items[cursor];
      if (item.path === "__new__") {
        setCreating(true);
      } else {
        onSelect(item.path);
      }
    }
  });

  const accentRed = "#E63946";
  const mutedText = "#555555";
  const activeText = "#F5F5F0";

  const panelWidth = Math.min(width - 8, 52);
  const panelX = Math.floor((width - panelWidth) / 2);
  const panelY = Math.floor(height / 2) - Math.floor(items.length / 2) - 4;

  if (creating) {
    return (
      <box width={width} height={height} bg="#0D0D0D">
        <box x={panelX} y={panelY} width={panelWidth} height={6} bg="#111111">
          <text content="  NEW PROJECT" fg={accentRed} bold y={1} x={2} />
          <text content={"─".repeat(panelWidth)} fg="#222222" y={2} />
          <text content="  Title:" fg={mutedText} y={3} x={2} />
          <text
            content={`  ${newTitle}_`}
            fg={activeText}
            y={4}
            x={2}
          />
        </box>
      </box>
    );
  }

  return (
    <box width={width} height={height} bg="#0D0D0D">
      <box x={panelX} y={panelY} width={panelWidth} height={items.length + 5} bg="#111111">
        <text content="  FOLIO" fg={accentRed} bold y={1} x={2} />
        <text content="  Open a project" fg={mutedText} y={2} x={2} />
        <text content={"─".repeat(panelWidth)} fg="#222222" y={3} />
        {items.map((item, i) => (
          <text
            key={item.path}
            content={`  ${cursor === i ? "▶ " : "  "}${item.name}`}
            fg={cursor === i ? activeText : mutedText}
            bold={cursor === i}
            y={4 + i}
            x={0}
          />
        ))}
      </box>
    </box>
  );
}
