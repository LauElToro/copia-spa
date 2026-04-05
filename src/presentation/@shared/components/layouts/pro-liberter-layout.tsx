'use client';
import React, { ReactNode } from 'react';
import { Box } from '@mui/material';
import Navbar from '../ui/molecules/navbar-proliberter/navbar';

interface ProLiberterLayoutProps {
  children: ReactNode;
}

const ProLiberterLayout: React.FC<ProLiberterLayoutProps> = ({ children }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      {/* Navbar con Logo a la izquierda y dropdown a la derecha */}
      <Navbar/>
      {/* Menú superior ProLiberter horizontal, centrado, con ítems alineados a la izquierda */}
      
      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, marginTop: '1.5rem' }}>
        {children}
      </Box>
    </Box>
  );
};

export default ProLiberterLayout; 