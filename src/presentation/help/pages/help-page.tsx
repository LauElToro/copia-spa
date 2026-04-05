"use client";

import React from 'react';
import { Box, Container, Typography, Grid, TextField, Button as MuiButton, CircularProgress } from '@mui/material';
import { Email as EmailIcon } from '@mui/icons-material';
import MainLayout from '@/presentation/@shared/components/layouts/main-layout';
import { Link } from '@/presentation/@shared/components/ui/atoms/link';
import { Input } from '@/presentation/@shared/components/ui/atoms/input';
import { DropdownButton } from '@/presentation/@shared/components/ui/molecules/dropdown-button';
import { useLanguage } from '@/presentation/@shared/hooks/use-language';
import { useHelpContactForm } from '@/presentation/help/hooks/use-help-contact-form';
import HelpHero from '@/presentation/@shared/components/ui/molecules/help-hero/help-hero';

const HelpPage: React.FC = () => {
  const { t } = useLanguage();
  
  const countryOptions = [
    { value: '+54', label: '+54', native: t.contact?.countries?.argentina || 'Argentina (+54)' },
    { value: '+56', label: '+56', native: t.contact?.countries?.chile || 'Chile (+56)' },
    { value: '+57', label: '+57', native: t.contact?.countries?.colombia || 'Colombia (+57)' },
    { value: '+52', label: '+52', native: t.contact?.countries?.mexico || 'México (+52)' },
    { value: '+51', label: '+51', native: t.contact?.countries?.peru || 'Perú (+51)' },
    { value: '+598', label: '+598', native: t.contact?.countries?.uruguay || 'Uruguay (+598)' },
    { value: '+58', label: '+58', native: t.contact?.countries?.venezuela || 'Venezuela (+58)' },
    { value: '+1', label: '+1', native: t.contact?.countries?.usa || 'Estados Unidos (+1)' },
    { value: '+34', label: '+34', native: t.contact?.countries?.spain || 'España (+34)' },
  ];
  const {
    formData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    errors: _errors,
    isLoading,
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
  } = useHelpContactForm();

  return (
    <MainLayout>
      {/* Hero Section */}
      <HelpHero />

      {/* Contact Form Section */}
        <Box
          component="section"
          sx={{
            py: 8,
          width: "100%"
          }}
        >
        <Container maxWidth="xl" sx={{ px: { xs: 4, sm: 6, lg: 8 } }}>
          <Grid 
            container 
            spacing={4}
          >
            {/* Columna Izquierda: Formulario */}
            <Grid 
              size={{ xs: 12, md: 6 }}
              sx={{
                flexGrow: 1,
                minWidth: 0
              }}
            >
              <Box sx={{ 
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                p: { xs: 3, md: 4 }
              }}>
                <Typography 
                  component="h3"
                  sx={{ 
                    fontSize: { xs: '1.5rem', md: '1.875rem' },
                    fontWeight: 700,
                    color: '#ffffff', 
                    mb: { xs: 2, md: 3 },
                    textAlign: { xs: 'center', md: 'left' },
                    lineHeight: 1.2,
                    fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                  }}
                >
                  {t.contact?.formTitle || 'Formulario de contacto'}
                </Typography>
                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                {/* Fila 1: Nombre, Apellido, Email - 3 columnas */}
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', md: 'row' }, 
                  gap: 3, 
                  mb: 3, 
                  width: '100%' 
                }}>
                  <Box sx={{ flex: { md: '1 1 auto' }, width: { xs: '100%', md: 'auto' }, minWidth: 0 }}>
                    <Typography 
                      component="label"
                      htmlFor="name"
                      sx={{ 
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#ffffff', 
                        mb: 1,
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                      }}
                    >
                      {t.contact?.name || 'Nombre'}
                    </Typography>
                    <Input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={() => handleBlur('name')}
                      state="modern"
                      error={getFieldError('name')}
                      required
                      placeholder={t.contact?.name || 'Nombre'}
                      fullWidth
                    />
                        </Box>
                  <Box sx={{ flex: { md: '1 1 auto' }, width: { xs: '100%', md: 'auto' }, minWidth: 0 }}>
                    <Typography
                      component="label"
                      htmlFor="lastName"
                      sx={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#ffffff',
                        mb: 1,
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                      }}
                    >
                      {t.contact?.lastName || 'Apellido'}
                    </Typography>
                          <Input
                            type="text"
                            name="lastName"
                            id="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            onBlur={() => handleBlur('lastName')}
                            state="modern"
                            error={getFieldError('lastName')}
                            required
                            placeholder={t.contact?.lastName || 'Apellido'}
                            fullWidth
                          />
                        </Box>
                  <Box sx={{ flex: { md: '1 1 auto' }, width: { xs: '100%', md: 'auto' }, minWidth: 0 }}>
                  <Typography
                    component="label"
                    htmlFor="email"
                    sx={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#ffffff',
                      mb: 1,
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                    }}
                  >
                    {t.contact?.email || 'Email'}
                  </Typography>
                  <Input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => handleBlur('email')}
                    state="modern"
                    error={getFieldError('email')}
                    required
                    placeholder={t.contact?.email || 'Email'}
                    fullWidth
                  />
                  </Box>
                </Box>

                {/* Fila 3: Código de país, código de área, teléfono - 3 columnas */}
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', md: 'row' }, 
                  gap: 3, 
                  mb: 3, 
                  width: '100%' 
                }}>
                  <Box sx={{ flex: { md: '0 0 auto' }, width: { xs: '100%', md: 'auto' }, minWidth: { md: '150px' } }}>
                    <Typography
                      component="label"
                      sx={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#ffffff',
                        mb: 1,
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                      }}
                    >
                      {t.contact?.countryCode || 'Código de país'}
                    </Typography>
                    <DropdownButton
                      options={countryOptions}
                      value={formData.phoneCountry}
                      onChange={handleCountryChange}
                      placeholder={t.contact?.selectCountry || 'Seleccionar país'}
                      renderValue={(option) => option.value}
                      fullWidth={true}
                      searchable={true}
                      sx={{ 
                        width: '100%',
                        '& button': {
                          height: '56px',
                          minHeight: '56px',
                          alignItems: 'center',
                          display: 'flex',
                          '& .MuiTypography-root': {
                            fontSize: '0.875rem !important',
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                            lineHeight: '1.5',
                          }
                        }
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: { md: '0 0 auto' }, width: { xs: '100%', md: 'auto' }, minWidth: { md: '120px' } }}>
                    <Typography
                      component="label"
                      htmlFor="phoneArea"
                      sx={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#ffffff',
                        mb: 1,
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                      }}
                    >
                      {t.contact?.areaCode || 'Código de área'}
                    </Typography>
                    <Input
                      type="number"
                      name="phoneArea"
                      id="phoneArea"
                      value={formData.phoneArea}
                      onChange={handlePhoneAreaChange}
                      onBlur={() => handleBlur('phoneArea')}
                      state="modern"
                      error={getFieldError('phoneArea')}
                      required
                      placeholder="11"
                      fullWidth
                      inputProps={{
                        min: 1,
                        max: 9999
                      }}
                    />
                        </Box>
                  <Box sx={{ flex: { md: '1 1 auto' }, width: { xs: '100%', md: 'auto' }, minWidth: 0 }}>
                  <Typography
                    component="label"
                    htmlFor="phoneNumber"
                    sx={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#ffffff',
                      mb: 1,
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                    }}
                  >
                    {t.contact?.phoneNumber || 'Teléfono'}
                  </Typography>
                  <Input
                    type="number"
                    name="phoneNumber"
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handlePhoneNumberChange}
                    onBlur={() => handleBlur('phoneNumber')}
                    state="modern"
                    error={getFieldError('phoneNumber')}
                    required
                    placeholder="12345678"
                    fullWidth
                    inputProps={{
                      min: 1,
                      max: 99999999
                    }}
                  />
                  </Box>
                </Box>
                          
                {/* Select the subject */}
                <Box sx={{ mb: 3 }}>
                      <Typography 
                    component="label"
                    htmlFor="subject"
                        sx={{ 
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#ffffff',
                      mb: 1,
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                        }}
                      >
                        {t.contact?.selectSubject || 'Selecciona el asunto'}
                      </Typography>
                  <DropdownButton
                    options={subjectOptions.map(opt => ({
                      value: opt.value,
                      label: t.contact?.[opt.value as keyof typeof t.contact] as string || opt.label,
                      native: t.contact?.[opt.value as keyof typeof t.contact] as string || opt.label
                    }))}
                    value={formData.subject || ''}
                    onChange={handleSubjectChange}
                    placeholder={t.contact?.selectSubject || 'Selecciona el asunto'}
                    renderValue={(option) => option ? option.label : ''}
                    fullWidth={true}
                    searchable={true}
                    sx={{ 
                      width: '100%',
                      '& button': {
                        borderColor: getFieldError('subject') ? '#ef4444 !important' : undefined,
                        '&:hover': {
                          borderColor: getFieldError('subject') ? '#ef4444 !important' : undefined,
                        },
                        '& .MuiTypography-root': {
                          fontSize: '0.875rem !important',
                          fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                        }
                      }
                    }}
                        />
                      </Box>

                {/* Textarea */}
                    <Box sx={{ mb: 4 }}>
                  <Typography
                    component="label"
                    htmlFor="message"
                    sx={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#ffffff',
                      mb: 1,
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                    }}
                  >
                    {t.contact?.message || 'Mensaje'}
                  </Typography>
                  <TextField
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        onBlur={() => handleBlur('message')}
                        error={getFieldError('message')}
                        placeholder={t.contact?.writeMessage || 'Escribe tu mensaje...'}
                        required
                    multiline
                    rows={5}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#1f2937',
                        color: '#ffffff',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        '& fieldset': {
                          borderColor: getFieldError('message') ? '#ef4444' : '#374151',
                        },
                        '&:hover fieldset': {
                          borderColor: getFieldError('message') ? '#ef4444' : '#22c55e',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: getFieldError('message') ? '#ef4444' : '#22c55e',
                          boxShadow: getFieldError('message') ? '0 0 0 1px rgba(239, 68, 68, 0.2)' : '0 0 0 1px rgba(34, 197, 94, 0.2)',
                        },
                        '& .MuiInputBase-input': {
                          fontSize: '0.875rem',
                          padding: '16px',
                          '&::placeholder': {
                            color: '#9ca3af',
                            opacity: 0.7,
                            fontSize: '0.875rem',
                          },
                        },
                        '& textarea': {
                          color: '#ffffff',
                          fontSize: '0.875rem',
                          fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                          '&::placeholder': {
                            color: '#9ca3af',
                            opacity: 0.7,
                            fontSize: '0.875rem',
                          },
                        },
                      },
                    }}
                      />
                    </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <MuiButton
                    type="button"
                    onClick={handleClear}
                    variant="outlined"
                    sx={{
                      px: 4,
                      py: 1.5,
                      color: '#ef4444',
                      borderColor: '#ef4444',
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: '#dc2626',
                        color: '#dc2626',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)'
                      }
                    }}
                  >
                    Limpiar
                  </MuiButton>
                  <MuiButton
                        type="submit"
                        disabled={isLoading}
                        startIcon={isLoading ? <CircularProgress size={20} sx={{ color: '#1e293b' }} /> : undefined}
                        sx={{
                      px: 4,
                          py: 1.5,
                      backgroundColor: '#29C480',
                      color: '#1e293b',
                      fontWeight: 600,
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontSize: '1rem',
                      transition: 'background-color 0.3s ease, color 0.3s ease',
                      '&:hover': {
                        backgroundColor: isLoading ? '#29C480' : '#ffffff',
                        color: isLoading ? '#1e293b' : '#000000'
                      },
                      '&:disabled': {
                        backgroundColor: '#29C480',
                        color: '#1e293b',
                        opacity: 0.6
                      }
                    }}
                  >
                    {isLoading ? (t.contact?.sending || 'Enviando...') : (t.contact?.send || 'Enviar')}
                  </MuiButton>
                    </Box>
                  </form>
                </Box>
              </Grid>

            {/* Columna Derecha: Info de contacto */}
            <Grid 
              size={{ xs: 12, md: 6, lg: 6 }}
            >
              <Box
                sx={{
                  p: { xs: 3, md: 4 },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  width: '100%'
                }}
              >
                <Typography 
                  component="h3"
                  sx={{ 
                    fontSize: { xs: '1.5rem', md: '1.875rem' },
                    fontWeight: 700,
                    color: '#ffffff', 
                    mb: { xs: 2, md: 3 },
                    textAlign: { xs: 'center', md: 'left' },
                    lineHeight: 1.2,
                    fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                  }}
                >
                  {t.help?.notifyUs || t.contact?.notifyUs || 'Notifícanos'}
                </Typography>
                <Typography 
                  component="p"
                  sx={{ 
                    fontSize: { xs: '1rem', md: '1.125rem' },
                    color: 'rgba(255, 255, 255, 0.8)',
                    textAlign: { xs: 'center', md: 'left' },
                    mb: { xs: 3, md: 4 },
                    lineHeight: 1.6,
                    opacity: 0.9
                  }}
                >
                  {t.help?.sendQuery || t.contact?.sendQuery || 'Envía tu consulta o sugerencia para mejorar tu experiencia.'}
                </Typography>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    mb: 2,
                    justifyContent: { xs: 'center', md: 'flex-start' },
                    p: { xs: 2, md: 2.5 },
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderColor: 'rgba(34, 197, 94, 0.3)'
                    }
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 44,
                      height: 44,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      flexShrink: 0,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(16, 185, 129, 0.25) 100%)',
                        borderColor: 'rgba(34, 197, 94, 0.5)',
                        transform: 'scale(1.05)'
                      }
                    }}
                  >
                    <EmailIcon 
                      sx={{ 
                        fontSize: 22, 
                        color: '#22c55e',
                        transition: 'all 0.3s ease'
                      }} 
                    />
                  </Box>
                  <Link 
                    href="mailto:contacto@libertyclub.io" 
                    sx={{ 
                      fontSize: { xs: '0.9375rem', md: '1rem' },
                      fontWeight: 500,
                      color: '#22c55e',
                      textDecoration: 'none',
                      transition: 'color 0.3s ease',
                      '&:hover': {
                        color: '#34d399',
                        textDecoration: 'none',
                      }
                    }}
                  >
                    contacto@libertyclub.io
                  </Link>
                </Box>
              </Box>
            </Grid>
            </Grid>
          </Container>
      </Box>
    </MainLayout>
  );
};

export default HelpPage;

