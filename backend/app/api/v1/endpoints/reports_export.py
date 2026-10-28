"""
FastAPI Endpoints for Scientific Reports & Data Export (Feature 9)
"""

from fastapi import APIRouter, HTTPException, Response, Body
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.services.report_export_service import generate_pdf_report, generate_docx_report

router = APIRouter()


class ExportReportRequest(BaseModel):
    compound_name: str = Field("Imatinib", description="Compound name")
    target_gene: str = Field("BCR-ABL1", description="Target gene symbol")
    pdb_id: Optional[str] = Field("1IEP", description="PDB Accession ID")
    smiles: Optional[str] = Field("", description="SMILES string")
    docking_score: Optional[str] = Field("-11.4", description="Binding affinity in kcal/mol")
    pocket: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Binding pocket parameters")
    contacts: Optional[List[Dict[str, Any]]] = Field(default_factory=list, description="Interaction contacts")
    admet: Optional[Dict[str, Any]] = Field(default_factory=dict, description="ADMET endpoints")


@router.post("/pdf", summary="Generate Downloadable Scientific PDF Report")
async def export_pdf_endpoint(request: ExportReportRequest):
    try:
        pdf_bytes = generate_pdf_report(request.dict())
        filename = f"{request.compound_name.replace(' ', '_')}_{request.target_gene}_Report.pdf"
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")


@router.post("/docx", summary="Generate Downloadable Scientific DOCX Report")
async def export_docx_endpoint(request: ExportReportRequest):
    try:
        docx_bytes = generate_docx_report(request.dict())
        filename = f"{request.compound_name.replace(' ', '_')}_{request.target_gene}_Report.docx"
        return Response(
            content=docx_bytes,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DOCX generation failed: {str(e)}")
