const db = require('../models');

// submit one or more answers for a candidateTest
exports.submit = async (req, res, next) => {
  try {
    const { candidateTestId, answers } = req.body; // answers = [{ questionId, optionId, answer }, ...]
    if (!candidateTestId || !Array.isArray(answers)) return res.status(400).json({ success: false, message: 'Invalid payload' });

    const created = [];
    for (const a of answers) {
      const rec = await db.CandidateAnswer.create({ candidateTestId, questionId: a.questionId, optionId: a.optionId, answer: a.answer });
      created.push(rec);
    }

    // mark candidate test as completed
    await db.CandidateTest.update({ status: 'completed', completedAt: new Date() }, { where: { id: candidateTestId } });

    res.status(201).json({ success: true, data: created });
  } catch (err) { next(err); }
};

exports.getByCandidateTest = async (req, res, next) => {
  try {
    const items = await db.CandidateAnswer.findAll({ where: { candidateTestId: req.params.candidateTestId } });
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
};
