import { useState } from "react";
import { Button } from "@/components/hotel/ui/button";
import { Camera, ImageOff } from "lucide-react";
import { getImagesWithFallbacks, getRandomHotelFallback } from "@/utils/imageFallbacks";

interface HotelImageGalleryProps {
  images?: (string | { url: string })[];
  hotelName: string;
}

const HotelImageGallery = ({ images, hotelName }: HotelImageGalleryProps) => {
  const [currentImage, setCurrentImage] = useState(0);
  
  // Use centralized fallback system
  const galleryImages = getImagesWithFallbacks(images, 'hotel');
  
  // Check if we have valid images from the API (not just fallbacks)
  const hasValidImages = images && Array.isArray(images) && images.length > 0 && 
    images.some(img => {
      const url = typeof img === 'string' ? img : img.url;
      return Boolean(url && url.trim() !== '' && url !== 'undefined' && url !== 'null');
    });

  // If no valid images are provided, show the "No image available" card
  if (!hasValidImages) {
    return (
      <div className="relative">
        <div className="aspect-[4/3] overflow-hidden rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300">
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto bg-gray-300 rounded-full flex items-center justify-center mb-4">
                <ImageOff size={32} className="text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Images Available
              </h3>
              <p className="text-gray-500 text-sm max-w-md">
                We don't have any photos of {hotelName} at the moment. 
                Please check back later or contact the hotel directly for more information.
              </p>
            </div>
            
            {/* Decorative elements */}
            <div className="flex space-x-2 mt-6">
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-4 right-4">
          <Button variant="secondary" size="sm" className="bg-black/50 text-white hover:bg-black/70">
            <Camera size={16} className="mr-2" />
            No Photos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="aspect-[4/3] overflow-hidden rounded-lg">
        <img 
          src={galleryImages[currentImage]} 
          alt={`${hotelName} - Image ${currentImage + 1}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // If main image fails, try to show a fallback
            if (galleryImages.length > 1) {
              const nextImageIndex = (currentImage + 1) % galleryImages.length;
              e.currentTarget.src = galleryImages[nextImageIndex];
            } else {
              e.currentTarget.src = getRandomHotelFallback();
            }
          }}
        />
      </div>
      
      <div className="absolute bottom-4 right-4">
        <Button variant="secondary" size="sm" className="bg-black/50 text-white hover:bg-black/70">
          <Camera size={16} className="mr-2" />
          {galleryImages.length} Photos
        </Button>
      </div>
      
      {galleryImages.length > 1 && (
        <div className="flex space-x-2 mt-4">
          {galleryImages.slice(0, 4).map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`relative flex-1 h-20 rounded-md overflow-hidden border-2 transition-all ${
                currentImage === index ? 'border-primary' : 'border-transparent'
              }`}
            >
              <img 
                src={image} 
                alt={`${hotelName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  // Hide broken images
                  e.currentTarget.style.display = 'none';
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HotelImageGallery;