"use client";

import React, { useState } from 'react';
import { Box, Container, Grid, Typography, Button, CircularProgress } from '@mui/material';
import MainLayout from '@/presentation/@shared/components/layouts/main-layout';
import { Image } from '@/presentation/@shared/components/ui/atoms/image';
import { Link } from '@/presentation/@shared/components/ui/atoms/link';
import { FormGroup } from '@/presentation/@shared/components/ui/molecules/form-group/form-group';
import { Radio } from '@/presentation/@shared/components/ui/atoms/radio';
import { Textarea } from '@/presentation/@shared/components/ui/atoms/textarea';
import { AnimatedSection } from '@/presentation/@shared/components/ui/atoms/animated-section';
import { useThemeMode } from "@/presentation/@shared/contexts/theme-mode-context";
import { notificationService } from '@/presentation/@shared/providers/toast-provider';
import { useNotifications } from '@/presentation/@shared/hooks/use-notifications';
import { useLanguage } from '@/presentation/@shared/hooks/use-language';
import { AxiosError } from 'axios';

const ContactPage: React.FC = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    phoneCountry: '+54',
    phoneArea: '',
    phoneNumber: '',
    subject: '',
    message: ''
  });

  const { sendEmailNotification } = useNotifications();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const toEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contacto@libertyclub.io';
      const subject = `[Contacto] ${formData.subject || t.contact.query} - ${formData.name} ${formData.lastName}`.trim();
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
      notificationService.success(t.contact.messageSentSuccess, { autoClose: 4000 });
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
    } catch (err) {
      const axiosError = err as AxiosError;
      const status = axiosError?.response?.status;
      if (status === 401 || status === 403) {
        notificationService.error(t.contact.unauthorized);
      } else {
        notificationService.error(t.contact.sendError, { autoClose: 5000 });
      }
      console.error('contact send error', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const { mode } = useThemeMode(); 

  return (
    <MainLayout>
      {/* Hero Section */}
      <Box
        component="section"
        sx={{
          position: "relative",
          overflow: "hidden",
          width: "100%",
          height: "400px",
          boxSizing: "border-box",
          background: `
            radial-gradient(circle at 30% 70%, rgba(34, 197, 94, 0.95) 0%, rgba(41, 196, 128, 0.9) 30%, rgba(16, 185, 129, 0.8) 50%),
            radial-gradient(ellipse 500px 400px at 70% 30%, rgba(34, 197, 94, 0.9) 0%, rgba(41, 196, 128, 0.85) 40%, rgba(16, 185, 129, 0.8) 70%)
          `,
          border: "2px solid rgba(255, 255, 255, 0.2)",
          borderRadius: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Blur effect */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 256,
            height: 256,
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            borderRadius: "50%",
            filter: "blur(64px)",
            zIndex: 0
          }}
        />
        <Box sx={{
          maxWidth: "90%",
          mx: "auto",
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          width: "100%",
          textAlign: "center",
          px: { xs: 3, md: 6 }
        }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "2.288rem", md: "2.8rem" },
              mb: { xs: 1, md: 1.5 },
              margin: 0,
              padding: 0,
              width: "100%",
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.1
            }}
          >
            {t.contact.notifyUs}
          </Typography>
          <Typography
            variant="h2"
            sx={{
              mt: { xs: 0.5, md: 0.5 },
              width: "100%",
              fontSize: { xs: "1.6rem", md: "1.96rem" },
              fontWeight: 700,
              color: "#000000",
              display: "block",
              mb: { xs: 1, md: 1.5 }
            }}
          >
            {t.contact.sendQuery}
          </Typography>
        </Box>
      </Box>

      {/* Contact Form Section */}
      <Box
        component="section"
        sx={{
          py: 8,
          backgroundColor: '#000000',
          position: 'relative',
          minHeight: '80vh',
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 4, sm: 6, lg: 8 } }}>
          <Grid container spacing={0} sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: '0 0 32px rgba(0, 0, 0, 0.2)' }}>
                  {/* Columna Izquierda: Info */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                sx={{
                  backgroundColor: 'rgba(34, 197, 94, 0.05)',
                  p: { xs: 4, md: 5 },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: { xs: 'auto', md: '600px' },
                }}
              >
                      <AnimatedSection className='d-grid justify-content-space-between h-100' delay={2} direction="left">  
                        {() => (
                          <>
                      <Box>
                        <Typography 
                          variant="h4" 
                          sx={{ 
                            color: '#ffffff', 
                            fontWeight: 600, 
                            mb: 3,
                            textAlign: { xs: 'center', md: 'left' }
                          }}
                        >
                          {t.contact.notifyUs}
                        </Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            color: 'rgba(255, 255, 255, 0.7)',
                            textAlign: { xs: 'center', md: 'left' },
                            mb: 4
                          }}
                        >
                          {t.contact.sendQuery}
                        </Typography>
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2,
                            mb: 2,
                            justifyContent: { xs: 'center', md: 'flex-start' }
                          }}
                        >
                                <Image src="/Msj.svg" alt="Vende en Liberty Club" className='icon' width={20} height={16} />
                          <Link 
                            href="mailto:contacto@libertyclub.io" 
                            sx={{ 
                              color: '#22c55e',
                              textDecoration: 'none',
                              '&:hover': {
                                textDecoration: 'underline',
                              }
                            }}
                          >
                            contacto@libertyclub.io
                          </Link>
                        </Box>
                             
                              {mode === 'light' && (
                          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                  <Image
                                    src="/images/banner-contact.svg"
                                    alt="banner contacto"
                                    width={250}
                                    height={320}
                                    className="img-fluid banner-contact"
                                  />
                          </Box>
                              )}
                      </Box>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          flexDirection: { xs: 'column', md: 'row' },
                          alignItems: { xs: 'center', md: 'flex-end' },
                          justifyContent: 'space-between',
                          width: '100%',
                          mt: { xs: 4, md: 'auto' },
                          pt: 4,
                          gap: 2
                        }}
                      >
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Link href="#" sx={{ display: 'inline-block' }}>
                            <Image src="/images/social/instagram1.svg" className='icon' alt="instagram_icon_white" width={30} height={30} />
                          </Link>
                          <Link href="#" sx={{ display: 'inline-block' }}>
                            <Image src="/images/social/youtube1.svg" className='icon' alt="youtube_icon_white" width={30} height={30} />
                          </Link>
                          <Link href="#" sx={{ display: 'inline-block' }}>
                            <Image src="/images/social/linkedin1.svg" className='icon' alt="linkedin_icon_white" width={30} height={30} />
                          </Link>
                        </Box>
                        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                          <Image src="/contact-logo.svg" alt="liberty_club_logo_rounded" width={70} height={70} />
                        </Box>
                      </Box>
                          </>
                        )}
                      </AnimatedSection>
              </Box>
            </Grid>

                  {/* Columna Derecha: Formulario */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Box
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  p: { xs: 4, md: 5 },
                }}
              >
                      <AnimatedSection delay={3} direction="right">
                        {() => (
                          <form onSubmit={handleSubmit}>
                      <Grid container spacing={3}>
                        <Grid size={{ xs: 12, lg: 6 }}>
                                <FormGroup
                                  label={t.contact.name}
                                  id="name"
                                  type="text"
                                  name="name"
                                  value={formData.name}
                                  onChange={handleChange}
                                  variant="input"
                                  state="ghost"
                                  required={true}
                                />
                        </Grid>
                        <Grid size={{ xs: 12, lg: 6 }}>
                                <FormGroup
                                  label={t.contact.lastName}
                                  id="lastName"
                                  type="text"
                                  name="lastName"
                                  value={formData.lastName}
                                  onChange={handleChange}
                                  variant="input"
                                  state="ghost"
                                  required={true}
                                />
                        </Grid>
                        <Grid size={{ xs: 12, lg: 6 }}>
                                <FormGroup
                                  label={t.contact.email}
                                  id="email"
                                  type="email"
                                  name="email"
                                  value={formData.email}
                                  onChange={handleChange}
                                  variant="input"
                                  state="ghost"
                                  required={true}
                                />  
                        </Grid>
                        <Grid size={{ xs: 12, lg: 6 }}>
                                <FormGroup
                                  label={t.contact.phoneNumber}
                                  id='phoneNumber'
                                  name='phoneNumber'
                                  value={formData.phoneNumber}
                                  onChange={handleChange}
                                  variant="input"
                                  state="ghost"
                                  required={true}
                                />
                        </Grid>
                      </Grid>
                          
                      <Box sx={{ mt: 4, mb: 5 }}>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontWeight: 600, 
                            mb: 3,
                            color: '#ffffff'
                          }}
                        >
                          {t.contact.selectSubject}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                  <Radio
                                    label={t.contact.platformError}
                                    name="subject"
                                    id="platformError"
                                    value="platformError"
                                    checked={formData.subject === 'platformError'}
                                    state={formData.subject === 'platformError' ? 'checked' : 'default'}
                                    onChange={handleChange}
                                  />
                                  <Radio
                                    label={t.contact.purchaseProblem}
                                    name="subject"
                                    id="purchaseProblem"
                                    value="purchaseProblem"
                                    checked={formData.subject === 'purchaseProblem'}
                                    state={formData.subject === 'purchaseProblem' ? 'checked' : 'default'}
                                    onChange={handleChange}
                                  />
                                  <Radio
                                    label={t.contact.saleProblem}
                                    name="subject"
                                    id="saleProblem"
                                    value="saleProblem"
                                    checked={formData.subject === 'saleProblem'}
                                    state={formData.subject === 'saleProblem' ? 'checked' : 'default'}
                                    onChange={handleChange}
                                  />
                                  <Radio
                                    label={t.contact.other}
                                    name="subject"
                                    id="other"
                                    value="other"
                                    checked={formData.subject === 'other'}
                                    onChange={handleChange}
                                    state={formData.subject === 'other' ? 'checked' : 'default'}
                                  />
                        </Box>
                      </Box>
                      <Box sx={{ mb: 4 }}>
                              <Textarea
                                label={t.contact.message}
                                id="message"
                                name="message"
                                className='border-top-0 border-start-0 border-end-0'
                                state="transparent"
                                rows={1}
                                value={formData.message}
                                onChange={handleChange}
                                placeholder={t.contact.writeMessage}
                                required
                              />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                                type="submit"
                          variant="outlined"
                                disabled={sendEmailNotification.isPending}
                          sx={{
                            px: 5,
                            py: 1.5,
                            borderWidth: 2,
                            borderColor: '#22c55e',
                            color: '#22c55e',
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            '&:hover': {
                              borderWidth: 2,
                              borderColor: '#22c55e',
                              backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            },
                            '&:disabled': {
                              borderColor: 'rgba(255, 255, 255, 0.3)',
                              color: 'rgba(255, 255, 255, 0.3)',
                            },
                          }}
                              >
                                {sendEmailNotification.isPending && (
                            <CircularProgress size={20} sx={{ mr: 1, color: '#22c55e' }} />
                                )}
                                {sendEmailNotification.isPending ? t.contact.sending : t.contact.send}
                        </Button>
                      </Box>
                          </form>
                        )}
                      </AnimatedSection>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </MainLayout>
  );
};

export default ContactPage;
