import express from 'express';
import cors from 'cors';
import usersRoutes from './routes/usersRoutes.js';
import projectsRoutes from './routes/projectsRoutes.js';
import purchaseOrdersRoutes from './routes/purchaseOrdersRoutes.js';
import itemsRoutes from './routes/itemsRoutes.js';
import reportsRoutes from './routes/reportsRoutes.js';
import { getDb } from './db/database.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', async (_req, res, next) => {
  try {
    await getDb();
    res.json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
});

app.use('/users', usersRoutes);
app.use('/projects', projectsRoutes);
app.use('/purchase-orders', purchaseOrdersRoutes);
app.use('/items', itemsRoutes);
app.use('/reports', reportsRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Internal Server Error', detail: error.message });
});

export default app;
