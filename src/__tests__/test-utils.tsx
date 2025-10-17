import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Mock providers that your app uses
const MockProviders = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid='mock-providers'>{children}</div>;
};

// Custom render function that includes providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: MockProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Common test utilities
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  firstName: 'Test',
  lastName: 'User',
  role: 'member',
  ...overrides,
});

export const createMockFairteiler = (overrides = {}) => ({
  id: 'test-fairteiler-id',
  name: 'Test Fairteiler',
  slug: 'test-fairteiler',
  description: 'Test description',
  address: 'Test Address',
  city: 'Test City',
  postalCode: '12345',
  thumbnail: null,
  ...overrides,
});

export const createMockContribution = (overrides = {}) => ({
  id: 'test-contribution-id',
  quantity: 1.5,
  foodId: 'test-food-id',
  title: 'Test Food Item',
  categoryId: 'test-category-id',
  originId: 'test-origin-id',
  companyId: 'test-company-id',
  company: 'Test Company',
  cool: false,
  shelfLife: null,
  allergens: null,
  comment: null,
  ...overrides,
});

// Mock server action responses
export const createMockActionResponse = <T,>(data?: T, success = true) => ({
  success,
  message: success ? 'Operation successful' : 'Operation failed',
  data,
  ...(success ? {} : { error: 'Test error message' }),
});

// Helper to wait for async operations
export const waitForAsync = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

// Mock file for testing file uploads
export const createMockFile = (name = 'test.jpg', type = 'image/jpeg') => {
  const file = new File(['test content'], name, { type });
  return file;
};
