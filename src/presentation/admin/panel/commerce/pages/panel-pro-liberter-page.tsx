"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Box, Container, Grid, Typography, useTheme, useMediaQuery } from "@mui/material";
import { TrendingUp, AttachMoney, CurrencyExchange, BarChart, SmartToy, AddPhotoAlternate } from "@mui/icons-material";
import { Text } from "@/presentation/@shared/components/ui/atoms/text";
import { Stack } from "@/presentation/@shared/components/ui/molecules/stack";
import { Chip } from "@/presentation/@shared/components/ui/atoms/chip";
import { Breadcrumb } from "@/presentation/@shared/components/ui/molecules/breadcrumb/breadcrumb";
import { Textarea } from "@/presentation/@shared/components/ui/atoms/textarea";
import { Radio } from "@/presentation/@shared/components/ui/atoms/radio";
import { Checkbox } from "@/presentation/@shared/components/ui/atoms/checkbox";
import { useLanguage } from '@/presentation/@shared/hooks/use-language';
import { useLibiaAssistantConfig } from "../hooks/use-libia-assistant-config";
import { useToast } from "@/presentation/@shared/components/ui/molecules/toast";
import "./panel-ai-assistant.css";

const getStatIcon = (iconName: string) => {
  const iconMap: Record<string, React.ReactElement> = {
    "bi-graph-up-arrow": <TrendingUp />,
    "bi-cash-stack": <AttachMoney />,
    "bi-currency-dollar": <CurrencyExchange />,
  };
  return iconMap[iconName] || null;
};

const stats = [
  { icon: "bi-graph-up-arrow", label: "Ventas totales", value: 10 },
  { icon: "bi-cash-stack", label: "Ingresos Mensuales", value: "$0.00" },
  { icon: "bi-currency-dollar", label: "Ingresos Anuales", value: "$9620.62" },
];

const mostViewed = [
  { name: "Tecno Pova 6 Dual SIM 256 GB gris oscuro 12 GB RAM", value: 205 },
  { name: "Apple iPhone 13 (128 GB) - Blanco estelar", value: 196 },
  { name: "Samsung Galaxy A15 128 GB Negro azulado 4 GB RAM", value: 191 },
  { name: "Xiaomi Pocophone Poco M6 Pro Dual SIM 512 GB negro 12 GB RAM", value: 158 },
  { name: "Motorola Moto E14 64 GB Lavanda 2 GB RAM", value: 153 },
];
const mostSold = [
  { name: "Motorola Moto G75 Xt2437-2 5g Ram 8gb Interna 128 Gb Dual Sim Aqua", value: 0 },
  { name: "Samsung Galaxy S25 Ultra 512gb Titanium Silverblue", value: 0 },
  { name: "Realme C61 Dual Sim de 256 GB/8 GB de RAM con NFC (), color dorado", value: 0 },
  { name: "Xiaomi Redmi 14c Dual Sim 256gb 8 + 8 Gb Ram Extendida", value: 0 },
  { name: "Celular TCL 50 NXTPAPER", value: 0 },
];
const mostViewedMarketplace = [
  { name: "Xiaomi Redmi 14 C 8 Ram + 256 GB", value: 1114 },
  { name: "Xiaomi Redmi 14C 8 Ram + 128 GB", value: 868 },
  { name: "Iphone 11 128gb Swap 100% batería", value: 697 },
  { name: "Xiaomi Redmi note 14 8 Ram + 256 GB", value: 546 },
  { name: "Motorola E14 2 Ram + 64 GB X3 unidades", value: 457 },
];
const mostSoldMarketplace = [
  { name: "Xiaomi Redmi 14c Dual Sim 256gb 8 + 8 Gb Ram Extendida", value: 0 },
  { name: "Smartphone Tcl 50 5g T613p 6.56 Hd+ 256gb Space Gray 6gb Ram", value: 0 },
  { name: "Samsung Galaxy S25 Ultra 512gb Titanium Silverblue", value: 0 },
  { name: "Realme C61 Dual Sim de 256 GB/8 GB de RAM con NFC (), color dorado", value: 0 },
  { name: "Samsung Galaxy A16 5g 256 Blue Black 8 Gb Ram", value: 0 },
];

// Tabs para Asistente AI
const assistantTabs = [
  "Marca",
  "Políticas",
  "Logistica",
  "Preguntas",
  "Personalidad",
  "Escenarios",
];

