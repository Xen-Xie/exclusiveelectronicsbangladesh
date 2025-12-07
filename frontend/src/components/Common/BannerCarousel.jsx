import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

function BannerCarousel() {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({});
  const [hasInteracted, setHasInteracted] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  // Minimum swipe distance
  const minSwipeDistance = 50;

  const fetchBanners = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/banners/active`);
      setBanners(res.data.data);
    } catch (error) {
      console.error("Failed to fetch banners:", error);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // Auto-rotate banners (pause on hover)
  useEffect(() => {
    if (banners.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length, isHovered]);

  const nextBanner = () => {
    setHasInteracted(true);
    setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  const prevBanner = () => {
    setHasInteracted(true);
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const goToBanner = (index) => {
    setHasInteracted(true);
    setCurrentIndex(index);
  };

  // Get image dimensions when loaded
  const handleImageLoad = (bannerId, e) => {
    const img = e.target;
    setImageDimensions((prev) => ({
      ...prev,
      [bannerId]: {
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: img.naturalWidth / img.naturalHeight,
      },
    }));
  };

  // Touch handlers for mobile swipe
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      setHasInteracted(true);
    }

    if (isLeftSwipe) {
      nextBanner();
    } else if (isRightSwipe) {
      prevBanner();
    }
  };

  if (loading) {
    return (
      <div
        className="w-full bg-gray-200 animate-pulse rounded-lg"
        style={{ aspectRatio: "4 / 1" }}
      ></div>
    );
  }

  if (banners.length === 0) return null;

  const currentBanner = banners[currentIndex];
  const currentImageDimensions = imageDimensions[currentBanner._id];

  return (
    <div
      className="relative w-full rounded-lg overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Banner Container with dynamic height based on image */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          aspectRatio: currentImageDimensions?.aspectRatio
            ? currentImageDimensions.aspectRatio
            : "4 / 1",
          maxHeight: currentImageDimensions?.height > 800 ? "80vh" : "none",
        }}
      >
        {banners.map((banner, index) => (
          <div
            key={banner._id}
            className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
              index === currentIndex
                ? "translate-x-0"
                : index < currentIndex
                ? "-translate-x-full"
                : "translate-x-full"
            }`}
          >
            {banner.link ? (
              <a
                href={banner.link}
                target={banner.target}
                rel="noopener noreferrer"
                className="block w-full h-full transition-all duration-500 group-hover:scale-105"
              >
                <img
                  src={banner.image.url}
                  alt={banner.title || "Banner"}
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                  onLoad={(e) => handleImageLoad(banner._id, e)}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                  }}
                />
              </a>
            ) : (
              <div className="w-full h-full transition-all duration-500 group-hover:scale-105">
                <img
                  src={banner.image.url}
                  alt={banner.title || "Banner"}
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                  onLoad={(e) => handleImageLoad(banner._id, e)}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Overlay gradient on hover */}
      <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

      {/* Navigation */}
      {banners.length > 1 && (
        <>
          {/* Left Arrow */}
          <button
            onClick={prevBanner}
            className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-secondary/80 text-primarybg p-2 sm:p-3 rounded-full hover:bg-secondary transition-all duration-300 z-10 opacity-0 sm:group-hover:opacity-100 hover:scale-105 hover:shadow-lg"
          >
            <i className="fa-solid fa-chevron-left text-sm sm:text-base"></i>
          </button>

          {/* Right Arrow - Hidden on mobile, shown on hover for desktop */}
          <button
            onClick={nextBanner}
            className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-secondary/80 text-primarybg p-2 sm:p-3 rounded-full hover:bg-secondary transition-all duration-300 z-10 opacity-0 sm:group-hover:opacity-100 hover:scale-105 hover:shadow-lg"
          >
            <i className="fa-solid fa-chevron-right text-sm sm:text-base"></i>
          </button>

          {/* Dots indicator */}
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 space-x-2 z-10 opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 hidden sm:flex">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToBanner(index)}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 hover:scale-125 ${
                  index === currentIndex
                    ? "bg-primary scale-125 shadow-lg"
                    : "bg-primarybg/50 hover:bg-primarybg/80"
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* Title */}
      {banners[currentIndex].title && (
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-lg backdrop-blur-sm max-w-[90%] z-10 transition-all duration-300 group-hover:bg-black/80 group-hover:scale-105">
          <h3 className="text-sm sm:text-lg font-semibold text-center whitespace-nowrap overflow-hidden text-ellipsis">
            {banners[currentIndex].title}
          </h3>
        </div>
      )}

      {/* Hover info panel */}
      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-black/70 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 z-10 hidden sm:block">
        {currentIndex + 1} / {banners.length}
      </div>

      {/* Mobile swipe instruction - Only show on mobile until user interacts */}
      {banners.length > 1 &&
        typeof window !== "undefined" &&
        window.innerWidth < 768 &&
        !hasInteracted && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white text-xs opacity-70 animate-pulse bg-black/50 px-2 py-1 rounded">
            Swipe to navigate
          </div>
        )}
    </div>
  );
}

export default BannerCarousel;
