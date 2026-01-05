const db = require('../models');

exports.getAll = async (req, res, next) => {
  try {
    const items = await db.Question.findAll();
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const item = await db.Question.findByPk(req.params.id, { include: ['options'] });
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const created = await db.Question.create(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const item = await db.Question.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    await item.update(req.body);
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const item = await db.Question.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    await item.destroy();
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
};