// Componentes de contenido para Asistente AI (misma estructura que Marca: div, label, input, panel-ai-*)
const policyContent = (
  <div>
    <h2 className="panel-ai-heading">Políticas y atención al cliente</h2>
    <div className="panel-ai-grid panel-ai-grid-2" style={{ marginBottom: 24 }}>
      <div>
        <label className="panel-ai-field-label">Objeciones comunes y respuestas sugeridas</label>
        <div className="panel-ai-box">
          <span style={{ color: 'rgba(255,255,255,0.9)' }}>&quot;¿Y si el celular no funciona?&quot;<br />
            Todos nuestros productos cuentan con garantía oficial. Si hay algún problema de fábrica, te lo cambiamos o gestionamos la reparación sin costo.</span>
        </div>
        <div className="panel-ai-box">
          <span style={{ color: 'rgba(255,255,255,0.9)' }}>&quot;¿Tiene garantía?&quot;<br />
            Sí, todos los productos tienen garantía oficial del fabricante.</span>
        </div>
      </div>
      <div>
        <label className="panel-ai-field-label">Política de devoluciones</label>
        <div className="panel-ai-box">
          <span style={{ color: 'rgba(255,255,255,0.9)' }}>Aceptamos devoluciones dentro de los 10 días posteriores a la compra, siempre que el producto esté sin uso, en su empaque original y con todos los accesorios. En caso de compra online, el cliente puede desistir de la compra dentro de los 10 días de recibido el producto (según la Ley de Defensa del Consumidor en Argentina).</span>
        </div>
      </div>
      <div>
        <label className="panel-ai-field-label">Políticas para productos fallados</label>
        <div className="panel-ai-box">
          <span style={{ color: 'rgba(255,255,255,0.9)' }}>Si el producto presenta una falla de fábrica dentro de los primeros 10 días, se realiza el cambio inmediato por uno nuevo. Luego de ese período, gestionamos la garantía oficial con el fabricante o servicio técnico autorizado correspondiente. No cubrimos daños por mal uso, golpes, agua o intervención externa.</span>
        </div>
      </div>
      <div>
        <label className="panel-ai-field-label">Políticas generales de la empresa</label>
        <div className="panel-ai-box">
          <span style={{ color: 'rgba(255,255,255,0.9)' }}>Todos los productos se entregan con factura.<br />
            Los medios de pago incluyen tarjetas, transferencia, efectivo y plataformas digitales.<br />
            El stock está sujeto a disponibilidad y puede variar sin previo aviso.</span>
        </div>
      </div>
      <div>
        <label className="panel-ai-field-label">Garantías que ofrece la empresa</label>
        <div className="panel-ai-box">
          <span style={{ color: 'rgba(255,255,255,0.9)' }}>Garantía oficial del fabricante (de 6 a 12 meses según el producto).<br />
            Soporte inicial de nuestra tienda para gestionar cualquier inconveniente.<br />
            Posibilidad de contratar garantía extendida en algunos casos.</span>
        </div>
      </div>
      <div>
        <label className="panel-ai-field-label">¿Por qué deberían elegirte sobre la competencia?</label>
        <div className="panel-ai-box">
          <span style={{ color: 'rgba(255,255,255,0.9)' }}>Porque ofrecemos productos originales, precios competitivos y atención personalizada. Nos destacamos por la confianza que generamos con nuestros clientes, la rapidez en la entrega y el respaldo postventa.</span>
        </div>
      </div>
    </div>
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
      <button type="button" className="panel-ai-save-btn">Guardar</button>
    </div>
  </div>
);

const logisticsContent = (
  <div>
    <h2 className="panel-ai-heading">Logística y Métodos de Pago</h2>
    <div className="panel-ai-grid panel-ai-grid-2" style={{ marginBottom: 24 }}>
      <div>
        <label className="panel-ai-field-label">Métodos de envío nacionales</label>
        <input className="panel-ai-input" type="text" placeholder="Ej: OCA, Correo Argentino" defaultValue="Hacemos envíos regionales y a todo el país atraves de oca" />
      </div>
      <div>
        <label className="panel-ai-field-label">Tiempos de entrega estimados</label>
        <input className="panel-ai-input" type="text" placeholder="Ej: 48 a 72 hs hábiles" defaultValue="48 a 72 horas habiles" />
      </div>
      <div>
        <label className="panel-ai-field-label">¿Se puede retirar desde la tienda?</label>
        <div className="panel-ai-radio-group">
          <label className="panel-ai-radio-option"><input type="radio" name="retiroTienda" value="si" /> Sí</label>
          <label className="panel-ai-radio-option"><input type="radio" name="retiroTienda" value="no" defaultChecked /> No</label>
        </div>
        <input className="panel-ai-input" id="retiro-sucursal" type="text" placeholder="Sucursal" defaultValue="Sucursal" />
      </div>
      <div>
        <label className="panel-ai-field-label">¿Realizan envíos internacionales?</label>
        <div className="panel-ai-radio-group">
          <label className="panel-ai-radio-option"><input type="radio" name="envioInt" value="si" /> Sí</label>
          <label className="panel-ai-radio-option"><input type="radio" name="envioInt" value="no" defaultChecked /> No</label>
        </div>
        <input className="panel-ai-input" id="envio-internacional" type="text" placeholder="Internacionales" defaultValue="Internacionales" />
      </div>
      <div>
        <label className="panel-ai-field-label">Formas de pago aceptadas</label>
        <div className="panel-ai-checkbox-group">
          <label className="panel-ai-checkbox-option"><input type="checkbox" defaultChecked /> Tarjeta de crédito</label>
          <label className="panel-ai-checkbox-option"><input type="checkbox" defaultChecked /> Tarjeta de débito</label>
          <label className="panel-ai-checkbox-option"><input type="checkbox" defaultChecked /> Criptomonedas</label>
          <label className="panel-ai-checkbox-option"><input type="checkbox" defaultChecked /> Transferencia bancaria</label>
        </div>
      </div>
      <div>
        <label className="panel-ai-field-label">Facturación (Tipo de comprobante emitido)</label>
        <input className="panel-ai-input" id="facturacion" type="text" placeholder="Ej: Factura A, B, C" defaultValue="factura a b c" />
      </div>
    </div>
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
      <button type="button" className="panel-ai-save-btn">Guardar</button>
    </div>
  </div>
);

