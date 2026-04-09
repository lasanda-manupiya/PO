import { useEffect, useState } from 'react';
import SummaryTable from '../components/SummaryTable.jsx';
import { fetchSummaryReport } from '../services/api.js';

export default function DashboardPage() {
  const [report, setReport] = useState({ by_project: [], by_user: [] });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSummaryReport()
      .then(setReport)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <main style={{ maxWidth: 1000, margin: '40px auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>Purchase Order Summary Dashboard</h1>
      {error ? <p style={{ color: 'red' }}>{error}</p> : null}

      <SummaryTable
        title="Summary by Project"
        columns={[
          { key: 'id', label: 'Project ID' },
          { key: 'name', label: 'Project Name' },
          { key: 'po_count', label: 'PO Count' },
          { key: 'total_amount', label: 'Total Amount' },
        ]}
        rows={report.by_project}
      />

      <SummaryTable
        title="Summary by User"
        columns={[
          { key: 'id', label: 'User ID' },
          { key: 'name', label: 'User Name' },
          { key: 'project_count', label: 'Project Count' },
          { key: 'po_count', label: 'PO Count' },
          { key: 'total_amount', label: 'Total Amount' },
        ]}
        rows={report.by_user}
      />
    </main>
  );
}
