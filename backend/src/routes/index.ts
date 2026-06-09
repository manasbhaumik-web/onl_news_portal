import express from 'express';
import * as authController from '../controllers/auth.controller';
import * as articlesController from '../controllers/articles.controller';
import * as categoriesController from '../controllers/categories.controller';
import * as searchController from '../controllers/search.controller';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

// Auth
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);

// Articles
router.get('/articles', articlesController.listArticles);
router.get('/articles/slug/:slug', articlesController.getArticleBySlug);
router.post('/articles', requireAuth, articlesController.createArticle);
router.post('/articles/:id/view', articlesController.trackView);

// Categories
router.get('/categories', categoriesController.listCategories);
router.get('/categories/slug/:slug', categoriesController.getCategoryBySlug);

// Search
router.get('/search', searchController.searchArticles);
router.get('/search/suggestions', searchController.getSuggestions);

export default router;
