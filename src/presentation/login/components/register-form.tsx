import { AuthCardForm } from "@/presentation/login/components";
import { useSearchParams } from "next/navigation";
import {
  RegisterFormData,
  RegisterType,
  LoginTypesEnum,
  DocumentType,
  DocumentTypeOption} from "@/presentation/@shared/types/login";
import { Input } from "@/presentation/@shared/components/ui/atoms/input";
import { Select } from "@/presentation/@shared/components/ui/atoms/select";
import { SelectChangeEvent } from "@mui/material";
import {
  FaEnvelope,
  FaIdCard,
  FaLock,
  FaStore,
  FaUser,
  FaPhone,
  FaPlus,
  FaFire,
  FaList} from "react-icons/fa";
import { CountrySelect } from "@/presentation/@shared/components/ui/molecules/country-select/country-select";
import { AnimatedSection } from "@/presentation/@shared/components/ui/atoms/animated-section";
import { Image } from "@/presentation/@shared/components/ui/atoms/image";
import { useLanguage } from "@/presentation/@shared/hooks/use-language";
import { getDocumentPlaceholder, getDocumentInputType, formatDocumentNumber } from "@/presentation/@shared/helpers/document-validators";

export interface RegisterFormProps {
  formData: RegisterFormData;
  buttonLoading?: boolean;
  planOptions?: Array<{ value: string; label: string }>;
  plansLoading?: boolean;
  // 👇 Cambiamos el tipo de value a string | boolean para que acepte el checkbox
  handleInputChange: (field: keyof RegisterFormData, value: string | boolean) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const getLabelByType = (t: { auth: { registerUser: string; registerCommerce: string; registerSeller: string; name: string; commerceName: string; email: string; commerceEmail: string } }): Record<
  RegisterType,
  {
    type: string;
    name: string;
    email: string;
  }
> => ({
  user: {
    type: t.auth.registerUser,
    name: t.auth.name,
    email: t.auth.email},
  commerce: {
    type: t.auth.registerCommerce,
    name: t.auth.commerceName,
    email: t.auth.commerceEmail},
  seller: {
    type: t.auth.registerSeller,
    name: t.auth.commerceName,
    email: t.auth.commerceEmail}});

// Este array ahora es solo para fallback, los planes reales vienen del hook usePlans
const getPlanOptionsFallback = (t: { auth: { selectPlan: string } }) => [
  { value: "", label: t.auth.selectPlan },
  { value: "Plan Starter", label: "Plan Starter - Gratuito" },
  { value: "Plan Liberty - Monthly", label: "Plan Liberty - USD 20/mes" },
  { value: "Plan Liberty - Annual", label: "Plan Liberty - USD 216/año" },
  { value: "Plan Pro Liberty - Monthly", label: "Plan Pro Liberty - USD 269/mes" },
  { value: "Plan Pro Liberty - Annual", label: "Plan Pro Liberty - USD 2,905/año" },
  { value: "Plan Experiencia Liberty - Monthly", label: "Plan Experiencia Liberty - USD 697/mes" },
  { value: "Plan Experiencia Liberty - Annual", label: "Plan Experiencia Liberty - USD 7,524/año" },
];

const getDocumentTypeOptions = (): DocumentTypeOption[] => [
  { value: "DNI", label: "DNI" },
  { value: "LC", label: "LC (Libreta Cívica)" },
  { value: "LE", label: "LE (Libreta de Enrolamiento)" },
  { value: "PASAPORTE", label: "Pasaporte" },
  { value: "CUIL", label: "CUIL" },
  { value: "CUIT", label: "CUIT" },
];

export const RegisterForm: React.FC<RegisterFormProps> = ({
  handleInputChange,
  onSubmit,
  buttonLoading,
  formData,
  planOptions: planOptionsProp,
  plansLoading}) => {
  const params = useSearchParams();
  const type = params.get("type") as RegisterType;
  const { t } = useLanguage();

  // Handle loading state for translations
  if (!t || !t.auth) {
    return (
      <div className="login-background">
        <div className="login-page">
          <div className="row align-items-center justify-content-center">
            <div className="col-12 text-center">
              Loading...
            </div>
          </div>
        </div>
      </div>
    );
  }

  const labelByType = getLabelByType(t);
  // Usar planes desde props o fallback
  const planOptions = planOptionsProp || getPlanOptionsFallback(t);
  const isCommerceOrSeller = type === LoginTypesEnum.COMMERCE || type === LoginTypesEnum.SELLER;

  // Validate type exists in labelByType
  if (!type || !labelByType[type]) {
    return (
      <div className="login-background">
        <div className="login-page">
          <div className="row align-items-center justify-content-center">
            <div className="col-12 text-center">
              Invalid registration type
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isFormComplete = (): boolean => {
    const basicFieldsComplete = !!(
      formData.name?.trim() &&
      formData.email?.trim() &&
      formData.password?.trim() &&
      formData.confirmPassword?.trim() &&
      formData.country?.trim() &&
      formData.termsAccepted // 👈 debe estar tildado
    );

    const hasAnyPhoneField = !!(
      formData.phoneCountryCode?.trim() ||
      formData.phoneAreaCode?.trim() ||
      formData.phoneNumber?.trim()
    );

    const phoneComplete =
      !hasAnyPhoneField ||
      !!(
        formData.phoneCountryCode?.trim() &&
        formData.phoneAreaCode?.trim() &&
        formData.phoneNumber?.trim()
      );

    if (type === LoginTypesEnum.USER) {
      const hasDocument = !!(formData.documentType && formData.documentNumber?.trim()) || !!formData.dni?.trim();
      return basicFieldsComplete && phoneComplete && hasDocument;
    } else if (isCommerceOrSeller) {
      return basicFieldsComplete && phoneComplete && !!formData.plan?.trim();
    }

    return basicFieldsComplete && phoneComplete;
  };

  return (
    <div className="login-background">
      <div className="login-page">
        <div className="row align-items-center">
          {/* Imagen lateral */}
          <div className="col-12 col-md-6 d-flex justify-content-end mb-4-md-0">
            <AnimatedSection direction="left" delay={100}>
              <div className="login-image-container">
                <Image
                  src="/images/login/imglogin2.svg"
                  alt="Login Illustration"
                />
              </div>
            </AnimatedSection>
          </div>

          {/* Formulario */}
          <div className="col-12 col-md-6">
            <AuthCardForm
              title={`${t.auth.register} ${labelByType[type].type}`}
              subtitle={t.auth.completeForm.replace('{type}', labelByType[type].type)}
              type={type}
              onSubmit={onSubmit}
              buttonText={t.auth.register}
              buttonLoading={buttonLoading}
              buttonDisabled={!isFormComplete()}
            >
              <div className="row row-gap-3">
                {/* Name */}
                <div className="col-12 col-md-6">
                  <Input
                    id="name"
                    value={formData.name}
                    type="text"
                    placeholder={labelByType[type].name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    leftIcon={
                      type === LoginTypesEnum.USER ? <FaUser /> : <FaStore />
                    }
                  />
                </div>

                {/* LastName - Solo para usuarios */}
                {type === LoginTypesEnum.USER && (
                  <div className="col-12 col-md-6">
                    <Input
                      id="lastName"
                      value={formData.lastName || ""}
                      type="text"
                      placeholder={t.auth.lastName || "Apellido"}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      leftIcon={<FaUser />}
                    />
                  </div>
                )}

                {/* Email */}
                <div className="col-12 col-md-6">
                  <Input
                    id="email"
                    value={formData.email}
                    type="email"
                    placeholder={labelByType[type].email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    leftIcon={<FaEnvelope />}
                  />
                </div>

                {/* Documento o Plan */}
                <div className="col-12 col-md-6">
                  {type === LoginTypesEnum.USER ? (
                    <div className="row row-gap-3">
                      <div className="col-12 col-md-4">
                        <Select
                          className="custom-select"
                          id="documentType"
                          value={formData.documentType || ""}
                          onChange={(e: SelectChangeEvent<unknown>) => {
                            const newType = String(e.target.value);
                            handleInputChange("documentType", newType);
                            // Limpiar el número de documento cuando cambia el tipo
                            if (formData.documentNumber) {
                              handleInputChange("documentNumber", "");
                            }
                          }}
                          leftIcon={<FaIdCard />}
                          options={[
                            { value: "", label: "Tipo" },
                            ...getDocumentTypeOptions()
                          ]}
                        />
                      </div>
                      <div className="col-12 col-md-8">
                        <Input
                          id="documentNumber"
                          value={formData.documentNumber || ""}
                          type={getDocumentInputType(formData.documentType as DocumentType)}
                          placeholder={getDocumentPlaceholder(formData.documentType as DocumentType)}
                          onChange={(e) => {
                            let value = e.target.value;
                            // Formatear automáticamente para CUIL/CUIT
                            if (formData.documentType === "CUIL" || formData.documentType === "CUIT") {
                              value = formatDocumentNumber(formData.documentType as DocumentType, value);
                            }
                            handleInputChange("documentNumber", value);
                          }}
                          leftIcon={<FaIdCard />}
                          disabled={!formData.documentType}
                        />
                      </div>
                    </div>
                  ) : (
                    <Select
                      className="custom-select"
                      id="plan"
                      value={formData.plan}
                      onChange={(e: SelectChangeEvent<unknown>) => handleInputChange("plan", String(e.target.value))}
                      leftIcon={<FaList />}
                      options={planOptions}
                      disabled={plansLoading}
                    />
                  )}
                </div>

                {/* Country */}
                <div className="col-12 col-md-6">
                  <CountrySelect
                    value={formData.country}
                    onChange={(country, phoneCode) => {
                      handleInputChange("country", country);
                      handleInputChange("phoneCountryCode", phoneCode);
                    }}
                  />
                </div>

                {/* Password */}
                <div className="col-12 col-md-6">
                  <Input
                    id="password"
                    value={formData.password}
                    type="password"
                    placeholder={t.auth.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    leftIcon={<FaLock />}
                  />
                </div>

                {/* Confirm Password */}
                <div className="col-12 col-md-6">
                  <Input
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    type="password"
                    placeholder={t.auth.repeatPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    leftIcon={<FaLock />}
                  />
                </div>

                {/* Teléfono */}
                <div className="col-12">
                  <div className="row row-gap-3">
                    <div className="col-6 col-md-3 col-lg-2 phone-metadata-input">
                      <Input
                        id="phoneCountryCode"
                        placeholder="+57"
                        value={formData.phoneCountryCode}
                        type="text"
                        leftIcon={<FaPhone />}
                        disabled
                      />
                    </div>
                    <div className="col-6 col-md-3 col-lg-2 phone-metadata-input">
                      <Input
                        id="phoneAreaCode"
                        value={formData.phoneAreaCode}
                        type="text"
                        placeholder={t.auth.phoneAreaCode}
                        onChange={(e) =>
                          handleInputChange("phoneAreaCode", e.target.value)
                        }
                        leftIcon={<FaPlus />}
                      />
                    </div>
                    <div className="col">
                      <Input
                        id="phoneNumber"
                        value={formData.phoneNumber}
                        type="tel"
                        placeholder={t.auth.phone}
                        onChange={(e) =>
                          handleInputChange("phoneNumber", e.target.value)
                        }
                        leftIcon={<FaPhone />}
                      />
                    </div>
                  </div>
                </div>

                {/* Código de referido */}
                {isCommerceOrSeller && (
                  <div className="col-12">
                    <Input
                      id="referralCode"
                      value={formData.referralCode}
                      type="text"
                      placeholder={t.auth.referralCode}
                      onChange={(e) =>
                        handleInputChange("referralCode", e.target.value)
                      }
                      leftIcon={<FaFire />}
                    />
                  </div>
                )}

                {/* Checkbox Términos */}
                <div className="col-12 d-flex justify-content-center">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="terms"
                      checked={!!formData.termsAccepted}
                      onChange={(e) =>
                        handleInputChange("termsAccepted", e.target.checked)
                      }
                    />
                    <label className="form-check-label" htmlFor="terms">
                      {t.auth.acceptTerms}{" "}
                      <a
                        href="/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t.auth.termsAndConditions}
                      </a>
                    </label>
                  </div>
                </div>
              </div>
            </AuthCardForm>
          </div>
        </div>
      </div>
    </div>
  );
};
