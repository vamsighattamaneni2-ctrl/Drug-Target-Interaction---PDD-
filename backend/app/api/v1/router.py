from fastapi import APIRouter
from app.api.v1.endpoints import (
    health,
    interactions,
    external,
    docking,
    admet,
    pockets,
    batch,
    similarity,
    reports_export,
    projects,
)

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(external.router, prefix="/external", tags=["External Data Sources"])
api_router.include_router(docking.router, prefix="/docking", tags=["Molecular Preparation & Docking"])
api_router.include_router(pockets.router, prefix="/pockets", tags=["Binding-Pocket Detection"])
api_router.include_router(batch.router, prefix="/batch", tags=["Batch Virtual Screening"])
api_router.include_router(similarity.router, prefix="/similarity", tags=["Molecular Similarity Search"])
api_router.include_router(admet.router, prefix="/admet", tags=["ADMET Pharmacokinetics"])
api_router.include_router(interactions.router, prefix="/interactions", tags=["Interactions & Contacts"])
api_router.include_router(reports_export.router, prefix="/export", tags=["Reports & Data Export"])
api_router.include_router(projects.router, prefix="/projects", tags=["Research Projects History"])
