import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

export interface ResponsiveValues {
  width: number;
  height: number;
  isSmallDevice: boolean;
  isMediumDevice: boolean;
  isLargeDevice: boolean;
  isTablet: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
  scale: (size: number) => number;
}

/**
 * Custom hook for responsive design
 * @returns Responsive values and helper functions
 */
export const useResponsive = (): ResponsiveValues => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  const { width, height } = dimensions;
  const isPortrait = height > width;
  const isLandscape = width > height;

  // Device breakpoints
  const isSmallDevice = width < 360;
  const isMediumDevice = width >= 360 && width < 600;
  const isLargeDevice = width >= 600 && width < 768;
  const isTablet = width >= 768;

  // Scale function for responsive sizing
  const scale = (size: number): number => {
    if (isSmallDevice) return size * 0.85;
    if (isTablet) return size * 1.2;
    return size;
  };

  return {
    width,
    height,
    isSmallDevice,
    isMediumDevice,
    isLargeDevice,
    isTablet,
    isPortrait,
    isLandscape,
    scale,
  };
};

/**
 * Get responsive size based on device width
 * @param base Base size for medium devices
 * @param small Size for small devices (optional)
 * @param large Size for large devices (optional)
 * @param tablet Size for tablets (optional)
 */
export const getResponsiveSize = (
  base: number,
  small?: number,
  large?: number,
  tablet?: number
): number => {
  const { width } = Dimensions.get('window');
  
  if (width < 360 && small !== undefined) return small;
  if (width >= 600 && width < 768 && large !== undefined) return large;
  if (width >= 768 && tablet !== undefined) return tablet;
  
  return base;
};

/**
 * Get responsive padding/margin values
 */
export const getResponsiveSpacing = () => {
  const { width } = Dimensions.get('window');
  
  if (width < 360) {
    return {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 20,
    };
  }
  
  if (width >= 768) {
    return {
      xs: 8,
      sm: 12,
      md: 16,
      lg: 24,
      xl: 32,
    };
  }
  
  return {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 20,
    xl: 28,
  };
};
