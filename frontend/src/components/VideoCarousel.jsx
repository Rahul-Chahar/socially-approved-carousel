import React, { useRef, useEffect, useState } from "react";
import SwiperCore from "swiper";
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';
import axios from 'axios'; // Make sure to install axios: npm install axios

SwiperCore.use([EffectCoverflow]);

// Backend API URL - change this to your server address
const API_URL = 'http://localhost:5000';
// Generate a simple user ID (in a real app, you'd use authentication)
const USER_ID = `user_${Math.floor(Math.random() * 1000000)}`;

export default function VideoCarousel() {
  const videoRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [userLikes, setUserLikes] = useState({});
  const [slidesPerView, setSlidesPerView] = useState(5);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch videos from backend
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get(`${API_URL}/videos`);
        setVideos(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching videos:", err);
        setError("Failed to load videos. Please try again later.");
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  // Adjust visible slides based on screen width
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setSlidesPerView(3);
      } else if (width < 1024) {
        setSlidesPerView(5);
      } else {
        setSlidesPerView(7);
      }
    };

    handleResize(); // Initialize on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    videoRefs.current = videoRefs.current.slice(0, videos.length);
  }, [videos]);

  useEffect(() => {
    if (!videos.length) return;

    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === activeIndex) {
        video.play().catch(() => {});
        setIsPlaying(true);
      } else {
        video.pause();
      }
    });
  }, [activeIndex, videos]);

  const handlePlayPause = () => {
    if (!videos.length) return;
    const video = videoRefs.current[activeIndex];
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleMuteUnmute = () => {
    if (!videos.length) return;
    const video = videoRefs.current[activeIndex];
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleTimeUpdate = () => {
    if (!videos.length) return;
    const video = videoRefs.current[activeIndex];
    if (!video) return;

    const progressPercentage = (video.currentTime / video.duration) * 100;
    setProgress(progressPercentage || 0);
  };

  const handleShare = async () => {
    if (!videos.length) return;
    const video = videos[activeIndex];
    
    try {
      // Call the share API
      await axios.post(`${API_URL}/share`, {
        videoId: video.id,
        platform: 'web' // You could dynamically set this based on where it's shared
      });
      
      // Copy the URL to clipboard
      await navigator.clipboard.writeText(video.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to share or copy:', err);
    }
  };

  const handleLike = async () => {
    if (!videos.length) return;
    const video = videos[activeIndex];
    
    try {
      const response = await axios.post(`${API_URL}/like`, {
        videoId: video.id,
        userId: USER_ID
      });
      
      // Update local state based on server response
      setUserLikes(prev => ({
        ...prev,
        [activeIndex]: response.data.liked
      }));
      
      // Update the likes count in the videos array
      setVideos(prev => 
        prev.map(v => 
          v.id === video.id ? { ...v, likes: response.data.likes } : v
        )
      );
    } catch (err) {
      console.error('Failed to like video:', err);
    }
  };

  useEffect(() => {
    if (!videos.length) return;
    const video = videoRefs.current[activeIndex];
    if (!video) return;

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [activeIndex, videos]);

  const getScaleClass = (index) => {
    const distance = Math.abs(index - activeIndex);
    if (distance === 0) return "scale-110 shadow-xl";
    if (distance === 1) return "scale-100 shadow-lg";
    if (distance === 2) return "scale-95 opacity-90";
    return "scale-90 opacity-60";
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-2xl">Loading videos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-2xl">{error}</div>
      </div>
    );
  }

  if (!videos.length) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-2xl">No videos available</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-900 relative">
      <Swiper
        modules={[EffectCoverflow, Navigation, Autoplay]}
        slidesPerView={slidesPerView}
        centeredSlides={true}
        loop={true}
        spaceBetween={20}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        effect="coverflow"
        navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 100,
          modifier: 2,
          slideShadows: false
        }}
        className="w-full max-w-[95vw]"
      >
        {videos.map((video, index) => (
          <SwiperSlide key={video.id}>
            <div
              className={`relative transition-all duration-300 ease-in-out transform overflow-hidden rounded-2xl shadow-lg mx-auto ${getScaleClass(index)}`}
              style={{
                width: '280px',
                height: '75vh',
                aspectRatio: '9/16',
                borderWidth: index === activeIndex ? '2px' : '0px',
                borderColor: '#3b82f6',
                boxShadow: index === activeIndex ? '0 0 15px rgba(59, 130, 246, 0.5)' : 'none'
              }}
            >
              <video
                ref={(el) => (videoRefs.current[index] = el)}
                src={video.url}
                muted
                playsInline
                className="w-full h-full object-cover rounded-2xl"
              />

              {index === activeIndex && (
                <div className="absolute inset-0 flex flex-col justify-between">
                  {/* Video Title & Description */}
                  <div className="bg-gradient-to-b from-black to-transparent p-4">
                    <h3 className="text-white font-bold text-lg">{video.title}</h3>
                    <p className="text-white text-xs opacity-80">{video.description}</p>
                  </div>
                  
                  {/* Top Controls: Mute */}
                  <div className="absolute top-0 right-0 p-4">
                    <button
                      onClick={handleMuteUnmute}
                      className="bg-black bg-opacity-60 hover:bg-opacity-80 text-white px-3 py-2 rounded-full text-sm transition-all duration-200 flex items-center space-x-1"
                    >
                      {isMuted ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                          </svg>
                          <span>Unmute</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                          </svg>
                          <span>Mute</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Right Side Instagram-style Action Buttons */}
                  <div className="absolute right-4 bottom-24 flex flex-col space-y-6 items-center">
                    {/* Like Button */}
                    <div className="flex flex-col items-center">
                      <button
                        onClick={handleLike}
                        className="bg-black bg-opacity-60 hover:bg-opacity-80 rounded-full p-3 mb-1 transition-all duration-200"
                      >
                        <svg 
                          className={`w-6 h-6 ${userLikes[activeIndex] ? 'text-red-500' : 'text-white'}`} 
                          fill={userLikes[activeIndex] ? "currentColor" : "none"} 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                      <span className="text-white text-xs">
                        {video.likes}
                      </span>
                    </div>

                    {/* Share Button */}
                    <div className="flex flex-col items-center">
                      <button
                        onClick={handleShare}
                        className="bg-black bg-opacity-60 hover:bg-opacity-80 rounded-full p-3 mb-1 transition-all duration-200"
                      >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                      </button>
                      <span className="text-white text-xs">
                        {video.shares || 0}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar - Fixed position at bottom of the video */}
                  <div className="absolute bottom-16 left-0 right-0 px-4">
                    <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-500 h-2 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Play/Pause Button */}
                  <div className="w-full flex justify-center p-4">
                    <button
                      onClick={handlePlayPause}
                      className="bg-black bg-opacity-60 hover:bg-opacity-80 text-white px-4 py-2 rounded-full text-sm z-10 transition-all duration-200"
                    >
                      {isPlaying ? (
                        <>
                          <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Pause
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Play
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation Buttons */}
      <div className="absolute top-1/2 w-full flex justify-between px-4 transform -translate-y-1/2 z-10">
        <div className="swiper-button-prev text-white bg-black bg-opacity-60 hover:bg-opacity-80 p-3 rounded-full cursor-pointer transition-all duration-200">
          &#10094;
        </div>
        <div className="swiper-button-next text-white bg-black bg-opacity-60 hover:bg-opacity-80 p-3 rounded-full cursor-pointer transition-all duration-200">
          &#10095;
        </div>
      </div>

      {/* Copied Toast */}
      {copied && (
        <div className="absolute bottom-5 bg-green-500 text-white px-4 py-2 rounded-full text-sm">
          Link Copied!
        </div>
      )}
    </div>
  );
}