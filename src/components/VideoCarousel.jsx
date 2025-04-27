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

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === activeIndex) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [activeIndex]);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-900 relative">
      {/* Swiper Container */}
      <Swiper
        modules={[EffectCoverflow, Navigation, Autoplay]} // Add new modules here
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
          delay: 5000,  // 5 seconds auto-slide
          disableOnInteraction: false, // User clicking buttons does not stop autoplay
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
              className={`transition-all duration-300 ease-in-out transform overflow-hidden rounded-2xl shadow-lg ${
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
