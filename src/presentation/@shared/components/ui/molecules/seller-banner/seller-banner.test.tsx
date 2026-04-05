import { render } from '@testing-library/react';
import { SellerBanner } from './index';

describe('SellerBanner', () => {
  it('renders without crashing', () => {
    render(
      <SellerBanner
        title="Test Title"
        description="Test description"
        imageUrl="/test.jpg"
      />
    );
  });
}); 