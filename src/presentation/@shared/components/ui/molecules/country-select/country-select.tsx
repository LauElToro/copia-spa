import React from "react";
import Select, { SingleValue } from "react-select";
import { useThemeMode } from "@/presentation/@shared/contexts/theme-mode-context";
import countries from "../../../../../../data/paises.json";

interface CountrySelectProps {
  value: string;
  onChange: (countryName: string, phoneCode: string) => void;
}

interface CountryOption {
  label: string;
  value: string;
  phoneCode: string;
}

export const CountrySelect: React.FC<CountrySelectProps> = ({ value, onChange }) => {
  const { mode } = useThemeMode();

  const isLight = mode === "light";
  const backgroundColor = isLight ? "#ffffff" : "#080908";
  const textColor = isLight ? "#111827" : "#F9FAFB";
  const borderColor = isLight ? "#080908" : "#ffff";
  const focusBorderColor = isLight ? "#16A34A" : "#9af0c0";
  const placeholderColor = isLight ? "#080908" : "#9CA3AF";
  const menuBgColor = isLight ? "#ffffff" : "#080908";
  const focusBoxShadowColor = isLight
    ? "rgba(22, 163, 74, 0.25)"
    : "rgba(154, 240, 192, 0.25)";
  const optionHoverBg = isLight ? "#F3F4F6" : "#333333";
  const menuBoxShadow = isLight
    ? "0 4px 12px rgba(0, 0, 0, 0.1)"
    : "0 4px 12px rgba(255, 255, 255, 0.05)";

  const options: CountryOption[] = countries.map((c) => ({
    label: `${c.name} (+${c.phone_code})`,
    value: c.name,
    phoneCode: `+${c.phone_code}`}));

  const selectedOption = options.find((opt) => opt.value === value) || null;

  const handleChange = (selected: SingleValue<CountryOption>) => {
    if (selected) {
      onChange(selected.value, selected.phoneCode);
    }
  };

  return (
    <div className="w-full">
      <Select
        options={options}
        value={selectedOption}
        onChange={handleChange}
        placeholder="Seleccionar país..."
        classNamePrefix="country-select"
        isSearchable
        styles={{
          control: (base, state) => ({
            ...base,
            backgroundColor,
            borderColor: state.isFocused ? focusBorderColor : borderColor,
            boxShadow: state.isFocused
              ? `0 0 0 0.15rem ${focusBoxShadowColor}`
              : "none",
            "&:hover": { borderColor: focusBorderColor },
            borderRadius: "0.25rem",
            padding: "2px",
            cursor: "pointer",
            minHeight: "2rem",
            color: textColor}),
          menu: (base) => ({
            ...base,
            backgroundColor: menuBgColor,
            zIndex: 50,
            borderRadius: "0.5rem",
            boxShadow: menuBoxShadow}),
          placeholder: (base) => ({
            ...base,
            color: placeholderColor}),
          singleValue: (base) => ({
            ...base,
            color: textColor}),
          input: (base) => ({
            ...base,
            color: textColor}),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused ? optionHoverBg : "transparent",
            color: textColor,
            cursor: "pointer"})}}
      />
    </div>
  );
};
