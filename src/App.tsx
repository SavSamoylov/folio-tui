import { useState, useEffect } from "react";
import { useRenderer, useOnResize } from "@opentui/react";
import { ProjectPicker } from "./components/ProjectPicker";
import { Sidebar } from "./components/Sidebar";
import { Editor } from "./components/Editor";
import {
  listProjects,
  loadProject,
  saveProject,
  createProject,
  createChapter,
  createScene,
  countWords,
} from "./utils/fs";
import type { Project, NavNode } from "./types";

const SIDEBAR_WIDTH = 24;

export function App() {
  const renderer = useRenderer();
  const [termWidth, setTermWidth] = useState(renderer?.root?.width ?? 80);
  const [termHeight, setTermHeight] = useState(renderer?.root?.height ?? 24);

  const [screen, setScreen] = useState<"picker" | "editor">("picker");
  const [projects, setProjects] = useState<{ name: string; path: string }[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [currentPath, setCurrentPath] = useState<string | null>(null);

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [selected, setSelected] = useState<NavNode>({
    type: "scene",
    chapterIndex: 0,
    sceneIndex: 0,
  });

  useOnResize((w, h) => {
    setTermWidth(w);
    setTermHeight(h);
  });

  useEffect(() => {
    listProjects().then(setProjects);
  }, []);

  async function handleSelectProject(path: string) {
    const p = await loadProject(path);
    setProject(p);
    setCurrentPath(path);
    setScreen("editor");
  }

  async function handleCreateProject(title: string) {
    const p = createProject(title);
    await saveProject(p);
    const updated = await listProjects();
    setProjects(updated);
    const found = updated.find((u) => u.name === title.toLowerCase().replace(/\s+/g, "-"));
    if (found) {
      await handleSelectProject(found.path);
    }
  }

  function getCurrentScene() {
    if (!project) return null;
    const chapter = project.chapters[selected.chapterIndex];
    if (!chapter) return null;
    if (selected.type === "chapter") return chapter.scenes[0] ?? null;
    if (selected.type === "note") return null;
    return chapter.scenes[selected.sceneIndex ?? 0] ?? null;
  }

  function getCurrentChapter() {
    if (!project) return null;
    return project.chapters[selected.chapterIndex] ?? null;
  }

  function handleContentChange(content: string) {
    if (!project) return;
    const updated = { ...project };
    const chapter = updated.chapters[selected.chapterIndex];
    if (selected.type === "note") {
      chapter.notes = content;
      setProject(updated);
      return;
    }
    const sceneIndex = selected.type === "scene" ? (selected.sceneIndex ?? 0) : 0;
    const scene = chapter.scenes[sceneIndex];
    scene.content = content;
    scene.wordCount = countWords(content);
    scene.updatedAt = new Date().toISOString();
    setProject(updated);
  }

  async function handleSave() {
    if (!project) return;
    await saveProject(project);
  }

  function handleNavSelect(node: NavNode) {
    setSelected(node);
  }

  function handleAddScene(chapterIndex: number) {
    if (!project) return;
    const chapter = project.chapters[chapterIndex];
    const newScene = createScene(chapter.scenes.length);
    const chapters = project.chapters.map((ch, i) =>
      i === chapterIndex ? { ...ch, scenes: [...ch.scenes, newScene] } : ch
    );
    const updated = { ...project, chapters };
    setProject(updated);
    saveProject(updated);
    setSelected({ type: "scene", chapterIndex, sceneIndex: chapter.scenes.length });
  }

  function handleAddChapter() {
    if (!project) return;
    const newChapter = createChapter(project.chapters.length);
    const updated = { ...project, chapters: [...project.chapters, newChapter] };
    setProject(updated);
    saveProject(updated);
  }

  function handleRenameChapter(chapterIndex: number, title: string) {
    if (!project) return;
    const chapters = project.chapters.map((ch, i) =>
      i === chapterIndex ? { ...ch, title } : ch
    );
    const updated = { ...project, chapters };
    setProject(updated);
    saveProject(updated);
  }

  if (screen === "picker") {
    return (
      <ProjectPicker
        projects={projects}
        onSelect={handleSelectProject}
        onCreate={handleCreateProject}
        width={termWidth}
        height={termHeight}
      />
    );
  }

  if (!project) return null;

  const scene = getCurrentScene();
  const chapter = getCurrentChapter();
  const isNote = selected.type === "note";
  const editorContent = isNote ? (chapter?.notes ?? "") : (scene?.content ?? "");
  const editorSceneTitle = isNote ? "Notes" : (scene?.title ?? "");
  const editorWidth = sidebarVisible ? termWidth - SIDEBAR_WIDTH : termWidth;

  return (
    <box width={termWidth} height={termHeight} flexDirection="row">
      {sidebarVisible && (
        <Sidebar
          project={project}
          selected={selected}
          onSelect={handleNavSelect}
          onClose={() => setSidebarVisible(false)}
          onAddChapter={handleAddChapter}
          onAddScene={handleAddScene}
          onRenameChapter={handleRenameChapter}
          width={SIDEBAR_WIDTH}
          height={termHeight}
        />
      )}
      <Editor
        content={editorContent}
        sceneTitle={editorSceneTitle}
        chapterTitle={chapter?.title ?? ""}
        onContentChange={handleContentChange}
        onSave={handleSave}
        onToggleSidebar={() => setSidebarVisible((v) => !v)}
        sidebarVisible={sidebarVisible}
        width={editorWidth}
        height={termHeight}
      />
    </box>
  );
}
