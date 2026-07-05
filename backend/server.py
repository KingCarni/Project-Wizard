"""
Project Wizard — backend LLM endpoints.

The core MVP is still localStorage-driven; the backend only powers two
optional LLM features:

  POST /api/generate — Claude Sonnet 4.5 → all 4 outputs from Project DNA
  POST /api/rewrite  — Gemini 3 Flash → single-field rewrite suggestion

Both endpoints are model-agnostic at the frontend layer — we return JSON
and a "generatedBy" tag so the client can swap providers later.
"""
from __future__ import annotations

import asyncio
import os
import uuid
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv()

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")

app = FastAPI(title="Project Wizard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------
@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "app": "project-wizard",
        "llm_ready": bool(EMERGENT_LLM_KEY),
    }


@app.get("/api/")
async def root():
    return {"message": "Project Wizard API — LLM-powered generators + inline rewrite."}


# ---------------------------------------------------------------------------
# Shared LLM helper — imports the library lazily so a missing key never
# breaks non-AI endpoints.
# ---------------------------------------------------------------------------
async def _run_llm(
    *,
    provider: str,
    model: str,
    system: str,
    user: str,
    max_tokens: int = 4096,
    timeout_s: int = 45,
) -> str:
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=503, detail="LLM key not configured")

    # Lazy import to keep startup fast and non-AI flows unaffected.
    from emergentintegrations.llm.chat import LlmChat, UserMessage

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"pw-{uuid.uuid4()}",
        system_message=system,
    ).with_model(provider, model)

    try:
        result = await asyncio.wait_for(
            chat.send_message(UserMessage(text=user)),
            timeout=timeout_s,
        )
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="LLM timed out. Try the template-based generation.")
    except Exception as e:  # noqa: BLE001
        msg = str(e)
        if "Budget has been exceeded" in msg or "budget has been exceeded" in msg.lower():
            raise HTTPException(
                status_code=402,
                detail=(
                    "Emergent Universal Key balance exhausted. "
                    "Top up in Profile → Universal Key → Add Balance, "
                    "or use the template-based generator meanwhile."
                ),
            )
        if "rate limit" in msg.lower() or "429" in msg:
            raise HTTPException(status_code=429, detail="LLM rate limit hit. Try again in a moment.")
        raise HTTPException(status_code=502, detail=f"LLM error: {msg[:240]}")

    # LlmChat.send_message returns either a string or an object with .content.
    if isinstance(result, str):
        return result.strip()
    return getattr(result, "content", str(result)).strip()


# ---------------------------------------------------------------------------
# /api/generate — Claude Sonnet 4.5 → all 4 outputs
# ---------------------------------------------------------------------------
class ContextFile(BaseModel):
    name: str
    size: int = 0
    type: str = ""
    content: str = ""  # trimmed on the client to keep payloads small


class GenerateRequest(BaseModel):
    projectName: str
    templateName: str
    templateId: str
    selectedBuilder: str = "lovable"
    recommendedBuilder: str = "lovable"
    answers: Dict[str, Any] = Field(default_factory=dict)
    contextFiles: List[ContextFile] = Field(default_factory=list)
    kinds: Optional[List[str]] = None  # ["emergentPrompt","lovablePrompt","markdownSpec","qaChecklist"]


class GenerateResponse(BaseModel):
    outputs: Dict[str, str]
    generatedBy: str = "ai"
    model: str = "anthropic/claude-sonnet-4-5-20250929"


