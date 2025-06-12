const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const authenticateToken = require('../middleware/auth');

// Save a favorite movie
router.post('/favorites', authMiddleware, async (req, res) => {
  const { movieId, title, posterPath, releaseDate } = req.body;

  try {
    const user = await User.findById(req.user.id);

    // Prevent duplicates
    if (user.favorites.some(fav => fav.movieId === movieId)) {
      return res.status(400).json({ msg: 'Movie already in favorites' });
    }

    user.favorites.push({ movieId, title, posterPath, releaseDate });
    await user.save();

    res.json(user.favorites);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});
// GET user favorites
router.get('/favorites', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// DELETE /api/user/favorites/:movieId
router.delete('/favorites/:movieId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Filter out the movie to be deleted
    user.favorites = user.favorites.filter(
      (movie) => movie.movieId !== req.params.movieId
    );

    await user.save();

    res.json(user.favorites);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});
router.post('/watchlist', authenticateToken, async (req, res) => {
  try {
    const { movieId, title, posterPath, releaseDate } = req.body;
    const user = await User.findById(req.user.id);

    const alreadyExists = user.watchlist.some((m) => m.movieId === movieId);
    if (alreadyExists) {
      return res.status(400).json({ msg: 'Movie already in watchlist' });
    }

    user.watchlist.push({ movieId, title, posterPath, releaseDate });
    await user.save();

    res.json(user.watchlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});
router.get('/watchlist', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.watchlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});
router.delete('/watchlist/:movieId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.watchlist = user.watchlist.filter(
      (movie) => movie.movieId !== req.params.movieId
    );

    await user.save();
    res.json(user.watchlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// GET user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// UPDATE user profile
router.put('/profile', authenticateToken, async (req, res) => {
  const { username, email } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (username) user.username = username;
    if (email) user.email = email;
    await user.save();
    res.json({ msg: 'Profile updated', user });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

const bcrypt = require('bcrypt');

// PUT /api/user/change-password
router.put('/change-password', authenticateToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword)
    return res.status(400).json({ msg: 'Both old and new password are required' });

  try {
    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: 'Old password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();
    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).send('Server error');
  }
});
router.post('/follow/:id', auth, async (req, res) => {
  const userId = req.user.id;
  const targetId = req.params.id;

  if (userId === targetId) return res.status(400).json({ message: "You can't follow yourself." });

  try {
    const user = await User.findById(userId);
    const target = await User.findById(targetId);

    if (!user || !target) return res.status(404).json({ message: 'User not found' });

    if (!user.following.includes(targetId)) {
      user.following.push(targetId);
      await user.save();
    }

    if (!target.followers.includes(userId)) {
      target.followers.push(userId);
      await target.save();
    }

    res.json({ message: 'Followed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Unfollow a user
router.post('/unfollow/:id', auth, async (req, res) => {
  const userId = req.user.id;
  const targetId = req.params.id;

  try {
    const user = await User.findById(userId);
    const target = await User.findById(targetId);

    user.following = user.following.filter(id => id.toString() !== targetId);
    target.followers = target.followers.filter(id => id.toString() !== userId);

    await user.save();
    await target.save();

    res.json({ message: 'Unfollowed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});




module.exports = router;
