import React from 'react';
import { Box, Typography } from '@mui/material';
import { ProductEntity } from '@/presentation/@shared/types/product';
import { useLanguage } from '@/presentation/@shared/hooks/use-language';

interface DescriptionProps {
  product: ProductEntity;
  showProductDesc: boolean;
  setShowProductDesc: React.Dispatch<React.SetStateAction<boolean>>;
}

// Función para truncar HTML de forma segura (funciona en cliente y servidor)
const truncateHtml = (html: string, maxLength: number): { truncated: string; shouldAddEllipsis: boolean } => {
  if (html.length <= maxLength) {
    return { truncated: html, shouldAddEllipsis: false };
  }

  // Obtener el texto sin HTML para calcular la longitud real
  const textContent = html.replace(/<[^>]*>/g, '');
  
  if (textContent.length <= maxLength) {
    return { truncated: html, shouldAddEllipsis: false };
  }

  // Si estamos en el cliente, usar DOM para truncar de forma más precisa
  if (typeof window !== 'undefined') {
    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';
      
      if (plainText.length <= maxLength) {
        return { truncated: html, shouldAddEllipsis: false };
      }

      // Buscar un punto de corte seguro (después de un tag de cierre)
      const safeCutPoint = html.lastIndexOf('>', maxLength);
      if (safeCutPoint > maxLength * 0.7) {
        return { truncated: html.slice(0, safeCutPoint + 1), shouldAddEllipsis: true };
      }
    } catch (error) {
      // Si hay error, usar método simple
      console.warn('Error al truncar HTML:', error);
    }
  }

  // Método simple: truncar en un punto seguro después de un tag
  const safeCutPoint = html.lastIndexOf('>', maxLength);
  if (safeCutPoint > maxLength * 0.7) {
    return { truncated: html.slice(0, safeCutPoint + 1), shouldAddEllipsis: true };
  }

  // Último recurso: truncar directamente
  return { truncated: html.slice(0, maxLength), shouldAddEllipsis: true };
};

const Description: React.FC<DescriptionProps> = ({ product, showProductDesc, setShowProductDesc }) => {
  const { t } = useLanguage();
  
  // Determinar qué contenido mostrar (hooks deben estar antes de cualquier return)
  const displayContent = React.useMemo(() => {
    if (!product.description || product.description.trim().length === 0) {
      return '';
    }
    if (showProductDesc) {
      return product.description;
    }
    const { truncated, shouldAddEllipsis } = truncateHtml(product.description, 370);
    return truncated + (shouldAddEllipsis ? '...' : '');
  }, [showProductDesc, product.description]);

  // Verificar si la descripción es lo suficientemente larga para mostrar el botón
  const shouldShowToggle = React.useMemo(() => {
    if (!product.description || product.description.trim().length === 0) {
      return false;
    }
    const textContent = product.description.replace(/<[^>]*>/g, '');
    return textContent.length > 370;
  }, [product.description]);

  if (!product.description || product.description.trim().length === 0) {
    return null;
  }

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <Box sx={{ pt: { xs: 0, md: 0.5 } }}>
        <Typography
          sx={{
            fontSize: { xs: '1rem', md: '1.125rem' },
            fontWeight: 700,
            color: '#ffffff',
            marginBottom: { xs: 2, md: 3 },
            lineHeight: 1.4
          }}
        >
          {t.shop.description}
        </Typography>
        <Box
          sx={{
            fontSize: { xs: '0.875rem', md: '0.9375rem' },
            lineHeight: 1.6,
            color: 'rgba(255, 255, 255, 0.85)',
            marginBottom: 2,
            '& p': {
              margin: 0,
              marginBottom: '0.5rem',
              '&:last-child': {
                marginBottom: 0
              }
            },
            '& ul, & ol': {
              margin: 0,
              paddingLeft: '1.5rem',
              marginBottom: '0.5rem'
            },
            '& h1, & h2, & h3, & h4, & h5, & h6': {
              margin: 0,
              marginBottom: '0.5rem',
              fontWeight: 600
            },
            '& strong, & b': {
              fontWeight: 600
            },
            '& em, & i': {
              fontStyle: 'italic'
            },
            '& a': {
              color: '#29C480',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline'
              }
            }
          }}
          dangerouslySetInnerHTML={{ __html: displayContent }}
        />
        {shouldShowToggle && (
          <Box
            component="button"
            onClick={() => setShowProductDesc((v) => !v)}
            sx={{
              background: 'none',
              border: 'none',
              padding: 0,
              marginTop: 2,
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'flex',
              fontSize: { xs: '0.875rem', md: '0.9375rem' },
              color: '#29C480',
              fontWeight: 500,
              '&:hover': {
                color: '#34d399',
                textDecoration: 'underline'
              }
            }}
          >
            {showProductDesc ? t.common.seeLess : t.shop.seeFullDescription}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Description;
