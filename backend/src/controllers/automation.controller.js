import { query } from '../config/database.js';

export const getRules = async (req, res, next) => {
  try {
    const rules = await query('SELECT * FROM automation_rules ORDER BY created_at DESC');
    res.status(200).json({ success: true, data: rules });
  } catch (error) {
    next(error);
  }
};

export const createRule = async (req, res, next) => {
  try {
    const { name, description, triggerType, conditions, actions } = req.body;
    const result = await query(
      'INSERT INTO automation_rules (name, description, trigger_type, created_by_user_id) VALUES (?, ?, ?, ?)',
      [name, description, triggerType, req.user.id]
    );

    const ruleId = result.insertId;

    // Add conditions
    if (conditions && Array.isArray(conditions)) {
      for (let i = 0; i < conditions.length; i++) {
        await query(
          'INSERT INTO automation_rule_conditions (rule_id, field_name, operator, value, condition_order) VALUES (?, ?, ?, ?, ?)',
          [ruleId, conditions[i].field, conditions[i].operator, conditions[i].value, i]
        );
      }
    }

    // Add actions
    if (actions && Array.isArray(actions)) {
      for (let i = 0; i < actions.length; i++) {
        await query(
          'INSERT INTO automation_rule_actions (rule_id, action_type, action_config, action_order) VALUES (?, ?, ?, ?)',
          [ruleId, actions[i].type, JSON.stringify(actions[i].config), i]
        );
      }
    }

    res.status(201).json({ success: true, message: 'Automation rule created', data: { id: ruleId } });
  } catch (error) {
    next(error);
  }
};

export const updateRule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;
    const updates = [];
    const values = [];

    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (isActive !== undefined) { updates.push('is_active = ?'); values.push(isActive); }

    if (updates.length > 0) {
      values.push(id);
      await query(`UPDATE automation_rules SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    res.status(200).json({ success: true, message: 'Automation rule updated' });
  } catch (error) {
    next(error);
  }
};

export const deleteRule = async (req, res, next) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM automation_rules WHERE id = ?', [id]);
    res.status(200).json({ success: true, message: 'Automation rule deleted' });
  } catch (error) {
    next(error);
  }
};
