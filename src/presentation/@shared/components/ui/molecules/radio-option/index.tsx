import { Radio } from '../../atoms/radio';

interface RadioOptionProps {
  name: string;
  label: string;
  id: string;
  value: string;
  icon?: React.ReactNode;
  onClick?: (value: string) => void;
  onChange?: (value: string) => void;
  checked?: boolean;
}

export const RadioOption = ({ name, label, id, value, icon, onClick, onChange, checked }: RadioOptionProps) => {

  const handleClick = () => {
    if (onClick) {
      onClick(value);
    }
    if (onChange) {
      onChange(value);
    }
  }

  return (
    <button
      className="radioBox"
      onClick={handleClick}
      tabIndex={0}
      type="button"
    >
      <Radio
        name={name}
        id={id}
        label={label}
        value={value}
        icon={icon}
        checked={checked}
        onChange={() => handleClick()}
      />
    </button>
  )
}
