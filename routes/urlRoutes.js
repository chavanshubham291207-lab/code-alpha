import express from 'express';
import { shortenUrl, redirectUrl, getUrlStats } from '../controllers/urlController.js';

const router = express.Router();

// Route to shorten a URL
router.post('/shorten', shortenUrl);

// Route to get statistics for a URL (order matters, place this before /:code so it does not capture 'stats' as a code)
router.get('/stats/:code', getUrlStats);

// Route to redirect to original URL
router.get('/:code', redirectUrl);

export default router;
