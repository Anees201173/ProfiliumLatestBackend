const db = require('../models');

// Public: list active pricing plans
exports.listPublicPlans = async (req, res, next) => {
  try {
    const plans = await db.PricingPlan.findAll({
      where: { isActive: true },
      order: [['priceMonthly', 'ASC']],
    });
    res.json({ success: true, data: plans });
  } catch (err) {
    next(err);
  }
};

// Admin: list all plans
exports.listAllPlans = async (req, res, next) => {
  try {
    const plans = await db.PricingPlan.findAll({
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: plans });
  } catch (err) {
    next(err);
  }
};

// Admin: create plan
exports.createPlan = async (req, res, next) => {
  try {
    const plan = await db.PricingPlan.create(req.body);
    res.status(201).json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
};

// Admin: update plan
exports.updatePlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const plan = await db.PricingPlan.findByPk(id);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

    await plan.update(req.body);
    res.json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
};

// Admin: delete plan
exports.deletePlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const plan = await db.PricingPlan.findByPk(id);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

    await plan.destroy();
    res.json({ success: true, message: 'Plan deleted' });
  } catch (err) {
    next(err);
  }
};
