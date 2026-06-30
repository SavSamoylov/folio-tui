export interface Scene {
  id: string;
  title: string;
  order: number;
  content: string;
  wordCount: number;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  title: string;
  order: number;
  scenes: Scene[];
  notes: string;
}

export interface Project {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  chapters: Chapter[];
}

export type PanelFocus = "sidebar" | "editor";
export type SidebarSection = "chapters" | "plot";

export interface NavNode {
  type: "chapter" | "scene" | "note";
  chapterIndex: number;
  sceneIndex?: number;
}
