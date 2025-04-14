const Progress = require('../model/progress.model');

exports.saveProgress = async (req, res) => {
    try {
        const { userId, videoId, watchedIntervals, currentTime, duration } = req.body;
        console.log(`Saving progress via REST API: userId=${userId}, videoId=${videoId}`);
        
        if (!userId || !videoId || !watchedIntervals) {
            return res.status(400).json({ message: 'Missing required parameters' });
        }

        let progress = await Progress.findOne({ userId, videoId });

        if (progress) {
            progress.watchedIntervals = mergeIntervals(progress.watchedIntervals || [], watchedIntervals);
            progress.lastPosition = currentTime || progress.lastPosition;
            
            const totalUniqueSeconds = calculateUniqueTime(progress.watchedIntervals);
            const videoDuration = duration || 100;
            progress.percent = Math.min(100, (totalUniqueSeconds / videoDuration) * 100);
        } else {
            progress = new Progress({ 
                userId, 
                videoId, 
                watchedIntervals,
                lastPosition: currentTime || 0,
                percent: 0
            });
            
            if (watchedIntervals.length > 0 && duration) {
                const totalUniqueSeconds = calculateUniqueTime(watchedIntervals);
                progress.percent = Math.min(100, (totalUniqueSeconds / duration) * 100);
            }
        }

        await progress.save();
        res.status(200).json({ success: true, message: 'Progress saved successfully', progress });
    } catch (error) {
        console.error('Error in progress controller:', error);
        res.status(500).json({ message: error.message });
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

function calculateUniqueTime(intervals) {
    if (!intervals || !intervals.length) return 0;
    
    return intervals.reduce((total, interval) => {
        return total + (interval.end - interval.start);
    }, 0);
}