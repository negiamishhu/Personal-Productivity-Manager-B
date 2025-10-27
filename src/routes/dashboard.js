const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const auth = require('../middleware/auth');

router.get('/summary', auth, dashboardController.getDashboardSummary);
router.get('/expenses-by-category', auth, dashboardController.getExpensesByCategory);
router.get('/tasks-by-status', auth, dashboardController.getTasksByStatus);
router.get('/recent-activity', auth, dashboardController.getRecentActivity);

module.exports = router;
