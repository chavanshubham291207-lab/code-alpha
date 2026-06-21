import { nanoid } from 'nanoid';
import Url from '../models/Url.js';

/**
 * Helper to validate URL structure
 */
const isValidUrl = (string) => {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

/**
 * Create a shortened URL
 * POST /shorten
 */
export const shortenUrl = async (req, res, next) => {
  try {
    const { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ error: 'originalUrl is required' });
    }

    if (!isValidUrl(originalUrl)) {
      return res.status(400).json({ error: 'Invalid URL format. URL must start with http:// or https://' });
    }

    // Check if the URL has already been shortened to reuse it
    let urlDoc = await Url.findOne({ originalUrl });
    
    if (urlDoc) {
      const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
      return res.status(200).json({
        originalUrl: urlDoc.originalUrl,
        shortCode: urlDoc.shortCode,
        shortUrl: `${baseUrl}/${urlDoc.shortCode}`,
        clicks: urlDoc.clicks,
        createdAt: urlDoc.createdAt,
        message: 'Existing shortened URL retrieved'
      });
    }

    // Generate unique short code
    // Check for collisions (rare for 8 characters of nanoid, but good practice)
    let shortCode;
    let codeExists = true;
    while (codeExists) {
      shortCode = nanoid(8);
      const existing = await Url.findOne({ shortCode });
      if (!existing) {
        codeExists = false;
      }
    }

    // Save to database
    urlDoc = new Url({
      originalUrl,
      shortCode
    });
    await urlDoc.save();

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

    return res.status(201).json({
      originalUrl: urlDoc.originalUrl,
      shortCode: urlDoc.shortCode,
      shortUrl: `${baseUrl}/${urlDoc.shortCode}`,
      clicks: urlDoc.clicks,
      createdAt: urlDoc.createdAt
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Redirect to original URL from short code
 * GET /:code
 */
export const redirectUrl = async (req, res, next) => {
  try {
    const { code } = req.params;

    // Atomically increment click count and retrieve the document
    const urlDoc = await Url.findOneAndUpdate(
      { shortCode: code },
      { $inc: { clicks: 1 } },
      { new: true }
    );

    if (!urlDoc) {
      return res.status(404).json({ error: 'Shortened URL not found' });
    }

    // Redirect to original URL
    return res.redirect(urlDoc.originalUrl);
  } catch (error) {
    next(error);
  }
};

/**
 * Get statistics for a shortened URL
 * GET /stats/:code
 */
export const getUrlStats = async (req, res, next) => {
  try {
    const { code } = req.params;

    const urlDoc = await Url.findOne({ shortCode: code });

    if (!urlDoc) {
      return res.status(404).json({ error: 'Shortened URL not found' });
    }

    return res.status(200).json({
      originalUrl: urlDoc.originalUrl,
      shortCode: urlDoc.shortCode,
      clicks: urlDoc.clicks,
      createdAt: urlDoc.createdAt
    });
  } catch (error) {
    next(error);
  }
};
