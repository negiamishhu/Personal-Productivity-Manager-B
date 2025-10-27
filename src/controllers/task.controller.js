const Task = require('../models/Task');

// Create a new task for the user
exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate, status, priority, category } = req.body;
    if (!title || !dueDate || !category) {
      return res.status(400).json({ message: 'Title, dueDate, and category are required.' });
    }
    const task = new Task({
      title,
      description,
      dueDate,
      status,
      priority,
      category,
      userId: req.user.id,
    });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// List tasks with filters, pagination, and sorting
exports.listTasks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      startDue,
      endDue,
      q,
      sort = 'dueDate',
      order = 'asc'
    } = req.query;
    const query = { userId: req.user.id };
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
    const sortOrder = order === 'desc' ? -1 : 1;
    const tasks = await Task.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));
    const total = await Task.countDocuments(query);
    res.json({ tasks, page: parseInt(page), totalPages: Math.ceil(total / limit), total });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single task by ID (owner or admin)
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (
      task.userId.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(task);
  } catch {
    res.status(400).json({ message: 'Invalid task ID' });
  }
};

// Update a task (only owner)
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const updates = (({ title, description, dueDate, status, priority, category }) => ({ title, description, dueDate, status, priority, category }))(req.body);
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) task[key] = value;
    });
    await task.save();
    res.json(task);
  } catch {
    res.status(400).json({ message: 'Invalid request' });
  }
};

// Delete a task (only owner)
exports.deleteTask = async (req, res) => {
  try {
    console.log('Delete task request for ID:', req.params.id, 'by user:', req.user.id);
    
    const task = await Task.findById(req.params.id);
    if (!task) {
      console.log('Task not found:', req.params.id);
      return res.status(404).json({ message: 'Task not found' });
    }
    
    if (task.userId.toString() !== req.user.id) {
      console.log('Unauthorized delete attempt. Task owner:', task.userId.toString(), 'Requesting user:', req.user.id);
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await Task.findByIdAndDelete(req.params.id);
    console.log('Task deleted successfully:', req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Summary: total, completed, pending (for user)
exports.getTasksSummary = async (req, res) => {
  try {
    const summary = await Task.aggregate([
      { $match: { userId: (typeof req.user.id === 'string') ? require('mongoose').Types.ObjectId(req.user.id) : req.user.id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          },
          pending: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          total: 1,
          completed: 1,
          pending: 1,
        }
      }
    ]);
    res.json(summary[0] || { total: 0, completed: 0, pending: 0 });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};
