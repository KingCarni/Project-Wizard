import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, ChevronRight, Check, Sparkles, FileText, Rocket,
  PanelRight,
} from "lucide-react";
import { getProject, setAnswer, updateProject, addContextFile, removeContextFile } from "../lib/storage";
import { getTemplate } from "../templates";
import { buildProjectDNA, computeHealth } from "../lib/dna";
import { generateAll } from "../lib/generators";
import { buildProjectSummary } from "../lib/aiService";
import QuestionRenderer from "../components/QuestionRenderer";
import DNAPanel from "../components/DNAPanel";
import TopBar from "../components/TopBar";
import { TemplateIcon } from "../lib/icons";
import { toast } from "sonner";

export default function Wizard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [savingAt, setSavingAt] = useState(null); // timestamp for autosave indicator
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  const template = useMemo(() => project && getTemplate(project.templateId), [project]);

  useEffect(() => {
    const p = getProject(id);
    if (!p) {
      toast.error("Project not found");
      navigate("/");
      return;
    }
    setProject(p);
    setActiveSectionId(p.answers._lastSection || (getTemplate(p.templateId)?.sections?.[0]?.id));
  }, [id, navigate]);

  if (!project || !template) return null;

  const dna = buildProjectDNA(project);
  const health = computeHealth(project);
  const currentSection = template.sections.find((s) => s.id === activeSectionId) || template.sections[0];
  const currentSectionIdx = template.sections.findIndex((s) => s.id === currentSection.id);

  const flashSaving = () => {
    setSavingAt(Date.now());
    setTimeout(() => setSavingAt(null), 900);
  };

  const handleAnswer = (qid, value) => {
    const updated = setAnswer(project.id, qid, value);
    setProject(updated);
    // Autopilot: mark Ready if health >= 90 & currently Draft
    const h = computeHealth(updated);
    if (h.overall >= 90 && updated.status === "Draft") {
      const done = updateProject(project.id, { status: "Ready" });
      setProject(done);
    } else if (h.overall < 90 && updated.status === "Ready" && !updated.generatedOutputs) {
      const back = updateProject(project.id, { status: "Draft" });
      setProject(back);
    }
    flashSaving();
  };

  const handleFileAdd = (file) => {
    const updated = addContextFile(project.id, file);
    setProject(updated);
    flashSaving();
    toast.success(`Added ${file.name}`);
  };
  const handleFileRemove = (fid) => {
    const updated = removeContextFile(project.id, fid);
    setProject(updated);
    flashSaving();
  };

  const handleOverrideBuilder = (b) => {
    const updated = updateProject(project.id, { selectedBuilder: b, lastBuilderOverride: true });
    setProject(updated);
    flashSaving();
  };

  const goToSection = (sid) => {
    setActiveSectionId(sid);
    updateProject(project.id, { answers: { ...project.answers, _lastSection: sid } });
    // Smooth scroll top on section change
    setTimeout(() => document.getElementById("wizard-center")?.scrollTo({ top: 0, behavior: "smooth" }), 40);
  };

  const nextSection = () => {
    const next = template.sections[currentSectionIdx + 1];
    if (next) goToSection(next.id);
    else generateAndNavigate();
  };
  const prevSection = () => {
    const prev = template.sections[currentSectionIdx - 1];
    if (prev) goToSection(prev.id);
  };

  const generateAndNavigate = () => {
    const outputs = generateAll(buildProjectDNA(project));
    const updated = updateProject(project.id, {
      generatedOutputs: outputs,
      status: "Generated",
    });
    setProject(updated);
    toast.success("Outputs generated");
    navigate(`/project/${project.id}/outputs`);
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col" data-testid="wizard-page">
      <TopBar
        right={
          <>
            <button
              className="pw-btn pw-btn-ghost text-sm hidden md:flex"
              onClick={() => navigate("/")}
              data-testid="wizard-back-dashboard"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
            </button>
            <button
              className="pw-btn pw-btn-ghost text-sm md:hidden"
              onClick={() => setRightPanelOpen((v) => !v)}
              aria-label="Toggle DNA panel"
              data-testid="wizard-toggle-dna"
            >
              <PanelRight className="w-4 h-4" />
            </button>
            <button
              className="pw-btn pw-btn-accent text-sm"
              onClick={generateAndNavigate}
              data-testid="wizard-generate-btn"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate outputs
            </button>
          </>
        }
      />

      {/* Project bar */}
      <div
        className="border-b"
        style={{ borderColor: "var(--border)", background: "var(--bg-elev)" }}
      >
        <div className="max-w-[1440px] mx-auto px-6 py-3 flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
          >
            <TemplateIcon name={template.icon} className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <input
                className="text-[15px] font-semibold text-fg bg-transparent border-0 focus:outline-none min-w-0 flex-1"
                value={project.name}
                onChange={(e) => {
                  const u = updateProject(project.id, { name: e.target.value });
                  setProject(u);
                }}
                data-testid="wizard-project-name"
              />
              <span className="pw-chip" data-testid="wizard-project-status">{project.status}</span>
            </div>
            <div className="text-[12px] text-fg-subtle flex items-center gap-2">
              <span>{template.name}</span>
              <span>·</span>
              <span className="capitalize">Building for {project.selectedBuilder}</span>
              {savingAt && (
                <span className="pw-saving animate-fade-in" data-testid="autosave-indicator">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "var(--accent)" }}
                  />
                  Saved
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Three-panel layout */}
      <div className="flex-1 max-w-[1440px] w-full mx-auto grid grid-cols-1 md:grid-cols-[240px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)_340px]">
        {/* LEFT: sections + progress */}
        <aside
          className="hidden md:block border-r overflow-y-auto"
          style={{ borderColor: "var(--border)", height: "calc(100vh - 112px)" }}
        >
          <div className="p-4 space-y-1" data-testid="wizard-sidebar">
            <div className="pw-eyebrow px-2 mb-3">Sections</div>
            {template.sections.map((s, idx) => {
              const sh = health.sections.find((x) => x.id === s.id);
              const pct = Math.round((sh?.progress || 0) * 100);
              const active = s.id === activeSectionId;
              const done = pct === 100;
              return (
                <button
                  key={s.id}
                  onClick={() => goToSection(s.id)}
                  className="w-full text-left px-2.5 py-2 rounded-lg transition-colors flex items-center gap-2 group"
                  style={{
                    background: active ? "var(--accent-soft)" : "transparent",
                    color: active ? "var(--accent)" : "var(--fg)",
                  }}
                  data-testid={`wizard-nav-${s.id}`}
                >
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                    style={{
                      background: active ? "var(--accent)" : (done ? "#dcfce7" : "var(--bg-muted)"),
                      color: active ? "white" : (done ? "#15803d" : "var(--fg-subtle)"),
                    }}
                  >
                    {done ? <Check className="w-3 h-3" strokeWidth={3} /> : <span className="text-[10.5px] font-semibold">{idx + 1}</span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium truncate">{s.title}</div>
                    <div className="pw-progress mt-1" style={{ height: 3 }}>
                      <div style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Extras */}
            <div className="pw-eyebrow px-2 pt-6 mb-2">Project</div>
            <button
              className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-muted flex items-center gap-2 text-[13px] text-fg-muted"
              onClick={() => project.generatedOutputs ? navigate(`/project/${project.id}/outputs`) : generateAndNavigate()}
              data-testid="wizard-nav-outputs"
            >
              <FileText className="w-3.5 h-3.5" /> Outputs
              <ChevronRight className="w-3.5 h-3.5 ml-auto" />
            </button>
            <button
              className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-muted flex items-center gap-2 text-[13px] text-fg-muted"
              onClick={() => navigate(`/project/${project.id}/launch`)}
              data-testid="wizard-nav-launch-checklist"
            >
              <Rocket className="w-3.5 h-3.5" /> Launch checklist
              <ChevronRight className="w-3.5 h-3.5 ml-auto" />
            </button>
          </div>
        </aside>

        {/* CENTER: question workspace */}
        <section
          id="wizard-center"
          className="overflow-y-auto"
          style={{ height: "calc(100vh - 112px)" }}
        >
          <div className="max-w-[720px] mx-auto px-6 md:px-10 py-10">
            <div className="mb-8 animate-fade-in" key={currentSection.id}>
              <div className="pw-eyebrow mb-2">Section {currentSectionIdx + 1} of {template.sections.length}</div>
              <h2 className="text-[28px] font-semibold tracking-tight text-fg leading-tight">{currentSection.title}</h2>
              {currentSection.description && (
                <p className="text-fg-muted mt-2 text-[14.5px]">{currentSection.description}</p>
              )}
            </div>

            <div className="space-y-6 pw-stagger">
              {currentSection.questions.map((q) => (
                <div key={q.id} className="pw-card p-5" data-testid={`question-card-${q.id}`}>
                  <div className="mb-3">
                    <label className="text-[13.5px] font-semibold text-fg flex items-center gap-1.5">
                      {q.label}
                      {q.required && <span style={{ color: "var(--accent)" }}>*</span>}
                    </label>
                    {q.helperText && (
                      <p className="text-[12.5px] text-fg-subtle mt-1 leading-snug">{q.helperText}</p>
                    )}
                  </div>
                  <QuestionRenderer
                    question={q}
                    value={project.answers[q.id]}
                    onChange={(v) => handleAnswer(q.id, v)}
                    project={project}
                    onFilesAdd={handleFileAdd}
                    onFileRemove={handleFileRemove}
                    projectSummary={buildProjectSummary(project, template)}
                  />
                </div>
              ))}
            </div>

            {/* Nav */}
            <div className="mt-10 flex items-center justify-between border-t pt-6" style={{ borderColor: "var(--border)" }}>
              <button
                className="pw-btn pw-btn-ghost"
                onClick={prevSection}
                disabled={currentSectionIdx === 0}
                data-testid="wizard-prev-btn"
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>
              <div className="text-[12px] text-fg-subtle">
                {currentSectionIdx + 1} / {template.sections.length}
              </div>
              {currentSectionIdx === template.sections.length - 1 ? (
                <button className="pw-btn pw-btn-accent" onClick={generateAndNavigate} data-testid="wizard-finish-generate-btn">
                  <Sparkles className="w-4 h-4" /> Generate outputs
                </button>
              ) : (
                <button className="pw-btn pw-btn-primary" onClick={nextSection} data-testid="wizard-next-btn">
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* RIGHT: Project DNA */}
        <aside
          className={`border-l ${rightPanelOpen ? "block" : "hidden"} lg:block absolute lg:static top-14 right-0 bottom-0 w-full max-w-[340px] lg:max-w-none z-20`}
          style={{
            borderColor: "var(--border)",
            height: "calc(100vh - 112px)",
            background: "var(--bg)",
          }}
        >
          <DNAPanel
            dna={dna}
            health={health}
            project={project}
            template={template}
            onOverrideBuilder={handleOverrideBuilder}
          />
        </aside>
      </div>
    </div>
  );
}
