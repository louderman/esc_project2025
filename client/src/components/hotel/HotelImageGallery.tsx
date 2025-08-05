import { useState } from "react";
import { Button } from "@/components/hotel/ui/button";
import { Camera } from "lucide-react";

interface HotelImageGalleryProps {
  images?: string[];
  hotelName: string;
}

const HotelImageGallery = ({ images, hotelName }: HotelImageGalleryProps) => {
  const [currentImage, setCurrentImage] = useState(0);
  
  const defaultImages = [
    "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=1200&h=900&fit=crop&q=85",
    "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=1200&h=900&fit=crop&q=85",
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=900&fit=crop&q=85"
  ];
  
  const galleryImages = images || defaultImages;

  return (
    <div className="relative">
      <div className="aspect-[4/3] overflow-hidden rounded-lg">
        <img 
          src={galleryImages[currentImage]} 
          alt={`${hotelName} - Image ${currentImage + 1}`}
          className="w-full h-full object-cover"
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
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HotelImageGallery;