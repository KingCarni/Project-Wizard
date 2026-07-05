import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Copy, Check, Sparkles, RefreshCw, Rocket, Download, Loader2, FileText, Zap } from "lucide-react";
import TopBar from "../components/TopBar";
import { getProject, updateProject } from "../lib/storage";
import { getTemplate } from "../templates";
import { buildProjectDNA } from "../lib/dna";
import { generateAll } from "../lib/generators";
import { generateOutputsWithAI } from "../lib/aiService";
import { toast } from "sonner";

const TABS = [
  { id: "emergentPrompt", label: "Emergent Prompt", desc: "Structured build prompt for Emergent." },
  { id: "lovablePrompt", label: "Lovable Prompt", desc: "Visual, marketing-first prompt for Lovable." },
  { id: "markdownSpec", label: "Markdown Spec", desc: "Portable brief for Claude, Cursor, or a developer." },
  { id: "qaChecklist", label: "QA Checklist", desc: "Pre-launch quality gate." },
];

export default function Outputs() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [active, setActive] = useState("emergentPrompt");
  const [copied, setCopied] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  useEffect(() => {
    const p = getProject(id);
    if (!p) { navigate("/"); return; }
    setActive(p.selectedBuilder === "emergent" ? "emergentPrompt" : "lovablePrompt");
    setProject(p);
  }, [id, navigate]);

  const template = useMemo(() => project && getTemplate(project.templateId), [project]);

  const outputs = useMemo(() => {
    if (!project) return null;
    return project.generatedOutputs || generateAll(buildProjectDNA(project));
  }, [project]);

  if (!project || !outputs || !template) return null;

  const currentContent = outputs[active] || "";
  const generatedBy = project.generatedBy || "deterministic";

  const regenerateDeterministic = () => {
    const dna = buildProjectDNA(project);
    const fresh = generateAll(dna);
    const updated = updateProject(project.id, {
      generatedOutputs: fresh,
      generatedBy: "deterministic",
      generatedModel: null,
      generatedAt: new Date().toISOString(),
      aiFallback: false,
      status: "Generated",
    });
    setProject(updated);
    setAiError(null);
    toast.success("Rebuilt from template");
  };

  const generateWithAI = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const { outputs: aiOutputs, model } = await generateOutputsWithAI(project, template);
      const updated = updateProject(project.id, {
        generatedOutputs: aiOutputs,
        generatedBy: "ai",
        generatedModel: model,
        generatedAt: new Date().toISOString(),
        aiFallback: false,
        status: "Generated",
      });
      setProject(updated);
      toast.success("AI-generated outputs ready");
    } catch (e) {
      setAiError(e.message || "AI generation failed");
      toast.error("AI generation unavailable — showing template output.");
      // Fallback path: regenerate deterministic and flag the fallback.
      const dna = buildProjectDNA(project);
      const fresh = generateAll(dna);
      const updated = updateProject(project.id, {
        generatedOutputs: fresh,
        generatedBy: "deterministic",
        generatedModel: null,
        generatedAt: new Date().toISOString(),
        aiFallback: true,
        status: "Generated",
      });
      setProject(updated);
    } finally {
      setAiLoading(false);
    }
  };

  const copy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(currentContent);
      } else {
        const ta = document.createElement("textarea");
        ta.value = currentContent;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Copy failed — try selecting manually");
    }
  };

  const download = () => {
    const blob = new Blob([currentContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, "-").toLowerCase()}-${active}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-bg" data-testid="outputs-page">
      <TopBar
        right={
          <>
            <button
              className="pw-btn pw-btn-ghost text-sm"
              onClick={() => navigate(`/project/${project.id}`)}
              data-testid="outputs-back-btn"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to wizard
            </button>
            <button
              className="pw-btn pw-btn-primary text-sm"
              onClick={() => navigate(`/project/${project.id}/launch`)}
              data-testid="outputs-launch-btn"
            >
              <Rocket className="w-3.5 h-3.5" /> Launch checklist
            </button>
          </>
        }
      />

      <main className="max-w-[1100px] mx-auto px-6 py-10">
        <div className="mb-8 flex items-start justify-between gap-6">
          <div className="animate-fade-in">
            <div className="pw-eyebrow mb-2 flex items-center gap-2">
              Outputs
              <span
                className="pw-chip"
                style={
                  generatedBy === "ai"
                    ? { background: "var(--accent-soft)", color: "var(--accent)", borderColor: "transparent" }
                    : project.aiFallback
                    ? { background: "#fef3c7", color: "#92400e", borderColor: "transparent" }
                    : undefined
                }
                data-testid="outputs-generatedby-badge"
              >
                {generatedBy === "ai" ? (
                  <><Sparkles className="w-2.5 h-2.5" /> AI-generated</>
                ) : project.aiFallback ? (
                  <><FileText className="w-2.5 h-2.5" /> Template (fallback)</>
                ) : (
                  <><FileText className="w-2.5 h-2.5" /> Template</>
                )}
              </span>
            </div>
            <h1 className="text-[30px] font-semibold tracking-tight text-fg">
              Ready to <span className="font-display" style={{ color: "var(--accent)" }}>ship into a builder.</span>
            </h1>
            <p className="text-fg-muted mt-2 text-[14.5px] max-w-xl">
              {generatedBy === "ai"
                ? "Generated by Claude Sonnet 4.5 from your Project DNA. Copy, tweak, and paste into your builder of choice."
                : project.aiFallback
                ? "AI generation didn't complete — this is the template-based fallback. Try 'Generate with AI' again below."
                : "Everything below is generated deterministically from your Project DNA. Try 'Generate with AI' for a richer, tailored version."}
            </p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <button
              className="pw-btn pw-btn-accent"
              onClick={generateWithAI}
              disabled={aiLoading}
              data-testid="outputs-generate-ai-btn"
            >
              {aiLoading ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating with Claude…</>
              ) : (
                <><Sparkles className="w-3.5 h-3.5" /> Generate with AI</>
              )}
            </button>
            <button
              className="pw-btn pw-btn-ghost text-sm"
              onClick={regenerateDeterministic}
              disabled={aiLoading}
              data-testid="outputs-regenerate-btn"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Rebuild from template
            </button>
          </div>
        </div>

        {/* Loading placeholder card */}
        {aiLoading && (
          <div
            className="pw-card p-5 mb-5 flex items-center gap-3 animate-fade-in"
            style={{ borderColor: "var(--accent)", background: "var(--accent-soft)" }}
            data-testid="outputs-ai-loading"
          >
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--accent)" }} />
            <div>
              <div className="text-[13.5px] font-semibold" style={{ color: "var(--accent)" }}>
                Claude is drafting all four outputs in parallel…
              </div>
              <div className="text-[12px] text-fg-muted">Usually takes 15–40 seconds. Uploaded context is being included.</div>
            </div>
          </div>
        )}

        {/* Error banner — kept useful, not scary */}
        {aiError && !aiLoading && (
          <div
            className="pw-card p-4 mb-5 flex items-start gap-3 animate-fade-in"
            style={{ borderColor: "#fbbf24", background: "#fffbeb" }}
            data-testid="outputs-ai-error"
          >
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
              style={{ background: "#fef3c7", color: "#b45309" }}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold" style={{ color: "#92400e" }}>AI generation unavailable</div>
              <div className="text-[12.5px] mt-0.5 leading-snug" style={{ color: "#78350f" }}>{aiError}</div>
              <div className="text-[12px] mt-1.5" style={{ color: "#92400e" }}>
                Showing the template-based output instead &mdash; it&rsquo;s still complete and copy-ready.
              </div>
            </div>
            <button
              className="pw-btn pw-btn-ghost text-xs py-1 px-2"
              onClick={() => setAiError(null)}
              data-testid="outputs-ai-error-dismiss"
            >
              Dismiss
            </button>
          </div>
        )}


        {/* Tabs */}
        <div className="flex gap-1.5 flex-wrap mb-4" data-testid="outputs-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className="pw-choice"
              data-selected={active === t.id}
              data-testid={`outputs-tab-${t.id}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="mb-4 text-[12.5px] text-fg-subtle" data-testid="outputs-tab-desc">
          {TABS.find((t) => t.id === active)?.desc}
        </div>

        {/* Content card */}
        <div className="pw-card overflow-hidden">
          <div
            className="flex items-center justify-between px-4 py-2.5 border-b"
            style={{ borderColor: "var(--border)", background: "var(--bg-elev)" }}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
              <span className="text-[12.5px] font-medium text-fg">{TABS.find((t) => t.id === active)?.label}</span>
              <span className="pw-chip" style={{ fontSize: 10.5 }}>{currentContent.length.toLocaleString()} chars</span>
              {project.generatedModel && (
                <span className="pw-chip" style={{ fontSize: 10.5 }} title={project.generatedModel}>
                  <Zap className="w-2.5 h-2.5" /> {shortModel(project.generatedModel)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <button className="pw-btn pw-btn-ghost text-xs py-1.5" onClick={download} data-testid="outputs-download-btn">
                <Download className="w-3.5 h-3.5" /> Download
              </button>
              <button className="pw-btn pw-btn-primary text-xs py-1.5" onClick={copy} data-testid="outputs-copy-btn">
                {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
              </button>
            </div>
          </div>
          <pre className="pw-code" style={{ border: 0, borderRadius: 0, margin: 0, maxHeight: "68vh" }} data-testid="outputs-content">
            {currentContent}
          </pre>
        </div>
      </main>
    </div>
  );
}

function shortModel(m) {
  if (!m) return "";
  // "anthropic/claude-sonnet-4-5-20250929" → "claude-sonnet-4.5"
  const map = {
    "anthropic/claude-sonnet-4-5-20250929": "claude-sonnet-4.5",
    "gemini/gemini-3-flash-preview": "gemini-3-flash",
  };
  return map[m] || m.split("/").pop();
}
