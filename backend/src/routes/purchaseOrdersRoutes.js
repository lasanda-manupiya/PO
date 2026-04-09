import { Router } from 'express';
import {
  createPurchaseOrder,
  getPurchaseOrderById,
  listPurchaseOrders,
  updatePurchaseOrderStatus,
} from '../controllers/purchaseOrdersController.js';
import { createItem, listItemsByPurchaseOrder } from '../controllers/itemsController.js';
import { createApprovalLog, listApprovalsByPurchaseOrder } from '../controllers/approvalsController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', listPurchaseOrders);
router.post('/', createPurchaseOrder);
router.get('/:id', getPurchaseOrderById);
router.patch('/:id/status', updatePurchaseOrderStatus);

router.get('/:id/items', listItemsByPurchaseOrder);
router.post('/:id/items', createItem);

router.get('/:id/approvals', listApprovalsByPurchaseOrder);
router.post('/:id/approvals', createApprovalLog);

export default router;
