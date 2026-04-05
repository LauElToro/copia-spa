import { Link } from "../../atoms/link";
import { Text } from "../../atoms/text";
import { Button } from "../../atoms/button";
import { FormGroup } from "../form-group";
import { LoginFormData } from "@/presentation/@shared/helpers/auth-mappers";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUser, FaStore } from "react-icons/fa";
import { AnimatedSection } from "../../atoms/animated-section";
import { Box } from '@mui/material';
import {Image}  from "@/presentation/@shared/components/ui/atoms/image";
import { useThemeMode } from "@/presentation/@shared/contexts/theme-mode-context";
import { useLanguage } from "@/presentation/@shared/hooks/use-language";
import { defaultTheme as linkTheme } from "../../atoms/link/theme";

export interface LoginFormProps {
  formData: LoginFormData;
  buttonLoading?: boolean;
  handleInputChange: (field: "email" | "password", value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  showPassword: boolean;
  handleShowPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  handleInputChange,
  onSubmit,
  formData,
  buttonLoading,
  showPassword,
  handleShowPassword}) => {
  
  const { email, password } = formData;
  const { mode } = useThemeMode();
  const { t } = useLanguage();

  const linkDynamicTheme = {
    ...linkTheme,
    variants: {
      ...linkTheme.variants,
            primary: {
        ...linkTheme.variants.primary,
        color: mode === "light" ? "#000000" : "#ffffff",
        hover: {
          color: mode === "light" ? "var(--bs-primary)" : "#9af0c0"}}}};

  return (
    <section className="login-page container">
      {/* Contenedor principal con fondo */}
      <div className="login-background row">
        {/* Imagen decorativa al lado izquierdo */}
        <div className="login-image-container col-12 col-lg-6">
          <Image src="/images/login/imglogin2.svg" alt="Login Illustration"/>
        </div>

        {/* Contenedor del formulario */}
        <div className="col-12 col-lg-6">
          <Box >
            <AnimatedSection direction="down" delay={200}>
              <Text className="mb-2 mt-3" variant="h3" weight="black">{t.auth.login}</Text>
              <Text className="mb-5 mt-3" variant="h6" weight="normal">{t.auth.welcome}</Text>

              <form onSubmit={onSubmit} className="m-auto d-grid gap-4">
                <FormGroup
                  label={t.auth.email}
                  showLabel={false}
                  id="email"
                  value={email}
                  type="email"
                  placeholder={t.auth.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  variant="input"
                  leftIcon={<FaEnvelope />}
                />

                <FormGroup
                  label={t.auth.password}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  placeholder={t.auth.password}
                  showLabel={false}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  leftIcon={<FaLock />}
                  variant="input"
                  rightIcon={showPassword ? <FaEye onClick={handleShowPassword}/> : <FaEyeSlash onClick={handleShowPassword}/>}
                />

                <div className="mt-2">
                  <Link href="/password-recovery" variant="primary" theme={linkDynamicTheme}>
                    {t.auth.forgotPassword}
                  </Link>
                </div>

                <div className="text-center mt-4">
                  <Button type="submit" size="lg" className="w-75 border-2" disabled={!email || !password} isLoading={buttonLoading}>
                    {t.auth.access}
                  </Button>
                </div>
              </form>

              <div className="mt-5 d-flex gap-1 justify-content-center">
                <Text variant="h6" weight="bold" align="center">{t.auth.noAccount}</Text>
                <Text
                  variant="h6"
                  weight="bold"
                  align="center"
                >
                  {t.auth.register}
                </Text>
              </div>

              <div className="register-button-groups mt-3 mb-3">
                <Link href="/register?type=user">
                  <Button>
                    <Text className="d-flex align-items-center gap-1" variant="span" align="center" style={{fontSize: '14px'}}>
                      <FaUser /> {t.auth.registerAsUser}
                    </Text>
                  </Button>
                </Link>
                <Link href="/register?type=commerce">
                  <Button>
                    <Text className="d-flex align-items-center gap-1" align="center" style={{fontSize: '14px'}}>
                      <FaStore /> {t.auth.registerAsCommerce}
                    </Text>
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
          </Box>
        </div>
      </div>
    </section>
  );
};
