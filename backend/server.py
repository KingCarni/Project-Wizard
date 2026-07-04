"""
Project Wizard — minimal backend.

The MVP is a localStorage-only frontend app (per source-of-truth doc:
"No backend, No auth, No payments, No external API calls").

This file exists only to satisfy the platform's supervisor + provide a
/api/health endpoint. All product data lives in the browser.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Project Wizard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    return {"status": "ok", "app": "project-wizard", "mode": "localStorage-only"}


@app.get("/api/")
async def root():
    return {"message": "Project Wizard MVP — frontend is localStorage-only."}
