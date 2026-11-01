"""
DrugNet Comprehensive Security Regression Test Suite
Validates the remediation of all 16 failed test cases identified in the security assessment:
TC-SEC-01, TC-SEC-02, TC-SEC-03, TC-SEC-05, TC-SEC-06, TC-SEC-07, TC-SEC-08,
TC-SEC-12, TC-SEC-16, TC-SEC-17, TC-SEC-18, TC-SEC-21, TC-SEC-22, TC-SEC-23,
TC-SEC-25, TC-SEC-26.
"""

import io
import os
import sys

# Ensure backend root is on sys.path
_backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

import re
import tempfile
import time
from datetime import timedelta
import jwt
import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.core.security import (
    AuthenticatedUser,
    UserRole,
    create_access_token,
    verify_token,
)
from app.main import app
from app.services.project_service import (
    RESEARCH_PROJECTS,
    delete_research_project,
    get_research_project,
    list_research_projects,
    save_research_project,
)
from app.services.report_export_service import generate_pdf_report
from app.api.v1.endpoints.reports_export import SHARED_REPORTS
from app.services.pocket_service import _run_fpocket_if_installed, _run_p2rank_if_installed


@pytest.fixture
def client():
    """FastAPI TestClient fixture."""
    return TestClient(app)


@pytest.fixture
def user_researcher_token():
    """Generates valid JWT for standard Researcher user."""
    return create_access_token({
        "uid": "usr-researcher-101",
        "email": "alice@theratarget.org",
        "role": UserRole.RESEARCHER.value,
        "name": "Dr. Alice Researcher",
    })


@pytest.fixture
def user_b_token():
    """Generates valid JWT for second distinct Researcher user."""
    return create_access_token({
        "uid": "usr-researcher-202",
        "email": "bob@theratarget.org",
        "role": UserRole.RESEARCHER.value,
        "name": "Dr. Bob Researcher",
    })


@pytest.fixture
def admin_token():
    """Generates valid JWT for Administrator user."""
    return create_access_token({
        "uid": "usr-admin-999",
        "email": "admin@theratarget.org",
        "role": UserRole.ADMINISTRATOR.value,
        "name": "Platform Administrator",
    })


# ============================================================================
# TC-SEC-01: Broken Authentication on Compute-Intensive Docking Endpoint
# ============================================================================
def test_tc_sec_01_docking_requires_authentication(client, user_researcher_token):
    docking_payload = {
        "compound_name": "Imatinib",
        "smiles": "CC1=C(C=C(C=C1)NC(=O)C2=CC=C(CN3CCN(C)CC3)C=C2)NC4=NC=CC(=N4)C5=CN=CC=C5",
        "target_gene": "BCR-ABL1",
        "pdb_id": "1IEP",
        "exhaustiveness": 8,
        "num_modes": 9,
    }

    # 1. Anonymous request must be rejected with 401
    res_unauth = client.post("/api/v1/docking/run", json=docking_payload)
    assert res_unauth.status_code == 401, f"Expected 401 for anonymous request, got {res_unauth.status_code}"

    # 2. Tampered token must be rejected with 401
    tampered_headers = {"Authorization": f"Bearer {user_researcher_token}tampered"}
    res_tampered = client.post("/api/v1/docking/run", json=docking_payload, headers=tampered_headers)
    assert res_tampered.status_code == 401

    # 3. Valid authenticated request must succeed
    auth_headers = {"Authorization": f"Bearer {user_researcher_token}"}
    res_auth = client.post("/api/v1/docking/run", json=docking_payload, headers=auth_headers)
    assert res_auth.status_code == 200, f"Expected 200 for authenticated docking, got {res_auth.status_code}"
    body = res_auth.json()
    assert "binding_affinity_delta_g" in body or "best_mode" in body or "modes" in body


