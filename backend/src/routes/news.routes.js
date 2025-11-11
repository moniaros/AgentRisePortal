import express from 'express';
import { getArticles, getArticleById, createArticle, updateArticle, deleteArticle } from '../controllers/news.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getArticles); // Public
router.get('/:id', getArticleById); // Public

router.use(authenticate); // Require auth for write operations
router.post('/', createArticle);
router.put('/:id', updateArticle);
router.delete('/:id', deleteArticle);

export default router;
