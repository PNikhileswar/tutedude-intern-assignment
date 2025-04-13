import React from 'react';
import { Bar } from 'react-chartjs-2';

const ViewingAnalytics = ({ playedIntervals, duration }) => {
  const segments = [];
  for (let i = 0; i < duration; i += 10) {
    segments.push({
      start: i,
      end: Math.min(i + 10, duration),
      label: `${Math.floor(i/60)}:${(i%60).toString().padStart(2, '0')}`,
      watched: false
    });
  }
  
  playedIntervals.forEach(interval => {
    segments.forEach(segment => {
      if (interval.start <= segment.end && interval.end >= segment.start) {
        segment.watched = true;
      }
    });
  });
  
  return (
    <div className="viewing-analytics">
      <h3>Your Viewing Pattern</h3>
      <div className="segment-visualization">
        {segments.map((segment, index) => (
          <div 
            key={index}
            className={`segment ${segment.watched ? 'watched' : 'unwatched'}`}
            title={`${segment.label} - ${segment.watched ? 'Watched' : 'Not watched'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ViewingAnalytics;