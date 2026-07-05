"""
Iteration 3 backend tests — verify:
  1. AI /api/generate outputs contain '_(not specified)_' when required fields missing.
  2. AI outputs reference uploaded context files by name.
  3. AI outputs contain the anti-generic mandate + authoritative context language.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/") or \
           "https://build-orchestrator-2.preview.emergentagent.com"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


class TestIter3Generate:
    """Iteration 3 acceptance criteria on /api/generate output content."""

    def _sparse_payload(self, kinds):
        # Deliberately sparse to trigger "_(not specified)_" placeholders
        return {
            "projectName": "TEST Sparse Project",
            "templateName": "Business Website",
            "templateId": "business-website",
            "selectedBuilder": "lovable",
            "recommendedBuilder": "lovable",
            "answers": {
                "businessName": "TEST Sparse Co",
                # Intentionally leave tagline/description/etc. missing
            },
            "contextFiles": [],
            "kinds": kinds,
        }

    def _payload_with_file(self, kinds):
        return {
            "projectName": "TEST Context Project",
            "templateName": "Business Website",
            "templateId": "business-website",
            "selectedBuilder": "lovable",
            "recommendedBuilder": "lovable",
            "answers": {
                "businessName": "Northwind Consultancy",
                "tagline": "Precision small-business strategy",
                "description": "A consultancy for family-owned NY businesses.",
            },
            "contextFiles": [
                {
                    "name": "brand-voice.md",
                    "size": 320,
                    "type": "text/markdown",
                    "content": (
                        "# Brand voice\n"
                        "- Warm but direct.\n"
                        "- Never use the word 'synergy'.\n"
                        "- Preferred phrase: 'small-business owners' (never 'SMBs').\n"
                    ),
                }
            ],
            "kinds": kinds,
        }

    def test_missing_fields_mark_not_specified_lovable(self, client):
        r = client.post(
            f"{BASE_URL}/api/generate",
            json=self._sparse_payload(["lovablePrompt"]),
            timeout=180,
        )
        if r.status_code in (502, 504):
            pytest.skip(f"Ingress timeout {r.status_code} — retry required")
        assert r.status_code == 200, r.text[:500]
        content = r.json()["outputs"]["lovablePrompt"]
        # Prompt asks the model to use exactly '_(not specified)_' for missing info
        assert "not specified" in content.lower(), \
            f"Expected 'not specified' placeholder in output; got:\n{content[:800]}"

    def test_anti_generic_mandate_in_emergent(self, client):
        r = client.post(
            f"{BASE_URL}/api/generate",
            json=self._sparse_payload(["emergentPrompt"]),
            timeout=180,
        )
        if r.status_code in (502, 504):
            pytest.skip(f"Ingress timeout {r.status_code} — retry required")
        assert r.status_code == 200, r.text[:500]
        content = r.json()["outputs"]["emergentPrompt"].lower()
        # Should have a Visual Identity section
        assert "visual identity" in content, "Missing 'Visual Identity' section"
        # Should mention the anti-generic mandate
        assert "generic" in content and ("ai" in content or "landing page" in content), \
            "Missing anti-generic mandate language"

    def test_qa_brand_fidelity_first(self, client):
        r = client.post(
            f"{BASE_URL}/api/generate",
            json=self._sparse_payload(["qaChecklist"]),
            timeout=120,
        )
        if r.status_code in (502, 504):
            pytest.skip(f"Ingress timeout {r.status_code} — retry required")
        assert r.status_code == 200, r.text[:500]
        content = r.json()["outputs"]["qaChecklist"]
        low = content.lower()
        assert "brand fidelity" in low, "QA checklist missing 'Brand Fidelity' section"
        # Verify Brand Fidelity is the FIRST ## section
        first_h2 = None
        for line in content.splitlines():
            if line.strip().startswith("## "):
                first_h2 = line.strip().lower()
                break
        assert first_h2 is not None, "No ## sections found"
        assert "brand fidelity" in first_h2, f"First section is '{first_h2}', expected Brand Fidelity"

    def test_context_file_referenced_by_name(self, client):
        r = client.post(
            f"{BASE_URL}/api/generate",
            json=self._payload_with_file(["markdownSpec"]),
            timeout=180,
        )
        if r.status_code in (502, 504):
            pytest.skip(f"Ingress timeout {r.status_code} — retry required")
        assert r.status_code == 200, r.text[:500]
        content = r.json()["outputs"]["markdownSpec"]
        low = content.lower()
        assert "brand-voice.md" in content or "brand-voice" in low, \
            f"Output should reference uploaded file 'brand-voice.md'; got:\n{content[-1200:]}"
        # Should have authoritative-context language somewhere
        assert "authoritative" in low or "project context" in low, \
            "Output should mention Project Context / authoritative background"
