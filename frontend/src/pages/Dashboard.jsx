import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Plus, ArrowRight, MoreHorizontal, Trash2, FileText, Rocket, Clock } from "lucide-react";
import TopBar from "../components/TopBar";
import { listProjects, deleteProject } from "../lib/storage";
import { getTemplate } from "../templates";
import { computeHealth } from "../lib/dna";
import { toast } from "sonner";
import { TemplateIcon } from "../lib/icons";

function timeAgo(iso) {
  const d = new Date(iso);
  const s = Math.round((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.round(h / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString();
}

const STATUS_STYLES = {
  Draft: { fg: "var(--fg-subtle)", bg: "var(--bg-muted)" },
  Ready: { fg: "#0369a1", bg: "#e0f2fe" },
  Generated: { fg: "#7130f0", bg: "#ede6ff" },
  "Setup Needed": { fg: "#b45309", bg: "#fef3c7" },
  Launched: { fg: "#15803d", bg: "#dcfce7" },
};

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [menuOpen, setMenuOpen] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setProjects(listProjects());
  }, []);

  const handleDelete = (id) => {
    deleteProject(id);
    setProjects(listProjects());
    setMenuOpen(null);
    toast.success("Project deleted");
  };

  const empty = projects.length === 0;

  return (
    <div className="min-h-screen bg-bg" data-testid="dashboard-page">
      <TopBar />
      <main className="max-w-[1200px] mx-auto px-6 py-14">
        {/* Header */}
        <div className="flex items-start justify-between gap-6 mb-10">
          <div className="animate-fade-in">
            <div className="pw-eyebrow mb-2">Dashboard</div>
            <h1 className="text-[34px] leading-tight tracking-tight font-semibold text-fg">
              Your projects, <span className="font-display" style={{ color: "var(--accent)" }}>designed before they're built.</span>
            </h1>
            <p className="text-fg-muted mt-3 text-[15px] max-w-xl">
              Project Wizard interviews you like a product manager, then exports builder&#8209;ready prompts and specs &mdash; so the AI knows exactly what to build.
            </p>
          </div>
          <button
            onClick={() => navigate("/new")}
            className="pw-btn pw-btn-accent shrink-0"
            data-testid="new-project-cta"
          >
            <Plus className="w-4 h-4" strokeWidth={2.4} />
            New Project
          </button>
        </div>

        {empty ? <EmptyState onNew={() => navigate("/new")} /> : (
          <>
            <div className="flex items-center gap-2 mb-4">
              <div className="pw-eyebrow">Projects</div>
              <span className="pw-chip">{projects.length}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pw-stagger">
              {projects.map((p) => {
                const t = getTemplate(p.templateId);
                const health = computeHealth(p);
                const style = STATUS_STYLES[p.status] || STATUS_STYLES.Draft;
                return (
                  <div
                    key={p.id}
                    className="pw-card p-5 flex flex-col gap-4 cursor-pointer group relative"
                    onClick={() => navigate(`/project/${p.id}`)}
                    data-testid={`project-card-${p.id}`}
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                        >
                          <TemplateIcon name={t?.icon} className="w-[18px] h-[18px]" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[15px] font-semibold text-fg truncate">{p.name}</div>
                          <div className="text-xs text-fg-subtle truncate">{t?.name || "Unknown template"}</div>
                        </div>
                      </div>
                      <div className="relative">
                        <button
                          className="p-1.5 rounded-md hover:bg-muted"
                          onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === p.id ? null : p.id); }}
                          data-testid={`project-card-menu-${p.id}`}
                        >
                          <MoreHorizontal className="w-4 h-4 text-fg-subtle" />
                        </button>
                        {menuOpen === p.id && (
                          <div
                            className="absolute right-0 top-8 pw-card p-1 z-10 min-w-[140px] shadow-pop"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              className="w-full text-left px-3 py-1.5 text-sm rounded-md hover:bg-muted flex items-center gap-2 text-red-600"
                              onClick={() => handleDelete(p.id)}
                              data-testid={`project-delete-${p.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Health */}
                    <div>
                      <div className="flex items-center justify-between text-xs text-fg-subtle mb-1.5">
                        <span>Project Health</span>
                        <span className="tabular-nums font-medium text-fg">{health.overall}%</span>
                      </div>
                      <div className="pw-progress"><div style={{ width: `${health.overall}%` }} /></div>
                    </div>

                    {/* Footer row */}
                    <div className="flex items-center justify-between text-xs text-fg-subtle mt-1">
                      <span
                        className="pw-chip"
                        style={{ background: style.bg, color: style.fg, borderColor: "transparent" }}
                        data-testid={`project-status-${p.id}`}
                      >
                        {p.status}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {timeAgo(p.updatedAt)}
                      </span>
                    </div>

                    {/* Quick actions on hover */}
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        to={`/project/${p.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="pw-btn pw-btn-subtle flex-1 justify-center text-[12.5px] py-1.5"
                        data-testid={`project-continue-${p.id}`}
                      >
                        Continue <ArrowRight className="w-3 h-3" />
                      </Link>
                      {p.generatedOutputs && (
                        <Link
                          to={`/project/${p.id}/outputs`}
                          onClick={(e) => e.stopPropagation()}
                          className="pw-btn pw-btn-subtle text-[12.5px] py-1.5"
                          data-testid={`project-outputs-${p.id}`}
                        >
                          <FileText className="w-3 h-3" /> Outputs
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function EmptyState({ onNew }) {
  return (
    <div className="relative overflow-hidden pw-card p-14 text-center" data-testid="dashboard-empty-state">
      <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none"
           style={{ maskImage: "radial-gradient(circle at 50% 40%, black 20%, transparent 70%)" }} />
      <div className="relative">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
        >
          <Rocket className="w-6 h-6" strokeWidth={2.2} />
        </div>
        <h2 className="text-[24px] font-semibold tracking-tight text-fg mb-2">
          Start with a project, not a prompt.
        </h2>
        <p className="text-fg-muted max-w-md mx-auto mb-7 text-[14.5px] leading-relaxed">
          Answer a structured set of questions. Watch your Project DNA fill in. Generate builder-ready prompts for Emergent, Lovable, and more.
        </p>
        <button onClick={onNew} className="pw-btn pw-btn-accent" data-testid="empty-new-project-btn">
          <Plus className="w-4 h-4" strokeWidth={2.4} />
          Create your first project
        </button>
      </div>
    </div>
  );
}
