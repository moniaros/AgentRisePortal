import { query } from '../config/database.js';

export const getArticles = async (req, res, next) => {
  try {
    const { status = 'published', page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const articles = await query(
      `SELECT a.*, u.first_name, u.last_name
       FROM news_articles a
       LEFT JOIN users u ON a.author_id = u.id
       WHERE a.status = ?
       ORDER BY a.published_at DESC
       LIMIT ? OFFSET ?`,
      [status, parseInt(limit), offset]
    );

    res.status(200).json({ success: true, data: articles });
  } catch (error) {
    next(error);
  }
};

export const getArticleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const articles = await query('SELECT * FROM news_articles WHERE id = ?', [id]);
    if (articles.length === 0) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }
    res.status(200).json({ success: true, data: articles[0] });
  } catch (error) {
    next(error);
  }
};

export const createArticle = async (req, res, next) => {
  try {
    const { title, slug, excerpt, content, featuredImageUrl, tags, seoTitle, seoDescription, status } = req.body;
    const result = await query(
      `INSERT INTO news_articles (title, slug, excerpt, content, author_id, featured_image_url, tags, seo_title, seo_description, status, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [title, slug, excerpt, content, req.user.id, featuredImageUrl, JSON.stringify(tags), seoTitle, seoDescription, status || 'draft']
    );
    res.status(201).json({ success: true, message: 'Article created', data: { id: result.insertId } });
  } catch (error) {
    next(error);
  }
};

export const updateArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowedFields = ['title', 'slug', 'excerpt', 'content', 'featuredImageUrl', 'tags', 'seoTitle', 'seoDescription', 'status'];
    const updates = [];
    const values = [];

    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        updates.push(`${dbField} = ?`);
        values.push(key === 'tags' ? JSON.stringify(req.body[key]) : req.body[key]);
      }
    });

    if (updates.length > 0) {
      values.push(id);
      await query(`UPDATE news_articles SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    res.status(200).json({ success: true, message: 'Article updated' });
  } catch (error) {
    next(error);
  }
};

export const deleteArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM news_articles WHERE id = ?', [id]);
    res.status(200).json({ success: true, message: 'Article deleted' });
  } catch (error) {
    next(error);
  }
};
