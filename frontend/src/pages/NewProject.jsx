import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Zap, Lock } from "lucide-react";
import TopBar from "../components/TopBar";
import { getAvailableTemplates, getComingSoonTemplates } from "../templates";
import { createProject } from "../lib/storage";
import { TemplateIcon } from "../lib/icons";
import { toast } from "sonner";

export default function NewProject() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(null);
  const [name, setName] = useState("");
  const [builder, setBuilder] = useState(null); // will default from template

  const available = getAvailableTemplates();
  const comingSoon = getComingSoonTemplates();
  const selected = available.find((t) => t.id === selectedId);

  const handleCreate = () => {
    if (!selected) {
      toast.error("Choose a template first.");
      return;
    }
    if (!name.trim()) {
      toast.error("Give your project a name.");
      return;
    }
    const chosenBuilder = builder || selected.recommendedBuilder || "lovable";
    const project = createProject({ name: name.trim(), templateId: selected.id, selectedBuilder: chosenBuilder });
    toast.success("Project created");
    navigate(`/project/${project.id}`);
  };

  return (
    <div className="min-h-screen bg-bg" data-testid="new-project-page">
      <TopBar
        right={
          <button
            className="pw-btn pw-btn-ghost text-sm"
            onClick={() => navigate("/")}
            data-testid="new-project-back-btn"
          >
            Cancel
          </button>
        }
      />

      <main className="max-w-[1100px] mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10 animate-fade-in">
          <div className="pw-eyebrow mb-2">Step 1 of 2</div>
          <h1 className="text-[32px] font-semibold tracking-tight text-fg">
            Good day. <span className="font-display" style={{ color: "var(--accent)" }}>What are you looking to build?</span>
          </h1>
          <p className="text-fg-muted mt-3 text-[15px] max-w-2xl">
            Pick a template to structure the interview. You&#39;ll be able to override the recommended builder before starting.
          </p>
        </div>

        {/* Available templates */}
        <div className="mb-3 flex items-center gap-2">
          <div className="pw-eyebrow">Available now</div>
          <span className="pw-chip accent">{available.length}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 pw-stagger">
          {available.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedId(t.id)}
              className={`pw-card p-5 text-left transition-all ${selectedId === t.id ? "ring-2" : ""}`}
              style={{
                borderColor: selectedId === t.id ? "var(--accent)" : undefined,
                boxShadow: selectedId === t.id ? "0 0 0 4px var(--accent-soft), 0 8px 24px -12px rgba(95,34,207,0.24)" : undefined,
              }}
              data-testid={`template-card-${t.id}`}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: selectedId === t.id ? "var(--accent)" : "var(--accent-soft)",
                    color: selectedId === t.id ? "white" : "var(--accent)",
                    transition: "all 160ms ease",
                  }}
                >
                  <TemplateIcon name={t.icon} className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[15.5px] font-semibold text-fg">{t.name}</div>
                    <span className="pw-chip accent" style={{ fontSize: 10.5 }}>
                      <Zap className="w-2.5 h-2.5" /> {t.recommendedBuilder}
                    </span>
                  </div>
                  <p className="text-[13.5px] text-fg-muted mt-1 leading-snug">{t.tagline}</p>
                  <p className="text-[12.5px] text-fg-subtle mt-2">{t.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Coming soon */}
        <div className="mb-3 flex items-center gap-2">
          <div className="pw-eyebrow">Coming soon</div>
          <span className="pw-chip">{comingSoon.length}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 mb-10">
          {comingSoon.map((t) => (
            <div
              key={t.id}
              className="pw-card p-3.5 opacity-70 cursor-not-allowed"
              data-testid={`template-coming-soon-${t.id}`}
              title={`${t.name} — coming soon`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center"
                  style={{ background: "var(--bg-muted)", color: "var(--fg-subtle)" }}
                >
                  <TemplateIcon name={t.icon} className="w-3.5 h-3.5" />
                </div>
                <Lock className="w-3 h-3 text-fg-subtle ml-auto" />
              </div>
              <div className="text-[12.5px] font-semibold text-fg leading-tight">{t.name}</div>
              <div className="text-[11px] text-fg-subtle mt-1 leading-snug">{t.tagline}</div>
            </div>
          ))}
        </div>

        {/* Configuration panel appears once template is chosen */}
        {selected && (
          <div className="pw-card p-6 animate-fade-in" data-testid="template-config-panel">
            <div className="pw-eyebrow mb-4">Configure your project</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[13px] font-medium text-fg mb-1.5">Project name</label>
                <input
                  className="pw-input"
                  placeholder={selected.id === "portfolio" ? "e.g. Alex Chen — Portfolio" : "e.g. Riverstone Studios Website"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  data-testid="project-name-input"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-fg mb-1.5 flex items-center gap-1.5">
                  Builder
                  <Sparkles className="w-3 h-3" style={{ color: "var(--accent)" }} />
                  <span className="text-[11px] font-normal text-fg-subtle">
                    (recommended: {selected.recommendedBuilder})
                  </span>
                </label>
                <div className="pw-segmented" data-testid="builder-segmented">
                  {["lovable", "emergent"].map((b) => (
                    <button
                      key={b}
                      data-active={(builder || selected.recommendedBuilder) === b}
                      onClick={() => setBuilder(b)}
                      data-testid={`builder-choice-${b}`}
                    >
                      {b === "lovable" ? "Lovable" : "Emergent"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button className="pw-btn pw-btn-ghost" onClick={() => setSelectedId(null)}>
                Change template
              </button>
              <button
                className="pw-btn pw-btn-accent"
                onClick={handleCreate}
                disabled={!name.trim()}
                data-testid="create-project-btn"
              >
                Start interview <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
