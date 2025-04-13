const express = require('express');
const router = express.Router();
const Playlist = require('../model/playlist.model');
const Video = require('../model/video.model');
const Progress = require('../model/progress.model');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/languages', async (req, res) => {
  try {
    const languages = await Playlist.aggregate([
      { $group: {
          _id: "$language",
          playlistCount: { $sum: 1 }
        }
      },
      { $project: {
          _id: 0,
          name: "$_id",
          playlistCount: 1,
          slug: { $toLower: { $replaceAll: { input: "$_id", find: " ", replacement: "-" } } }
        }
      }
    ]);
    
    const languagesWithIcons = languages.map(lang => {
      let icon = "📚";
      if (lang.name === "JavaScript") icon = "🟨";
      if (lang.name === "Python") icon = "🐍";
      if (lang.name === "Java") icon = "☕";
      if (lang.name === "C++") icon = "🔠";
      if (lang.name === "HTML/CSS") icon = "🌐";
      return { ...lang, icon };
    });
    
    res.json(languagesWithIcons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/language/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    
    console.log(`Processing request for slug: "${slug}"`);
    
    let languageName;
    if (slug === 'html-css') {
      languageName = 'HTML/CSS';
      console.log(`HTML/CSS request detected, looking for: "${languageName}"`);
    } else {
      languageName = slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    
    console.log(`Finding playlists for language: "${languageName}"`);
    
    let query;
    if (languageName === 'HTML/CSS') {
      query = { language: languageName };
    } else {
      query = { language: new RegExp('^' + languageName + '$', 'i') };
    }
    
    const playlists = await Playlist.find(query)
      .populate('videos');
    
    console.log(`Found ${playlists.length} playlists for ${languageName}`);
    
    res.json({
      language: { name: languageName, slug },
      playlists
    });
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/:playlistId/videos', async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.playlistId)
      .populate('videos');
    
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    
    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:playlistId/progress', authMiddleware, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.playlistId)
      .populate('videos');
    
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    
    const videoIds = playlist.videos.map(video => video._id);
    const progress = await Progress.find({
      userId: req.userId,
      videoId: { $in: videoIds }
    });
    
    const totalDuration = playlist.videos.reduce((sum, video) => sum + video.duration, 0);
    const watchedDuration = progress.reduce((sum, p) => sum + p.percent * 0.01 * 
      playlist.videos.find(v => v._id.toString() === p.videoId.toString())?.duration || 0, 0);
    
    const progressPercent = totalDuration > 0 ? (watchedDuration / totalDuration) * 100 : 0;
    
    res.json({
      ...playlist.toObject(),
      progress: progressPercent.toFixed(1),
      videoProgress: progress.map(p => ({
        videoId: p.videoId,
        percent: p.percent,
        lastPosition: p.lastPosition
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;