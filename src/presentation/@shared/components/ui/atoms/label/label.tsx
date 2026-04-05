import React from "react";

// Definimos la interfaz para las props del componente Label
interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor?: string;
  children: React.ReactNode;
  showLabel?: boolean;
  className?: string;
}

export const Label: React.FC<LabelProps> = ({
  htmlFor,
  children,
  className = "",
  showLabel = true,
  ...props
}) => {
  const baseClasses = "label";
  const displayClass = showLabel ? "" : "d-none";

  const inputClasses = [baseClasses, displayClass, className]
    .filter(Boolean)
    .join(" ");

  return (
    <label htmlFor={htmlFor} className={inputClasses} {...props}>
      {children}
    </label>
  );
};
