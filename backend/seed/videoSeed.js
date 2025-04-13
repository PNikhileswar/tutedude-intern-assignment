const mongoose = require('mongoose');
const Video = require('../model/video.model');
const Playlist = require('../model/playlist.model');

mongoose.connect('mongodb://localhost:27017/VideoProgress', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected for seeding...'))
  .catch(e => console.log(e));

const programmingLanguages = [
  {
    name: "JavaScript",
    slug: "javascript",
    icon: "🟨",
    playlists: [
      {
        title: "JavaScript Fundamentals",
        description: "Learn the basics of JavaScript programming",
        thumbnail: "https://i.ytimg.com/vi/hdI2bqOjy3c/maxresdefault.jpg",
        videos: [
          {
            title: "JavaScript Crash Course (10 min)",
            youtubeId: "DHjqpvDnNGE",  // 10 min JS intro
            description: "Quick intro to JavaScript fundamentals",
            duration: 600
          },
          {
            title: "JavaScript Variables (5 min)",
            youtubeId: "9WXgNPbF9Yc",  // Short variables explanation
            description: "Learn about variables in JavaScript",
            duration: 300
          }
        ]
      },
      {
        title: "React.js for Beginners",
        description: "Build modern UIs with React",
        thumbnail: "https://i.ytimg.com/vi/Ke90Tje7VS0/maxresdefault.jpg",
        videos: [
          {
            title: "React in 5 Minutes",
            youtubeId: "MRIMT0xPXFI",  // Very short React intro
            description: "Learn React basics in just 5 minutes",
            duration: 300
          },
          {
            title: "React Hooks in 10 Minutes",
            youtubeId: "f687hBjwFcM",  // Short hooks tutorial
            description: "Quick introduction to React Hooks",
            duration: 600
          }
        ]
      }
    ]
  },
  {
    name: "Python",
    slug: "python",
    icon: "🐍",
    playlists: [
      {
        title: "Python Basics",
        description: "Learn the fundamentals of Python",
        thumbnail: "https://i.ytimg.com/vi/_uQrJ0TkZlc/maxresdefault.jpg",
        videos: [
          {
            title: "Python in 5 Minutes",
            youtubeId: "I2wURDqiXdM",  // 5 min Python intro
            description: "Quick introduction to Python",
            duration: 300
          },
          {
            title: "Python Lists in 5 Minutes",
            youtubeId: "ohCDWZgNIU0",  // Short Python lists tutorial
            description: "Learn about Python lists",
            duration: 300
          }
        ]
      }
    ]
  },
  {
    name: "HTML/CSS",
    slug: "html-css",
    icon: "🌐",
    playlists: [
      {
        title: "HTML Basics",
        description: "Learn the fundamentals of HTML",
        thumbnail: "https://i.ytimg.com/vi/UB1O30fR-EE/maxresdefault.jpg",
        videos: [
          {
            title: "HTML in 5 Minutes",
            youtubeId: "salY_Sm6mv4",  // 5 min HTML intro
            description: "Quick introduction to HTML",
            duration: 300
          },
          {
            title: "CSS in 5 Minutes",
            youtubeId: "Z4pCqK-V_Wo",  // Short CSS intro
            description: "Learn CSS basics quickly",
            duration: 300
          }
        ]
      }
    ]
  }
];

const seedDatabase = async () => {
  try {
    await Playlist.deleteMany({});
    await Video.deleteMany({});
    
    console.log('Database cleared');
    
    for (const language of programmingLanguages) {
      for (const playlistData of language.playlists) {
        const playlist = new Playlist({
          title: playlistData.title,
          description: playlistData.description,
          language: language.name,
          thumbnail: playlistData.thumbnail
        });
        
        await playlist.save();
        
        const videoIds = [];
        
        for (const videoData of playlistData.videos) {
          const video = new Video({
            title: videoData.title,
            youtubeId: videoData.youtubeId,
            description: videoData.description,
            duration: videoData.duration,
            playlistId: playlist._id
          });
          
          await video.save();
          videoIds.push(video._id);
        }
        
        playlist.videos = videoIds;
        await playlist.save();
        
        console.log(`Added playlist: ${playlist.title}`);
      }
    }
    
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
};

seedDatabase();