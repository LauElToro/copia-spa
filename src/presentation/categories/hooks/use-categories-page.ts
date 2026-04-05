"use client";

import { useEffect, useMemo, useState } from "react";
import { useProducts } from "@/presentation/@shared/hooks/use-products";
import { useToast } from '@/presentation/@shared/components/ui/molecules/toast';
import { CategoryEntity } from '@/presentation/@shared/types/product';

// Mapeo de nombres de categorías a nombres de archivos SVG
const getCategoryIconName = (categoryName: string): string => {
  const categoryMap: { [key: string]: string } = {
    'Deportes': 'deportes',
    'Moda': 'indumentaria',
    'Inversiones': 'inversiones',
    'Vehículos': 'vehiculos',
    'Hogar': 'hogar',
    'Inmuebles': 'inmuebles',
    'Servicios': 'servicios',
    'Alimentos y Bebidas': 'alimentos',
    'Agro': 'agro',
    'Antiguedad': 'antiguedad',
    'Animales y mascotas': 'mascotas',
    'Joyas y Relojes': 'joyeria',
    'Instrumentos Musicales': 'instrumentos',
    'Industrias y oficinas': 'oficina',
    'Herramientas': 'herramientas',
    'Electrodomesticos y Aires ac.': 'electrodomesticos',
    'Belleza y cuidado personal': 'belleza',
    'Arte, librería y merceria': 'arte-y-libreria',
    'Electronica': 'electronica',
    'Juegos y juguetes': 'juegos-y-juguetes',
    'Libros, revistas y comics': 'libros-y-comics',
    'Música, películas y series': 'cine-y-musica',
    'Salud y equipamiento medico': 'salud',
    'Bebes': 'bebes'
  };

  return categoryMap[categoryName] || 'servicios';
};

export interface CategoryWithIcon extends CategoryEntity {
  iconName: string;
}

export const useCategoriesPage = () => {
  const { categories, refetchCategories } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const toast = useToast();

  // Manejar errores
  useEffect(() => {
    if (categories.isError) {
      // Extraer mensaje del backend si está disponible
      let errorMessage = 'Error al obtener las categorías';
      
      const apiError = categories.error as { 
        response?: { 
          data?: { 
            message?: string; 
            detail?: string;
            error?: string;
          } 
        };
        message?: string;
      };
      
      // Priorizar message, luego detail, luego error, luego el mensaje del error
      const backendMessage = 
        apiError?.response?.data?.message ||
        apiError?.response?.data?.detail ||
        apiError?.response?.data?.error ||
        apiError?.message;
      
      if (backendMessage) {
        errorMessage = backendMessage;
      }
      
      toast.error(errorMessage);
    }
  }, [categories.isError, categories.error, toast]);

  // Ordenar, filtrar y mapear categorías con iconos (defensivo si la API devuelve no-array)
  const sortedCategories = useMemo(() => {
    const data = categories.data;
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [];
    }

    // Deduplicar por id y por nombre (evita "Inversiones" repetido)
    const seenIds = new Set<string>();
    const seenNames = new Set<string>();
    let filtered = data.filter((c) => {
      if (seenIds.has(c.id)) return false;
      const nameKey = (c.name || '').trim().toLowerCase();
      if (nameKey && seenNames.has(nameKey)) return false;
      seenIds.add(c.id);
      if (nameKey) seenNames.add(nameKey);
      return true;
    });

    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((category) =>
        category.name.toLowerCase().includes(searchLower)
      );
    }

    return filtered
      .sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }))
      .map((category): CategoryWithIcon => ({
        ...category,
        iconName: getCategoryIconName(category.name)
      }));
  }, [categories.data, searchTerm]);

  const isInitialLoading = categories.isLoading && sortedCategories.length === 0;

  // Handlers
  const handleSearchChange = (value: string) => {
    setSearchTerm(value.trim());
  };

  return {
    // Data
    categories: sortedCategories,
    
    // State
    searchTerm,
    isLoading: categories.isLoading,
    isError: categories.isError,
    error: categories.error,
    isInitialLoading,
    
    // Handlers
    handleSearchChange,
    retry: () => refetchCategories(),
    
    // Utils
    getCategoryIconName,
  };
};

