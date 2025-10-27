const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const auth = require('../middleware/auth');

// Create a new task
router.post('/', auth, taskController.createTask);

// Task routes
router.get('/', auth, taskController.listTasks);
router.get('/summary', auth, taskController.getTasksSummary);
router.get('/:id', auth, taskController.getTaskById);
router.put('/:id', auth, taskController.updateTask);
router.delete('/:id', auth, taskController.deleteTask);

module.exports = router;
