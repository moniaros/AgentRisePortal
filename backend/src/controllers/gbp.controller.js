import { query } from '../config/database.js';

export const getLocations = async (req, res, next) => {
  try {
    const locations = await query('SELECT * FROM gbp_locations');
    res.status(200).json({ success: true, data: locations });
  } catch (error) {
    next(error);
  }
};

export const getReviews = async (req, res, next) => {
  try {
    const { locationId } = req.params;
    const reviews = await query(
      'SELECT * FROM gbp_reviews WHERE location_id = ? ORDER BY review_date DESC',
      [locationId]
    );
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

export const replyToReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { reply } = req.body;

    await query(
      'UPDATE gbp_reviews SET review_reply = ?, replied_at = NOW() WHERE id = ?',
      [reply, reviewId]
    );

    res.status(200).json({ success: true, message: 'Reply posted successfully' });
  } catch (error) {
    next(error);
  }
};