const questionsContent = (
  <div>
    <h2 className="panel-ai-heading">Preguntas frecuentes</h2>
    <div className="panel-ai-grid panel-ai-grid-2" style={{ marginBottom: 24 }}>
      <div>
        <label className="panel-ai-field-label">¿Puedo devolver un producto si no me gusta?</label>
        <div className="panel-ai-radio-group">
          <label className="panel-ai-radio-option"><input type="radio" name="devolver" defaultChecked /> Sí</label>
          <label className="panel-ai-radio-option"><input type="radio" name="devolver" /> No</label>
        </div>
        <label className="panel-ai-field-label">¿Los productos con oferta tienen cambio?</label>
        <div className="panel-ai-radio-group">
          <label className="panel-ai-radio-option"><input type="radio" name="ofertaCambio" defaultChecked /> Sí</label>
          <label className="panel-ai-radio-option"><input type="radio" name="ofertaCambio" /> No</label>
        </div>
        <label className="panel-ai-field-label">¿Los productos tienen garantía?</label>
        <div className="panel-ai-radio-group">
          <label className="panel-ai-radio-option"><input type="radio" name="garantia" defaultChecked /> Sí</label>
          <label className="panel-ai-radio-option"><input type="radio" name="garantia" /> No</label>
        </div>
      </div>
      <div>
        <label className="panel-ai-field-label">¿Cuánto tiempo tengo para cambiar un artículo?</label>
        <input className="panel-ai-input" type="text" placeholder="Ej: 10 días desde la compra" defaultValue="10 dias desde la compra" />
        <label className="panel-ai-field-label" style={{ marginTop: 16, display: 'block' }}>¿Qué necesito para hacer una devolución?</label>
        <input className="panel-ai-input" type="text" placeholder="Ej: factura, embalaje original" defaultValue="la factura y estar dentro de el tiempo" />
        <label className="panel-ai-field-label" style={{ marginTop: 16, display: 'block' }}>¿Qué cubre la garantía?</label>
        <input className="panel-ai-input" type="text" placeholder="Ej: desperfectos de fábrica" defaultValue="desperfectos tecnicos y arrepentimiento de compra" />
      </div>
    </div>
    <h3 className="panel-ai-subheading">¿Cómo gestiono un reclamo por producto defectuoso?</h3>
    <div className="panel-ai-grid panel-ai-grid-2" style={{ marginBottom: 24 }}>
      <div>
        <label className="panel-ai-field-label">Elegir forma de contacto</label>
        <div className="panel-ai-checkbox-group">
          <label className="panel-ai-checkbox-option"><input type="checkbox" defaultChecked /> E-mail</label>
          <label className="panel-ai-checkbox-option"><input type="checkbox" defaultChecked /> Teléfono</label>
          <label className="panel-ai-checkbox-option"><input type="checkbox" /> Chat en vivo</label>
        </div>
      </div>
      <div>
        <label className="panel-ai-field-label">E-mail de contacto</label>
        <input className="panel-ai-input" type="text" placeholder="contacto@ejemplo.com" defaultValue="juanmcareaga@gmail.com" />
        <label className="panel-ai-field-label" style={{ marginTop: 16, display: 'block' }}>Teléfono</label>
        <input className="panel-ai-input" type="text" placeholder="Ej: 1138010146" defaultValue="1138010146" />
        <label className="panel-ai-field-label" style={{ marginTop: 16, display: 'block' }}>Chat / Otro</label>
        <input className="panel-ai-input" type="text" placeholder="Ej: zoom@Usuario123" defaultValue="Ejemplo: zoom@Usuario123" />
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <label className="panel-ai-field-label">Horarios de atención</label>
        <input className="panel-ai-input" type="text" placeholder="Ej: Lun a Vie 9 a 18 hs" defaultValue="lun a viernes 9 a 19:30" />
      </div>
    </div>
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
      <button type="button" className="panel-ai-save-btn">Guardar</button>
    </div>
  </div>
);

const personalityContent = (
  <div>
    <h2 className="panel-ai-heading">Personalidad de la IA</h2>
    <div className="panel-ai-grid panel-ai-grid-2" style={{ marginBottom: 24 }}>
      <div>
        <label className="panel-ai-field-label">Elige el tono de respuesta de tu IA</label>
        <div className="panel-ai-radio-group" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <label className="panel-ai-radio-option"><input type="radio" name="tono" defaultChecked /> Amigable (Cálido y accesible)</label>
          <label className="panel-ai-radio-option"><input type="radio" name="tono" /> Formal (Profesional y estructurado)</label>
          <label className="panel-ai-radio-option"><input type="radio" name="tono" /> Casual e informal (Relajado y directo)</label>
          <label className="panel-ai-radio-option"><input type="radio" name="tono" /> Técnico (Preciso y detallado)</label>
          <label className="panel-ai-radio-option"><input type="radio" name="tono" /> Persuasivo / Comercial (Enfocado en cerrar ventas)</label>
          <label className="panel-ai-radio-option"><input type="radio" name="tono" /> Serio y conciso (Directo y sin adornos)</label>
          <label className="panel-ai-radio-option"><input type="radio" name="tono" /> Divertido y carismático (Con humor y personalidad)</label>
        </div>
      </div>
      <div>
        <label className="panel-ai-field-label">Identidad de la IA</label>
        <div className="panel-ai-radio-group" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <label className="panel-ai-radio-option"><input type="radio" name="identidad" /> Femenino</label>
          <label className="panel-ai-radio-option"><input type="radio" name="identidad" defaultChecked /> Masculino</label>
          <label className="panel-ai-radio-option"><input type="radio" name="identidad" /> Sin género</label>
        </div>
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <label className="panel-ai-field-label">¿Debe usar emojis?</label>
        <div className="panel-ai-radio-group">
          <label className="panel-ai-radio-option"><input type="radio" name="emojis" defaultChecked /> Sí, muchos</label>
          <label className="panel-ai-radio-option"><input type="radio" name="emojis" /> Sí, pero con moderación</label>
          <label className="panel-ai-radio-option"><input type="radio" name="emojis" /> No, sin emojis</label>
        </div>
      </div>
    </div>
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
      <button type="button" className="panel-ai-save-btn">Guardar</button>
    </div>
  </div>
);

