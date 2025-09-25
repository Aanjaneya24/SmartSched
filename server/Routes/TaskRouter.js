const router = require('express').Router();
const auth = require('../Middlewares/auth');
const TaskController = require('../Controllers/TaskController');

router.post('/', auth, TaskController.createTask);
router.get('/', auth, TaskController.getTasks);
router.put('/:id', auth, TaskController.updateTask);
router.delete('/:id', auth, TaskController.deleteTask);
router.get('/progress', auth, TaskController.getProgress);
router.get('/streak', auth, TaskController.getStreak);
router.get('/category-progress', auth, TaskController.getCategoryProgress);

module.exports = router;