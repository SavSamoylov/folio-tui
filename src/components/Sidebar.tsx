import { useState } from "react";
import { useKeyboard } from "@opentui/react";
import type { Project, NavNode } from "../types";
import type { Theme } from "../theme";

interface SidebarProps {
  project: Project;
  selected: NavNode;
  onSelect: (node: NavNode) => void;
  onClose: () => void;
  onAddChapter: () => void;
  onAddScene: (chapterIndex: number) => void;
  onRenameChapter: (chapterIndex: number, title: string) => void;
  width: number;
  height: number;
  theme: Theme;
}

export function Sidebar({
  project,
  selected,
  onSelect,
  onClose,
  onAddChapter,
  onAddScene,
  onRenameChapter,
  width,
  height,
  theme,
}: SidebarProps) {
  const [editingChapter, setEditingChapter] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // Flatten nav items for keyboard traversal
  const items: NavNode[] = [];
  for (let ci = 0; ci < project.chapters.length; ci++) {
    items.push({ type: "chapter", chapterIndex: ci });
    for (let si = 0; si < project.chapters[ci].scenes.length; si++) {
      items.push({ type: "scene", chapterIndex: ci, sceneIndex: si });
    }
    items.push({ type: "note", chapterIndex: ci });
  }

  const currentIndex = items.findIndex((item) => {
    if (item.type !== selected.type) return false;
    if (item.chapterIndex !== selected.chapterIndex) return false;
    if (item.type === "scene") return item.sceneIndex === selected.sceneIndex;
    return true;
  });

  function confirmEdit() {
    if (editingChapter === null) return;
    const trimmed = editTitle.trim();
    onRenameChapter(editingChapter, trimmed || `Chapter ${editingChapter + 1}`);
    setEditingChapter(null);
  }

  function startEdit(chapterIndex: number) {
    setEditingChapter(chapterIndex);
    setEditTitle(project.chapters[chapterIndex].title);
  }

  function handleAddClick() {
    const newIndex = project.chapters.length;
    onAddChapter();
    // Pre-select the new chapter and immediately enter edit mode for its title.
    // The chapter appears in the next render once App updates project state.
    onSelect({ type: "chapter", chapterIndex: newIndex });
    setEditTitle(`Chapter ${newIndex + 1}`);
    setEditingChapter(newIndex);
  }

  useKeyboard((key) => {
    // Chapter title edit mode
    if (editingChapter !== null) {
      if (key.name === "return") {
        confirmEdit();
      } else if (key.name === "escape") {
        setEditingChapter(null);
      } else if (key.name === "backspace") {
        setEditTitle((t) => t.slice(0, -1));
      } else if (
        key.sequence.length === 1 &&
        !key.ctrl &&
        !key.meta &&
        key.sequence.charCodeAt(0) >= 32
      ) {
        setEditTitle((t) => t + key.sequence);
      }
      return;
    }

    // Normal navigation
    if (key.name === "j" || key.name === "down") {
      const next = Math.min(currentIndex + 1, items.length - 1);
      onSelect(items[next]);
    } else if (key.name === "k" || key.name === "up") {
      const prev = Math.max(currentIndex - 1, 0);
      onSelect(items[prev]);
    } else if (key.name === "return") {
      const node = items[currentIndex];
      if (node?.type === "chapter") {
        startEdit(node.chapterIndex);
      } else if (node?.type === "scene" || node?.type === "note") {
        onSelect(node);
        onClose();
      }
    } else if (key.name === "escape") {
      onClose();
    } else if (key.name === "a") {
      handleAddClick();
    }
  });

  const borderColor = theme.overlay;
  const accentRed = theme.accent;
  const mutedText = theme.textMuted;
  const activeText = theme.text;
  const addFg = theme.textFaint;

  const rows: any[] = [];

  // Header
  rows.push(
    <box key="header" width={width} height={1}>
      <text content="NAVIGATOR" fg={accentRed} bold x={2} />
    </box>
  );

  rows.push(
    <box key="divider" width={width} height={1}>
      <text content={"─".repeat(width)} fg={borderColor} />
    </box>
  );

  // Nav items — rendered chapter by chapter so each gets its own (+) scene button
  for (let ci = 0; ci < project.chapters.length; ci++) {
    const chapter = project.chapters[ci];
    const chapterItem: NavNode = { type: "chapter", chapterIndex: ci };
    const isChapterSelected =
      selected.type === "chapter" && selected.chapterIndex === ci;
    const isEditing = editingChapter === ci;

    rows.push(
      <box
        key={`ch-${ci}`}
        width={width}
        height={1}
        backgroundColor={isChapterSelected ? theme.selection : undefined}
        onMouseDown={() => {
          if (isChapterSelected && !isEditing) {
            startEdit(ci);
          } else {
            onSelect(chapterItem);
          }
        }}
      >
        {isEditing ? (
          <text
            content={`  ${editTitle}_`.slice(0, width - 2)}
            fg={accentRed}
            x={0}
          />
        ) : (
          <text
            content={`  ${chapter.title.toUpperCase()}`.slice(0, width - 2)}
            fg={isChapterSelected ? accentRed : mutedText}
            bold={isChapterSelected}
            x={0}
          />
        )}
      </box>
    );

    for (let si = 0; si < chapter.scenes.length; si++) {
      const scene = chapter.scenes[si];
      const sceneItem: NavNode = { type: "scene", chapterIndex: ci, sceneIndex: si };
      const isSceneSelected =
        selected.type === "scene" &&
        selected.chapterIndex === ci &&
        selected.sceneIndex === si;
      const prefix = isSceneSelected ? "▶ " : "  ";

      rows.push(
        <box
          key={`sc-${ci}-${si}`}
          width={width}
          height={1}
          backgroundColor={isSceneSelected ? theme.selection : undefined}
          onMouseDown={() => onSelect(sceneItem)}
        >
          <text
            content={`    ${prefix}${scene.title}`.slice(0, width - 1)}
            fg={isSceneSelected ? activeText : mutedText}
            x={0}
          />
        </box>
      );
    }

    const noteItem: NavNode = { type: "note", chapterIndex: ci };
    const isNoteSelected = selected.type === "note" && selected.chapterIndex === ci;
    rows.push(
      <box
        key={`note-${ci}`}
        width={width}
        height={1}
        backgroundColor={isNoteSelected ? theme.selection : undefined}
        onMouseDown={() => onSelect(noteItem)}
      >
        <text
          content={`    ${isNoteSelected ? "▶ " : "  "}Notes`.slice(0, width - 1)}
          fg={isNoteSelected ? activeText : mutedText}
          x={0}
        />
      </box>
    );

    rows.push(
      <box
        key={`add-scene-${ci}`}
        width={width}
        height={1}
        focusable={false}
        onMouseDown={() => onAddScene(ci)}
      >
        <text content="    (+) scene" fg={addFg} x={0} selectable={false} />
      </box>
    );
  }

  // Add chapter button
  rows.push(
    <box key="divider-bottom" width={width} height={1}>
      <text content={"─".repeat(width)} fg={accentRed} />
    </box>
  );
  rows.push(
    <box
      key="add-chapter-row"
      width={width}
      height={1}
    >
      <box
        key="add-chapter"
        alignSelf="flex-start"
        marginLeft={2}
        paddingLeft={1}
        paddingRight={1}
        backgroundColor={theme.overlay}
        focusable={false}
        onMouseDown={handleAddClick}
      >
        <text content="(+) New chapter" fg={addFg} selectable={false} />
      </box>
    </box>
  );

  return (
    <box width={width} height={height} flexDirection="column">
      {rows}
    </box>
  );
}
