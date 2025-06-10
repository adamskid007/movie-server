const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  movieId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: { type: String }, // optional: store user email/username
  reviewText: { type: String, required: true },
  rating: { type: Number, min: 1, max: 10 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Review', ReviewSchema);
