import { Router } from 'express';
import { deleteItem, updateItem } from '../controllers/itemsController.js';

const router = Router();

router.patch('/:id', updateItem);
router.delete('/:id', deleteItem);

export default router;
