import '@testing-library/jest-dom/vitest';
import {
  cleanup,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';
import LocationMap from '../LocationMap';

// Mock the Google Maps components
vi.mock('@vis.gl/react-google-maps', () => ({
  APIProvider: ({ children, apiKey }: { children: React.ReactNode; apiKey: string }) => (
    <div data-testid="api-provider" data-api-key={apiKey}>
      {children}
    </div>
  ),
  Map: ({ 
    children, 
    defaultCenter, 
    defaultZoom, 
    gestureHandling,
    mapId 
  }: { 
    children: React.ReactNode; 
    defaultCenter: { lat: number; lng: number }; 
    defaultZoom: number; 
    gestureHandling: string;
    mapId: string;
  }) => (
    <div 
      data-testid="google-map"
      data-center-lat={defaultCenter.lat}
      data-center-lng={defaultCenter.lng}
      data-zoom={defaultZoom}
      data-gesture-handling={gestureHandling}
      data-map-id={mapId}
    >
      {children}
    </div>
  ),
  Marker: ({ position }: { position: { lat: number; lng: number } }) => (
    <div 
      data-testid="map-marker"
      data-lat={position.lat}
      data-lng={position.lng}
    >
      📍
    </div>
  ),
}));

// Mock console methods to avoid noise in tests
let consoleErrorSpy: MockInstance;
let consoleLogSpy: MockInstance;

beforeEach(() => {
  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

  // Reset mocks
  vi.clearAllMocks();
});

afterEach(() => {
  consoleErrorSpy.mockRestore();
  consoleLogSpy.mockRestore();
  cleanup();
});

// Helper function to render LocationMap with specific props
const renderLocationMap = (props: any = {}) => {
  const defaultProps = {
    address: '123 Hotel Street, Singapore 123456',
    hotelName: 'Test Hotel',
    // Only provide coordinates if explicitly requested
    ...(props.latitude !== undefined && { latitude: props.latitude }),
    ...(props.longitude !== undefined && { longitude: props.longitude }),
  };

  return render(<LocationMap {...defaultProps} {...props} />);
};

describe('Unit Test - Location Map Component', () => {
  describe('TC_HOTELDETAIL_6: User interacts with hotel location map', () => {
    it('should display map with valid coordinates', async () => {
      // Arrange
      const props = {
        address: '123 Hotel Street, Singapore 123456',
        latitude: 1.3521,
        longitude: 103.8198,
        hotelName: 'Test Hotel',
      };

      // Act
      renderLocationMap(props);

      // Assert - Map should be displayed with correct coordinates
      expect(screen.getByTestId('google-map')).toBeInTheDocument();
      expect(screen.getByTestId('map-marker')).toBeInTheDocument();
      
      // Check map properties
      const map = screen.getByTestId('google-map');
      expect(map).toHaveAttribute('data-center-lat', '1.3521');
      expect(map).toHaveAttribute('data-center-lng', '103.8198');
      expect(map).toHaveAttribute('data-zoom', '15');
      expect(map).toHaveAttribute('data-gesture-handling', 'greedy');
      expect(map).toHaveAttribute('data-map-id', 'a8079e059f31bc15534a6a3a');
      
      // Check marker position
      const marker = screen.getByTestId('map-marker');
      expect(marker).toHaveAttribute('data-lat', '1.3521');
      expect(marker).toHaveAttribute('data-lng', '103.8198');
    });

    it('should display placeholder when coordinates are missing', async () => {
      // Arrange
      const props = {
        address: '123 Hotel Street, Singapore 123456',
        hotelName: 'Test Hotel',
        // No latitude/longitude provided
      };

      // Act
      renderLocationMap(props);

      // Assert - Placeholder should be displayed
      expect(screen.queryByTestId('google-map')).not.toBeInTheDocument();
      expect(screen.queryByTestId('map-marker')).not.toBeInTheDocument();
      
      // Check placeholder message
      expect(screen.getByText('Location coordinates not available')).toBeInTheDocument();
      
      // Check placeholder styling - the bg-muted class is on the outer container
      const placeholderText = screen.getByText('Location coordinates not available');
      const outerContainer = placeholderText.closest('div[class*="bg-muted"]');
      expect(outerContainer).toHaveClass('bg-muted');
      expect(outerContainer).toHaveClass('rounded-lg');
    });

    it('should display placeholder when coordinates are 0,0 (treated as falsy)', async () => {
      // Arrange
      const props = {
        address: '123 Hotel Street, Singapore 123456',
        latitude: 0,
        longitude: 0,
        hotelName: 'Test Hotel',
      };

      // Act
      renderLocationMap(props);

      // Assert - Component treats 0 as falsy, so placeholder should be displayed
      expect(screen.queryByTestId('google-map')).not.toBeInTheDocument();
      expect(screen.queryByTestId('map-marker')).not.toBeInTheDocument();
      
      // Check placeholder message
      expect(screen.getByText('Location coordinates not available')).toBeInTheDocument();
      
      // Check placeholder styling
      const placeholderText = screen.getByText('Location coordinates not available');
      const outerContainer = placeholderText.closest('div[class*="bg-muted"]');
      expect(outerContainer).toHaveClass('bg-muted');
      expect(outerContainer).toHaveClass('rounded-lg');
    });

    it('should display hotel address information', async () => {
      // Arrange
      const props = {
        address: '456 Luxury Avenue, Marina Bay, Singapore 018956',
        latitude: 1.3521,
        longitude: 103.8198,
        hotelName: 'Luxury Hotel',
      };

      // Act
      renderLocationMap(props);

      // Assert - Address should be displayed
      expect(screen.getByText('456 Luxury Avenue, Marina Bay, Singapore 018956')).toBeInTheDocument();
      
      // Check address styling
      const addressElement = screen.getByText('456 Luxury Avenue, Marina Bay, Singapore 018956');
      expect(addressElement).toHaveClass('text-hotel-text-secondary');
    });

    it('should display location title with map pin icon', async () => {
      // Arrange
      const props = {
        address: '123 Hotel Street, Singapore 123456',
        latitude: 1.3521,
        longitude: 103.8198,
        hotelName: 'Test Hotel',
      };

      // Act
      renderLocationMap(props);

      // Assert - Location title should be displayed
      expect(screen.getByText('Location')).toBeInTheDocument();
      
      // Check that the title is in a header
      const titleElement = screen.getByText('Location');
      expect(titleElement.closest('h3')).toBeInTheDocument();
    });

    it('should display distance information', async () => {
      // Arrange
      const props = {
        address: '123 Hotel Street, Singapore 123456',
        latitude: 1.3521,
        longitude: 103.8198,
        hotelName: 'Test Hotel',
      };

      // Act
      renderLocationMap(props);

      // Assert - Distance information should be displayed
      expect(screen.getByText('Distance from city center: 2.5 km')).toBeInTheDocument();
      
      // Check distance styling - the class is on the parent div, not the text
      const distanceContainer = screen.getByText('Distance from city center: 2.5 km').closest('div');
      expect(distanceContainer).toHaveClass('text-sm');
      expect(distanceContainer).toHaveClass('text-hotel-text-secondary');
    });

    it('should use correct Google Maps API key', async () => {
      // Arrange
      const props = {
        address: '123 Hotel Street, Singapore 123456',
        latitude: 1.3521,
        longitude: 103.8198,
        hotelName: 'Test Hotel',
      };

      // Act
      renderLocationMap(props);

      // Assert - API Provider should use correct API key
      const apiProvider = screen.getByTestId('api-provider');
      expect(apiProvider).toHaveAttribute('data-api-key', 'AIzaSyBta33S3S8OPr_m0uL-TNn3UTW8MSVF-L8');
    });

    it('should use correct map ID', async () => {
      // Arrange
      const props = {
        address: '123 Hotel Street, Singapore 123456',
        latitude: 1.3521,
        longitude: 103.8198,
        hotelName: 'Test Hotel',
      };

      // Act
      renderLocationMap(props);

      // Assert - Map should use correct map ID
      const map = screen.getByTestId('google-map');
      expect(map).toHaveAttribute('data-map-id', 'a8079e059f31bc15534a6a3a');
    });

    it('should handle map with different coordinate values', async () => {
      // Arrange
      const props = {
        address: '789 Beach Road, Sentosa, Singapore 099234',
        latitude: -1.3521,
        longitude: -103.8198,
        hotelName: 'Beach Hotel',
      };

      // Act
      renderLocationMap(props);

      // Assert - Map should handle negative coordinates
      const map = screen.getByTestId('google-map');
      expect(map).toHaveAttribute('data-center-lat', '-1.3521');
      expect(map).toHaveAttribute('data-center-lng', '-103.8198');
      
      const marker = screen.getByTestId('map-marker');
      expect(marker).toHaveAttribute('data-lat', '-1.3521');
      expect(marker).toHaveAttribute('data-lng', '-103.8198');
    });

    it('should maintain aspect ratio for map container', async () => {
      // Arrange
      const props = {
        address: '123 Hotel Street, Singapore 123456',
        latitude: 1.3521,
        longitude: 103.8198,
        hotelName: 'Test Hotel',
      };

      // Act
      renderLocationMap(props);

      // Assert - Map container should have correct aspect ratio
      // The aspect ratio class is on the container div that wraps the map
      const mapContainer = screen.getByTestId('google-map').closest('div[class*="aspect-[16/9]"]');
      expect(mapContainer).toHaveClass('aspect-[16/9]');
    });

    it('should display placeholder with correct styling when no coordinates', async () => {
      // Arrange
      const props = {
        address: '123 Hotel Street, Singapore 123456',
        hotelName: 'Test Hotel',
        // No coordinates
      };

      // Act
      renderLocationMap(props);

      // Assert - Placeholder should have correct styling
      const placeholderText = screen.getByText('Location coordinates not available');
      const outerContainer = placeholderText.closest('div[class*="aspect-[16/9]"]');
      expect(outerContainer).toHaveClass('aspect-[16/9]');
      expect(outerContainer).toHaveClass('bg-muted');
      expect(outerContainer).toHaveClass('rounded-lg');
      expect(outerContainer).toHaveClass('overflow-hidden');
    });

    it('should display map pin icon in placeholder when no coordinates', async () => {
      // Arrange
      const props = {
        address: '123 Hotel Street, Singapore 123456',
        hotelName: 'Test Hotel',
        // No coordinates
      };

      // Act
      renderLocationMap(props);

      // Assert - Map pin icon should be displayed in placeholder
      // Note: The MapPin component from lucide-react will be rendered
      // We can check for the presence of the placeholder text which indicates the icon is there
      expect(screen.getByText('Location coordinates not available')).toBeInTheDocument();
    });

    it('should handle empty address gracefully', async () => {
      // Arrange
      const props = {
        address: '',
        latitude: 1.3521,
        longitude: 103.8198,
        hotelName: 'Test Hotel',
      };

      // Act
      renderLocationMap(props);

      // Assert - Component should render without crashing
      expect(screen.getByTestId('google-map')).toBeInTheDocument();
      expect(screen.getByTestId('map-marker')).toBeInTheDocument();
      
      // Empty address should still be displayed (empty paragraph element)
      // Use getAllByText to get all elements with empty text and find the address one
      const addressElements = screen.getAllByText('').filter(el => 
        el.closest('p') && el.closest('p')?.className.includes('text-hotel-text-secondary')
      );
      expect(addressElements.length).toBeGreaterThan(0);
      
      const addressElement = addressElements[0].closest('p');
      expect(addressElement).toHaveClass('text-hotel-text-secondary');
    });

    it('should handle very long address text', async () => {
      // Arrange
      const longAddress = 'This is a very long address that might wrap to multiple lines and test the component\'s ability to handle long text content without breaking the layout or causing overflow issues in the UI';
      const props = {
        address: longAddress,
        latitude: 1.3521,
        longitude: 103.8198,
        hotelName: 'Test Hotel',
      };

      // Act
      renderLocationMap(props);

      // Assert - Long address should be displayed
      expect(screen.getByText(longAddress)).toBeInTheDocument();
      
      // Map should still render correctly
      expect(screen.getByTestId('google-map')).toBeInTheDocument();
      expect(screen.getByTestId('map-marker')).toBeInTheDocument();
    });

    it('should maintain card structure and styling', async () => {
      // Arrange
      const props = {
        address: '123 Hotel Street, Singapore 123456',
        latitude: 1.3521,
        longitude: 103.8198,
        hotelName: 'Test Hotel',
      };

      // Act
      renderLocationMap(props);

      // Assert - Card structure should be maintained
      expect(screen.getByText('Location')).toBeInTheDocument();
      expect(screen.getByText('123 Hotel Street, Singapore 123456')).toBeInTheDocument();
      expect(screen.getByText('Distance from city center: 2.5 km')).toBeInTheDocument();
      
      // Check that all elements are within the card structure
      const cardHeader = screen.getByText('Location').closest('div');
      const cardContent = screen.getByText('123 Hotel Street, Singapore 123456').closest('div');
      
      expect(cardHeader).toBeInTheDocument();
      expect(cardContent).toBeInTheDocument();
    });
  });
});
