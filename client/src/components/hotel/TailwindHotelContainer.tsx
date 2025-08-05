import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { TailwindHotelWidget } from './TailwindHotelWidget';

interface TailwindHotelContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const TailwindHotelContainer: React.FC<TailwindHotelContainerProps> = ({ 
  children, 
  className = '' 
}) => {
  const widgetRef = useRef<TailwindHotelWidget | null>(null);

  useEffect(() => {
    // Ensure the custom element is defined
    if (!customElements.get('tailwind-hotel-widget')) {
      customElements.define('tailwind-hotel-widget', TailwindHotelWidget);
    }
  }, []);

  useEffect(() => {
    if (widgetRef.current) {
      // Convert React children to HTML string
      const tempDiv = document.createElement('div');
      tempDiv.className = className;
      
      // Create a temporary React root to render children
      const root = createRoot(tempDiv);
      root.render(<>{children}</>);
      
      // Get the HTML content
      const htmlContent = tempDiv.innerHTML;
      
      // Set the content in the Web Component
      widgetRef.current.setContent(htmlContent);
      
      // Cleanup
      root.unmount();
    }
  }, [children, className]);

  return (
    <tailwind-hotel-widget 
      ref={widgetRef as any}
      className={className}
    />
  );
};

// Alternative approach using a simpler method
export const TailwindHotelContainerSimple: React.FC<TailwindHotelContainerProps> = ({ 
  children, 
  className = '' 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ensure the custom element is defined
    if (!customElements.get('tailwind-hotel-widget')) {
      customElements.define('tailwind-hotel-widget', TailwindHotelWidget);
    }
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      const widget = containerRef.current.querySelector('tailwind-hotel-widget') as TailwindHotelWidget;
      if (widget) {
        // Convert children to HTML string
        const htmlString = `
          <div class="${className}">
            ${children}
          </div>
        `;
        widget.setContent(htmlString);
      }
    }
  }, [children, className]);

  return (
    <div ref={containerRef}>
      <tailwind-hotel-widget />
    </div>
  );
}; 