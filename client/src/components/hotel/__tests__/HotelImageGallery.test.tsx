import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import HotelImageGallery from '../HotelImageGallery';

// Mock the Button component
vi.mock('@/components/hotel/ui/button', () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props} data-testid="button">
      {children}
    </button>
  ),
}));

// Mock the lucide-react icons
vi.mock('lucide-react', () => ({
  Camera: ({ size, className, ...props }: any) => (
    <svg data-testid="camera-icon" {...props} />
  ),
  ImageOff: ({ size, className, ...props }: any) => (
    <svg data-testid="image-off-icon" {...props} />
  ),
}));

describe('Unit Test - Hotel Image Gallery', () => {
  const mockHotelName = 'Test Hotel';
  
  const mockImages = [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
    'https://example.com/image3.jpg',
    'https://example.com/image4.jpg',
    'https://example.com/image5.jpg'
  ];

  const mockImageObjects = [
    { url: 'https://example.com/image1.jpg' },
    { url: 'https://example.com/image2.jpg' },
    { url: 'https://example.com/image3.jpg' }
  ];

  beforeEach(() => {
    // Clear any previous mocks
    vi.clearAllMocks();
  });

  describe('TC_HOTELDETAIL_2: User interacts with hotel image gallery', () => {
    describe('Basic Gallery Rendering', () => {
      it('should render hotel image gallery with provided images', () => {
        render(<HotelImageGallery images={mockImages} hotelName={mockHotelName} />);
        
        // Should display main image
        const mainImage = screen.getByAltText(`${mockHotelName} - Image 1`);
        expect(mainImage).toBeInTheDocument();
        expect(mainImage).toHaveAttribute('src', mockImages[0]);
        
        // Should display photo count button
        const photoButton = screen.getByTestId('button');
        expect(photoButton).toHaveTextContent('5 Photos');
        
        // Should display thumbnail navigation (first 4 images)
        const thumbnails = screen.getAllByAltText(/thumbnail/);
        expect(thumbnails).toHaveLength(4);
      });

      it('should render gallery with image objects (url property)', () => {
        render(<HotelImageGallery images={mockImageObjects} hotelName={mockHotelName} />);
        
        // Should display main image from object
        const mainImage = screen.getByAltText(`${mockHotelName} - Image 1`);
        expect(mainImage).toBeInTheDocument();
        expect(mainImage).toHaveAttribute('src', mockImageObjects[0].url);
        
        // Should display correct photo count
        const photoButton = screen.getByTestId('button');
        expect(photoButton).toHaveTextContent('3 Photos');
      });

      it('should handle single image without thumbnails', () => {
        const singleImage = ['https://example.com/single.jpg'];
        render(<HotelImageGallery images={singleImage} hotelName={mockHotelName} />);
        
        // Should display main image
        const mainImage = screen.getByAltText(`${mockHotelName} - Image 1`);
        expect(mainImage).toBeInTheDocument();
        
        // Should not display thumbnails for single image
        const thumbnails = screen.queryAllByAltText(/thumbnail/);
        expect(thumbnails).toHaveLength(0);
        
        // Should display correct photo count
        const photoButton = screen.getByTestId('button');
        expect(photoButton).toHaveTextContent('1 Photo');
      });
    });

    describe('Thumbnail Navigation', () => {
      it('should update main image when thumbnail is clicked', async () => {
        const user = userEvent.setup();
        render(<HotelImageGallery images={mockImages} hotelName={mockHotelName} />);
        
        // Initially should show first image
        let mainImage = screen.getByAltText(`${mockHotelName} - Image 1`);
        expect(mainImage).toHaveAttribute('src', mockImages[0]);
        
        // Click on second thumbnail
        const secondThumbnail = screen.getByAltText(`${mockHotelName} thumbnail 2`);
        await user.click(secondThumbnail);
        
        // Main image should update to second image
        await waitFor(() => {
          mainImage = screen.getByAltText(`${mockHotelName} - Image 2`);
          expect(mainImage).toHaveAttribute('src', mockImages[1]);
        });
        
        // Alt text should also update
        expect(mainImage).toHaveAttribute('alt', `${mockHotelName} - Image 2`);
      });

      it('should highlight active thumbnail with primary border', async () => {
        const user = userEvent.setup();
        render(<HotelImageGallery images={mockImages} hotelName={mockHotelName} />);
        
        // Initially first thumbnail should be active
        const firstThumbnail = screen.getByAltText(`${mockHotelName} thumbnail 1`);
        expect(firstThumbnail.parentElement).toHaveClass('border-primary');
        
        // Click on third thumbnail
        const thirdThumbnail = screen.getByAltText(`${mockHotelName} thumbnail 3`);
        await user.click(thirdThumbnail);
        
        // Third thumbnail should now be active
        await waitFor(() => {
          expect(thirdThumbnail.parentElement).toHaveClass('border-primary');
        });
        
        // First thumbnail should no longer be active
        expect(firstThumbnail.parentElement).toHaveClass('border-transparent');
      });

      it('should handle multiple thumbnail clicks correctly', async () => {
        const user = userEvent.setup();
        render(<HotelImageGallery images={mockImages} hotelName={mockHotelName} />);
        
        // Click through multiple thumbnails
        const thumbnails = screen.getAllByAltText(/thumbnail/);
        
        // Click second thumbnail
        await user.click(thumbnails[1]);
        await waitFor(() => {
          const mainImage = screen.getByAltText(`${mockHotelName} - Image 2`);
          expect(mainImage).toHaveAttribute('src', mockImages[1]);
        });
        
        // Click fourth thumbnail
        await user.click(thumbnails[3]);
        await waitFor(() => {
          const mainImage = screen.getByAltText(`${mockHotelName} - Image 4`);
          expect(mainImage).toHaveAttribute('src', mockImages[3]);
        });
        
        // Click first thumbnail
        await user.click(thumbnails[0]);
        await waitFor(() => {
          const mainImage = screen.getByAltText(`${mockHotelName} - Image 1`);
          expect(mainImage).toHaveAttribute('src', mockImages[0]);
        });
      });
    });

    describe('Navigation Dots (Thumbnail Selection)', () => {
      it('should display navigation dots for multiple images', () => {
        render(<HotelImageGallery images={mockImages} hotelName={mockHotelName} />);
        
        // Should display thumbnails as navigation dots
        const thumbnails = screen.getAllByAltText(/thumbnail/);
        expect(thumbnails).toHaveLength(4); // First 4 images
        
        // Each thumbnail should be clickable
        thumbnails.forEach((thumbnail, index) => {
          expect(thumbnail).toBeInTheDocument();
          expect(thumbnail).toHaveAttribute('alt', `${mockHotelName} thumbnail ${index + 1}`);
        });
      });

      it('should update main image when navigation dot is clicked', async () => {
        const user = userEvent.setup();
        render(<HotelImageGallery images={mockImages} hotelName={mockHotelName} />);
        
        // Click on third navigation dot
        const thirdThumbnail = screen.getByAltText(`${mockHotelName} thumbnail 3`);
        await user.click(thirdThumbnail);
        
        // Main image should update to third image
        await waitFor(() => {
          const mainImage = screen.getByAltText(`${mockHotelName} - Image 3`);
          expect(mainImage).toHaveAttribute('src', mockImages[2]);
        });
      });

      it('should limit navigation dots to first 4 images', () => {
        const manyImages = [
          'https://example.com/image1.jpg',
          'https://example.com/image2.jpg',
          'https://example.com/image3.jpg',
          'https://example.com/image4.jpg',
          'https://example.com/image5.jpg',
          'https://example.com/image6.jpg',
          'https://example.com/image7.jpg'
        ];
        
        render(<HotelImageGallery images={manyImages} hotelName={mockHotelName} />);
        
        // Should only show first 4 thumbnails
        const thumbnails = screen.getAllByAltText(/thumbnail/);
        expect(thumbnails).toHaveLength(4);
        
        // Should display correct total photo count
        const photoButton = screen.getByTestId('button');
        expect(photoButton).toHaveTextContent('7 Photos');
      });
    });

    describe('Hover Effects', () => {
      it('should apply hover effects to main image', async () => {
        const user = userEvent.setup();
        render(<HotelImageGallery images={mockImages} hotelName={mockHotelName} />);
        
        const mainImage = screen.getByAltText(`${mockHotelName} - Image 1`);
        
        // Hover over main image
        await user.hover(mainImage);
        
        // Note: CSS hover effects are not directly testable in JSDOM
        // But we can verify the image is present and has the correct classes
        expect(mainImage).toHaveClass('w-full', 'h-full', 'object-cover');
      });

      it('should apply hover effects to thumbnails', async () => {
        const user = userEvent.setup();
        render(<HotelImageGallery images={mockImages} hotelName={mockHotelName} />);
        
        const firstThumbnail = screen.getByAltText(`${mockHotelName} thumbnail 1`);
        
        // Hover over thumbnail
        await user.hover(firstThumbnail);
        
        // Verify thumbnail has transition classes
        expect(firstThumbnail.parentElement).toHaveClass('transition-all');
      });
    });

    describe('Fallback and Error Handling', () => {
      it('should display default placeholder images when no images provided', () => {
        render(<HotelImageGallery images={[]} hotelName={mockHotelName} />);
        
        // Should show "No Images Available" message
        expect(screen.getByText('No Images Available')).toBeInTheDocument();
        expect(screen.getByText(/We don't have any photos of Test Hotel at the moment/)).toBeInTheDocument();
        
        // Should display ImageOff icon
        expect(screen.getByTestId('image-off-icon')).toBeInTheDocument();
        
        // Should show "No Photos" button
        const noPhotosButton = screen.getByTestId('button');
        expect(noPhotosButton).toHaveTextContent('No Photos');
      });

      it('should display default placeholder images when images array is undefined', () => {
        render(<HotelImageGallery images={undefined} hotelName={mockHotelName} />);
        
        // Should show "No Images Available" message
        expect(screen.getByText('No Images Available')).toBeInTheDocument();
        expect(screen.getByTestId('image-off-icon')).toBeInTheDocument();
      });

      it('should display default placeholder images when images array is null', () => {
        render(<HotelImageGallery images={null as any} hotelName={mockHotelName} />);
        
        // Should show "No Images Available" message
        expect(screen.getByText('No Images Available')).toBeInTheDocument();
        expect(screen.getByTestId('image-off-icon')).toBeInTheDocument();
      });

      it('should filter out invalid image URLs', () => {
        const invalidImages = [
          '',
          'undefined',
          'null',
          'https://example.com/valid.jpg',
          '   ',
          'https://example.com/another-valid.jpg'
        ];
        
        render(<HotelImageGallery images={invalidImages} hotelName={mockHotelName} />);
        
        // Should only show valid images (2 valid URLs)
        const mainImage = screen.getByAltText(`${mockHotelName} - Image 1`);
        expect(mainImage).toHaveAttribute('src', 'https://example.com/valid.jpg');
        
        // Should display correct photo count
        const photoButton = screen.getByTestId('button');
        expect(photoButton).toHaveTextContent('2 Photos');
      });

      it('should handle image load errors gracefully', async () => {
        // Mock console.error to avoid noise in tests
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        render(<HotelImageGallery images={mockImages} hotelName={mockHotelName} />);
        
        const mainImage = screen.getByAltText(`${mockHotelName} - Image 1`);
        
        // Simulate image load error
        fireEvent.error(mainImage);
        
        // Should attempt to load next image or fallback
        await waitFor(() => {
          // The component should handle the error internally
          expect(mainImage).toBeInTheDocument();
        });
        
        consoleSpy.mockRestore();
      });
    });

    describe('Smooth Transitions and UX', () => {
      it('should have smooth transitions between images', () => {
        render(<HotelImageGallery images={mockImages} hotelName={mockHotelName} />);
        
        // Verify transition classes are present
        const thumbnails = screen.getAllByAltText(/thumbnail/);
        thumbnails.forEach(thumbnail => {
          expect(thumbnail.parentElement).toHaveClass('transition-all');
        });
      });

      it('should maintain aspect ratio and responsive design', () => {
        render(<HotelImageGallery images={mockImages} hotelName={mockHotelName} />);
        
        // Main image container should have aspect ratio
        const mainImageContainer = screen.getByAltText(`${mockHotelName} - Image 1`).parentElement;
        expect(mainImageContainer).toHaveClass('aspect-[4/3]');
        
        // Thumbnails should be responsive
        const thumbnails = screen.getAllByAltText(/thumbnail/);
        thumbnails.forEach(thumbnail => {
          expect(thumbnail.parentElement).toHaveClass('flex-1');
        });
      });

      it('should handle rapid thumbnail clicks without breaking', async () => {
        const user = userEvent.setup();
        render(<HotelImageGallery images={mockImages} hotelName={mockHotelName} />);
        
        const thumbnails = screen.getAllByAltText(/thumbnail/);
        
        // Rapidly click through thumbnails
        await user.click(thumbnails[1]);
        await user.click(thumbnails[3]);
        await user.click(thumbnails[0]);
        await user.click(thumbnails[2]);
        
        // Should end up on the last clicked image
        await waitFor(() => {
          const mainImage = screen.getByAltText(`${mockHotelName} - Image 3`);
          expect(mainImage).toHaveAttribute('src', mockImages[2]);
        });
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty string images', () => {
        const emptyStringImages = ['', 'https://example.com/valid.jpg', ''];
        render(<HotelImageGallery images={emptyStringImages} hotelName={mockHotelName} />);
        
        // Should only show valid image
        const mainImage = screen.getByAltText(`${mockHotelName} - Image 1`);
        expect(mainImage).toHaveAttribute('src', 'https://example.com/valid.jpg');
        
        // Should display correct photo count
        const photoButton = screen.getByTestId('button');
        expect(photoButton).toHaveTextContent('1 Photo');
      });

      it('should handle whitespace-only images', () => {
        const whitespaceImages = ['   ', 'https://example.com/valid.jpg', '  \n  '];
        render(<HotelImageGallery images={whitespaceImages} hotelName={mockHotelName} />);
        
        // Should only show valid image
        const mainImage = screen.getByAltText(`${mockHotelName} - Image 1`);
        expect(mainImage).toHaveAttribute('src', 'https://example.com/valid.jpg');
        
        // Should display correct photo count
        const photoButton = screen.getByTestId('button');
        expect(photoButton).toHaveTextContent('1 Photo');
      });

      it('should handle mixed valid and invalid image formats', () => {
        const mixedImages = [
          'https://example.com/valid1.jpg',
          { url: 'https://example.com/valid2.jpg' },
          'invalid-url',
          { url: '' },
          'https://example.com/valid3.jpg'
        ];
        
        render(<HotelImageGallery images={mixedImages} hotelName={mockHotelName} />);
        
        // Should show first valid image
        const mainImage = screen.getByAltText(`${mockHotelName} - Image 1`);
        expect(mainImage).toHaveAttribute('src', 'https://example.com/valid1.jpg');
        
        // Should display correct photo count (4 valid images - 'invalid-url' is considered valid)
        const photoButton = screen.getByTestId('button');
        expect(photoButton).toHaveTextContent('4 Photos');
      });
    });
  });
});
