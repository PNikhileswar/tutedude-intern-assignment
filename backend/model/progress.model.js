const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
    watchedIntervals: [{ start: Number, end: Number }],
    lastPosition: { type: Number, default: 0 },
    percent: { type: Number, default: 0 }
});

const Progress = mongoose.model('Progress', ProgressSchema);
module.exports = Progress;