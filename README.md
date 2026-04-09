# Purchase Order System

Standalone Purchase Order system scaffold with a working Node.js + Express + SQLite backend and a React frontend.

## Structure

```text
purchase-order-system/
  backend/
    src/
      db/
      middleware/
      routes/
      controllers/
      services/
      app.js
      server.js
  frontend/
    src/
      pages/
      components/
      services/
```

## Quick start

### Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs at `http://localhost:4000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` and expects backend at `http://localhost:4000`.

## API endpoints

### Authentication

- `POST /auth/register` (name, email, password)
- `POST /auth/login` (email, password)
- `GET /auth/me` (Bearer token)

### User + project/PO workflow

- Register/login to receive a Bearer token.
- Create projects as the signed-in user.
- Create purchase orders under your own projects.

Authenticated endpoints:

- Users
  - `GET /users`
  - `POST /users`
  - `GET /users/:id`
  - `GET /users/:id/projects`
- Projects
  - `GET /projects`
  - `POST /projects`
  - `GET /projects/:id`
  - `GET /projects/:id/purchase-orders`
- Purchase Orders
  - `GET /purchase-orders`
  - `POST /purchase-orders`
  - `GET /purchase-orders/:id`
  - `PATCH /purchase-orders/:id/status`
- PO Items
  - `GET /purchase-orders/:id/items`
  - `POST /purchase-orders/:id/items`
  - `PATCH /items/:id`
  - `DELETE /items/:id`
- Approval Logs
  - `GET /purchase-orders/:id/approvals`
  - `POST /purchase-orders/:id/approvals`

Public endpoint:

- Reporting
  - `GET /reports/summary`
