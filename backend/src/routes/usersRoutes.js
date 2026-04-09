import { Router } from 'express';
import { createUser, getUserById, listUsers } from '../controllers/usersController.js';
import { listProjectsByUser } from '../controllers/projectsController.js';

const router = Router();

router.get('/', listUsers);
router.post('/', createUser);
router.get('/:id', getUserById);
router.get('/:id/projects', listProjectsByUser);

export default router;
