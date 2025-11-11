import { query } from '../config/database.js';

export const getUsers = async (req, res, next) => {
  try {
    const users = await query(
      'SELECT id, email, first_name, last_name, role, phone, license_number, license_state, license_expiry, is_active, created_at FROM users ORDER BY created_at DESC'
    );

    res.status(200).json({
      success: true,
      data: users.map(u => ({
        id: u.id,
        email: u.email,
        firstName: u.first_name,
        lastName: u.last_name,
        role: u.role,
        phone: u.phone,
        licenseNumber: u.license_number,
        licenseState: u.license_state,
        licenseExpiry: u.license_expiry,
        isActive: Boolean(u.is_active),
        createdAt: u.created_at
      }))
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const users = await query(
      'SELECT id, email, first_name, last_name, role, phone, avatar_url, license_number, license_state, license_expiry, is_active, created_at FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: users[0] });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = [];
    const values = [];

    const allowedFields = {
      firstName: 'first_name',
      lastName: 'last_name',
      role: 'role',
      phone: 'phone',
      isActive: 'is_active',
      licenseNumber: 'license_number',
      licenseState: 'license_state',
      licenseExpiry: 'license_expiry'
    };

    Object.keys(req.body).forEach(key => {
      if (allowedFields[key]) {
        updates.push(`${allowedFields[key]} = ?`);
        values.push(req.body[key]);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }

    values.push(id);
    await query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

    res.status(200).json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    await query('DELETE FROM users WHERE id = ?', [id]);
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};
