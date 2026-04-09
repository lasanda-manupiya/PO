import { Router } from 'express';
import { createUser, getUserById, listUsers } from '../controllers/usersController.js';
import { listProjectsByUser } from '../controllers/projectsController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', listUsers);
router.post('/', createUser);
router.get('/:id', getUserById);
router.get('/:id/projects', listProjectsByUser);

export default router;
