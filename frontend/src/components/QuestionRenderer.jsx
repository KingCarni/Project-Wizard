import { Upload, File as FileIcon, X } from "lucide-react";
import React, { useRef, useState } from "react";

/**
 * QuestionRenderer — one component per question type, kept small and predictable.
 */
export default function QuestionRenderer({ question, value, onChange, project, onFilesAdd, onFileRemove }) {
  const q = question;
  switch (q.type) {
    case "text":
      return (
        <input
          className="pw-input"
          placeholder={q.placeholder || ""}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          data-testid={`q-${q.id}`}
        />
      );
    case "textarea":
      return (
        <textarea
          className="pw-textarea"
          placeholder={q.placeholder || ""}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          data-testid={`q-${q.id}`}
        />
      );
    case "select":
      return (
        <div className="flex flex-wrap gap-1.5" data-testid={`q-${q.id}`}>
          {q.options.map((opt) => (
            <button
              key={opt}
              type="button"
              className="pw-choice"
              data-selected={value === opt}
              onClick={() => onChange(value === opt ? null : opt)}
              data-testid={`q-${q.id}-opt-${slug(opt)}`}
            >
              {opt}
            </button>
          ))}
        </div>
      );
    case "multiselect": {
      const arr = Array.isArray(value) ? value : (q.default || []);
      return (
        <div className="flex flex-wrap gap-1.5" data-testid={`q-${q.id}`}>
          {q.options.map((opt) => {
            const active = arr.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                className="pw-choice"
                data-selected={active}
                onClick={() =>
                  onChange(active ? arr.filter((x) => x !== opt) : [...arr, opt])
                }
                data-testid={`q-${q.id}-opt-${slug(opt)}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      );
    }
    case "toggle":
      return (
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="pw-toggle"
            data-on={value === true || (value === undefined && q.default === true)}
            onClick={() => onChange(!(value === true || (value === undefined && q.default === true)))}
            data-testid={`q-${q.id}`}
          />
          <span className="text-sm text-fg-muted">
            {value === true || (value === undefined && q.default === true) ? "Yes" : "No"}
          </span>
        </div>
      );
    case "color":
      return (
        <div className="flex items-center gap-2" data-testid={`q-${q.id}`}>
          <input
            type="color"
            value={value || q.default || "#5f22cf"}
            onChange={(e) => onChange(e.target.value)}
            className="w-11 h-11 rounded-lg border border-default cursor-pointer p-0"
            style={{ background: "transparent" }}
            data-testid={`q-${q.id}-picker`}
          />
          <input
            className="pw-input font-mono uppercase"
            style={{ maxWidth: 140 }}
            value={value || q.default || "#5f22cf"}
            onChange={(e) => onChange(e.target.value)}
            data-testid={`q-${q.id}-hex`}
          />
        </div>
      );
    case "chips-add":
      return <ChipsAdd value={value || []} onChange={onChange} placeholder={q.placeholder} testid={`q-${q.id}`} />;
    case "files":
      return (
        <FileUploader
          files={project.contextFiles || []}
          accept={q.accept}
          onAdd={onFilesAdd}
          onRemove={onFileRemove}
        />
      );
    default:
      return null;
  }
}

function slug(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function ChipsAdd({ value, onChange, placeholder, testid }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    if (value.includes(v)) return;
    onChange([...value, v]);
    setDraft("");
  };
  return (
    <div data-testid={testid}>
      <div className="flex gap-2">
        <input
          className="pw-input"
          placeholder={placeholder || "Type and press Enter"}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); add(); }
          }}
          data-testid={`${testid}-input`}
        />
        <button type="button" className="pw-btn pw-btn-subtle" onClick={add} data-testid={`${testid}-add`}>Add</button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {value.map((chip) => (
            <span
              key={chip}
              className="pw-chip accent"
              data-testid={`${testid}-chip-${slug(chip)}`}
              style={{ paddingRight: 6 }}
            >
              {chip}
              <button
                type="button"
                onClick={() => onChange(value.filter((c) => c !== chip))}
                className="ml-1 text-current opacity-70 hover:opacity-100"
                aria-label={`Remove ${chip}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
function FileUploader({ files, accept, onAdd, onRemove }) {
  const [dragOver, setDragOver] = useState(false);
  const ref = useRef();

  const handleFiles = async (fileList) => {
    for (const f of Array.from(fileList)) {
      let content = "";
      try {
        // Only read text-like files inline.
        if (/\.(md|txt|json|csv)$/i.test(f.name)) {
          content = await f.text();
        }
      } catch (e) {
        // ignore
      }
      onAdd({
        id: crypto.randomUUID(),
        name: f.name,
        size: f.size,
        type: f.type || "application/octet-stream",
        content,
      });
    }
  };

  return (
    <div data-testid="context-file-uploader">
      <label
        className="pw-card p-6 flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all"
        style={{
          borderStyle: "dashed",
          borderColor: dragOver ? "var(--accent)" : undefined,
          background: dragOver ? "var(--accent-soft)" : undefined,
        }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault(); setDragOver(false);
          if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
        }}
      >
        <input
          ref={ref}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          data-testid="context-file-input"
        />
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
        >
          <Upload className="w-4 h-4" strokeWidth={2.4} />
        </div>
        <div className="text-sm font-medium text-fg">Drop files here, or click to browse</div>
        <div className="text-xs text-fg-subtle">Supported: .md, .txt, .json, .csv, .pdf, .docx</div>
        <button
          type="button"
          className="pw-btn pw-btn-subtle mt-1 text-xs py-1.5"
          onClick={() => ref.current?.click()}
          data-testid="context-file-browse"
        >
          Browse files
        </button>
      </label>
      {files.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {files.map((f) => (
            <li key={f.id} className="pw-card flex items-center gap-3 px-3 py-2" data-testid={`context-file-${f.id}`}>
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                style={{ background: "var(--bg-muted)", color: "var(--fg-muted)" }}
              >
                <FileIcon className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium text-fg truncate">{f.name}</div>
                <div className="text-[11px] text-fg-subtle">{(f.size / 1024).toFixed(1)} KB · {f.type || "file"}</div>
              </div>
              <button
                type="button"
                onClick={() => onRemove(f.id)}
                className="p-1.5 rounded-md hover:bg-muted text-fg-subtle"
                aria-label="Remove file"
                data-testid={`context-file-remove-${f.id}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
