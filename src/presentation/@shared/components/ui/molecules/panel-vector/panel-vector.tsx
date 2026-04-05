import React from 'react'
import { Image } from '../../atoms/image/image';
import { Radio } from '../../atoms/radio/radio';
import { Label } from '../../atoms/label/label';

type PanelVectorProps = {
  id: string;
  name: string;
  value: string;
  label: string;
  imageSrc?: string;
  imageAlt?: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const PanelVector: React.FC<PanelVectorProps> = ({
  id,
  name,
  value,
  label,
  imageSrc,
  imageAlt,
  checked,
  onChange
}) => {
  return (
    <div className="form-check form-check-inline flex items-center gap-2">
      <Radio id={id} name={name} value={value} checked={checked} onChange={onChange} />
      <Label htmlFor={id}>{label}</Label>
      {imageSrc && (
        <Image src={imageSrc} alt={imageAlt || label} width={160} height={60} />
      )}
    </div>
  )
}

export default PanelVector;


 

