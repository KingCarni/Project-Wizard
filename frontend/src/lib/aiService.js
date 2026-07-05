/**
 * AI service — thin wrapper around the two LLM endpoints.
 * Model-agnostic on the client: we send DNA + selected fields, get text back.
 * The endpoint chooses which provider to use.
 */
const API = process.env.REACT_APP_BACKEND_URL;

async function callAPI(path, body) {
  if (!API) {
    throw new Error(
      "REACT_APP_BACKEND_URL is not set. On a local build, add it to /app/frontend/.env and restart the dev server."
    );
  }
  let res;
  try {
    res = await fetch(`${API}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (e) {
    throw new Error(
      `Cannot reach backend at ${API}${path}. Make sure the FastAPI server is running (locally: uvicorn on :8001) and REACT_APP_BACKEND_URL is correct.`
    );
  }
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      if (err?.detail) msg = err.detail;
    } catch { /* noop */ }
    if (res.status === 404) {
      msg += ` — endpoint not found at ${API}${path}. On a local build, confirm the backend exposes this route and REACT_APP_BACKEND_URL points to it.`;
    }
    throw new Error(msg);
  }
  return res.json();
}

/**
 * Generate all four outputs (Emergent, Lovable, Markdown spec, QA) from a Project object.
 */
export async function generateOutputsWithAI(project, template) {
  const payload = {
    projectName: project.name,
    templateName: template?.name || project.templateId,
    templateId: project.templateId,
    selectedBuilder: project.selectedBuilder,
    recommendedBuilder: project.selectedBuilder,
    answers: project.answers || {},
    contextFiles: (project.contextFiles || []).map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
      content: (f.content || "").slice(0, 4000),
    })),
  };
  const data = await callAPI("/api/generate", payload);
  return {
    outputs: data.outputs,
    generatedBy: data.generatedBy || "ai",
    model: data.model,
    partial: !!data.partial,
    failures: data.failures || {},
  };
}

/**
 * Rewrite a single field. Returns a suggestion string.
 */
export async function rewriteFieldWithAI({ label, currentValue, projectSummary, guidance = "improve" }) {
  const data = await callAPI("/api/rewrite", {
    label,
    currentValue: currentValue || "",
    projectSummary: projectSummary || "",
    guidance,
  });
  return data.suggestion;
}

/**
 * Build a compact one-paragraph project summary for the rewrite endpoint.
 * Uses only high-signal fields so the model isn't drowned.
 */
export function buildProjectSummary(project, template) {
  const a = project.answers || {};
  const parts = [];
  parts.push(`Project: ${project.name}`);
  parts.push(`Template: ${template?.name || project.templateId}`);
  if (a.businessName || a.restaurantName || a.productName || a.fullName) {
    parts.push(`Name: ${a.businessName || a.restaurantName || a.productName || a.fullName}`);
  }
  if (a.tagline) parts.push(`Tagline: ${a.tagline}`);
  if (a.description) parts.push(`Description: ${a.description}`);
  if (a.audience) parts.push(`Audience: ${a.audience}`);
  if (a.brandTone || a.tone) {
    const t = a.brandTone || a.tone;
    parts.push(`Tone: ${Array.isArray(t) ? t.join(", ") : t}`);
  }
  if (a.designStyle || a.visualStyle) parts.push(`Style: ${a.designStyle || a.visualStyle}`);
  if (a.primaryGoal) parts.push(`Primary goal: ${a.primaryGoal}`);
  return parts.join(" · ");
}
