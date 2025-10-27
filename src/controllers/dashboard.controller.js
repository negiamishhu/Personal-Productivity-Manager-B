const Expense = require('../models/Expense');
const Task = require('../models/Task');
const mongoose = require('mongoose');

exports.getDashboardSummary = async (req, res) => {
  try {
    console.log('Dashboard summary request for user:', req.user.id);
    
    const [expenseSummary] = await Expense.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: { $cond: [{$eq: ['$type', 'income']}, '$amount', 0] }
          },
          totalExpense: {
            $sum: { $cond: [{$eq: ['$type', 'expense']}, '$amount', 0] }
          },
        }
      }
    ]);
    
    const [taskSummary] = await Task.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{$eq: ['$status', 'completed']}, 1, 0] } },
          pending: { $sum: { $cond: [{$eq: ['$status', 'pending']}, 1, 0] } },
        }
      }
    ]);
    
    const result = {
      totalIncome: expenseSummary?.totalIncome || 0,
      totalExpense: expenseSummary?.totalExpense || 0,
      netBalance: (expenseSummary?.totalIncome || 0) - (expenseSummary?.totalExpense || 0),
      totalTasks: taskSummary?.total || 0,
      completedTasks: taskSummary?.completed || 0,
      pendingTasks: taskSummary?.pending || 0,
    };
    
    console.log('Dashboard summary result:', result);
    res.json(result);
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getExpensesByCategory = async (req, res) => {
  try {
    console.log('Expenses by category request for user:', req.user.id);
    
    const data = await Expense.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $group: {
          _id: '$category',
          value: { $sum: '$amount' }
        }
      },
      {
        $project: {
          name: '$_id',
          value: 1,
          color: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id', 'Food'] }, then: '#3B82F6' },
                { case: { $eq: ['$_id', 'Bills'] }, then: '#EF4444' },
                { case: { $eq: ['$_id', 'Travel'] }, then: '#10B981' },
                { case: { $eq: ['$_id', 'Shopping'] }, then: '#F59E0B' },
                { case: { $eq: ['$_id', 'Entertainment'] }, then: '#8B5CF6' },
                { case: { $eq: ['$_id', 'Salary'] }, then: '#10B981' },
                { case: { $eq: ['$_id', 'Freelance'] }, then: '#3B82F6' }
              ],
              default: '#6B7280'
            }
          }
        }
      }
    ]);
    
    console.log('Expenses by category result:', data);
    res.json(data);
  } catch (error) {
    console.error('Expenses by category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTasksByStatus = async (req, res) => {
  try {
    console.log('Tasks by status request for user:', req.user.id);
    
    const data = await Task.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $group: {
          _id: '$status',
          value: { $sum: 1 }
        }
      },
      {
        $project: {
          name: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id', 'completed'] }, then: 'Completed' },
                { case: { $eq: ['$_id', 'in-progress'] }, then: 'In Progress' },
                { case: { $eq: ['$_id', 'pending'] }, then: 'Pending' }
              ],
              default: '$_id'
            }
          },
          value: 1,
          color: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id', 'completed'] }, then: '#10B981' },
                { case: { $eq: ['$_id', 'in-progress'] }, then: '#F59E0B' },
                { case: { $eq: ['$_id', 'pending'] }, then: '#EF4444' }
              ],
              default: '#6B7280'
            }
          }
        }
      }
    ]);
    
    console.log('Tasks by status result:', data);
    res.json(data);
  } catch (error) {
    console.error('Tasks by status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    console.log('Recent activity request for user:', req.user.id);
    
    const recentExpenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 }).limit(2);
    const recentTasks = await Task.find({ userId: req.user.id }).sort({ dueDate: -1 }).limit(1);
    
    const result = {
      expenses: recentExpenses,
      tasks: recentTasks
    };
    
    console.log('Recent activity result:', result);
    res.json(result);
  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
