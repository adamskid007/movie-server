const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  favorites: [
  {
    movieId: String,
    title: String,
    posterPath: String,
    releaseDate: String
  }
],
watchlist: [
    {
      movieId: String,
      title: String,
      posterPath: String,
      releaseDate: String,
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
