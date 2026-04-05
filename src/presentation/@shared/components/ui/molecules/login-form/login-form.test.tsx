import { render } from '@testing-library/react';
import { LoginForm } from './login-form';
import { ThemeModeProvider } from "@/presentation/@shared/contexts/theme-mode-context";
import { LanguageProvider } from '@/presentation/@shared/contexts/language-context';

describe('LoginForm', () => {
  it('renders without crashing', () => {
    render(
      <LanguageProvider>
        <ThemeModeProvider>
          <LoginForm
            formData={{ email: '', password: '' }}
            handleInputChange={() => {}}
            onSubmit={() => {}}
            showPassword={false}
            handleShowPassword={() => {}}
          />
        </ThemeModeProvider>
      </LanguageProvider>
    );
  });
}); 