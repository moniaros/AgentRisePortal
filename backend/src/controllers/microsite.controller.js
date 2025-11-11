import { query } from '../config/database.js';

export const getMicrosites = async (req, res, next) => {
  try {
    const microsites = await query('SELECT * FROM microsites ORDER BY created_at DESC');
    res.status(200).json({ success: true, data: microsites });
  } catch (error) {
    next(error);
  }
};

export const getMicrositeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const microsites = await query('SELECT * FROM microsites WHERE id = ?', [id]);
    if (microsites.length === 0) {
      return res.status(404).json({ success: false, message: 'Microsite not found' });
    }

    const blocks = await query('SELECT * FROM microsite_blocks WHERE microsite_id = ? ORDER BY block_order', [id]);
    res.status(200).json({ success: true, data: { ...microsites[0], blocks } });
  } catch (error) {
    next(error);
  }
};

export const createMicrosite = async (req, res, next) => {
  try {
    const { siteName, subdomain, customerId, themeConfig, seoConfig } = req.body;
    const result = await query(
      'INSERT INTO microsites (site_name, subdomain, customer_id, theme_config, seo_config, created_by_user_id) VALUES (?, ?, ?, ?, ?, ?)',
      [siteName, subdomain, customerId, JSON.stringify(themeConfig), JSON.stringify(seoConfig), req.user.id]
    );
    res.status(201).json({ success: true, message: 'Microsite created', data: { id: result.insertId } });
  } catch (error) {
    next(error);
  }
};

export const updateMicrosite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { siteName, themeConfig, seoConfig, isPublished, blocks } = req.body;
    const updates = [];
    const values = [];

    if (siteName) { updates.push('site_name = ?'); values.push(siteName); }
    if (themeConfig) { updates.push('theme_config = ?'); values.push(JSON.stringify(themeConfig)); }
    if (seoConfig) { updates.push('seo_config = ?'); values.push(JSON.stringify(seoConfig)); }
    if (isPublished !== undefined) { updates.push('is_published = ?'); values.push(isPublished); }

    if (updates.length > 0) {
      values.push(id);
      await query(`UPDATE microsites SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    // Update blocks if provided
    if (blocks && Array.isArray(blocks)) {
      await query('DELETE FROM microsite_blocks WHERE microsite_id = ?', [id]);
      for (let i = 0; i < blocks.length; i++) {
        await query(
          'INSERT INTO microsite_blocks (microsite_id, block_type, block_order, content) VALUES (?, ?, ?, ?)',
          [id, blocks[i].type, i, JSON.stringify(blocks[i].content)]
        );
      }
    }

    res.status(200).json({ success: true, message: 'Microsite updated' });
  } catch (error) {
    next(error);
  }
};

export const deleteMicrosite = async (req, res, next) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM microsites WHERE id = ?', [id]);
    res.status(200).json({ success: true, message: 'Microsite deleted' });
  } catch (error) {
    next(error);
  }
};
