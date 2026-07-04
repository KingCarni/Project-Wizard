import React, { useState } from "react";
import { Sparkles, Loader2, Check, X } from "lucide-react";
import { rewriteFieldWithAI } from "../lib/aiService";
import { toast } from "sonner";

/**
 * AIRewriteButton — sparkle button + inline suggestion card.
 *
 * Behaviour:
 *  - Idle: shows a sparkle button on hover of the parent card.
 *  - Loading: spinner.
 *  - Suggestion: renders a small card BELOW the field with Accept / Discard buttons.
 *
 * The suggestion is never applied automatically — user must click Accept.
 */
export default function AIRewriteButton({ label, currentValue, projectSummary, onAccept, testid }) {
  const [state, setState] = useState("idle"); // idle | loading | ready
  const [suggestion, setSuggestion] = useState("");
  const [guidance, setGuidance] = useState("improve");

  const run = async (g = "improve") => {
    setGuidance(g);
    setState("loading");
    try {
      const text = await rewriteFieldWithAI({
        label,
        currentValue,
        projectSummary,
        guidance: g,
      });
      setSuggestion(text);
      setState("ready");
    } catch (e) {
      setState("idle");
      toast.error(e.message || "Could not rewrite");
    }
  };

  const accept = () => {
    onAccept(suggestion);
    toast.success("Suggestion applied");
    setState("idle");
    setSuggestion("");
  };

  const discard = () => {
    setState("idle");
    setSuggestion("");
  };

  if (state === "ready") {
    return (
      <div
        className="pw-card p-3 mt-2 animate-fade-in"
        style={{ borderColor: "var(--accent)", background: "var(--accent-soft)" }}
        data-testid={`${testid}-suggestion`}
      >
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 text-[11.5px] uppercase tracking-wide font-semibold" style={{ color: "var(--accent)" }}>
            <Sparkles className="w-3 h-3" /> AI suggestion · {guidance}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={discard}
              className="pw-btn pw-btn-ghost text-[11.5px] py-1 px-2"
              data-testid={`${testid}-discard`}
            >
              <X className="w-3 h-3" /> Discard
            </button>
            <button
              onClick={accept}
              className="pw-btn pw-btn-accent text-[11.5px] py-1 px-2"
              data-testid={`${testid}-accept`}
            >
              <Check className="w-3 h-3" /> Use this
            </button>
          </div>
        </div>
        <div
          className="text-[13.5px] leading-relaxed whitespace-pre-wrap"
          style={{ color: "var(--fg)" }}
          data-testid={`${testid}-suggestion-text`}
        >
          {suggestion}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 mt-1.5" data-testid={`${testid}-controls`}>
      <button
        type="button"
        onClick={() => run("improve")}
        disabled={state === "loading"}
        className="pw-btn pw-btn-subtle text-[11.5px] py-1 px-2"
        data-testid={testid}
        title="Rewrite with AI"
      >
        {state === "loading" ? (
          <><Loader2 className="w-3 h-3 animate-spin" /> Thinking…</>
        ) : (
          <><Sparkles className="w-3 h-3" style={{ color: "var(--accent)" }} /> AI rewrite</>
        )}
      </button>
      {state === "idle" && (
        <>
          <button
            type="button"
            onClick={() => run("shorten")}
            className="pw-btn pw-btn-ghost text-[11.5px] py-1 px-2"
            title="Make it shorter"
            data-testid={`${testid}-shorten`}
          >
            Shorten
          </button>
          <button
            type="button"
            onClick={() => run("punchier")}
            className="pw-btn pw-btn-ghost text-[11.5px] py-1 px-2"
            title="Make it punchier"
            data-testid={`${testid}-punchier`}
          >
            Punchier
          </button>
        </>
      )}
    </div>
  );
}
