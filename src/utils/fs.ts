import { join } from "path";
import { homedir } from "os";
import { v4 as uuidv4 } from "uuid";
import type { Project, Scene, Chapter } from "./types";

export const FOLIO_DIR = join(homedir(), "folio");

export async function ensureFolioDir(): Promise<void> {
  await Bun.write(join(FOLIO_DIR, ".keep"), "");
}

export async function listProjects(): Promise<{ name: string; path: string }[]> {
  await ensureFolioDir();
  const glob = new Bun.Glob("*.folio.json");
  const files: { name: string; path: string }[] = [];
  for await (const file of glob.scan(FOLIO_DIR)) {
    const name = file.replace(".folio.json", "");
    files.push({ name, path: join(FOLIO_DIR, file) });
  }
  return files.sort((a, b) => a.name.localeCompare(b.name));
}

export async function loadProject(filePath: string): Promise<Project> {
  const text = await Bun.file(filePath).text();
  return JSON.parse(text) as Project;
}

export async function saveProject(project: Project): Promise<void> {
  const slug = project.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const filePath = join(FOLIO_DIR, `${slug}.folio.json`);
  project.updatedAt = new Date().toISOString();
  await Bun.write(filePath, JSON.stringify(project, null, 2));
}

export function createProject(title: string): Project {
  const now = new Date().toISOString();
  const firstScene: Scene = {
    id: uuidv4(),
    title: "Scene 1",
    order: 0,
    content: "",
    wordCount: 0,
    updatedAt: now,
  };
  const firstChapter: Chapter = {
    id: uuidv4(),
    title: "Chapter 1",
    order: 0,
    scenes: [firstScene],
    notes: "",
  };
  return {
    id: uuidv4(),
    title,
    createdAt: now,
    updatedAt: now,
    chapters: [firstChapter],
  };
}

export function createScene(order: number): Scene {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    title: `Scene ${order + 1}`,
    order,
    content: "",
    wordCount: 0,
    updatedAt: now,
  };
}

export function createChapter(order: number): Chapter {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    title: `Chapter ${order + 1}`,
    order,
    scenes: [
      {
        id: uuidv4(),
        title: "Scene 1",
        order: 0,
        content: "",
        wordCount: 0,
        updatedAt: now,
      },
    ],
    notes: "",
  };
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function totalWordCount(project: Project): number {
  return project.chapters.reduce((acc, ch) => {
    return acc + ch.scenes.reduce((a, sc) => a + sc.wordCount, 0);
  }, 0);
}
