const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Admin dashboard summary
router.get('/summary', auth, role('admin'), adminController.getAdminDashboardSummary);

// Get all users
router.get('/users', auth, role('admin'), adminController.getAllUsers);

// Get all expenses from all users
router.get('/expenses', auth, role('admin'), adminController.getAllExpenses);

// Get all tasks from all users
router.get('/tasks', auth, role('admin'), adminController.getAllTasks);

module.exports = router;
