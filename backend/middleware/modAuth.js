import { User } from '../models/users.js';

const modAuth = {
  // Verify if the user is an admin/moderator
  verifyModerator: async (req, res, next) => {
    try {
      // Check if req.user exists (set by userAuth middleware)
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Get user from database to check admin status
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if user is an admin
      if (!user.is_admin) {
        return res.status(403).json({ message: 'Access denied: Admin privileges required' });
      }

      // If user is admin, continue to the next middleware or route handler
      next();
    } catch (error) {
      console.error('Moderator auth middleware error:', error);
      res.status(500).json({ message: 'Server error during authorization' });
    }
  }
};

export default modAuth;