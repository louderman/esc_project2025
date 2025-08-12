// Centralized image fallback system for the hotel application
// This ensures consistent placeholder images across all components

export const DEFAULT_IMAGES = {
  // Hotel main images (high quality, landscape orientation)
  HOTEL_MAIN: [
    "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=1200&h=900&fit=crop&q=85",
    "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=1200&h=900&fit=crop&q=85",
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=900&fit=crop&q=85"
  ],
  
  // Room images (medium quality, suitable for room cards)
  ROOM: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=300&h=200&fit=crop",
  
  // Hotel thumbnail (smaller size for compact displays)
  HOTEL_THUMBNAIL: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop",
  
  // Generic hotel placeholder (when no specific images available)
  GENERIC_HOTEL: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=600&fit=crop&q=85"
};

// Helper function to check if an image URL is valid
export const isValidImage = (imageUrl: string | undefined | null): boolean => {
  if (!imageUrl) return false;
  
  const url = typeof imageUrl === 'string' ? imageUrl : imageUrl;
  return Boolean(
    url && 
    url.trim() !== '' && 
    url !== 'undefined' && 
    url !== 'null' &&
    url !== 'https://undefined' &&
    url !== 'https://null'
  );
};

// Helper function to get a random fallback image from the main hotel images
export const getRandomHotelFallback = (): string => {
  const randomIndex = Math.floor(Math.random() * DEFAULT_IMAGES.HOTEL_MAIN.length);
  return DEFAULT_IMAGES.HOTEL_MAIN[randomIndex];
};

// Helper function to get the best available image with fallback
export const getImageWithFallback = (
  primaryImage: string | undefined | null,
  fallbackType: 'hotel' | 'room' | 'thumbnail' = 'hotel'
): string => {
  if (isValidImage(primaryImage)) {
    return primaryImage;
  }
  
  switch (fallbackType) {
    case 'room':
      return DEFAULT_IMAGES.ROOM;
    case 'thumbnail':
      return DEFAULT_IMAGES.HOTEL_THUMBNAIL;
    case 'hotel':
    default:
      return getRandomHotelFallback();
  }
};

// Helper function to get multiple images with fallbacks
export const getImagesWithFallbacks = (
  images: (string | { url: string })[] | undefined | null,
  fallbackType: 'hotel' | 'room' = 'hotel'
): string[] => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return fallbackType === 'hotel' ? DEFAULT_IMAGES.HOTEL_MAIN : [DEFAULT_IMAGES.ROOM];
  }
  
  const validImages = images
    .map(img => typeof img === 'string' ? img : img.url)
    .filter(isValidImage);
  
  if (validImages.length === 0) {
    return fallbackType === 'hotel' ? DEFAULT_IMAGES.HOTEL_MAIN : [DEFAULT_IMAGES.ROOM];
  }
  
  return validImages;
};
