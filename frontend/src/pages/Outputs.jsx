import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Copy, Check, Sparkles, RefreshCw, Rocket, Download } from "lucide-react";
import TopBar from "../components/TopBar";
import { getProject, updateProject } from "../lib/storage";
import { buildProjectDNA } from "../lib/dna";
import { generateAll } from "../lib/generators";
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

  useEffect(() => {
    const p = getProject(id);
    if (!p) { navigate("/"); return; }
    // Auto-align default active tab with selected builder
    setActive(p.selectedBuilder === "emergent" ? "emergentPrompt" : "lovablePrompt");
    setProject(p);
  }, [id, navigate]);

  const outputs = useMemo(() => {
    if (!project) return null;
    return project.generatedOutputs || generateAll(buildProjectDNA(project));
  }, [project]);

  if (!project || !outputs) return null;

  const currentContent = outputs[active] || "";

  const regenerate = () => {
    const dna = buildProjectDNA(project);
    const fresh = generateAll(dna);
    const updated = updateProject(project.id, { generatedOutputs: fresh, status: "Generated" });
    setProject(updated);
    toast.success("Outputs regenerated from latest DNA");
  };

  const copy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(currentContent);
      } else {
        // Fallback for environments without clipboard API
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
            <div className="pw-eyebrow mb-2">Outputs</div>
            <h1 className="text-[30px] font-semibold tracking-tight text-fg">
              Ready to <span className="font-display" style={{ color: "var(--accent)" }}>ship into a builder.</span>
            </h1>
            <p className="text-fg-muted mt-2 text-[14.5px] max-w-xl">
              Everything below is generated from your Project DNA. Copy, tweak, and paste into your builder of choice.
            </p>
          </div>
          <button
            className="pw-btn pw-btn-subtle shrink-0"
            onClick={regenerate}
            data-testid="outputs-regenerate-btn"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Regenerate
          </button>
        </div>

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
