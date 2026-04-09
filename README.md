# Purchase Order System

Standalone Purchase Order system scaffold with a working Node.js + Express + SQLite backend and a React frontend skeleton.

## Structure

```text
purchase-order-system/
  backend/
    src/
      db/
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

- Users
  - `GET /users`
  - `POST /users`
  - `GET /users/:id`
- Projects
  - `GET /projects`
  - `POST /projects`
  - `GET /projects/:id`
  - `GET /users/:id/projects`
- Purchase Orders
  - `GET /purchase-orders`
  - `POST /purchase-orders`
  - `GET /purchase-orders/:id`
  - `GET /projects/:id/purchase-orders`
  - `PATCH /purchase-orders/:id/status`
- PO Items
  - `GET /purchase-orders/:id/items`
  - `POST /purchase-orders/:id/items`
  - `PATCH /items/:id`
  - `DELETE /items/:id`
- Approval Logs
  - `GET /purchase-orders/:id/approvals`
  - `POST /purchase-orders/:id/approvals`
- Reporting
  - `GET /reports/summary`
