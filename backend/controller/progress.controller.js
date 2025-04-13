const Progress = require('../model/progress.model');

exports.saveProgress = async (req, res) => {
    const { userId, videoId, watchedIntervals, currentTime } = req.body; 

    try {
        let progress = await Progress.findOne({ userId, videoId });

        if (progress) {
            progress.watchedIntervals = mergeIntervals(progress.watchedIntervals || [], watchedIntervals);
            progress.lastPosition = currentTime || progress.lastPosition;
        } else {
            progress = new Progress({ 
                userId, 
                videoId, 
                watchedIntervals,
                lastPosition: currentTime || 0,
                percent: 0
            });
        }

        await progress.save();
        res.status(200).json({ message: 'Progress saved successfully', progress });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error saving progress' });
    }
}

exports.getProgress = async (req, res) => { 
    const { userId, videoId } = req.params;

    try {
        const progress = await Progress.findOne({ userId, videoId });

        if (progress) {
            res.status(200).json(progress);
        } else {
            res.status(404).json({ message: 'Progress not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching progress' });
    }
}

function mergeIntervals(existing, newIntervals) {
    const allIntervals = [...existing, ...newIntervals];
    allIntervals.sort((a, b) => a.start - b.start);

    if (allIntervals.length === 0) return [];
    
    const merged = [];
    let current = allIntervals[0];

    for (let i = 1; i < allIntervals.length; i++) {
        if (current.end >= allIntervals[i].start) {
            current.end = Math.max(current.end, allIntervals[i].end);
        } else {
            merged.push(current);
            current = allIntervals[i];
        }
    }
    merged.push(current);

    return merged;
}