const scenariosContent = (
  <div>
    <h2 className="panel-ai-heading">Escenarios de conversación y casos de uso</h2>
    <div className="panel-ai-grid panel-ai-grid-2" style={{ marginBottom: 24 }}>
      <div>
        <label className="panel-ai-field-label">Casos más frecuentes que la IA debe resolver</label>
        <textarea className="panel-ai-textarea" rows={4} placeholder="Ej: Consulta de precios, stock, envíos..." defaultValue={"Consulta de precios y stock\n\"¿Cuánto cuesta el iPhone 13?\"\n\"¿Tenés el Samsung Galaxy S23 disponible en color negro?\""} />
      </div>
      <div>
        <label className="panel-ai-field-label">Situaciones en las que la IA debe derivar a un humano</label>
        <textarea className="panel-ai-textarea" rows={4} placeholder="Ej: Cuando no tiene respuesta, derivar a..." defaultValue='En caso de no tener respuestas debe derivar a juanmcareaga@gmail.com con un mensaje como "No tengo la respuesta a esa consulta, por favor comunicate a este e-mail."' />
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <label className="panel-ai-field-label">¿Cómo debe manejar consultas fuera de su conocimiento?</label>
        <div className="panel-ai-radio-group" style={{ flexDirection: 'column', alignItems: 'flex-start', marginTop: 8 }}>
          <label className="panel-ai-radio-option"><input type="radio" name="fueraConocimiento" /> &quot;No tengo esa información, pero puedo ayudarte con otra consulta&quot;</label>
          <label className="panel-ai-radio-option"><input type="radio" name="fueraConocimiento" defaultChecked /> &quot;Derivar a atención al cliente&quot;</label>
          <label className="panel-ai-radio-option"><input type="radio" name="fueraConocimiento" /> &quot;Intentar ofrecer una respuesta aproximada basada en contexto&quot;</label>
        </div>
      </div>
    </div>
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
      <button type="button" className="panel-ai-save-btn">Guardar</button>
    </div>
  </div>
);

// Componente para renderizar los tabs
const RenderTabs = ({ id, label, isActive, disabled, onClick, isFirst, isLast, isMobile }: { id: string, label: string, isActive: boolean, disabled?: boolean, onClick: () => void; isFirst?: boolean; isLast?: boolean; isMobile?: boolean; }) => {
  // Mapear iconos según el id del tab
  const getIcon = () => {
    const iconSize = isMobile ? '1.75rem' : '1.25rem';
    if (id === '1') return <BarChart sx={{ fontSize: iconSize }} />;
    if (id === '2') return <SmartToy sx={{ fontSize: iconSize }} />;
    return null;
  };

  // Calcular border-radius para que los botones estén pegados
  const getBorderRadius = () => {
    if (isMobile) {
      return '12px';
    }
    if (isActive) {
      if (isFirst) return { xs: '16px 0 0 16px', sm: '16px 0 0 16px' };
      if (isLast) return { xs: '0 16px 16px 0', sm: '0 16px 16px 0' };
      return '0';
    }
    if (isFirst) return { xs: '16px 0 0 16px', sm: '16px 0 0 16px' };
    if (isLast) return { xs: '0 16px 16px 0', sm: '0 16px 16px 0' };
    return '0';
  };

  // Calcular bordes para que se vean pegados
  const getBorderStyles = () => {
    const baseBorder = isActive 
      ? "2px solid rgba(41, 196, 128, 0.4)"
      : "2px solid rgba(71, 85, 105, 0.3)";
    
    if (isMobile) {
      return {
        borderTop: baseBorder,
        borderRight: baseBorder,
        borderBottom: baseBorder,
        borderLeft: baseBorder,
      };
    }
    
    if (isActive) {
      return {
        borderTop: baseBorder,
        borderRight: baseBorder,
        borderBottom: baseBorder,
        borderLeft: baseBorder,
      };
    }
    
    if (isFirst) {
      return {
        borderTop: baseBorder,
        borderRight: 'none',
        borderBottom: baseBorder,
        borderLeft: baseBorder,
      };
    }
    if (isLast) {
      return {
        borderTop: baseBorder,
        borderRight: baseBorder,
        borderBottom: baseBorder,
        borderLeft: 'none',
      };
    }
    return {
      borderTop: baseBorder,
      borderRight: 'none',
      borderBottom: baseBorder,
      borderLeft: 'none',
    };
  };

  return (
    <Box
      onClick={disabled ? undefined : onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: isMobile ? (isActive ? 'space-between' : 'center') : 'flex-start',
        cursor: disabled ? 'not-allowed' : 'pointer',
        userSelect: 'none',
        borderRadius: getBorderRadius(),
        ...getBorderStyles(),
        ...(disabled && {
          opacity: 0.5,
        }),
        ...(isMobile
          ? {
              width: isActive ? 'auto' : '56px',
              minWidth: isActive ? '180px' : '56px',
              minHeight: '56px',
              padding: isActive ? '1rem 1.5rem' : '1rem',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden',
              position: 'relative',
              flexShrink: isActive ? 1 : 0,
              flexGrow: isActive ? 1 : 0,
              ...(isActive
                ? {
                    backgroundColor: "rgba(41, 196, 128, 0.1)",
                    color: '#34d399',
                    fontWeight: 600,
                    fontSize: '1rem',
                    fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    '& svg': {
                      color: '#34d399',
                      marginLeft: 'auto',
                      flexShrink: 0,
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    },
                  }
                : {
                    backgroundColor: "rgba(30, 41, 59, 0.4)",
                    color: '#94a3b8',
                    fontWeight: 500,
                    fontSize: '1rem',
                    fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    '& svg': {
                      color: '#94a3b8',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    },
                    '&:hover': {
                      backgroundColor: "rgba(30, 41, 59, 0.6)",
                      transform: 'scale(1.05)',
                      '& svg': {
                        color: '#cbd5e1',
                        transform: 'scale(1.1)',
                      },
                    },
                  }),
            }
          : {
              width: 'auto',
              minHeight: 'auto',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              ...(isActive
                ? {
                    backgroundColor: "rgba(41, 196, 128, 0.1)",
                    padding: { xs: '0.875rem 1.5rem', md: '1rem 2rem' },
                    color: '#34d399',
                    fontWeight: 600,
                    fontSize: { xs: '0.9375rem', md: '1rem' },
                    fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    '& svg': {
                      color: '#34d399',
                      ml: 1,
                    },
                  }
                : {
                    backgroundColor: "rgba(30, 41, 59, 0.4)",
                    padding: { xs: '0.875rem 1.5rem', md: '1rem 2rem' },
                    color: '#94a3b8',
                    fontWeight: 500,
                    fontSize: { xs: '0.9375rem', md: '1rem' },
                    fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    '& svg': {
                      color: '#94a3b8',
                      ml: 1,
                    },
                    '&:hover': {
                      backgroundColor: "rgba(30, 41, 59, 0.6)",
                      color: '#cbd5e1',
                      '& svg': {
                        color: '#cbd5e1',
                      },
                    },
                  }),
            }),
      }}
    >
      <Typography
        component="span"
        sx={{
          fontWeight: 'inherit',
          fontSize: 'inherit',
          color: 'inherit',
          fontFamily: 'inherit',
          whiteSpace: 'nowrap',
          flex: isMobile && isActive ? 1 : 'none',
          textAlign: isMobile && isActive ? 'left' : 'inherit',
          ...(isMobile && {
            opacity: isActive ? 1 : 0,
            width: isActive ? 'auto' : 0,
            overflow: 'hidden',
            transition: isActive
              ? 'opacity 0.3s ease-in 0.1s, width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              : 'opacity 0.2s ease-out, width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }),
        }}
      >
        {label}
      </Typography>
      {getIcon()}
    </Box>
  );
};

