"use client";

import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';
import { useLanguage } from '@/presentation/@shared/hooks/use-language';
import { useNotifications } from '@/presentation/@shared/hooks/use-notifications';
import { useToast } from '@/presentation/@shared/components/ui/molecules/toast';
import { preloadServiceSpaToken } from '@/presentation/@shared/helpers/axios-helper';
import type { DropdownButtonOption } from '@/presentation/@shared/components/ui/molecules/dropdown-button/types';

export interface ContactFormData {
  name: string;
  lastName: string;
  email: string;
  phoneCountry: string;
  phoneArea: string;
  phoneNumber: string;
  subject: string;
  message: string;
}

export interface ContactFormErrors {
  name?: string;
  lastName?: string;
  email?: string;
  phoneArea?: string;
  phoneNumber?: string;
  subject?: string;
  message?: string;
}

const subjectOptions: DropdownButtonOption[] = [
  { value: 'platformError', label: 'Error en la plataforma', native: 'Error en la plataforma' },
  { value: 'purchaseProblem', label: 'Problema con compra', native: 'Problema con compra' },
  { value: 'saleProblem', label: 'Problema con venta', native: 'Problema con venta' },
  { value: 'other', label: 'Otro', native: 'Otro' },
];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateForm = (formData: ContactFormData): ContactFormErrors => {
  const errors: ContactFormErrors = {};

  if (!formData.name.trim()) {
    errors.name = 'El nombre es requerido';
  }

  if (!formData.lastName.trim()) {
    errors.lastName = 'El apellido es requerido';
  }

  if (!formData.email.trim()) {
    errors.email = 'El email es requerido';
  } else if (!emailRegex.test(formData.email)) {
    errors.email = 'El email no es válido';
  }

  if (!formData.phoneArea.trim()) {
    errors.phoneArea = 'El código de área es requerido';
  } else {
    const areaCode = parseInt(formData.phoneArea, 10);
    if (isNaN(areaCode) || areaCode < 1 || areaCode > 9999) {
      errors.phoneArea = 'El código de área debe ser un número entre 1 y 9999';
    }
  }

  if (!formData.phoneNumber.trim()) {
    errors.phoneNumber = 'El número de teléfono es requerido';
  } else {
    const phone = parseInt(formData.phoneNumber, 10);
    if (isNaN(phone) || phone < 1 || phone > 99999999) {
      errors.phoneNumber = 'El número de teléfono debe ser un número entre 1 y 99999999';
    }
  }

  if (!formData.subject) {
    errors.subject = 'El asunto es requerido';
  }

  if (!formData.message.trim()) {
    errors.message = 'El mensaje es requerido';
  }

  return errors;
};

