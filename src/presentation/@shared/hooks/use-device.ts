import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface DeviceInfo {
  device: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
}

const useDevice = (): DeviceInfo => {
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    const getDevice = (width: number): DeviceType => {
      if (width < 768) return 'mobile';
      if (width >= 768 && width < 1024) return 'tablet';
      return 'desktop';
    };

    const handleResize = () => {
      const currentWidth = globalThis.window.innerWidth;
      setWidth(currentWidth);
      setDevice(getDevice(currentWidth));
    };

    handleResize();

    globalThis.window.addEventListener('resize', handleResize);

    return () => {
      globalThis.window.removeEventListener('resize', handleResize);
    };
  }, []);

  return {
    device,
    isMobile: device === 'mobile',
    isTablet: device === 'tablet',
    isDesktop: device === 'desktop',
    width,
  };
};

export default useDevice; 