const mongoose = require('mongoose');
const Video = require('../model/video.model');
const Playlist = require('../model/playlist.model');

mongoose.connect(process.env.MONGODB_URI , {
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
        description: "Complete basics of JavaScript from variables to functions",
        thumbnail: "https://i.ytimg.com/vi/hdI2bqOjy3c/maxresdefault.jpg",
        videos: [
          {
            title: "JavaScript Variables & Data Types",
            youtubeId: "hdI2bqOjy3c", 
            description: "Learn about variables and data types in JavaScript",
            duration: 401 
          },
          {
            title: "JavaScript Operators",
            youtubeId: "FZzyij43A54",
            description: "Understanding operators in JavaScript",
            duration: 240
          },
          {
            title: "JavaScript Control Flow",
            youtubeId: "JloLGV9DmtQ",
            description: "If statements, loops, and control flow",
            duration: 360
          },
          {
            title: "JavaScript Functions",
            youtubeId: "N8ap4k_1QEQ",
            description: "Learn how to create and use functions",
            duration: 420
          },
          {
            title: "JavaScript Arrays",
            youtubeId: "8JgU2WmrZXI",
            description: "Working with arrays and array methods",
            duration: 330
          }
        ]
      },
      {
        title: "JavaScript Advanced Concepts",
        description: "Take your JavaScript skills to the next level",
        thumbnail: "https://i.ytimg.com/vi/W6NZfCO5SIk/maxresdefault.jpg",
        videos: [
          {
            title: "JavaScript Objects & Classes",
            youtubeId: "PFmuCDHHpwk", 
            description: "Understanding objects and classes in JavaScript",
            duration: 480
          },
          {
            title: "JavaScript Promises",
            youtubeId: "DHvZLI7Db8E",
            description: "Working with asynchronous JavaScript using promises",
            duration: 420
          },
          {
            title: "JavaScript Async/Await",
            youtubeId: "V_Kr9OSfDeU",
            description: "Modern async programming in JavaScript",
            duration: 390
          },
          {
            title: "JavaScript Modules",
            youtubeId: "qgRUr-YUk1Q",
            description: "How to structure your code with ES6 modules",
            duration: 300
          },
          {
            title: "JavaScript Error Handling",
            youtubeId: "cFTFtuEQ-10",
            description: "Proper error handling techniques",
            duration: 270
          }
        ]
      },
      {
        title: "React.js Essentials",
        description: "Learn React from the ground up",
        thumbnail: "https://i.ytimg.com/vi/Ke90Tje7VS0/maxresdefault.jpg",
        videos: [
          {
            title: "React in 5 Minutes",
            youtubeId: "MRIMT0xPXFI",
            description: "Quick intro to React basics",
            duration: 300
          },
          {
            title: "React Components",
            youtubeId: "Cla1WwguArA",
            description: "Understanding React components",
            duration: 420
          },
          {
            title: "React Props",
            youtubeId: "m7OWXtbiXX8",
            description: "Working with props in React",
            duration: 300
          },
          {
            title: "React State",
            youtubeId: "4ORZ1GmjaMc",
            description: "State management in React components",
            duration: 360
          },
          {
            title: "React Hooks",
            youtubeId: "f687hBjwFcM",
            description: "Using hooks for functional components",
            duration: 480
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
        description: "Learn the fundamentals of Python programming",
        thumbnail: "https://i.ytimg.com/vi/_uQrJ0TkZlc/maxresdefault.jpg",
        videos: [
          {
            title: "Python Introduction",
            youtubeId: "I2wURDqiXdM",
            description: "Quick introduction to Python",
            duration: 401
          },
          {
            title: "Python Variables & Data Types",
            youtubeId: "khKv-8q7YmY",
            description: "Understanding variables and data types in Python",
            duration: 270
          },
          {
            title: "Python Control Flow",
            youtubeId: "Zp5MuPOtsSY",
            description: "If statements, loops, and control structures",
            duration: 330
          },
          {
            title: "Python Functions",
            youtubeId: "NSbOtYzIQI0",
            description: "Creating and using functions in Python",
            duration: 360
          },
          {
            title: "Python Lists & Dictionaries",
            youtubeId: "ohCDWZgNIU0",
            description: "Working with Python's data structures",
            duration: 420
          }
        ]
      },
      {
        title: "Python Data Science",
        description: "Use Python for data analysis and visualization",
        thumbnail: "https://i.ytimg.com/vi/r-uOLxNrNk8/maxresdefault.jpg",
        videos: [
          {
            title: "NumPy Basics",
            youtubeId: "GB9ByFAIAH4", 
            description: "Introduction to NumPy for numerical computing",
            duration: 360
          },
          {
            title: "Pandas Introduction",
            youtubeId: "vmEHCJofslg",
            description: "Working with data using Pandas",
            duration: 420
          },
          {
            title: "Data Visualization with Matplotlib",
            youtubeId: "DAQNHzOcO5A",
            description: "Creating charts and plots with Matplotlib",
            duration: 390
          },
          {
            title: "Seaborn for Statistical Visualization",
            youtubeId: "6GUZXDef2U0",
            description: "Enhanced visualizations with Seaborn",
            duration: 330
          },
          {
            title: "Data Analysis Project",
            youtubeId: "eMOA1pPVUc4",
            description: "Putting it all together with a simple project",
            duration: 450
          }
        ]
      },
      {
        title: "Python Web Development",
        description: "Build web applications with Flask and Django",
        thumbnail: "https://i.ytimg.com/vi/Z1RJmh_OqeA/maxresdefault.jpg",
        videos: [
          {
            title: "Flask Introduction",
            youtubeId: "Z1RJmh_OqeA",
            description: "Getting started with Flask web framework",
            duration: 360
          },
          {
            title: "Flask Routes & Templates",
            youtubeId: "mqhxxeeTbu0",
            description: "Creating routes and using templates in Flask",
            duration: 390
          },
          {
            title: "Django Introduction",
            youtubeId: "rHux0gMZ3Eg",
            description: "Getting started with Django framework",
            duration: 420
          },
          {
            title: "Django Models",
            youtubeId: "5zNR3E6WRLE",
            description: "Working with data models in Django",
            duration: 360
          },
          {
            title: "API Development with Django REST",
            youtubeId: "c708Nf0cHrs", 
            description: "Building REST APIs with Django",
            duration: 480
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
        title: "HTML Fundamentals",
        description: "Learn the building blocks of the web",
        thumbnail: "https://i.ytimg.com/vi/UB1O30fR-EE/maxresdefault.jpg",
        videos: [
          {
            title: "HTML Introduction",
            youtubeId: "salY_Sm6mv4",
            description: "Quick introduction to HTML",
            duration: 300
          },
          {
            title: "HTML Elements & Attributes",
            youtubeId: "XiQ9rjaa2Ow",
            description: "Understanding HTML elements and attributes",
            duration: 330
          },
          {
            title: "HTML Document Structure",
            youtubeId: "zcTT1-OQ2ww",
            description: "Proper HTML document structure and semantics",
            duration: 270
          },
          {
            title: "HTML Forms",
            youtubeId: "fNcJuPIZ2WE",
            description: "Creating forms to collect user input",
            duration: 360
          },
          {
            title: "HTML5 New Features",
            youtubeId: "kUMe1FH4CHE",
            description: "Modern HTML5 elements and APIs",
            duration: 420
          }
        ]
      },
      {
        title: "CSS Styling",
        description: "Style your web pages with CSS",
        thumbnail: "https://i.ytimg.com/vi/yfoY53QXEnI/maxresdefault.jpg",
        videos: [
          {
            title: "CSS Introduction",
            youtubeId: "Z4pCqK-V_Wo",
            description: "Getting started with CSS",
            duration: 300
          },
          {
            title: "CSS Selectors",
            youtubeId: "l1mER1bV0N0",
            description: "Targeting elements with CSS selectors",
            duration: 270
          },
          {
            title: "CSS Box Model",
            youtubeId: "rIO5326FgPE",
            description: "Understanding margin, padding, and borders",
            duration: 330
          },
          {
            title: "CSS Flexbox",
            youtubeId: "JJSoEo8JSnc",
            description: "Modern layout with Flexbox",
            duration: 390
          },
          {
            title: "CSS Grid",
            youtubeId: "9zBsdzdE4sM",
            description: "Powerful grid layouts with CSS Grid",
            duration: 420
          }
        ]
      },
      {
        title: "Responsive Web Design",
        description: "Build websites that work on any device",
        thumbnail: "https://i.ytimg.com/vi/srvUrASNj0s/maxresdefault.jpg",
        videos: [
          {
            title: "Responsive Design Principles",
            youtubeId: "srvUrASNj0s",
            description: "Core concepts of responsive design",
            duration: 360
          },
          {
            title: "Media Queries",
            youtubeId: "2KL-z9A56SQ",
            description: "Adapting designs to different screen sizes",
            duration: 300
          },
          {
            title: "Responsive Images",
            youtubeId: "D9EuCWcy8IU",
            description: "Optimizing images for different devices",
            duration: 270
          },
          {
            title: "Mobile-First Design",
            youtubeId: "ZYV6dYtz4HA",
            description: "Designing for mobile devices first",
            duration: 330
          },
          {
            title: "Responsive Typography",
            youtubeId: "wARbgs5Fmuw",
            description: "Creating flexible and readable text",
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
        
        console.log(`Added playlist: ${playlist.title} with ${videoIds.length} videos`);
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