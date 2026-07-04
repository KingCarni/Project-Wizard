"""
Backend tests for Project Wizard iteration 2.
Covers /api/health, /api/rewrite (Gemini 3 Flash), /api/generate (Claude Sonnet 4.5).
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/") or \
           "https://dac6b103-8bba-4a7c-9c48-6da1561b2244.preview.emergentagent.com"


# ---------- Fixtures ----------
@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- Health ----------
class TestHealth:
    def test_health_ok(self, client):
        r = client.get(f"{BASE_URL}/api/health", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["status"] == "ok"
        assert d["app"] == "project-wizard"
        assert d["llm_ready"] is True


# ---------- /api/rewrite (Gemini) ----------
class TestRewrite:
    def _payload(self, **over):
        base = {
            "label": "Business tagline",
            "currentValue": "we help small biz grow",
            "projectSummary": "Business: Acme Studios. A creative studio focused on brand identity.",
            "guidance": "improve",
        }
        base.update(over)
        return base

    def test_rewrite_improve(self, client):
        r = client.post(f"{BASE_URL}/api/rewrite", json=self._payload(), timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d["generatedBy"] == "ai"
        assert d["model"] == "gemini/gemini-3-flash-preview"
        assert isinstance(d["suggestion"], str) and len(d["suggestion"]) > 0

    def test_rewrite_punchier(self, client):
        r = client.post(
            f"{BASE_URL}/api/rewrite",
            json=self._payload(guidance="punchier"),
            timeout=30,
        )
        assert r.status_code == 200
        assert len(r.json()["suggestion"]) > 0

    def test_rewrite_shorten(self, client):
        r = client.post(
            f"{BASE_URL}/api/rewrite",
            json=self._payload(guidance="shorten", currentValue="This is a moderately long value that has some fluff we want removed."),
            timeout=30,
        )
        assert r.status_code == 200
        assert len(r.json()["suggestion"]) > 0

    def test_rewrite_empty_returns_400(self, client):
        r = client.post(
            f"{BASE_URL}/api/rewrite",
            json={"label": "X", "currentValue": "", "projectSummary": "", "guidance": "improve"},
            timeout=15,
        )
        assert r.status_code == 400
        assert "rewrite" in r.json()["detail"].lower()

    def test_rewrite_missing_label(self, client):
        r = client.post(
            f"{BASE_URL}/api/rewrite",
            json={"currentValue": "abc"},
            timeout=15,
        )
        # Pydantic validation should complain about missing label
        assert r.status_code == 422


# ---------- /api/generate (Claude Sonnet 4.5) ----------
class TestGenerate:
    def _payload(self, **over):
        base = {
            "projectName": "TEST Riverstone Studios",
            "templateName": "Business Website",
            "templateId": "business-website",
            "selectedBuilder": "lovable",
            "recommendedBuilder": "lovable",
            "answers": {
                "businessName": "Riverstone Studios",
                "tagline": "Warm minimalism for modern homes",
                "description": "A Brooklyn interior design studio.",
                "goal": "Book design consultations",
                "cta": "Book a consult",
                "features": ["Contact form", "Testimonials"],
            },
            "contextFiles": [],
        }
        base.update(over)
        return base

    def test_generate_single_kind_qa(self, client):
        # A single-kind call to isolate speed and correctness (Claude is slow).
        r = client.post(
            f"{BASE_URL}/api/generate",
            json=self._payload(kinds=["qaChecklist"]),
            timeout=180,
        )
        assert r.status_code == 200, r.text[:500]
        d = r.json()
        assert d["generatedBy"] == "ai"
        assert d["model"] == "anthropic/claude-sonnet-4-5-20250929"
        assert "qaChecklist" in d["outputs"]
        content = d["outputs"]["qaChecklist"]
        # QA checklist should contain checkbox syntax
        assert "- [ ]" in content or "- [x]" in content
        assert len(content) > 200

    def test_generate_all_four_kinds(self, client):
        r = client.post(f"{BASE_URL}/api/generate", json=self._payload(), timeout=180)
        # This can be flaky at ingress boundary (60s LB timeout); accept 502/504 as gateway timeout, not backend bug
        if r.status_code in (502, 504):
            pytest.skip(f"Gateway timeout {r.status_code} — ingress 60s cap can truncate parallel Claude runs; retry required")
        assert r.status_code == 200, r.text[:500]
        d = r.json()
        assert d["generatedBy"] == "ai"
        assert d["model"] == "anthropic/claude-sonnet-4-5-20250929"
        for k in ["emergentPrompt", "lovablePrompt", "markdownSpec", "qaChecklist"]:
            assert k in d["outputs"], f"missing {k}"
            assert len(d["outputs"][k]) > 300, f"{k} too short: {len(d['outputs'][k])}"
        # Verify the actual project name / tagline appears somewhere in output
        joined = "\n".join(d["outputs"].values()).lower()
        assert "riverstone" in joined
        assert "warm minimalism" in joined or "brooklyn" in joined

    def test_generate_invalid_kind_returns_400(self, client):
        r = client.post(
            f"{BASE_URL}/api/generate",
            json=self._payload(kinds=["notARealKind"]),
            timeout=30,
        )
        assert r.status_code == 400
        assert "unknown kinds" in r.json()["detail"].lower()
