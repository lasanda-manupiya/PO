import { useEffect, useMemo, useState } from 'react';
import {
  createProject,
  createPurchaseOrder,
  fetchMyProfile,
  fetchProjects,
  fetchPurchaseOrders,
  loginUser,
  registerUser,
} from '../services/api.js';

const TOKEN_STORAGE_KEY = 'po_token';

function AuthForm({ mode, onSubmit, loading }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isRegister = mode === 'register';

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({ name, email, password });
      }}
      style={{ display: 'grid', gap: 10, maxWidth: 360 }}
    >
      {isRegister ? (
        <input
          required
          placeholder="Full name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      ) : null}
      <input required type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
      <input
        required
        type="password"
        placeholder="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Please wait...' : isRegister ? 'Register' : 'Login'}
      </button>
    </form>
  );
}

export default function DashboardPage() {
  const [mode, setMode] = useState('login');
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY) || '');
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [error, setError] = useState('');
  const [loadingAuth, setLoadingAuth] = useState(false);

  const [projectName, setProjectName] = useState('');
  const [projectDate, setProjectDate] = useState('');

  const [poProjectId, setPoProjectId] = useState('');
  const [supplierName, setSupplierName] = useState('');

  const poByProject = useMemo(() => {
    const map = new Map();
    for (const po of purchaseOrders) {
      const list = map.get(po.project_id) || [];
      list.push(po);
      map.set(po.project_id, list);
    }
    return map;
  }, [purchaseOrders]);

  async function reloadWorkspace(authToken) {
    const [profileResponse, projectRows, poRows] = await Promise.all([
      fetchMyProfile(authToken),
      fetchProjects(authToken),
      fetchPurchaseOrders(authToken),
    ]);

    setUser(profileResponse.user);
    setProjects(projectRows);
    setPurchaseOrders(poRows);
    setPoProjectId(String(projectRows[0]?.id || ''));
  }

  useEffect(() => {
    if (!token) return;

    reloadWorkspace(token).catch((err) => {
      setError(err.message);
      setToken('');
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    });
  }, [token]);

  async function handleAuthSubmit(values) {
    try {
      setLoadingAuth(true);
      setError('');

      const response = mode === 'register'
        ? await registerUser(values)
        : await loginUser({ email: values.email, password: values.password });

      localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
      setToken(response.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingAuth(false);
    }
  }

  async function handleCreateProject(event) {
    event.preventDefault();
    try {
      setError('');
      await createProject(token, { name: projectName, start_date: projectDate || null });
      setProjectName('');
      setProjectDate('');
      await reloadWorkspace(token);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreatePo(event) {
    event.preventDefault();
    try {
      setError('');
      await createPurchaseOrder(token, { project_id: Number(poProjectId), supplier_name: supplierName });
      setSupplierName('');
      await reloadWorkspace(token);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main style={{ maxWidth: 1000, margin: '40px auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>Purchase Order Workspace</h1>
      {error ? <p style={{ color: '#c1121f' }}>{error}</p> : null}

      {!token ? (
        <section style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
          <h2>{mode === 'register' ? 'Create account' : 'Sign in'}</h2>
          <AuthForm mode={mode} onSubmit={handleAuthSubmit} loading={loadingAuth} />
          <button
            type="button"
            style={{ marginTop: 12 }}
            onClick={() => setMode(mode === 'register' ? 'login' : 'register')}
          >
            {mode === 'register' ? 'Already have an account? Login' : 'Need an account? Register'}
          </button>
        </section>
      ) : (
        <>
          <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <strong>{user?.name}</strong> ({user?.email})
            </div>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem(TOKEN_STORAGE_KEY);
                setToken('');
                setUser(null);
                setProjects([]);
                setPurchaseOrders([]);
              }}
            >
              Logout
            </button>
          </section>

          <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 14 }}>
              <h3>Create Project</h3>
              <form onSubmit={handleCreateProject} style={{ display: 'grid', gap: 10 }}>
                <input
                  required
                  placeholder="Project name"
                  value={projectName}
                  onChange={(event) => setProjectName(event.target.value)}
                />
                <input
                  type="date"
                  value={projectDate}
                  onChange={(event) => setProjectDate(event.target.value)}
                />
                <button type="submit">Create project</button>
              </form>
            </div>

            <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 14 }}>
              <h3>Create Purchase Order</h3>
              <form onSubmit={handleCreatePo} style={{ display: 'grid', gap: 10 }}>
                <select value={poProjectId} onChange={(event) => setPoProjectId(event.target.value)} required>
                  <option value="" disabled>
                    Select project
                  </option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                <input
                  required
                  placeholder="Supplier name"
                  value={supplierName}
                  onChange={(event) => setSupplierName(event.target.value)}
                />
                <button type="submit">Create PO</button>
              </form>
            </div>
          </section>

          <section style={{ marginTop: 24 }}>
            <h2>Your Projects</h2>
            {projects.map((project) => (
              <div key={project.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                <h3 style={{ margin: '0 0 8px' }}>
                  {project.name} <small style={{ color: '#666' }}>({project.status})</small>
                </h3>
                <p style={{ margin: 0 }}>Start Date: {project.start_date || 'N/A'}</p>
                <p style={{ margin: '8px 0 0' }}>Purchase Orders:</p>
                <ul>
                  {(poByProject.get(project.id) || []).map((po) => (
                    <li key={po.id}>
                      {po.po_number} - {po.supplier_name} ({po.status})
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        </>
      )}
    </main>
  );
}
