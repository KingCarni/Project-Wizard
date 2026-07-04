import React from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

/**
 * Global top bar — consistent across every page.
 * Kept intentionally minimal (Linear/Notion style).
 */
export default function TopBar({ right = null }) {
  return (
    <header
      className="sticky top-0 z-30 backdrop-blur-xl"
      style={{
        background: "color-mix(in oklab, var(--bg) 82%, transparent)",
        borderBottom: "1px solid var(--border)",
      }}
      data-testid="topbar"
    >
      <div className="max-w-[1440px] mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group" data-testid="topbar-home-link">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "var(--fg)", color: "var(--bg)" }}
          >
            <Sparkles className="w-3.5 h-3.5" strokeWidth={2.4} />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[15px] font-semibold tracking-tight text-fg">Project Wizard</span>
            <span className="pw-chip" style={{ padding: "1px 7px", fontSize: 10.5 }}>MVP</span>
          </div>
        </Link>
        <div className="flex items-center gap-2">{right}</div>
      </div>
    </header>
  );
}
