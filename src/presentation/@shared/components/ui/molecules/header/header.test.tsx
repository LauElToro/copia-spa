import { render } from '@testing-library/react';
import { Header } from './header';
import { LanguageProvider } from '@/presentation/@shared/contexts/language-context';
 
describe('Header', () => {
  it('renders without crashing', () => {
    render(
      <LanguageProvider>
        <Header />
      </LanguageProvider>
    );
  });
}); 