export const useHelpContactForm = () => {
  const { t } = useLanguage();
  const toast = useToast();
  const { sendEmailNotification } = useNotifications();

  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    lastName: '',
    email: '',
    phoneCountry: '+54',
    phoneArea: '',
    phoneNumber: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error cuando el usuario empieza a escribir
    if (errors[name as keyof ContactFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  }, [errors]);

  const handleBlur = useCallback((field: string) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));

    // Validar campo individual al perder el foco
    const fieldErrors = validateForm(formData);
    if (fieldErrors[field as keyof ContactFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: fieldErrors[field as keyof ContactFormErrors],
      }));
    }
  }, [formData]);

  const handlePhoneAreaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Validar que sea un número entre 1 y 9999
    if (value === '' || (/^\d+$/.test(value) && parseInt(value, 10) >= 1 && parseInt(value, 10) <= 9999)) {
      setFormData((prev) => ({
        ...prev,
        phoneArea: value,
      }));

      // Limpiar error cuando el usuario empieza a escribir
      if (errors.phoneArea) {
        setErrors((prev) => ({
          ...prev,
          phoneArea: undefined,
        }));
      }
    }
  }, [errors.phoneArea]);

  const handlePhoneNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Validar que sea un número entre 1 y 99999999
    if (value === '' || (/^\d+$/.test(value) && parseInt(value, 10) >= 1 && parseInt(value, 10) <= 99999999)) {
      setFormData((prev) => ({
        ...prev,
        phoneNumber: value,
      }));

      // Limpiar error cuando el usuario empieza a escribir
      if (errors.phoneNumber) {
        setErrors((prev) => ({
          ...prev,
          phoneNumber: undefined,
        }));
      }
    }
  }, [errors.phoneNumber]);

  const handleCountryChange = useCallback((option: DropdownButtonOption) => {
    setFormData((prev) => ({
      ...prev,
      phoneCountry: option.value,
    }));
  }, []);

  const handleSubjectChange = useCallback((option: DropdownButtonOption) => {
    setFormData((prev) => ({
      ...prev,
      subject: option.value,
    }));

    // Limpiar error cuando el usuario selecciona una opción
    if (errors.subject) {
      setErrors((prev) => ({
        ...prev,
        subject: undefined,
      }));
    }
  }, [errors.subject]);

  const handleClear = useCallback(() => {
    setFormData({
      name: '',
      lastName: '',
      email: '',
      phoneCountry: '+54',
      phoneArea: '',
      phoneNumber: '',
      subject: '',
      message: '',
    });
    setErrors({});
    setTouched({});
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // Marcar todos los campos como tocados
    setTouched({
      name: true,
      lastName: true,
      email: true,
      phoneArea: true,
      phoneNumber: true,
      subject: true,
      message: true,
    });

    // Validar formulario completo
    const formErrors = validateForm(formData);
    setErrors(formErrors);

    // Si hay errores, no enviar y mostrar toast con detalles
    if (Object.keys(formErrors).length > 0) {
      const errorFields = Object.entries(formErrors)
        .map(([field]) => {
          const fieldNames: Record<string, string> = {
            name: t.contact?.name || 'Nombre',
            lastName: t.contact?.lastName || 'Apellido',
            email: t.contact?.email || 'Email',
            phoneArea: 'Código de área',
            phoneNumber: t.contact?.phoneNumber || 'Teléfono',
            subject: t.contact?.selectSubject || 'Asunto',
            message: t.contact?.message || 'Mensaje',
          };
          return fieldNames[field] || field;
        })
        .join(', ');
      
      toast.error(
        `${t.contact?.sendError || 'Por favor, completa los siguientes campos'}: ${errorFields}`,
        { duration: 6000, position: 'bottom-center' }
      );
      return;
    }

    try {
      // Asegurar que el token SPA esté disponible antes de enviar la petición
      await preloadServiceSpaToken();

      const toEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contacto@libertyclub.io';
      const subjectText = subjectOptions.find(opt => opt.value === formData.subject)?.label || formData.subject || t.contact?.query || 'Consulta';
      const subject = `[Ayuda] ${subjectText} - ${formData.name} ${formData.lastName}`.trim();
      const phone = [formData.phoneCountry, formData.phoneArea, formData.phoneNumber].filter(Boolean).join(' ');

      await sendEmailNotification.mutateAsync({
        to: toEmail,
        subject,
        message: `${formData.message}\n\nNombre: ${formData.name} ${formData.lastName}\nEmail: ${formData.email}\nTeléfono: ${phone}`,
        metadata: {
          name: `${formData.name} ${formData.lastName}`.trim(),
          email: formData.email,
          phone,
          subject: formData.subject,
          source: 'help-contact-form',
        },
      });

      toast.success(t.contact?.messageSentSuccess || 'Mensaje enviado con éxito', { duration: 4000 });
      
      setFormData({
        name: '',
        lastName: '',
        email: '',
        phoneCountry: '+54',
        phoneArea: '',
        phoneNumber: '',
        subject: '',
        message: '',
      });
      setErrors({});
      setTouched({});
    } catch (err) {
      const axiosError = err as AxiosError;
      const status = axiosError?.response?.status;
      if (status === 401 || status === 403) {
        toast.error(t.contact?.unauthorized || 'No autorizado');
      } else {
        toast.error(t.contact?.sendError || 'Error al enviar', { duration: 5000 });
      }
      console.error('help send error', err);
    }
  }, [formData, t, toast, sendEmailNotification]);

  const getFieldError = useCallback((field: string): boolean => {
    return touched[field] && !!errors[field as keyof ContactFormErrors];
  }, [errors, touched]);

  return {
    formData,
    errors,
    touched,
    isLoading: sendEmailNotification.isPending,
    handleChange,
    handleBlur,
    handlePhoneAreaChange,
    handlePhoneNumberChange,
    handleCountryChange,
    handleSubjectChange,
    handleClear,
    handleSubmit,
    getFieldError,
    subjectOptions,
  };
};

