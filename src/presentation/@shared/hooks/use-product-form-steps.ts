import { useState, useCallback, useEffect } from 'react';
import type { UploadProductForm } from './use-upload-product';

export interface FormStep {
  id: string;
  label: string;
  component: string;
}

export interface UseProductFormStepsProps {
  tabs: Array<{ id: string; isActive: boolean }>;
  form: UploadProductForm;
}

export const useProductFormSteps = ({ tabs, form }: UseProductFormStepsProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');
  const [prevStep, setPrevStep] = useState<number | null>(null);

  const tab1Steps: FormStep[] = [
    { id: 'features', label: 'Características', component: 'features' },
    { id: 'images', label: 'Imágenes', component: 'images' },
    { id: 'price', label: 'Precio', component: 'price' },
    { id: 'shipping', label: 'Envío', component: 'shipping' },
  ];

  const totalSteps = tab1Steps.length;

  const handleNextStep = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setPrevStep(currentStep);
      setSlideDirection('left');
      setCurrentStep(prev => prev + 1);
      setTimeout(() => setPrevStep(null), 250);
    }
  }, [currentStep, totalSteps]);

  const handlePrevStep = useCallback(() => {
    if (currentStep > 0) {
      setPrevStep(currentStep);
      setSlideDirection('right');
      setCurrentStep(prev => prev - 1);
      setTimeout(() => setPrevStep(null), 250);
    }
  }, [currentStep]);

  const handleStepClick = useCallback((stepIndex: number) => {
    setPrevStep(currentStep);
    setSlideDirection(stepIndex > currentStep ? 'left' : 'right');
    setCurrentStep(stepIndex);
    setTimeout(() => setPrevStep(null), 250);
  }, [currentStep]);

  // Resetear el paso cuando se cambia de tab
  useEffect(() => {
    if (!tabs[0]?.isActive) {
      setCurrentStep(0);
    }
  }, [tabs]);

  const isStepComplete = useCallback((stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0: {
        const categoryValue = form.category?.trim() || "";
        const isDefaultCategory = categoryValue === "" || 
                                  categoryValue === "Seleccionar categoría" ||
                                  categoryValue.toLowerCase() === "seleccionar categoría";
        return !!(
          form.name?.trim() &&
          !isDefaultCategory &&
          form.condition &&
          form.description?.trim() &&
          form.stock > 0 &&
          form.year?.trim() &&
          Number(form.year) > 0
        );
      }
      case 1:
        return !!form.coverImage;
      case 2: {
        const hasUSDT = form.priceUSDT > 0;
        const hasARS = !form.crypto.includes(2) || form.priceARS > 0;
        return hasUSDT && hasARS;
      }
      case 3: {
        // Si shipping no está habilitado, el paso se considera completo
        if (!form.shipping) return true;
        
        // Si shipping está habilitado, validar que todos los campos tengan valores válidos
        const weight = typeof form.shippingWeight === 'string' ? parseFloat(form.shippingWeight) : Number(form.shippingWeight);
        const height = typeof form.shippingHeight === 'string' ? parseFloat(form.shippingHeight) : Number(form.shippingHeight);
        const width = typeof form.shippingWidth === 'string' ? parseFloat(form.shippingWidth) : Number(form.shippingWidth);
        const length = typeof form.shippingLength === 'string' ? parseFloat(form.shippingLength) : Number(form.shippingLength);
        
        return !!(
          weight && weight > 0 && !Number.isNaN(weight) &&
          height && height > 0 && !Number.isNaN(height) &&
          width && width > 0 && !Number.isNaN(width) &&
          length && length > 0 && !Number.isNaN(length)
        );
      }
      default:
        return false;
    }
  }, [form]);

  const isStepIncomplete = useCallback((stepIndex: number): boolean => {
    if (isStepComplete(stepIndex)) return false;
    
    switch (stepIndex) {
      case 0:
        return !!(form.name || form.category || form.condition || form.description || form.stock || form.year);
      case 1:
        return false;
      case 2:
        return !!(form.priceUSDT || form.priceARS);
      case 3:
        if (!form.shipping) return false;
        return !!(form.shippingWeight || form.shippingHeight || form.shippingWidth || form.shippingLength);
      default:
        return false;
    }
  }, [form, isStepComplete]);

  return {
    currentStep,
    prevStep,
    slideDirection,
    tab1Steps,
    totalSteps,
    handleNextStep,
    handlePrevStep,
    handleStepClick,
    isStepComplete,
    isStepIncomplete,
  };
};

