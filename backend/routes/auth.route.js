import express from 'express';
import { auth, login, logout, signup } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/protectRoute.js';

const router = express.Router();
router.get('/check', protectRoute, auth);
router.post('/login', login );

router.post('/signup', signup );

router.post('/logout', logout);

export default router;