KIND_SPECS = {
    "lovablePrompt": {
        "label": "Lovable Prompt",
        "instructions": (
            "Write a builder prompt optimized for Lovable — a visual, marketing-first AI website builder. "
            "Prioritize polished UI, responsive design, marketing copy, brand personality, and conversion-focused CTAs. "
            "Use rich Markdown structure with clear section headings (## Overview, ## Visual Identity, ## Brand, ## Pages, "
            "## Sections, ## Content, ## Features, ## Responsive & Accessibility, ## SEO, ## Acceptance Criteria, ## Project Context). "
            "The **Visual Identity** section MUST explicitly instruct: do NOT produce a generic AI-generated landing page "
            "(no purple/blue gradient hero, no giant glowing CTA, no identical-card grids, no 'AI startup' aesthetic). "
            "Ground the visual direction in the brand fields from the Project DNA. "
            "Include a **Project Context** section that treats any uploaded documents as AUTHORITATIVE background — "
            "list each file by name with a short excerpt, and instruct the builder to preserve any constraints, terminology, "
            "or positioning found in those files. "
            "Never invent facts not present in the project data — mark missing info as '_(not specified)_'."
        ),
    },
    "emergentPrompt": {
        "label": "Emergent Prompt",
        "instructions": (
            "Write a builder prompt optimized for Emergent — a full-stack AI product builder. "
            "Include: ## Project Overview, ## Visual Identity (with the anti-generic mandate below), "
            "## App Structure (routes), ## Components (per page, each with data-testid conventions), "
            "## Data Model (typed TypeScript snippets, future-ready), ## Feature Behaviour, ## Content Seeds, "
            "## Setup Expectations, ## Acceptance Criteria (as checkboxes), ## Launch Checklist, ## Project Context. "
            "The **Visual Identity** section MUST tell the builder: this must NOT look like a generic AI-generated landing page — "
            "commit to a distinctive palette, type hierarchy, and layout grounded in the Project DNA brand fields. "
            "The **Project Context** section MUST treat uploaded documents as AUTHORITATIVE — list each file by name, "
            "include a short excerpt, and instruct the builder to preserve any explicit constraints or terminology from those files. "
            "Never invent facts not in the project data — mark missing info as '_(not specified)_'."
        ),
    },
    "markdownSpec": {
        "label": "Markdown Specification",
        "instructions": (
            "Write a human-readable Markdown project brief that a designer, developer, or AI (Claude/Cursor) can pick up cold. "
            "Sections: # Title, ## Summary, ## Goals, ## Audience, ## Brand (with distinctive-identity mandate), ## Pages, "
            "## Features, ## Content, ## SEO, ## Builder Recommendation, ## Launch Notes, ## Project Context. "
            "The Project Context section MUST treat uploaded documents as AUTHORITATIVE background — list files by name, "
            "excerpt them briefly, and instruct downstream consumers to honour their constraints. "
            "Be crisp — no fluff. Never invent facts."
        ),
    },
    "qaChecklist": {
        "label": "QA Checklist",
        "instructions": (
            "Write a pre-launch QA checklist as Markdown with GitHub-style checkboxes ('- [ ]'). "
            "Sections: ## Brand Fidelity (first — verifies the site does NOT look like a generic AI-generated landing page, "
            "and that constraints from uploaded Project Context are preserved), ## Navigation, ## Mobile Responsiveness, "
            "## Forms & Interactions (specific to selected features), ## Accessibility, ## SEO Metadata, "
            "## Content Review (verifies no invented facts), ## Performance, ## Launch Readiness. "
            "Tailor form checks to the features the user selected."
        ),
    },
}


def _build_llm_payload(req: GenerateRequest, kind: str) -> tuple[str, str]:
    spec = KIND_SPECS[kind]
    system = (
        "You are a senior product manager + tech lead + brand director. "
        "You turn structured project data into high-signal builder prompts and specs. "
        "\n\n"
        "Non-negotiables in every output you produce:\n"
        "  1. Treat the provided Project DNA as the source of truth. Never invent business facts.\n"
        "  2. Treat uploaded Project Context files as AUTHORITATIVE background — preserve their constraints and terminology.\n"
        "  3. Refuse the generic AI-startup aesthetic — call it out and steer the builder away from it.\n"
        "  4. When information is missing, write '_(not specified)_'. Do not fabricate.\n"
        "  5. Every output ends with a Project Context section that lists each uploaded file by name with a short excerpt.\n"
        "\n"
        "Output only the requested Markdown document — no preamble, no commentary, no wrapping code fences. "
        "Use crisp headings and bullet lists."
    )

    context_snippets = ""
    if req.contextFiles:
        parts = []
        for f in req.contextFiles[:5]:  # cap for prompt size
            preview = (f.content or "")[:2400].strip()
            if preview:
                parts.append(f"### {f.name}\n{preview}")
        if parts:
            context_snippets = "\n\n---\nUser-uploaded project context:\n\n" + "\n\n".join(parts)

    project_json = {
        "projectName": req.projectName,
        "templateName": req.templateName,
        "templateId": req.templateId,
        "selectedBuilder": req.selectedBuilder,
        "recommendedBuilder": req.recommendedBuilder,
        "answers": req.answers,
    }
    import json as _json
    user = (
        f"Please produce the **{spec['label']}** for the following project.\n\n"
        f"### Task instructions\n{spec['instructions']}\n\n"
        f"### Project data (JSON)\n```json\n{_json.dumps(project_json, ensure_ascii=False, indent=2)}\n```"
        f"{context_snippets}"
    )
    return system, user


