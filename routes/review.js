const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Review = require('../models/Review');
const User = require('../models/User');

// POST: Add or update a review
router.post('/:movieId', auth, async (req, res) => {
  const { reviewText, rating } = req.body;
  const movieId = req.params.movieId;

  try {
    const user = await User.findById(req.user.id);

    // Check if user already reviewed this movie
    let review = await Review.findOne({ userId: user._id, movieId });

    if (review) {
      // Update existing review
      review.reviewText = reviewText;
      review.rating = rating;
    } else {
      // Create new review
      review = new Review({
        movieId,
        userId: user._id,
        username: user.email,
        reviewText,
        rating,
      });
    }

    await review.save();
    res.json(review);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// GET: Fetch reviews for a movie
router.get('/:movieId', async (req, res) => {
  try {
    const { movieId } = req.params;

    if (!movieId) {
      return res.status(400).json({ msg: 'movieId is required' });
    }

    const reviews = await Review.find({ movieId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error('Error fetching reviews:', err.message);
    res.status(500).send('Server error');
  }
});

// DELETE: Remove review by ID
router.delete('/delete/:reviewId', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ msg: 'Review not found' });
    }

    // Only allow user to delete their own review
    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    await Review.findByIdAndDelete(req.params.reviewId);
    res.json({ msg: 'Review deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


module.exports = router;
