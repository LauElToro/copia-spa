import React from "react";
import { AuthCardForm } from "@/presentation/login/components";
import { FormGroup } from "@/presentation/@shared/components/ui/molecules/form-group";
import { useLanguage } from "@/presentation/@shared/hooks/use-language";

import { RecoveryFormData } from "@/presentation/login/pages/password-recovery-page";
import { defaultTheme as inputTheme } from "@/presentation/@shared/components/ui/atoms/input/theme";

export interface PasswordRecoveryFormProps {
  formData: RecoveryFormData;
  buttonLoading?: boolean;
  handleInputChange: (field: "email", value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export const PasswordRecoveryForm: React.FC<PasswordRecoveryFormProps> = ({
  handleInputChange,
  onSubmit,
  formData,
  buttonLoading,
}) => {
  const { t } = useLanguage();
  
  return (
    <AuthCardForm
      title={t.auth.recoverPassword}
      subtitle={t.auth.recoverPasswordSubtitle}
      onSubmit={onSubmit}
      buttonText={t.auth.sendRecoveryLink}
      buttonLoading={buttonLoading}
      
    > 
      <FormGroup
        label={t.auth.email}
        id="email"
        value={formData.email}
        type="email"
        placeholder={t.auth.email}
        showLabel={false}
        onChange={(e) => handleInputChange("email", e.target.value)}
        variant="input"
        theme={{...inputTheme, states: {
          ...inputTheme.states,
          default: {
            ...inputTheme.states.default,
            height: "3.125rem"
          }
        }}}
      />
    </AuthCardForm>
  );
};
