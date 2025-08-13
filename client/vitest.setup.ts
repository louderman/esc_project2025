import '@testing-library/jest-dom';

// Mock resize observer, otherwise would throw errro
(global as any).ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

global.ResizeObserver = ResizeObserver;
