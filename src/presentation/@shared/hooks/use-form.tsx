import { useState } from "react";

export function useForm<T extends Record<string, string | boolean | undefined>>(
  initialState: T,
  onSubmit: (data: T) => Promise<void> | void,
) {
  const [formData, setFormData] = useState<T>(initialState);
  const [buttonLoading, setButtonLoading] = useState(false);

  const handleInputChange = (field: keyof T, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value}));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setButtonLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setButtonLoading(false);
    }
  };

  return { formData, handleInputChange, handleSubmit, buttonLoading };
}