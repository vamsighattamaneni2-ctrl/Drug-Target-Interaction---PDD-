export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  timestamp: string;
  environment: string;
}

export interface TargetInfo {
  target_id: string;
  target_name: string;
  gene_symbol?: string;
  organism: string;
  uniprot_id?: string;
  target_type: string;
}

export interface DTIPredictionRequest {
  target_id?: string;
  compound_smiles?: string;
  algorithm?: string;
  drug_filename?: string;
  target_filename?: string;
  drug_content?: string;
  target_content?: string;
}

export interface DTIPredictionResponse {
  target_id: string;
  compound_smiles: string;
  binding_affinity_pkd: number;
  predicted_kd_nm: number;
  confidence_score: number;
  interaction_type: string;
  key_contact_residues: string[];
  binding_affinity_delta_g?: number;
  hydrogen_bonds_count?: number;
  salt_bridges_count?: number;
  buried_sasa_angstrom?: number;
  docking_rmsd?: number;
  summary?: string;
}


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export async function checkBackendHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error(`Health check failed: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchTargets(): Promise<TargetInfo[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/interactions/targets`);
  if (!response.ok) {
    throw new Error(`Failed to fetch targets: ${response.statusText}`);
  }
  return response.json();
}

export async function predictInteraction(payload: DTIPredictionRequest): Promise<DTIPredictionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/interactions/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Prediction failed: ${response.statusText}`);
  }
  return response.json();
}
