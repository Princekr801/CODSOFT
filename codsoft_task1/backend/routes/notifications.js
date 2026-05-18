import express from 'express';
import { NotificationModel } from '../config/dbStore.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// @route   GET api/notifications
// @desc    Get all notifications for the logged-in user
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notifications = await NotificationModel.find({ userId: req.user.id });
    
    // Sort by latest first
    const sortedNotifications = notifications.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    res.json(sortedNotifications);
  } catch (err) {
    console.error('Fetch notifications error: ', err.message);
    res.status(500).send('Server Error fetching notifications');
  }
});

export default router;
