const express = require('express');
const {saveProgress,getProgress} = require('../controller/progress.controller');  
const { model } = require('mongoose');
const router = express.Router();

router.get('/:userId/:videoId', getProgress);
router.post('/save', saveProgress);

module.exports = router;