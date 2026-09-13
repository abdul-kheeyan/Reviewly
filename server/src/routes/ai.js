import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { triggerExplain, getExplanation } from '../controllers/explainerController.js';
import { triggerBugAnalysis, getBugReport } from '../controllers/bugController.js';
import { 
  triggerQualityScore, getQualityScore, 
  triggerSecurityScan, getSecurityScan, 
  triggerDependencyCheck, getDependencyCheck 
} from '../controllers/qualityController.js';

const router = Router();

router.post('/:repoId/explain', requireAuth, triggerExplain);
router.get('/:repoId/explain', requireAuth, getExplanation);

router.post('/:repoId/analyze-bugs', requireAuth, triggerBugAnalysis);
router.get('/:repoId/bugs', requireAuth, getBugReport);

router.post('/:repoId/quality-score', requireAuth, triggerQualityScore);
router.get('/:repoId/quality-score', requireAuth, getQualityScore);

router.post('/:repoId/security-scan', requireAuth, triggerSecurityScan);
router.get('/:repoId/security-scan', requireAuth, getSecurityScan);

router.post('/:repoId/dependencies', requireAuth, triggerDependencyCheck);
router.get('/:repoId/dependencies', requireAuth, getDependencyCheck);

export default router;

