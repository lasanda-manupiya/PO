import { Router } from 'express';
import { createProject, getProjectById, listProjects } from '../controllers/projectsController.js';
import { listPurchaseOrdersByProject } from '../controllers/purchaseOrdersController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', listProjects);
router.post('/', createProject);
router.get('/:id', getProjectById);
router.get('/:id/purchase-orders', listPurchaseOrdersByProject);

export default router;