@app.post("/api/generate", response_model=GenerateResponse)
async def generate(req: GenerateRequest):
    kinds = req.kinds or ["emergentPrompt", "lovablePrompt", "markdownSpec", "qaChecklist"]
    invalid = [k for k in kinds if k not in KIND_SPECS]
    if invalid:
        raise HTTPException(status_code=400, detail=f"Unknown kinds: {invalid}")

    async def run_kind(kind: str) -> tuple[str, str]:
        system, user = _build_llm_payload(req, kind)
        text = await _run_llm(
            provider="anthropic",
            model="claude-sonnet-4-5-20250929",
            system=system,
            user=user,
            max_tokens=3500,   # outputs are naturally 2–3K tokens; capping tightens latency
            timeout_s=180,
        )
        return kind, text

    # Run all 4 in parallel — dramatically improves total latency.
    results = await asyncio.gather(*(run_kind(k) for k in kinds), return_exceptions=True)

    outputs: Dict[str, str] = {}
    for r in results:
        if isinstance(r, Exception):
            # Bubble up first failure so client can fall back to deterministic.
            raise r
        kind, text = r
        outputs[kind] = text

    return GenerateResponse(outputs=outputs)


# ---------------------------------------------------------------------------
# /api/rewrite — Gemini 3 Flash → single-field suggestion
# ---------------------------------------------------------------------------
class RewriteRequest(BaseModel):
    label: str                          # question label
    currentValue: str = ""              # what the user has typed so far
    projectSummary: str = ""            # small context blob (business name, tagline, tone…)
    guidance: str = "improve"           # improve | shorten | expand | punchier | friendlier


class RewriteResponse(BaseModel):
    suggestion: str
    generatedBy: str = "ai"
    model: str = "gemini/gemini-3-flash-preview"


GUIDANCE_HINTS = {
    "improve":    "Make it sharper, clearer, and more compelling. Keep the same core meaning.",
    "shorten":    "Compress this to be significantly shorter without losing meaning.",
    "expand":     "Expand this with more specific detail. Keep the tone consistent.",
    "punchier":   "Rewrite with more punch, energy, and confidence. Shorter sentences.",
    "friendlier": "Rewrite in a warmer, more approachable tone. Feel human.",
}


@app.post("/api/rewrite", response_model=RewriteResponse)
async def rewrite(req: RewriteRequest):
    if not req.currentValue.strip() and not req.projectSummary.strip():
        raise HTTPException(status_code=400, detail="Nothing to rewrite yet — add some text first.")

    hint = GUIDANCE_HINTS.get(req.guidance, GUIDANCE_HINTS["improve"])
    system = (
        "You are a senior copy editor for a modern SaaS product. You rewrite a single form field value. "
        "Return ONLY the rewritten text — no quotes, no explanations, no preamble, no 'Here is…'. "
        "Match the length category of the input (short field → short output; textarea → similar length). "
        "Never invent factual details that aren't in the current value or project summary."
    )
    user = (
        f"Field: {req.label}\n"
        f"Guidance: {hint}\n\n"
        f"Project context:\n{req.projectSummary or '(none provided)'}\n\n"
        f"Current value:\n{req.currentValue or '(empty — write a first draft from the project context)'}\n\n"
        f"Return the rewritten value only."
    )
    text = await _run_llm(
        provider="gemini",
        model="gemini-3-flash-preview",
        system=system,
        user=user,
        max_tokens=800,
        timeout_s=20,
    )
    # Strip stray quote wrapping the model sometimes adds.
    cleaned = text.strip().strip('"').strip("'").strip()
    return RewriteResponse(suggestion=cleaned)
