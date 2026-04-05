import React from 'react';
import { render, screen } from '@testing-library/react';
import { SellerCard } from './seller-card';

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()})}));

describe('SellerCard', () => {
  const mockProps = {
    id: '1',
    name: 'Test Store',
    rating: 4,
    description: 'Test description',
    imageUrl: '/test-image.jpg',
    category: 'Electrónica'};

  it('renders seller information correctly', () => {
    render(<SellerCard seller={mockProps} />);

    // Check if name is rendered
    expect(screen.getByText(mockProps.name)).toBeInTheDocument();

    // Check if description is rendered
    expect(screen.getByText(mockProps.description)).toBeInTheDocument();

    // Check if rating stars are rendered
    const stars = screen.getAllByTestId('star');
    expect(stars).toHaveLength(mockProps.rating);

    // Check if visit button is rendered
    expect(screen.getByText('Visitar Tienda')).toBeInTheDocument();
  });

  it('renders image with correct attributes', () => {
    render(<SellerCard seller={mockProps} />);

    const image = screen.getByRole('img', { hidden: true });
    expect(image.getAttribute('src')).toContain('test-image.jpg');
    expect(image).toHaveAttribute('alt', `${mockProps.name} banner`);
  });
}); 