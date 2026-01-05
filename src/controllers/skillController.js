const db = require("../models");
const { Op } = require("sequelize");

const isAdmin = (req) => req.user && req.user.role === "admin";

exports.list = async (req, res, next) => {
  try {
    const { q, limit = 50, offset = 0 } = req.query || {};
    const where = q
      ? { name: { [Op.iLike]: `%${String(q).trim().toLowerCase()}%` } }
      : undefined;
    const items = await db.Skill.findAll({
      where,
      limit: Number(limit),
      offset: Number(offset),
      order: [["name", "ASC"]],
    });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};

exports.search = async (req, res, next) => {
  try {
    const { q = "", limit = 10 } = req.query || {};
    const items = await db.Skill.findAll({
      where: { name: { [Op.iLike]: `%${String(q).trim().toLowerCase()}%` } },
      limit: Number(limit),
      order: [["name", "ASC"]],
    });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ success: false, message: "Admin only" });
    }
    const name = String(req.body?.name || "")
      .trim()
      .toLowerCase();
    if (!name)
      return res
        .status(400)
        .json({ success: false, message: "name is required" });
    const [skill, created] = await db.Skill.findOrCreate({
      where: { name },
      defaults: { name },
    });
    res.status(created ? 201 : 200).json({ success: true, data: skill });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ success: false, message: "Admin only" });
    }
    const item = await db.Skill.findByPk(req.params.id);
    if (!item)
      return res.status(404).json({ success: false, message: "Not found" });
    const name = req.body?.name
      ? String(req.body.name).trim().toLowerCase()
      : null;
    if (!name)
      return res
        .status(400)
        .json({ success: false, message: "name is required" });
    await item.update({ name });
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ success: false, message: "Admin only" });
    }
    const item = await db.Skill.findByPk(req.params.id);
    if (!item)
      return res.status(404).json({ success: false, message: "Not found" });
    await item.destroy();
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    next(err);
  }
};
