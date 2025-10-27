const User = require('../models/User');
const Expense = require('../models/Expense');
const Task = require('../models/Task');

exports.getAllUsers = async (req, res) => {
  try {
    console.log('Admin getUsers request for user:', req.user.id, 'role:', req.user.role);
    
    const users = await User.find({}, 'name email role createdAt');
    console.log('Found users:', users.length);
    
    
    const usersWithStats = await Promise.all(users.map(async user => {
      const [totalExpenses, totalTasks] = await Promise.all([
        Expense.countDocuments({ userId: user._id }),
        Task.countDocuments({ userId: user._id })
      ]);
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        totalExpenses,
        totalTasks,
      };
    }));
    
    console.log('Users with stats:', usersWithStats);
    res.json(usersWithStats);
  } catch (err) {
    console.error('Admin getUsers error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all expenses from all users (admin only)
exports.getAllExpenses = async (req, res) => {
  try {
    console.log('Admin getAllExpenses request for user:', req.user.id, 'role:', req.user.role);
    
    const {
      page = 1,
      limit = 10,
      userId,
      type,
      category,
      startDate,
      endDate,
      q,
      sort = 'date',
      order = 'desc',
      regularUsersOnly = 'false'  
    } = req.query;
    
    const query = {};
     
    if (regularUsersOnly === 'true') {
      const regularUsers = await User.find({ role: 'user' }, '_id');
      const regularUserIds = regularUsers.map(user => user._id);
      query.userId = { $in: regularUserIds };
    }
    
    if (userId) query.userId = userId;
    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }
    
    const sortBy = sort === 'amount' ? 'amount' : 'date';
    const sortOrder = order === 'asc' ? 1 : -1;
    
    const expenses = await Expense.find(query)
      .populate('userId', 'name email')
      .sort({ [sortBy]: sortOrder })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));
    
    const total = await Expense.countDocuments(query);
    
    console.log('Admin expenses result:', expenses.length, 'total:', total);
    res.json({ 
      expenses, 
      page: parseInt(page), 
      totalPages: Math.ceil(total / limit), 
      total 
    });
  } catch (error) {
    console.error('Admin getAllExpenses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all tasks from all users (admin only)
exports.getAllTasks = async (req, res) => {
  try {
    console.log('Admin getAllTasks request for user:', req.user.id, 'role:', req.user.role);
    
    const {
      page = 1,
      limit = 10,
      userId,
      status,
      priority,
      startDue,
      endDue,
      q,
      sort = 'dueDate',
      order = 'desc',
      regularUsersOnly = 'false'  
    } = req.query;
    
    const query = {};
     
    if (regularUsersOnly === 'true') {
      const regularUsers = await User.find({ role: 'user' }, '_id');
      const regularUserIds = regularUsers.map(user => user._id);
      query.userId = { $in: regularUserIds };
    }
    
    if (userId) query.userId = userId;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (startDue || endDue) {
      query.dueDate = {};
      if (startDue) query.dueDate.$gte = new Date(startDue);
      if (endDue) query.dueDate.$lte = new Date(endDue);
    }
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }
    
    const sortBy = sort === 'priority' ? 'priority' : 'dueDate';
    const sortOrder = order === 'asc' ? 1 : -1;
    
    const tasks = await Task.find(query)
      .populate('userId', 'name email')
      .sort({ [sortBy]: sortOrder })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));
    
    const total = await Task.countDocuments(query);
    
    console.log('Admin tasks result:', tasks.length, 'total:', total);
    res.json({ 
      tasks, 
      page: parseInt(page), 
      totalPages: Math.ceil(total / limit), 
      total 
    });
  } catch (error) {
    console.error('Admin getAllTasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get admin dashboard summary 
exports.getAdminDashboardSummary = async (req, res) => {
  try {
    console.log('Admin dashboard summary request for user:', req.user.id, 'role:', req.user.role);
    
    
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: 'admin' });
     
    const [expenseSummary] = await Expense.aggregate([
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
    
    // Get task summary across ALL users (including admin)
    const [taskSummary] = await Task.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{$eq: ['$status', 'completed']}, 1, 0] } },
          pending: { $sum: { $cond: [{$eq: ['$status', 'pending']}, 1, 0] } },
          inProgress: { $sum: { $cond: [{$eq: ['$status', 'in-progress']}, 1, 0] } },
        }
      }
    ]);
    
    const result = {
      totalUsers,
      adminUsers,
      regularUsers: totalUsers - adminUsers,
      totalIncome: expenseSummary?.totalIncome || 0,
      totalExpense: expenseSummary?.totalExpense || 0,
      netBalance: (expenseSummary?.totalIncome || 0) - (expenseSummary?.totalExpense || 0),
      totalTasks: taskSummary?.total || 0,
      completedTasks: taskSummary?.completed || 0,
      pendingTasks: taskSummary?.pending || 0,
      inProgressTasks: taskSummary?.inProgress || 0,
    };
    
    console.log('Admin dashboard summary result:', result);
    res.json(result);
  } catch (error) {
    console.error('Admin dashboard summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
