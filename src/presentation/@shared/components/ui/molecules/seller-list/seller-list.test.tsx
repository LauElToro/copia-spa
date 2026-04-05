import { render } from '@testing-library/react';
import { SellerList } from './index';

describe('SellerList', () => {
  it('renders without crashing', () => {
    render(
      <SellerList
        sellers={[]}
        categories={[]}
        selectedCategory={''}
        onCategorySelect={() => {}}
      />
    );
  });
}); 