# ============================================================================
# TC-SEC-02: Broken Authentication on Project Deletion
# ============================================================================
def test_tc_sec_02_project_deletion_authorization(client, user_researcher_token, user_b_token, admin_token):
    # Setup project owned by User A
    proj_data = {
        "id": "PRJ-SEC-DEL-01",
        "title": "Private Project for Deletion Test",
        "target_gene": "EGFR",
        "compound_name": "Gefitinib",
        "owner_id": "usr-researcher-101",
    }
    save_research_project(proj_data)

    # 1. Anonymous deletion rejected with 401
    res_anon = client.delete("/api/v1/projects/PRJ-SEC-DEL-01")
    assert res_anon.status_code == 401

    # 2. Unauthorized User B cannot delete User A's project (403 Forbidden)
    res_user_b = client.delete(
        "/api/v1/projects/PRJ-SEC-DEL-01",
        headers={"Authorization": f"Bearer {user_b_token}"},
    )
    assert res_user_b.status_code == 403, f"Expected 403 Forbidden, got {res_user_b.status_code}"

    # 3. Owner User A can delete their own project (200 OK)
    res_owner = client.delete(
        "/api/v1/projects/PRJ-SEC-DEL-01",
        headers={"Authorization": f"Bearer {user_researcher_token}"},
    )
    assert res_owner.status_code == 200
    assert res_owner.json()["deleted"] is True

    # 4. Administrator can delete any project
    proj_data2 = {
        "id": "PRJ-SEC-DEL-02",
        "title": "Private Project for Admin Deletion",
        "target_gene": "EGFR",
        "compound_name": "Erlotinib",
        "owner_id": "usr-researcher-101",
    }
    save_research_project(proj_data2)
    res_admin = client.delete(
        "/api/v1/projects/PRJ-SEC-DEL-02",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_admin.status_code == 200
    assert res_admin.json()["deleted"] is True


# ============================================================================
# TC-SEC-03: Unauthenticated Batch Screening & Quota Enforcement
# ============================================================================
def test_tc_sec_03_batch_screening_auth_and_quota(client, user_researcher_token):
    batch_payload = {
        "target_gene": "BCR-ABL1",
        "pdb_id": "1IEP",
        "pocket_info": {"center_x": 14.8, "center_y": 21.2, "center_z": 17.9},
        "compounds": [
            {"id": "CMP-01", "name": "Compound 1", "smiles": "CC1=CC=CC=C1"},
            {"id": "CMP-02", "name": "Compound 2", "smiles": "CCN(CC)CC"},
        ],
        "exhaustiveness": 8,
    }

    # 1. Anonymous request rejected with 401
    res_anon = client.post("/api/v1/batch/start", json=batch_payload)
    assert res_anon.status_code == 401

    # 2. Exceeding batch compound quota rejected with 400
    oversized_compounds = [{"id": f"CMP-{i}", "name": f"Compound {i}", "smiles": "CC"} for i in range(501)]
    oversized_payload = dict(batch_payload)
    oversized_payload["compounds"] = oversized_compounds

    res_quota = client.post(
        "/api/v1/batch/start",
        json=oversized_payload,
        headers={"Authorization": f"Bearer {user_researcher_token}"},
    )
    assert res_quota.status_code == 400
    assert "quota" in res_quota.json()["detail"].lower()

    # 3. Valid authenticated batch within quota succeeds
    res_valid = client.post(
        "/api/v1/batch/start",
        json=batch_payload,
        headers={"Authorization": f"Bearer {user_researcher_token}"},
    )
    assert res_valid.status_code == 200
    assert res_valid.json()["status"] == "queued"
    assert "batch_id" in res_valid.json()


# ============================================================================
# TC-SEC-05: Missing JWT Validation & Claim Verification
# ============================================================================
def test_tc_sec_05_jwt_cryptographic_verification():
    # 1. Token signed with wrong secret key rejected
    fake_token = jwt.encode(
        {"uid": "attacker", "exp": int(time.time()) + 3600},
        "wrong-secret-key-attacker-32bytes-length-ok",
        algorithm="HS256",
    )
    with pytest.raises(Exception) as exc_info:
        verify_token(fake_token)
    assert "401" in str(exc_info.value)

    # 2. Expired token rejected
    expired_token = jwt.encode(
        {"uid": "expired-user", "exp": int(time.time()) - 3600},
        settings.SECRET_KEY,
        algorithm="HS256",
    )
    with pytest.raises(Exception) as exc_info:
        verify_token(expired_token)
    assert "expired" in str(exc_info.value).lower()

    # 3. Unsupported algorithm ('none') rejected
    none_token = jwt.encode({"uid": "none-user"}, key="", algorithm="none")
    with pytest.raises(Exception) as exc_info:
        verify_token(none_token)
    assert "401" in str(exc_info.value)

    # 4. Valid token successfully verified
    valid_token = create_access_token({"uid": "valid-user-1", "role": "Researcher"})
    user = verify_token(valid_token)
    assert user.uid == "valid-user-1"
    assert user.role == "Researcher"


# ============================================================================
# TC-SEC-06: Missing Role-Based Access Control (RBAC)
# ============================================================================
def test_tc_sec_06_rbac_hierarchical_enforcement():
    researcher_user = AuthenticatedUser(uid="u1", email="u1@test.com", role=UserRole.RESEARCHER.value)
    senior_user = AuthenticatedUser(uid="u2", email="u2@test.com", role=UserRole.SENIOR_SCIENTIST.value)
    admin_user = AuthenticatedUser(uid="u3", email="u3@test.com", role=UserRole.ADMINISTRATOR.value)

    # Hierarchy verification
    assert researcher_user.has_role(UserRole.RESEARCHER.value) is True
    assert researcher_user.has_role(UserRole.SENIOR_SCIENTIST.value) is False
    assert researcher_user.has_role(UserRole.ADMINISTRATOR.value) is False

    assert senior_user.has_role(UserRole.RESEARCHER.value) is True
    assert senior_user.has_role(UserRole.SENIOR_SCIENTIST.value) is True
    assert senior_user.has_role(UserRole.ADMINISTRATOR.value) is False

    assert admin_user.has_role(UserRole.RESEARCHER.value) is True
    assert admin_user.has_role(UserRole.SENIOR_SCIENTIST.value) is True
    assert admin_user.has_role(UserRole.ADMINISTRATOR.value) is True


# ============================================================================
# TC-SEC-07: Insecure Direct Object Reference (IDOR) on Research Projects
# ============================================================================
def test_tc_sec_07_project_idor_mitigation(client, user_researcher_token, user_b_token, admin_token):
    # User A creates a confidential project
    proj_data = {
        "id": "PRJ-IDOR-PRIVATE-01",
        "title": "Confidential Target Profiling",
        "target_gene": "KRAS-G12C",
        "compound_name": "Sotorasib",
        "smiles": "CC(=O)N1CCN(CC1)C...",
        "owner_id": "usr-researcher-101",
        "is_public": False,
    }
    save_research_project(proj_data)

    # 1. User B attempts to access User A's private project -> 403 Forbidden
    res_b = client.get(
        "/api/v1/projects/PRJ-IDOR-PRIVATE-01",
        headers={"Authorization": f"Bearer {user_b_token}"},
    )
    assert res_b.status_code == 403, f"Expected 403 Forbidden for IDOR attempt, got {res_b.status_code}"

    # 2. User A accesses their own project -> 200 OK
    res_a = client.get(
        "/api/v1/projects/PRJ-IDOR-PRIVATE-01",
        headers={"Authorization": f"Bearer {user_researcher_token}"},
    )
    assert res_a.status_code == 200
    assert res_a.json()["target_gene"] == "KRAS-G12C"

    # 3. Administrator can access project -> 200 OK
    res_admin = client.get(
        "/api/v1/projects/PRJ-IDOR-PRIVATE-01",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_admin.status_code == 200


# ============================================================================
# TC-SEC-08: Insecure Direct Object Reference on Shared Reports Manipulation
# ============================================================================
def test_tc_sec_08_report_overwrite_authorization(client, user_researcher_token, user_b_token, admin_token):
    # User A creates a report
    report_payload = {
        "id": "DTI-REPORT-AUTH-01",
        "compoundName": "Imatinib",
        "targetGene": "BCR-ABL1",
        "dockingScore": -10.5,
    }
    res_create = client.post(
        "/api/v1/export/reports",
        json=report_payload,
        headers={"Authorization": f"Bearer {user_researcher_token}"},
    )
    assert res_create.status_code == 200

    # User B attempts to overwrite User A's report -> 403 Forbidden
    malicious_payload = {
        "id": "DTI-REPORT-AUTH-01",
        "compoundName": "Poisoned Molecule",
        "targetGene": "Corrupted Target",
        "dockingScore": -2.0,
    }
    res_overwrite = client.post(
        "/api/v1/export/reports",
        json=malicious_payload,
        headers={"Authorization": f"Bearer {user_b_token}"},
    )
    assert res_overwrite.status_code == 403, f"Expected 403 for unauthorized report overwrite, got {res_overwrite.status_code}"

    # Verify report was not corrupted
    res_get = client.get("/api/v1/export/reports/DTI-REPORT-AUTH-01")
    assert res_get.status_code == 200
    assert res_get.json()["compoundName"] == "Imatinib"


# ============================================================================
# TC-SEC-12: Report Export XML/Format Injection Prevention
# ============================================================================
def test_tc_sec_12_report_export_xml_escaping():
    # Payload containing special characters that would crash raw ReportLab XML Paragraphs
    malicious_report_data = {
        "compound_name": "Test & Molecule <Special> & 'Quote'",
        "target_gene": "EGFR <H3K4me3> & Wildtype",
        "pdb_id": "1M17",
        "smiles": "CC(=O)N<script>alert('xss')</script>&CO2>H2O",
        "docking_score": "-9.8",
        "pocket": {
            "pocket_id": "Pocket <1> & 2",
            "center_x": 15.0,
            "center_y": 20.0,
            "center_z": 18.0,
            "box_size_x": 20.0,
            "box_size_y": 20.0,
            "box_size_z": 20.0,
            "lining_residues": ["ILE<313>", "THR&315", "MET>318"],
        },
        "contacts": [
            {"type": "H-Bond <Donor>", "residue": "ASP&381", "distance": "2.8 Å", "role": "Anchor & Stabilizer"},
        ],
    }

    # Must generate PDF without raising ExpatError / XML parsing exceptions
    pdf_bytes = generate_pdf_report(malicious_report_data)
    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 1000
    assert pdf_bytes.startswith(b"%PDF-")


# ============================================================================
# TC-SEC-16: Uncontrolled Resource Allocation (Upload Size Limits)
# ============================================================================
def test_tc_sec_16_upload_size_limit_and_format_validation(client, user_researcher_token):
    auth_headers = {"Authorization": f"Bearer {user_researcher_token}"}

    # 1. Invalid file extension (.exe) rejected with 400
    res_bad_ext = client.post(
        "/api/v1/batch/validate-upload",
        files={"file": ("malicious.exe", b"binarycontent", "application/octet-stream")},
        headers=auth_headers,
    )
    assert res_bad_ext.status_code == 400
    assert "unsupported" in res_bad_ext.json()["detail"].lower()

    # 2. Oversized payload (> 10 MB) via Content-Length header rejected with 413
    oversized_headers = dict(auth_headers)
    oversized_headers["Content-Length"] = str(15 * 1024 * 1024)  # 15 MB
    res_oversized = client.post(
        "/api/v1/batch/validate-upload",
        files={"file": ("large_library.csv", b"smiles,name\nCC,Ethanol\n", "text/csv")},
        headers=oversized_headers,
    )
    assert res_oversized.status_code == 413, f"Expected 413 for oversized upload, got {res_oversized.status_code}"

    # 3. Valid CSV within limit parsed successfully
    valid_csv = b"smiles,name\nCC1=C(C=C(C=C1)NC(=O)C2=CC=C(CN3CCN(C)CC3)C=C2)NC4=NC=CC(=N4)C5=CN=CC=C5,Imatinib\n"
    res_valid = client.post(
        "/api/v1/batch/validate-upload",
        files={"file": ("valid_library.csv", valid_csv, "text/csv")},
        headers=auth_headers,
    )
    assert res_valid.status_code == 200
    assert res_valid.json()["valid_count"] >= 1


# ============================================================================
# TC-SEC-17: Missing Input Validation on Report Creation
# ============================================================================
def test_tc_sec_17_report_input_schema_validation(client, user_researcher_token):
    auth_headers = {"Authorization": f"Bearer {user_researcher_token}"}

    # 1. Malformed payload with invalid types (e.g. string instead of float for dockingScore) -> 422
    invalid_type_payload = {
        "compoundName": "Imatinib",
        "targetGene": "BCR-ABL1",
        "dockingScore": "not_a_valid_float_number",
    }
    res_invalid_type = client.post("/api/v1/export/reports", json=invalid_type_payload, headers=auth_headers)
    assert res_invalid_type.status_code == 422

    # 2. Missing required fields (compoundName and targetGene absent) -> 422
    incomplete_payload = {
        "title": "Untitled Report without target or compound",
    }
    res_missing = client.post("/api/v1/export/reports", json=incomplete_payload, headers=auth_headers)
    assert res_missing.status_code == 422


# ============================================================================
# TC-SEC-18: Multi-Tenant Data Confidentiality on Project Listing
# ============================================================================
def test_tc_sec_18_project_listing_confidentiality(client, user_researcher_token, user_b_token):
    # Save a confidential project owned by User A
    proj_a = {
        "id": "PRJ-SEC-TENANT-A",
        "title": "User A Private Novel Scaffold",
        "target_gene": "BRAF-V600E",
        "compound_name": "NovelKinaseInhibitor-A",
        "smiles": "CC(C)NC1...",
        "owner_id": "usr-researcher-101",
        "is_public": False,
    }
    save_research_project(proj_a)

    # 1. Unauthenticated request rejected with 401
    res_anon = client.get("/api/v1/projects")
    assert res_anon.status_code == 401

    # 2. User B lists projects; User A's private project MUST NOT be present
    res_b = client.get(
        "/api/v1/projects",
        headers={"Authorization": f"Bearer {user_b_token}"},
    )
    assert res_b.status_code == 200
    projects_b = res_b.json()
    project_ids_seen_by_b = [p["id"] for p in projects_b]
    assert "PRJ-SEC-TENANT-A" not in project_ids_seen_by_b, "Confidential project leaked to unauthorized user!"

    # 3. User A lists projects; User A's private project IS present
    res_a = client.get(
        "/api/v1/projects",
        headers={"Authorization": f"Bearer {user_researcher_token}"},
    )
    assert res_a.status_code == 200
    project_ids_seen_by_a = [p["id"] for p in res_a.json()]
    assert "PRJ-SEC-TENANT-A" in project_ids_seen_by_a


# ============================================================================
# TC-SEC-21: Defensive HTTP Security Headers
# ============================================================================
def test_tc_sec_21_defensive_security_headers_present(client):
    res = client.get("/health")
    assert res.status_code == 200
    
    # Verify standard defensive headers injected by SecurityHeadersMiddleware
    assert res.headers.get("X-Content-Type-Options") == "nosniff"
    assert res.headers.get("X-Frame-Options") == "DENY"
    assert "default-src 'self'" in res.headers.get("Content-Security-Policy", "")
    assert res.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"


# ============================================================================
# TC-SEC-22: Rate Limiting on Compute Endpoints
# ============================================================================
def test_tc_sec_22_rate_limiting_enforcement(client, user_researcher_token):
    auth_headers = {"Authorization": f"Bearer {user_researcher_token}"}
    payload = {
        "compound_name": "Imatinib",
        "smiles": "CC1=CC=CC=C1",
        "target_gene": "BCR-ABL1",
        "pdb_id": "1IEP",
        "exhaustiveness": 1,
        "num_modes": 1,
    }

    # Dispatch requests in rapid succession; limit is 10/minute
    got_429 = False
    for _ in range(15):
        res = client.post("/api/v1/docking/run", json=payload, headers=auth_headers)
        if res.status_code == 429:
            got_429 = True
            assert "Retry-After" in res.headers
            assert "Rate limit exceeded" in res.json()["detail"]
            break

    assert got_429 is True, "Rate limit of 10/minute did not trigger HTTP 429 on rapid requests"


# ============================================================================
# TC-SEC-23: Debug Mode & Documentation Exposure Gating
# ============================================================================
def test_tc_sec_23_debug_and_docs_hardening():
    # Verify default config has DEBUG=False
    assert settings.DEBUG is False, "DEBUG should default to False for secure production operation"
    
    # In production environment, docs must be disabled
    prod_docs_enabled = settings.DEBUG and settings.ENVIRONMENT == "production"
    assert prod_docs_enabled is False


# ============================================================================
# TC-SEC-25: Audited and Hardened Dependencies
# ============================================================================
def test_tc_sec_25_dependencies_hardened():
    reqs_path = os.path.join(os.path.dirname(__file__), "..", "requirements.txt")
    with open(reqs_path, "r", encoding="utf-8") as f:
        reqs_content = f.read()

    # Verify vulnerable versions are not pinned
    assert "fastapi==0.115.6" not in reqs_content, "Vulnerable fastapi==0.115.6 still pinned!"
    assert "python-dotenv==1.0.1" not in reqs_content, "Vulnerable python-dotenv==1.0.1 still pinned!"

    # Verify security libraries are listed
    assert "pyjwt" in reqs_content.lower()
    assert "cryptography" in reqs_content.lower()
    assert "slowapi" in reqs_content.lower()


# ============================================================================
# TC-SEC-26: Temporary Directory Resource Leak Cleanup
# ============================================================================
def test_tc_sec_26_temporary_directory_cleanup():
    # Verify implementation of pocket_service uses context manager
    service_path = os.path.join(os.path.dirname(__file__), "..", "app", "services", "pocket_service.py")
    with open(service_path, "r", encoding="utf-8") as f:
        service_code = f.read()

    # Raw unmanaged mkdtemp calls should not exist
    assert "tempfile.mkdtemp" not in service_code, "Unmanaged tempfile.mkdtemp found in pocket_service!"
    assert "tempfile.TemporaryDirectory" in service_code, "TemporaryDirectory context manager missing in pocket_service!"
