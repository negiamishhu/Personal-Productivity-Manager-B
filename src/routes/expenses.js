const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense.controller');
const auth = require('../middleware/auth');

// Create a new expense 
router.post('/', auth, expenseController.createExpense);

// List expenses 
router.get('/', auth, expenseController.listExpenses);

// Expense details  
router.get('/summary', auth, expenseController.getExpensesSummary);
router.get('/:id', auth, expenseController.getExpenseById);
router.put('/:id', auth, expenseController.updateExpense);
router.delete('/:id', auth, expenseController.deleteExpense);

module.exports = router;
