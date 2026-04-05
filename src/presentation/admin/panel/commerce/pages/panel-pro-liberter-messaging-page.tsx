"use client";

import React, { useState } from "react";
import { Box } from "@mui/material";
import { Image } from "@/presentation/@shared/components/ui/atoms/image";
import { Text } from "@/presentation/@shared/components/ui/atoms/text";
import { Input } from "@/presentation/@shared/components/ui/atoms/input";
import { Button } from "@/presentation/@shared/components/ui/atoms/button";
import { Container } from '@mui/material';
import { Stack } from "@/presentation/@shared/components/ui/molecules/stack";
import { IconButton } from "@/presentation/@shared/components/ui/atoms/icon-button";
import { AccountCircle, Send } from "@mui/icons-material";

const users = [
  { name: "Anónimo", message: "Holi, este celular sirve par...", avatar: null },
  { name: "Monkeys3", message: "", avatar: null },
  { name: "Mi tienda LIBRE de...", message: "puedp retirar el celular en ...", avatar: "/avatar1.jpg" },
  { name: "Tecno Smart", message: "cuales son los valores de l...", avatar: "/logo192.png" },
  { name: "Juan Manuel Careaga", message: "cuanto tiene de memoria...", avatar: "/avatar2.jpg" },
  { name: "CoreTech ", message: "hola este celular tiene bue...", avatar: "/avatar3.jpg" },
];

export default function PanelProLiberterMessagingPage() {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 4, md: 6 },
        width: "100%",
        backgroundColor: '#000000',
        minHeight: '100vh',
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 6, lg: 8 } }}>
        <Box sx={{ px: { xs: 3, md: 0 } }}>
        <Stack direction="row" spacing={3} alignItems="flex-start" sx={{ maxHeight: 700 }}>
          {/* Left: Users/messages */}
          <Box sx={{ width: 400, backgroundColor: '#111', borderRadius: 4, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ textAlign: 'center', fontWeight: 'bold', py: 2, backgroundColor: '#111', color: '#fff', fontSize: '1.15rem', borderTopLeftRadius: 4, borderTopRightRadius: 4 }}>
              Mensajes de clientes
            </Box>
            <Stack spacing={2} sx={{ flexGrow: 1, p: 2, overflowY: 'auto' }}>
              {users.map((u, i) => (
                <Button
                  key={`user-${u.name}-${i}`}
                  variant="secondary"
                  onClick={() => setSelected(i)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    backgroundColor: '#000',
                    px: 2,
                    py: 2,
                    borderRadius: 2,
                    width: '100%',
                    textAlign: 'left',
                    border: selected === i ? '2px solid #19e97c' : 'none',
                    justifyContent: 'flex-start'}}
                >
                  {u.avatar ? (
                    <Image src={u.avatar} alt={u.name} width={44} height={44} sx={{ borderRadius: '50%' }} />
                  ) : (
                    <AccountCircle sx={{ color: '#999', fontSize: 44 }} />
                  )}
                  <Stack spacing={0.5}>
                    <Text weight="bold" sx={{ fontSize: "1.1rem" }}>{u.name}</Text>
                    <Text color="text.secondary" sx={{ fontSize: ".98rem", maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {u.message}
                    </Text>
                  </Stack>
                </Button>
              ))}
            </Stack>
          </Box>

          {/* Right: Chat */}
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', backgroundColor: "#18191b", borderRadius: 4, minHeight: 600 }}>
            <Box sx={{ textAlign: 'center', fontWeight: 'bold', py: 2, backgroundColor: '#111', color: '#fff', fontSize: '1.15rem', borderTopLeftRadius: 4, borderTopRightRadius: 4 }}>
              Selecciona un usuario
            </Box>
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', minHeight: 400 }}>
              Ningún mensaje seleccionado
            </Box>
            <Box sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Input
                  placeholder="Escribe el mensaje personalizado..."
                  disabled
                  sx={{
                    height: 56,
                    fontSize: '1.1rem',
                    backgroundColor: '#1a1a1a',
                    borderColor: '#19e97c',
                    borderRadius: 2,
                    flexGrow: 1}}
                />
                <IconButton disabled>
                  <Send sx={{ color: '#19e97c', fontSize: 36 }} />
                </IconButton>
              </Stack>
            </Box>
          </Box>
        </Stack>
        </Box>
      </Container>
    </Box>
  );
} 