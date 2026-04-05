import { render } from '@testing-library/react';
import { SellerRecommendations } from './index';

describe('SellerRecommendations', () => {
  it('renders without crashing', () => {
    render(
      <SellerRecommendations sellers={[]} />
    );
  });
}); 