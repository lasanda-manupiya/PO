const API_BASE_URL = 'http://localhost:4000';

export async function fetchSummaryReport() {
  const response = await fetch(`${API_BASE_URL}/reports/summary`);
  if (!response.ok) {
    throw new Error(`Failed to load summary report: ${response.status}`);
  }
  return response.json();
}
