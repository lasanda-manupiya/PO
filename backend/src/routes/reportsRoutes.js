import { Router } from 'express';
import { summaryReport } from '../controllers/reportsController.js';

const router = Router();

router.get('/summary', summaryReport);

export default router;
