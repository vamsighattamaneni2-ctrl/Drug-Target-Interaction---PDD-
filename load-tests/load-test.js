import http from 'k6/http';
import { check, sleep } from 'k6';

// 100 Virtual Users continuously for 1 Minute
export const options = {
  stages: [
    { duration: '10s', target: 100 }, // Ramp-up to 100 VUs
    { duration: '40s', target: 100 }, // Steady state 100 VUs
    { duration: '10s', target: 0 },   // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<800', 'avg<300'], // 95% < 800ms, avg < 300ms
    http_req_failed: ['rate<0.01'],             // Error rate < 1%
  },
};

const BASE_URL = __ENV.API_BASE_URL || 'http://127.0.0.1:8000';

export default function () {
  // 1. Health check
  const res1 = http.get(`${BASE_URL}/health`);
  check(res1, {
    'health status is 200': (r) => r.status === 200,
    'health response fast': (r) => r.timings.duration < 150,
  });

  // 2. Targets catalog
  const res2 = http.get(`${BASE_URL}/api/v1/interactions/targets`);
  check(res2, {
    'targets status is 200': (r) => r.status === 200,
  });

  // 3. ADMET profile prediction
  const payload = JSON.stringify({
    compound_name: 'Imatinib',
    smiles: 'CC1=C(C=C(C=C1)NC(=O)C2=CC=C(CN3CCN(C)CC3)C=C2)NC4=NC=CC(=N4)C5=CN=CC=C5',
    molecular_weight: 493.6,
  });
  const params = { headers: { 'Content-Type': 'application/json' } };
  const res3 = http.post(`${BASE_URL}/api/v1/admet/evaluate`, payload, params);
  check(res3, {
    'admet status is 200': (r) => r.status === 200,
  });

  sleep(0.5);
}
