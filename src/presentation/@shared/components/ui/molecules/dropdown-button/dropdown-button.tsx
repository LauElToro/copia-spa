import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  Box,
  Popper,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Fade,
  Grow,
  Divider
} from "@mui/material";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SearchIcon from '@mui/icons-material/Search';
import { Button } from '../../atoms/button';
import { DropdownButtonProps, DropdownButtonOption } from "./types";
import { defaultTheme } from "./theme";

export const DropdownButton: React.FC<DropdownButtonProps> = ({
  options = [],
  value,
  onChange,
  placeholder,
  disabled = false,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  renderOption,
  renderValue,
  searchable = false,
  defaultOption,
  closeOnSelect = true,
  disableHoverBorder = false,
  sx
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const buttonRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        dropdownRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        // Si hay renderOption y closeOnSelect es false, no cerrar automáticamente
        if (renderOption && !closeOnSelect) {
          return;
        }
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, renderOption, closeOnSelect]);

  const handleButtonClick = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm(''); // Clear search when opening
    }
  };

  const handleOptionClick = (option: DropdownButtonOption) => {
    if (onChange) {
      onChange(option);
    }
    if (closeOnSelect) {
    setIsOpen(false);
    setSearchTerm('');
    }
  };

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchable || !searchTerm.trim()) {
      return options;
    }
    return options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (option.native && option.native.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (option.description && option.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [options, searchTerm, searchable]);

  // Prepare all options with default option prepended if provided
  const allOptions = useMemo(() => {
    const opts = [...filteredOptions];
    if (defaultOption) {
      // Remove any existing option with the same value as default
      const filteredOpts = opts.filter(opt => opt.value !== defaultOption.value);
      return [defaultOption, ...filteredOpts];
    }
    return opts;
  }, [filteredOptions, defaultOption]);

  const selectedOption = useMemo(() => {
    if (!value && defaultOption) return defaultOption;
    return allOptions.find((option: DropdownButtonOption) => option.value === value);
  }, [allOptions, value, defaultOption]);

  const displayText = useMemo(() => {
    if (selectedOption) {
      return renderValue ? renderValue(selectedOption) : selectedOption.label;
    }
    return placeholder || "";
  }, [selectedOption, renderValue, placeholder]);

  const isDefaultSelected = selectedOption?.value === defaultOption?.value;

  return (
    <Box sx={{ position: 'relative' }} ref={buttonRef}>
      <Box onClick={handleButtonClick}>
        <Button
          disabled={disabled}
          variant={variant}
          size={size}
          fullWidth={fullWidth}
          className={className}
          sx={{
            justifyContent: 'space-between',
            width: fullWidth ? '100%' : 'fit-content', // se ajusta al contenido o 100% si fullWidth
            minHeight: 56, // altura aumentada 30% (40px * 1.4 = ~56px)
            height: 56, // altura fija para alineamiento
            px: 2, // padding horizontal más generoso
            cursor: disabled ? 'not-allowed' : 'pointer',
            backgroundColor: `${defaultTheme.colors.background} !important`,
            color: defaultTheme.colors.text,
            border: '1px solid #374151 !important', // gray-700 - mismo color que el Input
            borderColor: '#374151 !important', // gray-700 - mismo color que el Input
            background: `${defaultTheme.colors.background} !important`, // Sobrescribir background del Button
            transition: 'all 0.2s ease',
            // Sobrescribir todos los estilos de hover del Button base
            '&:hover:not(:disabled)': {
              backgroundColor: `${defaultTheme.colors.secondary} !important`,
              background: `${defaultTheme.colors.secondary} !important`,
              border: disableHoverBorder ? '1px solid #374151 !important' : '1px solid #22c55e !important', // green-500 - mismo color que el Input en hover
              borderColor: disableHoverBorder ? '#374151 !important' : '#22c55e !important', // green-500 - mismo color que el Input en hover
              backgroundImage: 'none !important',
              boxShadow: 'none !important',
            },
            '&:focus': {
              border: '1px solid #22c55e !important',
              borderColor: '#22c55e !important',
              boxShadow: '0 0 0 1px rgba(34, 197, 94, 0.2) !important',
              backgroundImage: 'none !important',
            },
            '&:focus-visible': {
              border: '1px solid #22c55e !important',
              borderColor: '#22c55e !important',
              boxShadow: '0 0 0 1px rgba(34, 197, 94, 0.2) !important',
              backgroundImage: 'none !important',
            },
            ...sx
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{
              color: selectedOption ? defaultTheme.colors.text : defaultTheme.colors.textSecondary, // blanco o gris para placeholder
              fontSize: '0.9rem',
              fontWeight: (isDefaultSelected || !selectedOption) ? 400 : 600,
              lineHeight: 1.2,
              opacity: (isDefaultSelected || !selectedOption) ? 0.7 : 1
            }}>
              {displayText || placeholder}
            </Typography>
            <KeyboardArrowDownIcon
              sx={{
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease-in-out',
                fontSize: '1.2rem',
                ml: 1,
                color: defaultTheme.colors.textSecondary
              }}
            />
          </Box>
        </Button>
      </Box>

      <Popper
        open={isOpen}
        anchorEl={buttonRef.current}
        placement="bottom-start"
        transition
        sx={{ zIndex: 1600 }}
        className="dropdown-popper"
        modifiers={[
          {
            name: 'preventOverflow',
            enabled: true,
            options: {
              altBoundary: true,
              rootBoundary: 'viewport',
            },
          },
        ]}
      >
        {({ TransitionProps }) => (
          <Grow
            in={isOpen}
            timeout={300}
            style={{ transformOrigin: '0 0 0' }}
            {...TransitionProps}
          >
            <Paper
              ref={dropdownRef}
              sx={{
                mt: 0.5,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)',
                borderRadius: 0,
                minWidth: buttonRef.current?.offsetWidth || 260,
                maxWidth: 400,
                maxHeight: 320,
                overflow: 'hidden',
                backgroundColor: defaultTheme.colors.surface,
                border: 'none'
              }}
              onClick={(e) => {
                e.stopPropagation();
                // Si hay renderOption, no cerrar el dropdown
                if (renderOption) {
                  return;
                }
              }}
              onMouseDown={(e) => {
                // Prevenir que el click fuera cierre el dropdown si hay renderOption
                if (renderOption) {
                  e.stopPropagation();
                }
              }}
            >
              {searchable && (
                <>
                  <Box sx={{ px: 1.5, py: 1 }}>
                    <TextField
                      autoFocus
                      fullWidth
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#1f2937',
                          color: '#ffffff',
                          borderRadius: '4px',
                          height: '56px',
                          fontSize: '0.875rem',
                          '& fieldset': {
                            borderColor: '#374151',
                          },
                          '&:hover fieldset': {
                            borderColor: '#22c55e',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#22c55e',
                            boxShadow: '0 0 0 1px rgba(34, 197, 94, 0.2)'
                          }
                        },
                        '& .MuiOutlinedInput-input': {
                          padding: '0 16px',
                          fontSize: '0.875rem',
                          fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                          '&::placeholder': {
                            color: '#9ca3af',
                            opacity: 0.7,
                            fontSize: '0.875rem'
                          }
                        },
                        '& .MuiInputAdornment-root': {
                          color: '#9ca3af',
                          marginLeft: '16px',
                          '& .MuiSvgIcon-root': {
                            fontSize: '1rem'
                          }
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                  <Divider sx={{
                    backgroundColor: defaultTheme.colors.secondary,
                    opacity: 0.3,
                    mx: 0
                  }} />
                </>
              )}

              <Box sx={{
                maxHeight: searchable ? 250 : 300,
                overflow: 'auto',
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: defaultTheme.colors.background,
                },
                '&::-webkit-scrollbar-thumb': {
                  background: defaultTheme.colors.secondary,
                  borderRadius: '3px',
                  '&:hover': {
                    background: defaultTheme.colors.primary,
                  }
                }
              }}>
                {allOptions.length > 0 ? (
                  allOptions.map((option: DropdownButtonOption, index: number) => {
                    const isSelected = option.value === value || (option.value === defaultOption?.value && !value);
                    const isDefaultOpt = defaultOption && option.value === defaultOption.value;

                    return (
                      <Box
                        key={option.value || index}
                        {...(renderOption ? {} : {
                          onClick: () => handleOptionClick(option),
                        })}
                        sx={{
                          py: 1.5,
                          px: 2,
                          cursor: renderOption ? 'default' : 'pointer',
                          transition: 'all 0.15s ease',
                          borderRadius: 0,
                          backgroundColor: isSelected ? defaultTheme.colors.secondary : 'transparent',
                          borderLeft: isSelected ? `3px solid ${defaultTheme.colors.primary}` : '3px solid transparent',
                          '&:hover': {
                            backgroundColor: renderOption ? 'transparent' : defaultTheme.colors.secondary,
                            borderLeftColor: renderOption ? 'transparent' : defaultTheme.colors.primary,
                          },
                          position: 'relative',
                        }}
                      >
                        <Fade in={true} timeout={300 + index * 50}>
                          <Box 
                            sx={{ 
                              position: 'relative', 
                              zIndex: 1,
                            }}
                            onClick={(e) => {
                              // Si hay renderOption, prevenir que el evento llegue al Box padre
                              if (renderOption) {
                                e.stopPropagation();
                              }
                            }}
                            onMouseDown={(e) => {
                              // Si hay renderOption, prevenir que el evento llegue al Box padre
                              if (renderOption) {
                                e.stopPropagation();
                              }
                            }}
                          >
                            {renderOption ? renderOption(option) : (
                              <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2" sx={{
                                    fontWeight: isDefaultOpt ? 400 : 600,
                                    fontSize: '0.95rem',
                                    color: isSelected ? defaultTheme.colors.primary : defaultTheme.colors.text,
                                    lineHeight: 1.2,
                                    opacity: isDefaultOpt ? 0.7 : 1
                                  }}>
                                    {option.label}
                                    {isDefaultOpt && defaultOption?.label && (
                                      <Typography component="span" sx={{
                                        fontStyle: 'italic',
                                        color: defaultTheme.colors.textSecondary,
                                        ml: 1,
                                        fontSize: '0.85rem'
                                      }}>
                                        (predeterminado)
                                      </Typography>
                                    )}
                                  </Typography>
                                </Box>
                                {option.native && option.native !== option.label && (
                                  <Typography variant="caption" sx={{
                                    color: defaultTheme.colors.textSecondary,
                                    fontSize: '0.8rem',
                                    fontWeight: 500,
                                    mt: 0.25
                                  }}>
                                    {option.native}
                                  </Typography>
                                )}
                                {option.description && (
                                  <Typography variant="caption" sx={{
                                    color: defaultTheme.colors.textSecondary,
                                    fontSize: '0.75rem',
                                    fontWeight: 400,
                                    mt: 0.3,
                                    display: 'block',
                                    lineHeight: 1.3
                                  }}>
                                    {option.description}
                                  </Typography>
                                )}
                              </Box>
                            )}
                          </Box>
                        </Fade>
                      </Box>
                    );
                  })
                ) : (
                  <Box sx={{ py: 3, px: 2, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{
                      color: defaultTheme.colors.textSecondary,
                      fontSize: '0.9rem'
                    }}>
                      {searchTerm ? 'No se encontraron resultados' : 'No hay opciones disponibles'}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grow>
        )}
      </Popper>
    </Box>
  );
};
