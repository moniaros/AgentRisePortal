import { query } from '../config/database.js';

export const getTestimonials = async (req, res, next) => {
  try {
    const { status = 'approved' } = req.query;
    const testimonials = await query(
      'SELECT * FROM testimonials WHERE status = ? ORDER BY created_at DESC',
      [status]
    );
    res.status(200).json({ success: true, data: testimonials });
  } catch (error) {
    next(error);
  }
};

export const createTestimonial = async (req, res, next) => {
  try {
    const { customerId, customerName, customerTitle, testimonialText, rating, photoUrl } = req.body;
    const result = await query(
      'INSERT INTO testimonials (customer_id, customer_name, customer_title, testimonial_text, rating, photo_url, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [customerId, customerName, customerTitle, testimonialText, rating, photoUrl, 'pending']
    );
    res.status(201).json({ success: true, message: 'Testimonial submitted', data: { id: result.insertId } });
  } catch (error) {
    next(error);
  }
};

export const updateTestimonialStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await query('UPDATE testimonials SET status = ? WHERE id = ?', [status, id]);
    res.status(200).json({ success: true, message: 'Testimonial status updated' });
  } catch (error) {
    next(error);
  }
};

export const deleteTestimonial = async (req, res, next) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM testimonials WHERE id = ?', [id]);
    res.status(200).json({ success: true, message: 'Testimonial deleted' });
  } catch (error) {
    next(error);
  }
};
