import React, { useRef, useEffect, useState } from "react";
import SwiperCore from "swiper";
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';


SwiperCore.use([EffectCoverflow]);

const videos = [
  { id: 1, url: "https://www.w3schools.com/html/mov_bbb.mp4" },
  { id: 2, url: "https://www.w3schools.com/html/movie.mp4" },
  { id: 3, url: "https://www.w3schools.com/html/mov_bbb.mp4" },
  { id: 4, url: "https://www.w3schools.com/html/movie.mp4" },
  { id: 5, url: "https://www.w3schools.com/html/mov_bbb.mp4" },
  { id: 6, url: "https://www.w3schools.com/html/mov_bbb.mp4" },
  { id: 7, url: "https://www.w3schools.com/html/movie.mp4" },
  { id: 8, url: "https://www.w3schools.com/html/mov_bbb.mp4" },
  { id: 9, url: "https://www.w3schools.com/html/movie.mp4" },
  { id: 10, url: "https://www.w3schools.com/html/mov_bbb.mp4" }
];

export default function VideoCarousel() {
  const videoRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === activeIndex) {
        video.play().catch(() => {});
        setIsPlaying(true);
      } else {
        video.pause();
      }
    });
  }, [activeIndex]);

  const handlePlayPause = () => {
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
    const video = videoRefs.current[activeIndex];
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleTimeUpdate = () => {
    const video = videoRefs.current[activeIndex];
    if (!video) return;

    const progressPercentage = (video.currentTime / video.duration) * 100;
    setProgress(progressPercentage || 0);
  };

  useEffect(() => {
    const video = videoRefs.current[activeIndex];
    if (!video) return;

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [activeIndex]);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-900 relative">
      <Swiper
        modules={[EffectCoverflow, Navigation, Autoplay]}
        slidesPerView={3}
        centeredSlides={true}
        loop={true}
        spaceBetween={30}
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
          depth: 150,
          modifier: 2.5,
          slideShadows: false
        }}
        className="w-full max-w-5xl"
      >
        {videos.map((video, index) => (
          <SwiperSlide key={video.id}>
            <div
              className={`relative transition-all duration-300 ease-in-out transform overflow-hidden rounded-2xl shadow-lg ${
                index === activeIndex ? "scale-105 border-4 border-blue-400" : "scale-90 opacity-70"
              }`}
            >
              <video
                ref={(el) => (videoRefs.current[index] = el)}
                src={video.url}
                muted
                playsInline
                className="w-full h-80 object-cover rounded-2xl"
              ></video>

              {/* Controls */}
              {index === activeIndex && (
                <div className="absolute inset-0 flex flex-col justify-between p-4">
                  {/* Top Right - Mute/Unmute */}
                  <button
                    onClick={handleMuteUnmute}
                    className="self-end bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs"
                  >
                    {isMuted ? "Unmute" : "Mute"}
                  </button>

                  {/* Bottom - Play/Pause + Progress Bar */}
                  <div className="flex flex-col items-center w-full">
                    <button
                      onClick={handlePlayPause}
                      className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm mb-2"
                    >
                      {isPlaying ? "Pause" : "Play"}
                    </button>
                    <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-400 h-2"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation Buttons */}
      <div className="absolute top-1/2 w-full flex justify-between px-4 transform -translate-y-1/2">
        <div className="swiper-button-prev text-white bg-gray-700 p-2 rounded-full cursor-pointer">
          &#10094;
        </div>
        <div className="swiper-button-next text-white bg-gray-700 p-2 rounded-full cursor-pointer">
          &#10095;
        </div>
      </div>
    </div>
  );
}
