import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, PartyPopper, Rocket } from "lucide-react";
import TopBar from "../components/TopBar";
import { getProject, toggleSetupTask, updateProject } from "../lib/storage";
import { getTemplate } from "../templates";
import { toast } from "sonner";

export default function Launch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);

  useEffect(() => {
    const p = getProject(id);
    if (!p) { navigate("/"); return; }
    setProject(p);
  }, [id, navigate]);

  const template = useMemo(() => project && getTemplate(project.templateId), [project]);
  if (!project || !template) return null;

  const tasks = template.setupChecklist || [];
  const progress = project.setupProgress || {};
  const doneCount = tasks.filter((t) => progress[t.id]).length;
  const pct = tasks.length === 0 ? 0 : Math.round((doneCount / tasks.length) * 100);
  const allDone = pct === 100 && tasks.length > 0;

  const toggle = (taskId) => {
    const updated = toggleSetupTask(project.id, taskId);
    setProject(updated);
  };

  const markLaunched = () => {
    const updated = updateProject(project.id, { status: "Launched" });
    setProject(updated);
    toast.success("🚀 Marked as launched — congratulations.");
  };

  return (
    <div className="min-h-screen bg-bg" data-testid="launch-page">
      <TopBar
        right={
          <button
            className="pw-btn pw-btn-ghost text-sm"
            onClick={() => navigate(`/project/${project.id}/outputs`)}
            data-testid="launch-back-btn"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Outputs
          </button>
        }
      />

      <main className="max-w-[820px] mx-auto px-6 py-10">
        <div className="mb-8 animate-fade-in">
          <div className="pw-eyebrow mb-2">Launch checklist</div>
          <h1 className="text-[28px] font-semibold tracking-tight text-fg">
            From generated site to <span className="font-display" style={{ color: "var(--accent)" }}>live in the world.</span>
          </h1>
          <p className="text-fg-muted mt-2 text-[14.5px] max-w-xl">
            Work through this once. Check things off as you go — progress autosaves.
          </p>
        </div>

        {/* Progress card */}
        <div className="pw-card p-5 mb-6 flex items-center gap-4" data-testid="launch-progress-card">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: allDone ? "#dcfce7" : "var(--accent-soft)",
              color: allDone ? "#15803d" : "var(--accent)",
            }}
          >
            {allDone ? <PartyPopper className="w-5 h-5" /> : <Rocket className="w-5 h-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-[14px] font-semibold text-fg">
                {allDone ? "Every task done" : `${doneCount} of ${tasks.length} tasks complete`}
              </div>
              <div className="text-[12px] tabular-nums text-fg-muted" data-testid="launch-progress-pct">{pct}%</div>
            </div>
            <div className="pw-progress"><div style={{ width: `${pct}%` }} /></div>
          </div>
          {allDone && project.status !== "Launched" && (
            <button className="pw-btn pw-btn-accent shrink-0" onClick={markLaunched} data-testid="mark-launched-btn">
              <Rocket className="w-3.5 h-3.5" /> Mark as launched
            </button>
          )}
        </div>

        {/* Tasks */}
        <ul className="space-y-2 pw-stagger" data-testid="launch-tasks">
          {tasks.map((task, i) => {
            const done = !!progress[task.id];
            return (
              <li key={task.id}>
                <button
                  onClick={() => toggle(task.id)}
                  className="pw-card w-full text-left p-4 flex items-start gap-3 transition-all hover:border-strong"
                  data-testid={`launch-task-${task.id}`}
                >
                  <div
                    className="w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all"
                    style={{
                      background: done ? "var(--accent)" : "transparent",
                      borderColor: done ? "var(--accent)" : "var(--border-strong)",
                      color: "white",
                    }}
                  >
                    {done && <Check className="w-3 h-3" strokeWidth={3.5} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`text-[14px] font-medium ${done ? "line-through text-fg-subtle" : "text-fg"}`}>
                      {i + 1}. {task.title}
                    </div>
                    {task.description && (
                      <div className="text-[12.5px] text-fg-subtle mt-0.5 leading-snug">
                        {task.description}
                      </div>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
