const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  youtubeId: { type: String, required: true },
  description: { type: String },
  duration: { type: Number },
  playlistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Playlist' }
});

const Video = mongoose.model('Video', VideoSchema);
module.exports = Video;