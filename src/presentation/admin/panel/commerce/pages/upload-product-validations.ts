export interface ProductFormState {
    name: string;
    description: string;
    promotion: string;
    category: string;
    condition: string;
    year: string;
    coverImage: File | null;
    productImages: File[];
    shipping: boolean;
    priceUSDT: number;
    priceARS: number;
    crypto: number[];
    stock: number;
    shippingWeight: number;
    shippingHeight: number;
    shippingWidth: number;
    shippingLength: number;
}

export interface ProductFormErrors {
    name?: string;
    description?: string;
    promotion?: string;
    category?: string;
    stock?: string;
    condition?: string;
    year?: string;
    images?: string;
    priceUSDT?: string;
    priceARS?: string;
    shippingWeight?: string;
    shippingHeight?: string;
    shippingWidth?: string;
    shippingLength?: string;
}

// Solo título, imagen y categoría son obligatorios. Todo lo demás es opcional.
export const validateMainFeatures = (form: ProductFormState): ProductFormErrors => {
    const errors: ProductFormErrors = {};
    if (!form.name?.trim()) {
        errors.name = "El nombre (título) es requerido.";
    }

    // Validar que la categoría esté seleccionada y no sea el valor por defecto
    const categoryValue = form.category?.trim() || "";
    const isDefaultCategory = categoryValue === "" || 
                              categoryValue === "Seleccionar categoría" ||
                              categoryValue.toLowerCase() === "seleccionar categoría";
    
    if (!categoryValue || isDefaultCategory) {
        errors.category = "La categoría es requerida.";
    }

    if (!form.coverImage) {
        errors.images = "La imagen de portada es obligatoria.";
    }

    // Validaciones opcionales: solo si el usuario ingresó valores inválidos
    if (form.year) {
        const yearNumber = Number(form.year);
        const currentYear = new Date().getFullYear();
        const isInvalidYear = Number.isNaN(yearNumber) || yearNumber > currentYear || yearNumber < 1900;
        if (isInvalidYear) {
            errors.year = "El año no es válido.";
        }
    }

    if (form.shipping) {
        const shippingErrors = validateShippingDimensions(form);
        Object.assign(errors, shippingErrors);
    }

    return errors;
};

const validateShippingDimensions = (form: ProductFormState): ProductFormErrors => {
    const errors: ProductFormErrors = {};
    
    if (form.shippingWeight <= 0) {
        errors.shippingWeight = "El peso del paquete debe ser mayor a 0.";
    }
    if (form.shippingHeight <= 0) {
        errors.shippingHeight = "La altura del paquete debe ser mayor a 0.";
    }
    if (form.shippingWidth <= 0) {
        errors.shippingWidth = "El ancho del paquete debe ser mayor a 0.";
    }
    if (form.shippingLength <= 0) {
        errors.shippingLength = "El largo del paquete debe ser mayor a 0.";
    }
    
    return errors;
};