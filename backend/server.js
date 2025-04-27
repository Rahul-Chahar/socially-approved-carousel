// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Data storage - in a real app, you'd use a database
let videosData = [
  { 
    id: 1, 
    title: "Big Buck Bunny", 
    description: "A short animated film featuring a big rabbit dealing with three bullies", 
    url: "https://www.w3schools.com/html/mov_bbb.mp4", 
    thumbnail: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Big_buck_bunny_poster_big.jpg",
    likes: 245,
    shares: 127,
    createdAt: "2023-01-15T10:30:00Z"
  },
  { 
    id: 2, 
    title: "Elephants Dream", 
    description: "An experimental animated film about two characters exploring a mechanical world", 
    url: "https://www.w3schools.com/html/movie.mp4", 
    thumbnail: "https://upload.wikimedia.org/wikipedia/commons/d/d2/Elephants_Dream_poster.jpg",
    likes: 512,
    shares: 233,
    createdAt: "2023-02-05T14:20:00Z"
  },
  { 
    id: 3, 
    title: "Nature's Beauty", 
    description: "Breathtaking landscapes and wildlife footage", 
    url: "https://www.w3schools.com/html/mov_bbb.mp4", 
    thumbnail: "https://picsum.photos/id/10/400/300",
    likes: 178,
    shares: 96,
    createdAt: "2023-03-12T09:15:00Z"
  },
  { 
    id: 4, 
    title: "Urban Exploration", 
    description: "A journey through vibrant city streets and architecture", 
    url: "https://www.w3schools.com/html/movie.mp4", 
    thumbnail: "https://picsum.photos/id/20/400/300",
    likes: 823,
    shares: 341,
    createdAt: "2023-04-18T16:45:00Z"
  },
  { 
    id: 5, 
    title: "Mountain Peaks", 
    description: "Spectacular drone footage of mountain ranges", 
    url: "https://www.w3schools.com/html/mov_bbb.mp4", 
    thumbnail: "https://picsum.photos/id/30/400/300",
    likes: 315,
    shares: 153,
    createdAt: "2023-05-29T11:30:00Z"
  },
  { 
    id: 6, 
    title: "Ocean Wonders", 
    description: "Diving into the depths of ocean wildlife", 
    url: "https://www.w3schools.com/html/movie.mp4", 
    thumbnail: "https://picsum.photos/id/40/400/300",
    likes: 642,
    shares: 278,
    createdAt: "2023-06-03T13:10:00Z"
  },
  { 
    id: 7, 
    title: "Desert Adventures", 
    description: "Exploring vast desert landscapes", 
    url: "https://www.w3schools.com/html/mov_bbb.mp4", 
    thumbnail: "https://picsum.photos/id/50/400/300",
    likes: 415,
    shares: 189,
    createdAt: "2023-07-08T15:25:00Z"
  },
  { 
    id: 8, 
    title: "Forest Trails", 
    description: "Walking through serene forest paths", 
    url: "https://www.w3schools.com/html/movie.mp4", 
    thumbnail: "https://picsum.photos/id/60/400/300",
    likes: 738,
    shares: 321,
    createdAt: "2023-08-14T10:40:00Z"
  },
  { 
    id: 9, 
    title: "Winter Wonderland", 
    description: "Beautiful snowy landscapes and winter activities", 
    url: "https://www.w3schools.com/html/mov_bbb.mp4", 
    thumbnail: "https://picsum.photos/id/70/400/300",
    likes: 219,
    shares: 114,
    createdAt: "2023-09-22T12:55:00Z"
  },
  { 
    id: 10, 
    title: "Sunset Views", 
    description: "Stunning sunset scenes from around the world", 
    url: "https://www.w3schools.com/html/movie.mp4", 
    thumbnail: "https://picsum.photos/id/80/400/300",
    likes: 547,
    shares: 256,
    createdAt: "2023-10-01T19:20:00Z"
  }
];

// In-memory store of user likes to prevent duplicate likes
// In a real app, you'd store this in a database
const userLikes = {};

// GET /videos - Return all videos with metadata
app.get('/videos', (req, res) => {
  res.json(videosData);
});

// GET /videos/:id - Return a specific video by ID
app.get('/videos/:id', (req, res) => {
  const videoId = parseInt(req.params.id);
  const video = videosData.find(v => v.id === videoId);
  
  if (!video) {
    return res.status(404).json({ message: 'Video not found' });
  }
  
  res.json(video);
});

// POST /like - Handle liking a video
app.post('/like', (req, res) => {
  const { videoId, userId } = req.body;
  
  if (!videoId || !userId) {
    return res.status(400).json({ message: 'Video ID and User ID are required' });
  }
  
  const video = videosData.find(v => v.id === parseInt(videoId));
  
  if (!video) {
    return res.status(404).json({ message: 'Video not found' });
  }
  
  // Check if this user has already liked this video
  const userLikeKey = `${userId}-${videoId}`;
  
  if (userLikes[userLikeKey]) {
    // User already liked this video, so unlike it
    video.likes -= 1;
    delete userLikes[userLikeKey];
    return res.json({ liked: false, likes: video.likes });
  } else {
    // User hasn't liked this video yet, so like it
    video.likes += 1;
    userLikes[userLikeKey] = true;
    return res.json({ liked: true, likes: video.likes });
  }
});

// POST /share - Track video shares
app.post('/share', (req, res) => {
  const { videoId, platform } = req.body;
  
  if (!videoId) {
    return res.status(400).json({ message: 'Video ID is required' });
  }
  
  const video = videosData.find(v => v.id === parseInt(videoId));
  
  if (!video) {
    return res.status(404).json({ message: 'Video not found' });
  }
  
  // Increment share count
  video.shares += 1;
  
  // Log the share with platform info if provided
  console.log(`Video ${videoId} shared${platform ? ` on ${platform}` : ''}`);
  
  return res.json({ 
    success: true, 
    message: 'Share recorded successfully', 
    shares: video.shares 
  });
});

// Optional: Save data to a JSON file periodically
function saveDataToFile() {
  const dataToSave = JSON.stringify(videosData, null, 2);
  fs.writeFileSync(path.join(__dirname, 'videos-data.json'), dataToSave);
  console.log('Data saved to file');
}

// Optionally save data every hour
setInterval(saveDataToFile, 3600000);

// Save data when the server is shutting down
process.on('SIGINT', () => {
  saveDataToFile();
  process.exit();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});