const MAX_LOGO_SIZE = 5 * 1024 * 1024;
const ACCEPTED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

export default function PanelProLiberterPage() {
  const { t } = useLanguage();
  const theme = useTheme();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState('1');
  const [assistantTab, setAssistantTab] = useState(0);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const { config, isSaving, save, uploadLogo, isUploadingLogo, storeId } = useLibiaAssistantConfig();
  const [formMarca, setFormMarca] = useState({
    nombre: "", descripcion: "", ventajasTienda: "", tipo_producto: "", marca_producto: "",
    slogan: "", objetivo: "", valores: "", trayectoria: "", ubicacion: "", imagen_url: "",
  });

  useEffect(() => {
    if (!config) return;
    setFormMarca((prev) => ({
      ...prev,
      nombre: config.empresa?.nombre ?? prev.nombre,
      descripcion: config.empresa?.descripcion ?? prev.descripcion,
      ventajasTienda: config.empresa?.ventajasTienda ?? prev.ventajasTienda,
      tipo_producto: config.empresa?.tipo_producto ?? prev.tipo_producto,
      marca_producto: config.empresa?.marca_producto ?? prev.marca_producto,
      slogan: config.empresa?.slogan ?? prev.slogan,
      objetivo: config.empresa?.objetivo ?? prev.objetivo,
      valores: config.empresa?.valores ?? prev.valores,
      trayectoria: config.empresa?.trayectoria ?? prev.trayectoria,
      ubicacion: config.empresa?.ubicacion ?? prev.ubicacion,
      imagen_url: config.imagen_url ?? prev.imagen_url,
    }));
  }, [config]);

  const updateMarca = useCallback((field: keyof typeof formMarca, value: string) => {
    setFormMarca((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSaveMarca = useCallback(async () => {
    if (!storeId) { toast.error("No se pudo identificar la tienda."); return; }
    try {
      await save({
        storeId,
        empresa: { ...formMarca },
        nombre_ia: formMarca.nombre,
        imagen_url: formMarca.imagen_url || config.imagen_url || "",
      });
      toast.success("Marca guardada correctamente.");
    } catch (err) {
      toast.error((err as Error).message ?? "Error al guardar");
    }
  }, [formMarca, config?.imagen_url, save, storeId, toast]);

  const handleLogoChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_LOGO_TYPES.includes(file.type)) {
      toast.error("Formatos permitidos: PNG, JPG o JPEG.");
      return;
    }
    if (file.size > MAX_LOGO_SIZE) {
      toast.error("Tamaño máximo: 5 MB.");
      return;
    }
    setLogoPreview(URL.createObjectURL(file));
    try {
      const url = await uploadLogo(file);
      setFormMarca((prev) => ({ ...prev, imagen_url: url }));
      setLogoPreview(url);
      toast.success("Logo subido correctamente.");
    } catch (err) {
      toast.error((err as Error).message ?? "Error al subir logo");
      setLogoPreview(null);
    }
    e.target.value = "";
  }, [uploadLogo, toast]);

  const tabs = [
    { id: '1', label: t.admin?.analytics || 'Analíticas', isActive: activeTab === '1', disabled: false },
    { id: '2', label: t.admin?.aiAssistant || 'Asistente AI', isActive: activeTab === '2', disabled: false },
  ];

  const handleTabClick = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab && !tab.disabled) {
      setActiveTab(tabId);
    }
  };

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 4, md: 6 },
        width: "100%",
        backgroundColor: '#000000',
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 6, lg: 8 } }}>
        <Box sx={{ px: { xs: 3, md: 0 } }}>
          <Stack spacing={3}>
            {/* Breadcrumb */}
            <Breadcrumb
              items={[
                { label: t.admin?.panel || 'Panel', href: '/admin/panel/home' },
                { label: t.admin?.panelProLiberter || 'Panel Pro Liberter' }
              ]}
            />

            {/* Tabs */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: isMobile ? 'flex-start' : 'center',
                gap: isMobile ? 1 : 0,
                mb: 4,
                alignItems: 'center',
                flexWrap: 'nowrap',
                width: isMobile ? '100%' : 'auto',
                overflowX: isMobile ? 'auto' : 'visible',
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
                scrollbarWidth: 'none',
              }}
            >
              {tabs.map((tab, index) => (
                <RenderTabs
                  key={`tab-${tab.id}`}
                  id={tab.id}
                  label={tab.label}
                  isActive={tab.isActive}
                  onClick={() => handleTabClick(tab.id)}
                  isFirst={index === 0}
                  isLast={index === tabs.length - 1}
                  isMobile={isMobile}
                />
              ))}
            </Box>

            {/* Tab Content - Analíticas */}
            {activeTab === '1' && (
              <>
            {/* Cards de estadísticas */}
            <Grid container spacing={4}>
              {stats.map((stat, i) => (
                <Grid size={{ xs: 12, md: 4 }} key={`stat-${stat.label}-${i}`}>
            <Box
              sx={{
                position: "relative",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))",
                border: "2px solid rgba(41, 196, 128, 0.1)",
                borderRadius: "24px",
                overflow: "hidden",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      cursor: "default",
                      "&:hover": {
                        backgroundColor: "rgba(41, 196, 128, 0.08)",
                        borderColor: "rgba(41, 196, 128, 0.4)",
                      },
                padding: { xs: 3, md: 4 },
                      gap: 2,
                      textAlign: 'center',
              }}
            >
                    <Box sx={{ color: '#34d399', fontSize: '2.5rem', display: 'flex', justifyContent: 'center' }}>
                      {getStatIcon(stat.icon)}
                    </Box>
                    <Typography
                      variant="body2"
                sx={{
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                }}
              >
                      {stat.label}
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontSize: '2rem',
                        fontWeight: 700,
                        color: '#34d399',
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                      }}
                    >
                      {stat.value}
                    </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

            {/* Más vistos y vendidos en la tienda */}
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))",
                    border: "2px solid rgba(41, 196, 128, 0.1)",
                    borderRadius: "24px",
                    overflow: "hidden",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "default",
                    "&:hover": {
                      backgroundColor: "rgba(41, 196, 128, 0.08)",
                      borderColor: "rgba(41, 196, 128, 0.4)",
                    },
                    padding: { xs: 3, md: 4 },
                    gap: 3,
                    height: '100%',
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: { xs: '1.25rem', md: '1.5rem' },
                      fontWeight: 700,
                      color: '#34d399',
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    Mas vistos en la tienda
                  </Typography>
                  <Stack spacing={2}>
                    {mostViewed.map((item, i) => (
                      <Box
                        key={`viewed-${item.name}-${i}`}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          border: '1px solid rgba(41, 196, 128, 0.2)',
                          borderRadius: '12px',
                          px: 2,
                          py: 1.5,
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          "&:hover": {
                            borderColor: "rgba(41, 196, 128, 0.4)",
                            backgroundColor: "rgba(41, 196, 128, 0.05)",
                          },
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: '0.875rem',
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                            flex: 1
                          }}
                        >
                          {item.name}
                        </Typography>
                        <Chip 
                          label={String(item.value)} 
                          sx={{ 
                            fontSize: '0.875rem', 
                            px: 2, 
                            py: 1,
                            backgroundColor: 'rgba(41, 196, 128, 0.2)',
                            border: '1px solid rgba(41, 196, 128, 0.6)',
                            color: '#34d399',
                            borderRadius: '8px',
                            fontWeight: 500,
                            '& .MuiChip-label': {
                              padding: 0,
                            }
                          }} 
                        />
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))",
                    border: "2px solid rgba(41, 196, 128, 0.1)",
                    borderRadius: "24px",
                    overflow: "hidden",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "default",
                    "&:hover": {
                      backgroundColor: "rgba(41, 196, 128, 0.08)",
                      borderColor: "rgba(41, 196, 128, 0.4)",
                    },
                    padding: { xs: 3, md: 4 },
                    gap: 3,
                    height: '100%',
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: { xs: '1.25rem', md: '1.5rem' },
                      fontWeight: 700,
                      color: '#34d399',
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    Mas vendidos en la tienda
                  </Typography>
                  <Stack spacing={2}>
                    {mostSold.map((item, i) => (
                      <Box
                        key={`sold-${item.name}-${i}`}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          border: '1px solid rgba(41, 196, 128, 0.2)',
                          borderRadius: '12px',
                          px: 2,
                          py: 1.5,
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          "&:hover": {
                            borderColor: "rgba(41, 196, 128, 0.4)",
                            backgroundColor: "rgba(41, 196, 128, 0.05)",
                          },
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: '0.875rem',
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                            flex: 1
                          }}
                        >
                          {item.name}
                        </Typography>
                        <Chip 
                          label={String(item.value)} 
                          sx={{ 
                            fontSize: '0.875rem', 
                            px: 2, 
                            py: 1,
                            backgroundColor: 'rgba(41, 196, 128, 0.2)',
                            border: '1px solid rgba(41, 196, 128, 0.6)',
                            color: '#34d399',
                            borderRadius: '8px',
                            fontWeight: 500,
                            '& .MuiChip-label': {
                              padding: 0,
                            }
                          }} 
                        />
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Grid>
            </Grid>

            {/* Más vistos y vendidos marketplace */}
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))",
                    border: "2px solid rgba(41, 196, 128, 0.1)",
                    borderRadius: "24px",
                    overflow: "hidden",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "default",
                    "&:hover": {
                      backgroundColor: "rgba(41, 196, 128, 0.08)",
                      borderColor: "rgba(41, 196, 128, 0.4)",
                    },
                    padding: { xs: 3, md: 4 },
                    gap: 3,
                    height: '100%',
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: { xs: '1.25rem', md: '1.5rem' },
                      fontWeight: 700,
                      color: '#34d399',
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    Más vistos (Marketplace)
                  </Typography>
                  <Stack spacing={2}>
                    {mostViewedMarketplace.map((item, i) => (
                      <Box
                        key={`marketplace-viewed-${item.name}-${i}`}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          border: '1px solid rgba(41, 196, 128, 0.2)',
                          borderRadius: '12px',
                          px: 2,
                          py: 1.5,
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          "&:hover": {
                            borderColor: "rgba(41, 196, 128, 0.4)",
                            backgroundColor: "rgba(41, 196, 128, 0.05)",
                          },
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: '0.875rem',
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                            flex: 1
                          }}
                        >
                          {item.name}
                        </Typography>
                        <Chip 
                          label={String(item.value)} 
                          sx={{ 
                            fontSize: '0.875rem', 
                            px: 2, 
                            py: 1,
                            backgroundColor: 'rgba(41, 196, 128, 0.2)',
                            border: '1px solid rgba(41, 196, 128, 0.6)',
                            color: '#34d399',
                            borderRadius: '8px',
                            fontWeight: 500,
                            '& .MuiChip-label': {
                              padding: 0,
                            }
                          }} 
                        />
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))",
                    border: "2px solid rgba(41, 196, 128, 0.1)",
                    borderRadius: "24px",
                    overflow: "hidden",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "default",
                    "&:hover": {
                      backgroundColor: "rgba(41, 196, 128, 0.08)",
                      borderColor: "rgba(41, 196, 128, 0.4)",
                    },
                    padding: { xs: 3, md: 4 },
                    gap: 3,
                    height: '100%',
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: { xs: '1.25rem', md: '1.5rem' },
                      fontWeight: 700,
                      color: '#34d399',
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    Más vendidos (Marketplace)
                  </Typography>
                  <Stack spacing={2}>
                    {mostSoldMarketplace.map((item, i) => (
                      <Box
                        key={`marketplace-sold-${item.name}-${i}`}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          border: '1px solid rgba(41, 196, 128, 0.2)',
                          borderRadius: '12px',
                          px: 2,
                          py: 1.5,
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          "&:hover": {
                            borderColor: "rgba(41, 196, 128, 0.4)",
                            backgroundColor: "rgba(41, 196, 128, 0.05)",
                          },
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: '0.875rem',
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                            flex: 1
                          }}
                        >
                          {item.name}
                        </Typography>
                        <Chip 
                          label={String(item.value)} 
                          sx={{ 
                            fontSize: '0.875rem', 
                            px: 2, 
                            py: 1,
                            backgroundColor: 'rgba(41, 196, 128, 0.2)',
                            border: '1px solid rgba(41, 196, 128, 0.6)',
                            color: '#34d399',
                            borderRadius: '8px',
                            fontWeight: 500,
                            '& .MuiChip-label': {
                              padding: 0,
                            }
                          }} 
                        />
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Grid>
            </Grid>
              </>
            )}

            {/* Tab Content - Asistente AI */}
            {activeTab === '2' && (
              <Box className="panel-ai-root" sx={{ width: '100%' }}>
                <h1 className="panel-ai-main-title">Configuración de IA Personalizada para tu Negocio</h1>
                <p className="panel-ai-instruction">
                  ¡Dale vida a tu asistente virtual en Liberty Club! Completa la siguiente información para que tu IA represente fielmente tu marca y ayude a tus clientes de la mejor manera.
                </p>
                <div className="panel-ai-tabs">
                  {assistantTabs.map((tabName, i) => (
                    <button
                      key={tabName}
                      type="button"
                      className={`panel-ai-tab ${assistantTab === i ? "panel-ai-tab-active" : "panel-ai-tab-inactive"}`}
                      onClick={() => setAssistantTab(i)}
                    >
                      {tabName}
                    </button>
                  ))}
                </div>
                <div className="panel-ai-content">
                {assistantTab === 0 && (
                  <div>
                    <h2 className="panel-ai-heading">Identidad de la marca</h2>
                    <div className="panel-ai-grid panel-ai-grid-2" style={{ marginBottom: 24 }}>
                      <div>
                        <label className="panel-ai-field-label">Nombre de la empresa/marca</label>
                        <input
                          className="panel-ai-input"
                          type="text"
                          value={formMarca.nombre}
                          onChange={(e) => updateMarca("nombre", e.target.value)}
                          placeholder="Ej: Androide Tecnology"
                        />
                      </div>
                      <div className="panel-ai-logo-section">
                        {logoPreview || formMarca.imagen_url ? (
                          <img src={logoPreview || formMarca.imagen_url || ""} alt="Logo" className="panel-ai-logo-preview" />
                        ) : (
                          <AddPhotoAlternate className="panel-ai-logo-icon" sx={{ fontSize: 48, color: 'var(--panel-ai-brand)' }} />
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/jpg"
                          onChange={handleLogoChange}
                          style={{ display: "none" }}
                          disabled={isUploadingLogo}
                        />
                        <button
                          type="button"
                          className="panel-ai-upload-btn"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingLogo}
                        >
                          {isUploadingLogo ? "Subiendo..." : "Subir logo"}
                        </button>
                        <p className="panel-ai-upload-hint">PNG, JPG o JPEG. Máx. 5 MB</p>
                      </div>
                    </div>
                    <div className="panel-ai-grid panel-ai-grid-2" style={{ marginBottom: 24 }}>
                      <div>
                        <label className="panel-ai-field-label">Descripción breve de la empresa</label>
                        <textarea
                          className="panel-ai-textarea"
                          rows={3}
                          value={formMarca.descripcion}
                          onChange={(e) => updateMarca("descripcion", e.target.value)}
                          placeholder="Describe tu empresa..."
                        />
                      </div>
                      <div>
                        <label className="panel-ai-field-label">Ventajas y beneficios de elegir tu marca</label>
                        <textarea
                          className="panel-ai-textarea"
                          rows={3}
                          value={formMarca.ventajasTienda}
                          onChange={(e) => updateMarca("ventajasTienda", e.target.value)}
                          placeholder="Lista las ventajas de tu marca..."
                        />
                      </div>
                    </div>
                    <div className="panel-ai-grid panel-ai-grid-2" style={{ marginBottom: 24 }}>
                      <div>
                        <label className="panel-ai-field-label">Tipos de productos y servicios</label>
                        <input
                          className="panel-ai-input"
                          type="text"
                          value={formMarca.tipo_producto}
                          onChange={(e) => updateMarca("tipo_producto", e.target.value)}
                          placeholder="Ej: Celulares, accesorios..."
                        />
                      </div>
                      <div>
                        <label className="panel-ai-field-label">Marcas de los productos (si aplica)</label>
                        <input
                          className="panel-ai-input"
                          type="text"
                          value={formMarca.marca_producto}
                          onChange={(e) => updateMarca("marca_producto", e.target.value)}
                          placeholder="Samsung - Xiaomi - Apple..."
                        />
                      </div>
                    </div>
                    <div className="panel-ai-grid panel-ai-grid-2" style={{ marginBottom: 24 }}>
                      <div>
                        <label className="panel-ai-field-label">Slogan de la empresa</label>
                        <input
                          className="panel-ai-input"
                          type="text"
                          value={formMarca.slogan}
                          onChange={(e) => updateMarca("slogan", e.target.value)}
                          placeholder="Ej: Innovación a tu alcance"
                        />
                      </div>
                      <div>
                        <label className="panel-ai-field-label">Objetivo principal de la marca</label>
                        <input
                          className="panel-ai-input"
                          type="text"
                          value={formMarca.objetivo}
                          onChange={(e) => updateMarca("objetivo", e.target.value)}
                          placeholder="Ej: Expandir nuestra tecnología"
                        />
                      </div>
                    </div>
                    <div className="panel-ai-grid panel-ai-grid-2" style={{ marginBottom: 24 }}>
                      <div>
                        <label className="panel-ai-field-label">Valores de la empresa</label>
                        <input
                          className="panel-ai-input"
                          type="text"
                          value={formMarca.valores}
                          onChange={(e) => updateMarca("valores", e.target.value)}
                          placeholder="Ej: Innovación, Transparencia"
                        />
                      </div>
                      <div>
                        <label className="panel-ai-field-label">Trayectoria (años en el mercado)</label>
                        <input
                          className="panel-ai-input"
                          type="text"
                          value={formMarca.trayectoria}
                          onChange={(e) => updateMarca("trayectoria", e.target.value)}
                          placeholder="Ej: 10 años en el mercado"
                        />
                      </div>
                    </div>
                    <div className="panel-ai-grid panel-ai-grid-2" style={{ marginBottom: 24 }}>
                      <div>
                        <label className="panel-ai-field-label">Ubicación y sucursales</label>
                        <input
                          className="panel-ai-input"
                          type="text"
                          value={formMarca.ubicacion}
                          onChange={(e) => updateMarca("ubicacion", e.target.value)}
                          placeholder="Ubicación y sucursales"
                        />
                      </div>
                      <div />
                    </div>
                    <div style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
                      <button type="button" className="panel-ai-save-btn" onClick={handleSaveMarca} disabled={isSaving}>
                        {isSaving ? "Guardando..." : "Guardar"}
                      </button>
                    </div>
                  </div>
                )}
                {assistantTab === 1 && policyContent}
                {assistantTab === 2 && logisticsContent}
                {assistantTab === 3 && questionsContent}
                {assistantTab === 4 && personalityContent}
                {assistantTab === 5 && scenariosContent}
                </div>
              </Box>
            )}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
} 