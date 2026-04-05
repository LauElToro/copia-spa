import React from 'react';
import { Box, Grid, IconButton, Typography, Stack } from '@mui/material';
import { Delete, Add } from '@mui/icons-material';
import { Input } from '@/presentation/@shared/components/ui/atoms/input';
import { Button } from '@/presentation/@shared/components/ui/atoms/button';
import { useModal } from '@/presentation/@shared/hooks/use-modal';
import { useIsMobile } from '@/presentation/@shared/hooks/use-is-mobile';

export interface ExtraAttribute {
  name: string;
  value: string;
  temporalId: number;
}

export interface DynamicAttributesProps {
  attributes: ExtraAttribute[];
  onAdd: () => void;
  onDelete: (index: number) => void;
  onChange: (index: number, field: 'name' | 'value', value: string) => void;
}

export const DynamicAttributes: React.FC<DynamicAttributesProps> = ({
  attributes,
  onAdd,
  onDelete,
  onChange,
}) => {
  const { openModal, closeModal } = useModal();
  const isMobile = useIsMobile(768);

  const handleDeleteClick = (index: number) => {
    const attr = attributes[index];
    const isComplete = attr.name.trim() !== '' && attr.value.trim() !== '';
    
    if (isComplete) {
      openModal(
        <>
          <Typography
            variant="h6"
            sx={{
              color: '#ffffff',
              mb: 2,
              fontWeight: 600,
              fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
            }}
          >
            Eliminar atributo
          </Typography>
          <Typography
            sx={{
              color: '#94a3b8',
              fontSize: '0.9375rem',
              lineHeight: 1.6,
              mb: 2,
              fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
            }}
          >
            ¿Estás seguro de que deseas eliminar este atributo? Esta acción no se puede deshacer.
          </Typography>
          <Box
            sx={{
              p: 2,
              backgroundColor: 'rgba(15, 23, 42, 0.3)',
              border: '1px solid rgba(71, 85, 105, 0.2)',
              borderRadius: '12px',
              transition: 'all 0.2s ease',
            }}
          >
            <Typography
              sx={{
                color: '#ffffff',
                fontSize: '0.875rem',
                fontWeight: 500,
                mb: 0.5,
                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
              }}
            >
              <strong>Nombre:</strong> {attr.name || '(vacío)'}
            </Typography>
            <Typography
              sx={{
                color: '#ffffff',
                fontSize: '0.875rem',
                fontWeight: 500,
                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
              }}
            >
              <strong>Valor:</strong> {attr.value || '(vacío)'}
            </Typography>
          </Box>
        </>,
        {
          title: undefined,
          maxWidth: 'sm',
          actions: {
            secondary: {
              label: 'Cancelar',
              onClick: closeModal,
            },
            primary: {
              label: 'Eliminar',
              onClick: () => {
                onDelete(index);
                closeModal();
              },
              variant: 'danger',
            },
          },
        }
      );
    } else {
      onDelete(index);
    }
  };

  // Versión Mobile
  if (isMobile) {
    return (
      <Box sx={{ width: '100%' }}>
        {/* Lista de atributos Mobile */}
        {attributes.length > 0 && (
          <Stack spacing={2} sx={{ mb: 3 }}>
            {attributes.map((attr, index) => (
              <Box
                key={attr.temporalId}
                sx={{
                  p: 2,
                  backgroundColor: 'rgba(15, 23, 42, 0.3)',
                  border: '1px solid rgba(71, 85, 105, 0.2)',
                  borderRadius: '12px',
                  transition: 'all 0.2s ease',
                }}
              >
                <Stack spacing={2}>
                  {/* Nombre del atributo */}
                  <Box>
                    <Typography
                      component="label"
                      htmlFor={`attr_name_${attr.temporalId}`}
                      sx={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#ffffff',
                        mb: 1,
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                      }}
                    >
                      Nombre del atributo
                    </Typography>
                    <Input
                      type="text"
                      placeholder="Ej: marca"
                      id={`attr_name_${attr.temporalId}`}
                      name={`attr_name_${attr.temporalId}`}
                      value={attr.name}
                      onChange={(e) => onChange(index, 'name', e.target.value)}
                      state="modern"
                      fullWidth
                    />
                  </Box>

                  {/* Valor del atributo */}
                  <Box>
                    <Typography
                      component="label"
                      htmlFor={`attr_value_${attr.temporalId}`}
                      sx={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#ffffff',
                        mb: 1,
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                      }}
                    >
                      Valor del atributo
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 1, width: '100%' }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Input
                          type="text"
                          name={`attr_value_${attr.temporalId}`}
                          id={`attr_value_${attr.temporalId}`}
                          placeholder="Categoría del producto"
                          value={attr.value}
                          onChange={(e) => onChange(index, 'value', e.target.value)}
                          state="modern"
                          fullWidth
                        />
                      </Box>
                      <IconButton
                        onClick={() => handleDeleteClick(index)}
                        sx={{
                          color: '#ef4444',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '4px',
                          width: 56,
                          height: 56,
                          minWidth: 56,
                          flexShrink: 0,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: 'rgba(239, 68, 68, 0.2)',
                            borderColor: '#ef4444',
                            transform: 'scale(1.02)',
                          },
                        }}
                      >
                        <Delete sx={{ fontSize: 20 }} />
                      </IconButton>
                    </Box>
                  </Box>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}

        {/* Botón Agregar Mobile */}
        <Box>
          <Button
            onClick={onAdd}
            type="button"
            fullWidth
            sx={{
              px: 4,
              py: 1.5,
              backgroundColor: "#29C480",
              color: "#1e293b",
              fontWeight: 600,
              borderRadius: "8px",
              textTransform: "none",
              fontSize: "1rem",
              transition: "background-color 0.3s ease, color 0.3s ease",
              '&:hover:not(:disabled)': {
                backgroundColor: "#ffffff",
                color: "#000000",
                '& .MuiSvgIcon-root': {
                  transform: "translateX(4px)",
                },
              },
              '& .MuiSvgIcon-root': {
                transition: "transform 0.3s ease",
              },
            }}
          >
            Agregar atributo
            <Add sx={{ ml: 0.5, fontSize: 18 }} />
          </Button>
        </Box>
      </Box>
    );
  }

  // Versión Desktop
  return (
    <Box sx={{ width: '100%' }}>
      {/* Lista de atributos */}
      {attributes.length > 0 && (
        <Box sx={{ mb: 3 }}>
          {attributes.map((attr, index) => (
            <Box
              key={attr.temporalId}
              sx={{
                mb: 2,
                p: 2,
                backgroundColor: 'rgba(15, 23, 42, 0.3)',
                border: '1px solid rgba(71, 85, 105, 0.2)',
                borderRadius: '12px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'rgba(41, 196, 128, 0.3)',
                  backgroundColor: 'rgba(41, 196, 128, 0.05)',
                },
              }}
            >
              <Grid container spacing={2} sx={{ width: '100%' }}>
                <Grid size={{ xs: 12, md: 5 }}>
                  <Typography
                    component="label"
                    htmlFor={`attr_name_${attr.temporalId}`}
                    sx={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#ffffff',
                      mb: 1,
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                    }}
                  >
                    Nombre del atributo
                  </Typography>
                  <Input
                    type="text"
                    placeholder="Ej: marca"
                    id={`attr_name_${attr.temporalId}`}
                    name={`attr_name_${attr.temporalId}`}
                    value={attr.name}
                    onChange={(e) => onChange(index, 'name', e.target.value)}
                    state="modern"
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 7 }}>
                  <Typography
                    component="label"
                    htmlFor={`attr_value_${attr.temporalId}`}
                    sx={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#ffffff',
                      mb: 1,
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                    }}
                  >
                    Valor del atributo
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 1, width: '100%' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Input
                        type="text"
                        name={`attr_value_${attr.temporalId}`}
                        id={`attr_value_${attr.temporalId}`}
                        placeholder="Categoría del producto"
                        value={attr.value}
                        onChange={(e) => onChange(index, 'value', e.target.value)}
                        state="modern"
                        fullWidth
                      />
                    </Box>
                    <IconButton
                      onClick={() => handleDeleteClick(index)}
                      sx={{
                        color: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '4px',
                        width: 56,
                        height: 56,
                        minWidth: 56,
                        flexShrink: 0,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(239, 68, 68, 0.2)',
                          borderColor: '#ef4444',
                          transform: 'scale(1.02)',
                        },
                      }}
                    >
                      <Delete sx={{ fontSize: 20 }} />
                    </IconButton>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          ))}
        </Box>
      )}

      {/* Botón Agregar */}
      <Box>
        <Button
          onClick={onAdd}
          type="button"
          sx={{
            minWidth: { xs: '100%', sm: 200 },
            px: 4,
            py: 1.5,
            backgroundColor: "#29C480",
            color: "#1e293b",
            fontWeight: 600,
            borderRadius: "8px",
            textTransform: "none",
            fontSize: "1rem",
            transition: "background-color 0.3s ease, color 0.3s ease",
            '&:hover:not(:disabled)': {
              backgroundColor: "#ffffff",
              color: "#000000",
              '& .MuiSvgIcon-root': {
                transform: "translateX(4px)",
              },
            },
            '& .MuiSvgIcon-root': {
              transition: "transform 0.3s ease",
            },
          }}
        >
          Agregar atributo
          <Add sx={{ ml: 0.5, fontSize: 18 }} />
        </Button>
      </Box>
    </Box>
  );
};

