import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { followUnfollowUser, getUserProfile, setSuggestedUsers, updatedUser } from '../controllers/user.controller.js';

const router = express.Router();

router.get('/profile/:username', protectRoute , getUserProfile);
router.get('/suggested', protectRoute , setSuggestedUsers);
router.post('/follow/:id', protectRoute , followUnfollowUser);
router.post('/updated', protectRoute , updatedUser);

export default router;