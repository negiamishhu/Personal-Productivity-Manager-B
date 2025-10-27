const Expense = require('../models/Expense');

// Create a new expense entry
exports.createExpense = async (req, res) => {
  try {
    const { title, amount, type, category, paymentMethod, date, description } = req.body;
    if (!title || !amount || !type || !category || !paymentMethod || !date) {
      return res.status(400).json({ message: 'All required fields must be provided.' });
    }
    const expense = new Expense({
      title,
      amount,
      type,
      category,
      paymentMethod,
      date,
      description,
      userId: req.user.id,
    });
    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// List expenses with filters, pagination, sorting
exports.listExpenses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      category,
      paymentMethod,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      q,
      sort = 'date',      
      order = 'desc' 
    } = req.query;
    
    const query = { userId: req.user.id };
    if (type) query.type = type;
    if (category) query.category = category;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = Number(minAmount);
      if (maxAmount) query.amount.$lte = Number(maxAmount);
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
      .sort({ [sortBy]: sortOrder })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));
    const total = await Expense.countDocuments(query);
    res.json({
      expenses,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single expense by ID (owner or admin)
exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    if (
      expense.userId.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(expense);
  } catch {
    res.status(400).json({ message: 'Invalid expense ID' });
  }
};

// Update an expense (only owner)
exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    if (expense.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const updates = (({ title, amount, type, category, paymentMethod, date, description }) => ({ title, amount, type, category, paymentMethod, date, description }))(req.body);
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) expense[key] = value;
    });
    await expense.save();
    res.json(expense);
  } catch {
    res.status(400).json({ message: 'Invalid request' });
  }
};

// Delete an expense (only owner)
exports.deleteExpense = async (req, res) => {
  try {
    console.log('Delete expense request for ID:', req.params.id, 'by user:', req.user.id);
    
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      console.log('Expense not found:', req.params.id);
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    if (expense.userId.toString() !== req.user.id) {
      console.log('Unauthorized delete attempt. Expense owner:', expense.userId.toString(), 'Requesting user:', req.user.id);
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await Expense.findByIdAndDelete(req.params.id);
    console.log('Expense deleted successfully:', req.params.id);
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Summary endpoint: total income, total expense, net balance
exports.getExpensesSummary = async (req, res) => {
  try {
    const summary = await Expense.aggregate([
      { $match: { userId: (typeof req.user.id === 'string') ? require('mongoose').Types.ObjectId(req.user.id) : req.user.id } },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0]
            }
          },
          totalExpense: {
            $sum: {
              $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0]
            }
          },
        }
      },
      {
        $project: {
          _id: 0,
          totalIncome: 1,
          totalExpense: 1,
          netBalance: { $subtract: ["$totalIncome", "$totalExpense"] },
        }
      }
    ]);
    res.json(summary[0] || { totalIncome: 0, totalExpense: 0, netBalance: 0 });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};
