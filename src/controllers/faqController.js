const db = require('../models');

// Public: list active FAQs grouped by category
exports.listPublicFaqs = async (req, res, next) => {
  try {
    const faqs = await db.Faq.findAll({
      where: { isActive: true },
      order: [['category', 'ASC'], ['order', 'ASC']],
    });

    // Group by category
    const grouped = faqs.reduce((acc, faq) => {
      if (!acc[faq.category]) {
        acc[faq.category] = [];
      }
      acc[faq.category].push({
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
      });
      return acc;
    }, {});

    res.json({ success: true, data: grouped });
  } catch (err) {
    next(err);
  }
};

// Admin: list all FAQs
exports.listAllFaqs = async (req, res, next) => {
  try {
    const faqs = await db.Faq.findAll({
      order: [['category', 'ASC'], ['order', 'ASC']],
    });
    res.json({ success: true, data: faqs });
  } catch (err) {
    next(err);
  }
};

// Admin: create FAQ
exports.createFaq = async (req, res, next) => {
  try {
    const faq = await db.Faq.create(req.body);
    res.status(201).json({ success: true, data: faq });
  } catch (err) {
    next(err);
  }
};

// Admin: update FAQ
exports.updateFaq = async (req, res, next) => {
  try {
    const { id } = req.params;
    const faq = await db.Faq.findByPk(id);
    if (!faq) return res.status(404).json({ success: false, message: 'FAQ not found' });

    await faq.update(req.body);
    res.json({ success: true, data: faq });
  } catch (err) {
    next(err);
  }
};

// Admin: delete FAQ
exports.deleteFaq = async (req, res, next) => {
  try {
    const { id } = req.params;
    const faq = await db.Faq.findByPk(id);
    if (!faq) return res.status(404).json({ success: false, message: 'FAQ not found' });

    await faq.destroy();
    res.json({ success: true, message: 'FAQ deleted' });
  } catch (err) {
    next(err);
  }
};
