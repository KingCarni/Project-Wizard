/**
 * AI service — thin wrapper around the two LLM endpoints.
 * Model-agnostic on the client: we send DNA + selected fields, get text back.
 * The endpoint chooses which provider to use.
 */
const API = process.env.REACT_APP_BACKEND_URL;

/**
 * Generate all four outputs (Emergent, Lovable, Markdown spec, QA) from a Project object.
 * Returns { outputs: {...}, generatedBy: 'ai' } or throws.
 */
export async function generateOutputsWithAI(project, template) {
  const payload = {
    projectName: project.name,
    templateName: template?.name || project.templateId,
    templateId: project.templateId,
    selectedBuilder: project.selectedBuilder,
    recommendedBuilder: project.selectedBuilder, // client already reconciled
    answers: project.answers || {},
    contextFiles: (project.contextFiles || []).map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
      // Cap content per file to keep the payload reasonable.
      content: (f.content || "").slice(0, 4000),
    })),
  };

  const res = await fetch(`${API}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let msg = `Generate failed: HTTP ${res.status}`;
    try {
      const err = await res.json();
      if (err?.detail) msg = err.detail;
    } catch { /* noop */ }
    throw new Error(msg);
  }
  const data = await res.json();
  return {
    outputs: data.outputs,
    generatedBy: data.generatedBy || "ai",
    model: data.model,
  };
}

/**
 * Rewrite a single field. Returns a suggestion string.
 * `projectSummary` gives the model project-wide context so rewrites feel on-brand.
 */
export async function rewriteFieldWithAI({ label, currentValue, projectSummary, guidance = "improve" }) {
  const res = await fetch(`${API}/api/rewrite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ label, currentValue: currentValue || "", projectSummary: projectSummary || "", guidance }),
  });
  if (!res.ok) {
    let msg = `Rewrite failed: HTTP ${res.status}`;
    try {
      const err = await res.json();
      if (err?.detail) msg = err.detail;
    } catch { /* noop */ }
    throw new Error(msg);
  }
  const data = await res.json();
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
