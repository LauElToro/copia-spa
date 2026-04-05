import React from "react";

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  className = "",
  ...props
}) => {
  return (
    <div className="form-check form-switch">
      <input
        type="checkbox"
        className={`form-check-input ${className}`}
        checked={checked}
        onChange={onChange}
        {...props}
      />
      {label && (
        <label className="form-check-label" htmlFor={props.id}>
          {label}
        </label>
      )}
    </div>
  );
};

export default Switch; 