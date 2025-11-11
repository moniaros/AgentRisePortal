import express from 'express';
import { getCampaigns, getCampaignById, createCampaign, updateCampaign, deleteCampaign } from '../controllers/campaign.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

router.get('/', getCampaigns);
router.get('/:id', getCampaignById);
router.post('/', createCampaign);
router.put('/:id', updateCampaign);
router.delete('/:id', deleteCampaign);

export default router;
