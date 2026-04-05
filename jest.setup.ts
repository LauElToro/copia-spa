import "@testing-library/jest-dom";
import React from "react";

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Silenciar warnings de fetchPriority en tests (sin imprimir nada)
beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation((...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes('React does not recognize the `fetchPriority` prop')
    ) {
      return;
    }
    // No imprimir nada
  });
});

// Mock Lottie sin JSX
jest.mock("lottie-react", () => ({
  __esModule: true,
  default: () => React.createElement("div", { "data-testid": "mock-lottie" }),
}));
