import { render } from '@testing-library/react';
import Footer from './footer';
import { ThemeModeProvider } from '@/presentation/@shared/contexts/theme-mode-context';
import { LanguageProvider } from '@/presentation/@shared/contexts/language-context';

// Mock ImageSwiper to avoid Swiper ES module issues
jest.mock('../image-swiper', () => {
  return function MockImageSwiper() {
    return <div data-testid="image-swiper">Mocked ImageSwiper</div>;
  };
});

describe('Footer', () => {
  it('renders without crashing', () => {
    render(
      <LanguageProvider>
        <ThemeModeProvider>
          <Footer />
        </ThemeModeProvider>
      </LanguageProvider>
    );
  });
}); 