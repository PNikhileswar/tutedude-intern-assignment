const mongoose = require('mongoose');

const PlaylistSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  language: { type: String, required: true }, 
  thumbnail: { type: String },
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }]
});

const Playlist = mongoose.model('Playlist', PlaylistSchema);
module.exports = Playlist;