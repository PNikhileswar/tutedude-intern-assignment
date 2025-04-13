const express = require('express');
const router = express.Router();
const Video = require('../model/video.model');
const Progress = require('../model/progress.model');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/:videoId', async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:videoId/progress', authMiddleware, async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    const progress = await Progress.findOne({
      userId: req.userId,
      videoId: req.params.videoId
    });
    
    res.json({
      ...video.toObject(),
      progress: progress ? {
        percent: progress.percent,
        lastPosition: progress.lastPosition,
        watchedIntervals: progress.watchedIntervals
      } : null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;