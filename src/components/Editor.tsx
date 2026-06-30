import { useState, useEffect, useRef } from "react";
import { useKeyboard, useRenderer } from "@opentui/react";
import { applyGain } from "@opentui/core";
import { countWords } from "../utils/fs";

import type { Theme } from "../theme";

interface EditorProps {
  content: string;
  sceneTitle: string;
  chapterTitle: string;
  onContentChange: (content: string) => void;
  onSave: () => void;
  onToggleSidebar: () => void;
  sidebarVisible: boolean;
  width: number;
  height: number;
  theme: Theme;
}

export function Editor({
  content,
  sceneTitle,
  chapterTitle,
  onContentChange,
  onSave,
  onToggleSidebar,
  sidebarVisible,
  width,
  height,
  theme,
}: EditorProps) {
  const renderer = useRenderer();
  const [saved, setSaved] = useState(true);
  const [typewriter, setTypewriter] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<any>(null);
  const fadeMaskRef = useRef<Float32Array | null>(null);
  const fadeMaskDimsRef = useRef({ bw: 0, bh: 0, sx: -1, sy: -1, tw: 0, th: 0, showTopFade: false, showBottomFade: false });
  const wordCount = countWords(content);


  // Yield keyboard focus to the sidebar when it opens; reclaim when it closes.
  useEffect(() => {
    if (!textareaRef.current) return;
    if (sidebarVisible) {
      textareaRef.current.blur();
    } else {
      textareaRef.current.focus();
    }
  }, [sidebarVisible]);

  // Sync textarea buffer when scene changes externally (navigation)
  useEffect(() => {
    if (!textareaRef.current) return;
    const current = textareaRef.current.editBuffer?.getText();
    if (current !== content) {
      textareaRef.current.setText(content);
    }
  }, [content]);

  // Fade effect at top/bottom of textarea
  useEffect(() => {
    if (!renderer) return;
    const FADE_ROWS = 4;

    const postProcess = (buffer: any) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const sx = textarea.screenX;
      const sy = textarea.screenY;
      const tw = textarea.width;
      const th = textarea.height;
      const bw = buffer.width;
      const bh = buffer.height;
      const ev = textarea.editorView;
      const viewport = ev?.getViewport();
      const showTopFade = (viewport?.offsetY ?? 0) > 0;
      const totalLines = ev?.getTotalVirtualLineCount() ?? 0;
      const showBottomFade = totalLines > (viewport?.offsetY ?? 0) + th;

      // Rebuild mask when layout or scroll state changes.
      // The mask is a flat list of (x, y, strength) triples.
      const dims = fadeMaskDimsRef.current;
      if (
        !fadeMaskRef.current ||
        dims.bw !== bw || dims.bh !== bh ||
        dims.sx !== sx || dims.sy !== sy ||
        dims.tw !== tw || dims.th !== th ||
        dims.showTopFade !== showTopFade ||
        dims.showBottomFade !== showBottomFade
      ) {
        fadeMaskDimsRef.current = { bw, bh, sx, sy, tw, th, showTopFade, showBottomFade };

        const triples: number[] = [];
        for (let row = 0; row < FADE_ROWS; row++) {
          const strength = (FADE_ROWS - row) / FADE_ROWS;
          const topY = sy + row;
          const botY = sy + th - 1 - row;
          for (let col = 0; col < tw; col++) {
            const x = sx + col;
            if (x < 0 || x >= bw) continue;
            if (showTopFade && topY >= 0 && topY < bh) triples.push(x, topY, strength);
            if (showBottomFade && botY !== topY && botY >= 0 && botY < bh) triples.push(x, botY, strength);
          }
        }
        fadeMaskRef.current = new Float32Array(triples);
      }

      if (fadeMaskRef.current.length > 0) {
        applyGain(buffer, 0.2, fadeMaskRef.current);
      }
    };

    renderer.addPostProcessFn(postProcess);
    return () => renderer.removePostProcessFn(postProcess);
  }, [renderer]);

  // Auto-save debounce
  useEffect(() => {
    setSaved(false);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      onSave();
      setSaved(true);
    }, 1200);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [content]);

  useKeyboard((key) => {
    if (showHelp) {
      if (key.name === "escape" || (key.ctrl && key.name === "/")) {
        setShowHelp(false);
      }
      return;
    }
    if (key.ctrl && key.name === "/") { setShowHelp(true); return; }
    if (key.ctrl && key.name === "b") onToggleSidebar();
    if (key.ctrl && key.name === "t") setTypewriter((v) => !v);
    if (key.ctrl && key.name === "s") {
      onSave();
      setSaved(true);
    }
    if (key.ctrl && key.name === "y") {
      const selected = textareaRef.current?.editorView?.getSelectedText?.();
      if (selected) {
        const proc = Bun.spawn(["pbcopy"], { stdin: "pipe" });
        proc.stdin.write(selected);
        proc.stdin.end();
      }
    }
  });

  const mutedText = theme.textFaint;
  const activeText = theme.text;
  const accentRed = theme.accent;

  const editorPad = 4;
  const editorWidth = Math.min(width - editorPad * 2, 72);
  const editorX = Math.floor((width - editorWidth) / 2);

  const breadcrumb = `${chapterTitle}  ·  ${sceneTitle}`;
  const saveLabel = saved ? "saved ✓" : "saving…";
  const statusRight = `${wordCount} words   ${saveLabel}`;

  return (
    <box width={width} height={height} backgroundColor={theme.bg} flexDirection="column">
      {/* Top bar */}
      <box width={width} height={1} backgroundColor={theme.surface}>
        <text
          content={sidebarVisible ? "  FOLIO" : "  FOLIO"}
          fg={accentRed}
          bold
          x={0}
        />
        <text
          content={breadcrumb}
          fg={mutedText}
          x={Math.floor((width - breadcrumb.length) / 2)}
        />
        <text
          content={typewriter ? `^B nav   ^S save   ^T typewriter ✦   ^/ help` : `^B nav   ^S save   ^T typewriter      ^/ help`}
          fg={typewriter ? theme.overlay : theme.border}
          x={width - 42}
        />
      </box>

      {/* Divider */}
      <box width={width} height={1} backgroundColor={theme.bg}>
        <text content={"─".repeat(width)} fg={theme.border} />
      </box>

      {/* Writing area */}
      <box
        width={width}
        height={height - 3}
        backgroundColor={theme.bg}
        paddingTop={2}
      >
        <textarea
          ref={textareaRef}
          x={editorX}
          width={editorWidth}
          height={height - 5}
          initialValue={content}
          onContentChange={() => {
            const text = textareaRef.current?.editBuffer?.getText() ?? "";
            onContentChange(text);
          }}
          onCursorChange={() => {
            if (!typewriter || !textareaRef.current) return;
            const ev = textareaRef.current.editorView;
            const viewport = ev.getViewport();
            const cursor = ev.getVisualCursor();
            const absRow = viewport.offsetY + cursor.visualRow;
            const centerRow = Math.floor(viewport.height / 2);
            const newOffsetY = Math.max(0, absRow - centerRow);
            if (newOffsetY !== viewport.offsetY) {
              ev.setViewport(viewport.offsetX, newOffsetY, viewport.width, viewport.height);
            }
          }}
          textColor={activeText}
          wrapMode="word"
        />
      </box>

      {/* Status bar */}
      <box width={width} height={1} backgroundColor={theme.surface}>
        <text
          content={`  ${statusRight}`}
          fg={mutedText}
          x={width - statusRight.length - 2}
        />
      </box>

      {/* Help overlay */}
      {showHelp && (() => {
        const modalW = 38;
        const modalH = 15;
        const border = theme.overlay;
        const labelFg = theme.textFaint;
        const keyFg = theme.textMuted;
        const rows: { key: string; desc: string }[] = [
          { key: "^B",  desc: "Toggle sidebar"     },
          { key: "^S",  desc: "Save"                },
          { key: "^T",  desc: "Typewriter mode"     },
          { key: "^Y",  desc: "Copy selection"      },
          { key: "^/",  desc: "Show / hide help"   },
          { key: "Esc", desc: "Close help"          },
        ];
        return (
          <box
            position="absolute"
            zIndex={100}
            top={Math.floor((height - modalH) / 2)}
            left={Math.floor((width - modalW) / 2)}
            width={modalW}
            height={modalH}
            backgroundColor={theme.surface}
            flexDirection="column"
          >
            <text content="" height={1} />
            <text content="  KEYBOARD SHORTCUTS" fg={accentRed} height={1} />
            <text content={"  " + "─".repeat(modalW - 4)} fg={border} height={1} />
            {rows.map(({ key, desc }) => (
              <box key={key} height={1} width={modalW} backgroundColor="#111111">
                <text content={`  ${key.padEnd(6)}`} fg={keyFg} x={0} />
                <text content={desc} fg={labelFg} x={9} />
              </box>
            ))}
            <text content={"  " + "─".repeat(modalW - 4)} fg={border} height={1} />
            <text content="  press ^/ or Esc to close" fg={border} height={1} />
          </box>
        );
      })()}
    </box>
  );
}
