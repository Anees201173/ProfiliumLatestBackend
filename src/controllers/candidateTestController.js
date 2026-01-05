const db = require('../models');

// assign a test to a candidate
exports.assign = async (req, res, next) => {
  try {
    const { candidateId, testId, assignedBy } = req.body;
    const created = await db.CandidateTest.create({ candidateId, testId, assignedBy });
    res.status(201).json({ success: true, data: created });
  } catch (err) { next(err); }
};

exports.getByCandidate = async (req, res, next) => {
  try {
    const items = await db.CandidateTest.findAll({ where: { candidateId: req.params.candidateId }, include: ['test','answers'] });
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const item = await db.CandidateTest.findByPk(req.params.id, { include: ['test','answers'] });
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const item = await db.CandidateTest.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    await item.update({ status: req.body.status });
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
};
