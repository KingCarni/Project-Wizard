/**
 * localStorage-backed project store.
 * Keeps things simple: one array of projects, autosave on every mutation.
 */
import { v4 as uuid } from "uuid";

const KEY = "projectWizard.v1.projects";

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to read projects", e);
    return [];
  }
}

function write(projects) {
  try {
    localStorage.setItem(KEY, JSON.stringify(projects));
  } catch (e) {
    console.error("Failed to write projects", e);
  }
}

export function listProjects() {
  return read().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export function getProject(id) {
  return read().find((p) => p.id === id) || null;
}

export function createProject({ name, templateId, selectedBuilder }) {
  const now = new Date().toISOString();
  const project = {
    id: uuid(),
    name: name || "Untitled Project",
    templateId,
    selectedBuilder: selectedBuilder || "lovable",
    status: "Draft",
    answers: {},
    contextFiles: [], // { id, name, size, type, content }
    setupProgress: {},
    generatedOutputs: null,
    lastBuilderOverride: false,
    createdAt: now,
    updatedAt: now,
  };
  const projects = read();
  projects.push(project);
  write(projects);
  return project;
}

export function updateProject(id, patch) {
  const projects = read();
  const idx = projects.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  projects[idx] = {
    ...projects[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  write(projects);
  return projects[idx];
}

export function setAnswer(id, questionId, value) {
  const project = getProject(id);
  if (!project) return null;
  const answers = { ...project.answers, [questionId]: value };
  return updateProject(id, { answers });
}

export function addContextFile(id, file) {
  const project = getProject(id);
  if (!project) return null;
  const contextFiles = [...(project.contextFiles || []), file];
  return updateProject(id, { contextFiles });
}

export function removeContextFile(id, fileId) {
  const project = getProject(id);
  if (!project) return null;
  const contextFiles = (project.contextFiles || []).filter((f) => f.id !== fileId);
  return updateProject(id, { contextFiles });
}

export function deleteProject(id) {
  const projects = read().filter((p) => p.id !== id);
  write(projects);
}

export function toggleSetupTask(id, taskId) {
  const project = getProject(id);
  if (!project) return null;
  const setupProgress = { ...(project.setupProgress || {}), [taskId]: !project.setupProgress?.[taskId] };
  return updateProject(id, { setupProgress });
}
