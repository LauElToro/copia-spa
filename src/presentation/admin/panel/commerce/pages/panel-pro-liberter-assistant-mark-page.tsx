"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Box, Container, Grid } from "@mui/material";
import { Public as GlobeIcon } from "@mui/icons-material";
import { Text } from "@/presentation/@shared/components/ui/atoms/text";
import { Radio } from "@/presentation/@shared/components/ui/atoms/radio";
import { Checkbox } from "@/presentation/@shared/components/ui/atoms/checkbox";
import { Stack } from "@/presentation/@shared/components/ui/molecules/stack";
import { Breadcrumb } from "@/presentation/@shared/components/ui/molecules/breadcrumb/breadcrumb";
import { useLibiaAssistantConfig } from "../hooks/use-libia-assistant-config";
import { useToast } from "@/presentation/@shared/components/ui/molecules/toast";
import { useLanguage } from "@/presentation/@shared/hooks/use-language";
import { isFrontendMockMode } from "@/presentation/@shared/mocks/frontend-mock-flag";
import { libiaMockReply } from "@/presentation/@shared/mocks/libia-frontend-mock";
import "./panel-ai-assistant.css";

const tabs = [
  "Marca",
  "Políticas",
  "Logística",
  "Preguntas",
  "Personalidad",
  "Escenarios",
  "Probar LIBIA",
];

const LIBIA_ENDPOINTS = [
  { id: "user", label: "/chat/user", desc: "Usuario / visitante" },
  { id: "seller", label: "/chat/seller/plan", desc: "Vendedor en tienda" },
  { id: "panel", label: "/chat/seller/plan/panel", desc: "Panel comercio" },
  { id: "product", label: "/chat/seller/plan/product", desc: "Contexto producto" },
];

const policyContent = (
  <Box className="panel-ai-tab-inner">
    <Stack spacing={4}>
      <h2 className="panel-ai-heading">Políticas y atención al cliente</h2>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={2}>
            <Text weight="bold" sx={{ color: "#fff" }}>Objeciones comunes y respuestas sugeridas</Text>
            <Box className="panel-ai-box">
              <Text component="span" sx={{ color: "rgba(255,255,255,0.9)" }}>&quot;¿Y si el celular no funciona?&quot;<br />
                Todos nuestros productos cuentan con garantía oficial. Si hay algún problema de fábrica, te lo cambiamos o gestionamos la reparación sin costo.</Text>
            </Box>
            <Box className="panel-ai-box">
              <Text component="span" sx={{ color: "rgba(255,255,255,0.9)" }}>&quot;¿Tiene garantía?&quot;<br />
                Sí, todos los productos tienen garantía oficial del fabricante.</Text>
            </Box>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={2}>
            <Text weight="bold" sx={{ color: "#fff" }}>Política de devoluciones</Text>
            <Box className="panel-ai-box">
              <Text component="span" sx={{ color: "rgba(255,255,255,0.9)" }}>Aceptamos devoluciones dentro de los 10 días posteriores a la compra, siempre que el producto esté sin uso, en su empaque original y con todos los accesorios. En caso de compra online, el cliente puede desistir de la compra dentro de los 10 días de recibido el producto (según la Ley de Defensa del Consumidor en Argentina).</Text>
            </Box>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={2}>
            <Text weight="bold" sx={{ color: "#fff" }}>Políticas para productos fallados</Text>
            <Box className="panel-ai-box">
              <Text component="span" sx={{ color: "rgba(255,255,255,0.9)" }}>Si el producto presenta una falla de fábrica dentro de los primeros 10 días, se realiza el cambio inmediato por uno nuevo. Luego de ese período, gestionamos la garantía oficial con el fabricante o servicio técnico autorizado correspondiente. No cubrimos daños por mal uso, golpes, agua o intervención externa.</Text>
            </Box>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={2}>
            <Text weight="bold" sx={{ color: "#fff" }}>Políticas generales de la empresa</Text>
            <Box className="panel-ai-box">
              <Text component="span" sx={{ color: "rgba(255,255,255,0.9)" }}>Todos los productos se entregan con factura.<br />
                Los medios de pago incluyen tarjetas, transferencia, efectivo y plataformas digitales.<br />
                El stock está sujeto a disponibilidad y puede variar sin previo aviso.</Text>
            </Box>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={2}>
            <Text weight="bold" sx={{ color: "#fff" }}>Garantías que ofrece la empresa</Text>
            <Box className="panel-ai-box">
              <Text component="span" sx={{ color: "rgba(255,255,255,0.9)" }}>Garantía oficial del fabricante (de 6 a 12 meses según el producto).<br />
                Soporte inicial de nuestra tienda para gestionar cualquier inconveniente.<br />
                Posibilidad de contratar garantía extendida en algunos casos.</Text>
            </Box>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={2}>
            <Text weight="bold" sx={{ color: "#fff" }}>¿Por qué deberían elegirte sobre la competencia?</Text>
            <Box className="panel-ai-box">
              <Text component="span" sx={{ color: "rgba(255,255,255,0.9)" }}>Porque ofrecemos productos originales, precios competitivos y atención personalizada. Nos destacamos por la confianza que generamos con nuestros clientes, la rapidez en la entrega y el respaldo postventa. No somos solo una tienda: acompañamos tu compra para que tengas una experiencia segura y sin sorpresas.</Text>
            </Box>
          </Stack>
        </Grid>
      </Grid>
      <Stack direction="row" justifyContent="center">
        <button type="button" className="panel-ai-save-btn">Guardar</button>
      </Stack>
    </Stack>
  </Box>
);

const logisticsContent = (
  <Box className="panel-ai-tab-inner">
    <Stack spacing={4}>
      <h2 className="panel-ai-heading">Logística y Métodos de Pago</h2>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <label className="panel-ai-field-label">Métodos de envío nacionales</label>
          <input className="panel-ai-input" type="text" defaultValue="Hacemos envíos regionales y a todo el país atraves de oca" />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <label className="panel-ai-field-label">Tiempos de entrega estimados</label>
          <input className="panel-ai-input" type="text" defaultValue="48 a 72 horas habiles" />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <label className="panel-ai-field-label">¿Se puede retirar desde la tienda?</label>
          <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 2, flexWrap: "wrap" }}>
            <Radio label="Sí" name="retiroTienda" id="retiroSi" />
            <Radio label="No" name="retiroTienda" id="retiroNo" state="checked" />
          </Stack>
          <input className="panel-ai-input" id="retiro-sucursal" type="text" defaultValue="Sucursal" />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <label className="panel-ai-field-label">¿Realizan envíos internacionales?</label>
          <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 2, flexWrap: "wrap" }}>
            <Radio label="Sí" name="envioInt" id="envioIntSi" />
            <Radio label="No" name="envioInt" id="envioIntNo" state="checked" />
          </Stack>
          <input className="panel-ai-input" id="envio-internacional" type="text" defaultValue="Internacionales" />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <label className="panel-ai-field-label">Formas de pago aceptadas</label>
          <Stack spacing={1.5} className="panel-ai-checkbox-stack">
            <Checkbox label="Tarjeta de crédito" id="credito" defaultChecked />
            <Checkbox label="Tarjeta de débito" id="debito" defaultChecked />
            <Checkbox label="Criptomonedas" id="cripto" defaultChecked />
            <Checkbox label="Transferencia bancaria" id="transferencia" defaultChecked />
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <label className="panel-ai-field-label">Facturación (Tipo de comprobante emitido)</label>
          <input className="panel-ai-input" id="facturacion" type="text" defaultValue="factura a b c" />
        </Grid>
      </Grid>
      <Stack direction="row" justifyContent="center" sx={{ mt: 4 }}>
        <button type="button" className="panel-ai-save-btn">Guardar</button>
      </Stack>
    </Stack>
  </Box>
);

const questionsContent = (
  <Box className="panel-ai-tab-inner">
    <Stack spacing={4}>
      <h2 className="panel-ai-heading">Preguntas frecuentes</h2>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={3}>
            <div>
              <label className="panel-ai-field-label">¿Puedo devolver un producto si no me gusta?</label>
              <Stack direction="row" spacing={3} alignItems="center" sx={{ mt: 1 }}>
                <Radio label="Sí" name="devolver" id="devolverSi" state="checked" />
                <Radio label="No" name="devolver" id="devolverNo" />
              </Stack>
            </div>
            <div>
              <label className="panel-ai-field-label">¿Los productos con oferta tienen cambio?</label>
              <Stack direction="row" spacing={3} alignItems="center" sx={{ mt: 1 }}>
                <Radio label="Sí" name="ofertaCambio" id="ofertaCambioSi" state="checked" />
                <Radio label="No" name="ofertaCambio" id="ofertaCambioNo" />
              </Stack>
            </div>
            <div>
              <label className="panel-ai-field-label">¿Los productos tienen garantía?</label>
              <Stack direction="row" spacing={3} alignItems="center" sx={{ mt: 1 }}>
                <Radio label="Sí" name="garantia" id="garantiaSi" state="checked" />
                <Radio label="No" name="garantia" id="garantiaNo" />
              </Stack>
            </div>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={3}>
            <div>
              <label className="panel-ai-field-label">¿Cuánto tiempo tengo para cambiar un artículo?</label>
              <input className="panel-ai-input" type="text" defaultValue="10 dias desde la compra" style={{ marginTop: 8 }} />
            </div>
            <div>
              <label className="panel-ai-field-label">¿Qué necesito para hacer una devolución?</label>
              <input className="panel-ai-input" type="text" defaultValue="la factura y estar dentro de el tiempo" style={{ marginTop: 8 }} />
            </div>
            <div>
              <label className="panel-ai-field-label">¿Qué cubre la garantía?</label>
              <input className="panel-ai-input" type="text" defaultValue="desperfectos tecnicos y arrepentimiento de compra" style={{ marginTop: 8 }} />
            </div>
          </Stack>
        </Grid>
      </Grid>
      <h3 className="panel-ai-subheading">¿Cómo gestiono un reclamo por producto defectuoso?</h3>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <label className="panel-ai-field-label">Elegir forma de contacto</label>
          <Stack spacing={1.5} className="panel-ai-checkbox-stack" sx={{ mt: 1 }}>
            <Checkbox label="E-mail" id="email" defaultChecked />
            <Checkbox label="Teléfono" id="telefono" defaultChecked />
            <Checkbox label="Chat en vivo" id="chat" />
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={2}>
            <div>
              <label className="panel-ai-field-label">E-mail de contacto</label>
              <input className="panel-ai-input" type="text" defaultValue="juanmcareaga@gmail.com" style={{ marginTop: 8 }} />
            </div>
            <div>
              <label className="panel-ai-field-label">Teléfono</label>
              <input className="panel-ai-input" type="text" defaultValue="1138010146" style={{ marginTop: 8 }} />
            </div>
            <div>
              <label className="panel-ai-field-label">Chat / Otro</label>
              <input className="panel-ai-input" type="text" defaultValue="Ejemplo: zoom@Usuario123" style={{ marginTop: 8 }} />
            </div>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <label className="panel-ai-field-label">Horarios de atención</label>
          <input className="panel-ai-input" type="text" defaultValue="lun a viernes 9 a 19:30" style={{ marginTop: 8 }} />
        </Grid>
      </Grid>
      <Stack direction="row" justifyContent="center" sx={{ mt: 4 }}>
        <button type="button" className="panel-ai-save-btn">Guardar</button>
      </Stack>
    </Stack>
  </Box>
);

const personalityContent = (
  <Box className="panel-ai-tab-inner">
    <Stack spacing={4}>
      <h2 className="panel-ai-heading">Personalidad de la IA</h2>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Text weight="bold" sx={{ mb: 3, display: 'block', color: "#fff" }}>Elige el tono de respuesta de tu IA</Text>
          <Stack spacing={2} className="panel-ai-radio-stack">
            <Radio label="Amigable (Cálido y accesible)" name="tono" id="amigable" state="checked" />
            <Radio label="Formal (Profesional y estructurado)" name="tono" id="formal" />
            <Radio label="Casual e informal (Relajado y directo)" name="tono" id="casual" />
            <Radio label="Técnico (Preciso y detallado)" name="tono" id="preciso" />
            <Radio label="Persuasivo / Comercial (Enfocado en cerrar ventas)" name="tono" id="persuasivo" />
            <Radio label="Serio y conciso (Directo y sin adornos)" name="tono" id="serio" />
            <Radio label="Divertido y carismático (Con humor y personalidad)" name="tono" id="divertido" />
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Text weight="bold" sx={{ mb: 3, display: 'block' }}>Identidad de la IA</Text>
          <Stack spacing={2}>
            <Radio label="Femenino" name="identidad" id="femenino" />
            <Radio label="Masculino" name="identidad" id="masculino" state="checked" />
            <Radio label="Sin género" name="identidad" id="sinGenero" />
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Text weight="bold" sx={{ mb: 2, display: 'block', color: "#fff" }}>¿Debe usar emojis?</Text>
          <Stack spacing={2} className="panel-ai-radio-stack">
            <Radio label="Sí, muchos" name="emojis" id="emojisMuchos" state="checked" />
            <Radio label="Sí, pero con moderación" name="emojis" id="emojisModerado" />
            <Radio label="No, sin emojis" name="emojis" id="emojisNo" />
          </Stack>
        </Grid>
      </Grid>
      <Stack direction="row" justifyContent="center" sx={{ mt: 4 }}>
        <button type="button" className="panel-ai-save-btn">Guardar</button>
      </Stack>
    </Stack>
  </Box>
);

const scenariosContent = (
  <Box className="panel-ai-tab-inner">
    <Stack spacing={4}>
      <h2 className="panel-ai-heading">Escenarios de conversación y casos de uso</h2>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Text weight="bold" sx={{ mb: 1, display: 'block', color: "#fff" }}>Casos más frecuentes que la IA debe resolver</Text>
          <Box className="panel-ai-box" sx={{ minHeight: 120 }}>
            <Text component="span" sx={{ color: "rgba(255,255,255,0.8)" }}>
              Consulta de precios y stock<br />
              &quot;¿Cuánto cuesta el iPhone 13?&quot;<br />
              &quot;¿Tenés el Samsung Galaxy S23 disponible en color negro?&quot;
            </Text>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Text weight="bold" sx={{ mb: 1, display: 'block', color: "#fff" }}>Situaciones en las que la IA debe derivar a un humano</Text>
          <Box className="panel-ai-box" sx={{ minHeight: 120 }}>
            <Text component="span" sx={{ color: "rgba(255,255,255,0.8)" }}>
              EN EL CASO DE QUE NO TENGA RESPUESTAS DEBE DERIVAR A JUANMCAREAGA@GMAIL.COM , CON UN MENSAJE COMO &quot;No tengo la respuesta a esa consulta, por favor comunicate a este e-mail, juanmcareaga@gmail.com&quot;
            </Text>
          </Box>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <label className="panel-ai-field-label">¿Cómo debe manejar consultas fuera de su conocimiento?</label>
          <Stack spacing={2} className="panel-ai-radio-stack" sx={{ mt: 1 }}>
            <Radio label="&quot;No tengo esa información, pero puedo ayudarte con otra consulta&quot;" name="fueraConocimiento" id="sinInfo" />
            <Radio label="&quot;Derivar a atención al cliente&quot;" name="fueraConocimiento" id="derivar" state="checked" />
            <Radio label="&quot;Intentar ofrecer una respuesta aproximada basada en contexto&quot;" name="fueraConocimiento" id="aproximada" />
          </Stack>
        </Grid>
      </Grid>
      <Stack direction="row" justifyContent="center" sx={{ mt: 4 }}>
        <button type="button" className="panel-ai-save-btn">Guardar</button>
      </Stack>
    </Stack>
  </Box>
);

const MAX_LOGO_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

export default function PanelProLiberterAssistantMarkPage() {
  const { t } = useLanguage();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState(0);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [testEndpoint, setTestEndpoint] = useState("user");
  const [testMessage, setTestMessage] = useState("Hola, ¿cómo funciona el envío?");
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const { config, isSaving, save, uploadLogo, isUploadingLogo, storeId } = useLibiaAssistantConfig();

  // Estado controlado del formulario Marca
  const [formMarca, setFormMarca] = useState({
    nombre: "",
    descripcion: "",
    ventajasTienda: "",
    tipo_producto: "",
    marca_producto: "",
    slogan: "",
    objetivo: "",
    valores: "",
    trayectoria: "",
    ubicacion: "",
    imagen_url: "",
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
    if (!storeId) {
      toast.error("No se pudo identificar la tienda.");
      return;
    }
    try {
      await save({
        storeId,
        empresa: {
          nombre: formMarca.nombre,
          descripcion: formMarca.descripcion,
          ventajasTienda: formMarca.ventajasTienda,
          tipo_producto: formMarca.tipo_producto,
          marca_producto: formMarca.marca_producto,
          slogan: formMarca.slogan,
          objetivo: formMarca.objetivo,
          valores: formMarca.valores,
          trayectoria: formMarca.trayectoria,
          ubicacion: formMarca.ubicacion,
        },
        nombre_ia: formMarca.nombre,
        imagen_url: formMarca.imagen_url || config.imagen_url || "",
      });
      toast.success("Marca guardada correctamente.");
    } catch (err) {
      toast.error((err as Error).message ?? "Error al guardar");
    }
  }, [formMarca, config.imagen_url, save, storeId, toast]);

  const handleLogoChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    },
    [uploadLogo, toast]
  );

  const handleTestLibia = async () => {
    setTestLoading(true);
    setTestResponse(null);
    try {
      if (isFrontendMockMode()) {
        const data = await libiaMockReply(500);
        setTestResponse(data.response);
        return;
      }
      const res = await fetch("/api/v1/libia/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: testMessage,
          message: testMessage,
          userType: testEndpoint,
          codigoIdentificacionUsuario: undefined,
          codigoIdentificacionComercio: testEndpoint !== "user" ? storeId : undefined,
          productId: testEndpoint === "product" ? "test-product-id" : undefined,
        }),
      });
      const data = await res.json();
      if (data?.response) {
        setTestResponse(data.response);
      } else {
        setTestResponse(`Error: ${data?.detail || data?.error || "Sin respuesta"}`);
      }
    } catch (err) {
      setTestResponse(`Error: ${(err as Error).message}`);
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <Box component="section" className="panel-ai-root" sx={{ py: { xs: 4, md: 6 }, width: "100%", minHeight: "100vh" }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 4, lg: 6 } }}>
        <Box sx={{ px: { xs: 2, md: 0 } }}>
          <Breadcrumb
            items={[
              { label: t.admin?.panel || "Panel", href: "/admin/panel/home" },
              { label: t.admin?.panelProLiberter || "Panel Pro Liberter", href: "/admin/panel/panel-proliberter" },
              { label: t.admin?.aiAssistant || "Asistente AI" },
            ]}
          />
          <h1 className="panel-ai-main-title">
            Configuración de IA Personalizada para tu Negocio
          </h1>
          <p className="panel-ai-instruction">
            ¡Dale vida a tu asistente virtual en Liberty Club! Completa la siguiente información para que tu IA represente fielmente tu marca y ayude a tus clientes de la mejor manera.
          </p>
          <div className="panel-ai-tabs">
            {tabs.map((tabName, i) => (
              <button
                key={tabName}
                type="button"
                className={`panel-ai-tab ${tab === i ? "panel-ai-tab-active" : "panel-ai-tab-inactive"}`}
                onClick={() => setTab(i)}
              >
                {tabName}
              </button>
            ))}
          </div>
          <div className="panel-ai-content">
            {tab === 0 && (
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
                      <GlobeIcon className="panel-ai-logo-icon" sx={{ fontSize: 64 }} />
                    )}
                    <input
                      id="logo-upload-ai"
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
                    <p className="panel-ai-upload-hint">Permitimos PNG, JPG o JPEG. Tamaño máximo 5 MB</p>
                  </div>
                </div>
                <div className="panel-ai-grid panel-ai-grid-2" style={{ marginBottom: 24 }}>
                  <div>
                    <label className="panel-ai-field-label">Descripción breve de la empresa</label>
                    <textarea
                      className="panel-ai-textarea"
                      rows={5}
                      value={formMarca.descripcion}
                      onChange={(e) => updateMarca("descripcion", e.target.value)}
                      placeholder="Describe tu empresa..."
                    />
                  </div>
                  <div>
                    <label className="panel-ai-field-label">Ventajas y beneficios de elegir tu marca</label>
                    <textarea
                      className="panel-ai-textarea"
                      rows={5}
                      value={formMarca.ventajasTienda}
                      onChange={(e) => updateMarca("ventajasTienda", e.target.value)}
                      placeholder="Lista las ventajas de tu marca..."
                    />
                  </div>
                </div>
                <div className="panel-ai-grid panel-ai-grid-2" style={{ marginBottom: 24 }}>
                  <div>
                    <label className="panel-ai-field-label">Tipos de productos y servicios que ofreces</label>
                    <textarea
                      className="panel-ai-textarea"
                      rows={3}
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
                      placeholder="Samsung - Xiaomi - Apple - Motor"
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
                    <label className="panel-ai-field-label">Trayectoria de la empresa (años en el mercado)</label>
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
                <div style={{ display: "flex", justifyContent: "center", marginTop: 32, paddingTop: 24 }}>
                  <button
                    type="button"
                    className="panel-ai-save-btn"
                    onClick={handleSaveMarca}
                    disabled={isSaving}
                  >
                    {isSaving ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </div>
            )}
            {tab === 1 && (
              <Box sx={{ color: "#fff" }} className="panel-ai-content">
                {policyContent}
              </Box>
            )}
            {tab === 2 && (
              <Box sx={{ color: "#fff" }} className="panel-ai-content">
                {logisticsContent}
              </Box>
            )}
            {tab === 3 && (
              <Box sx={{ color: "#fff" }} className="panel-ai-content">
                {questionsContent}
              </Box>
            )}
            {tab === 4 && (
              <Box sx={{ color: "#fff" }} className="panel-ai-content">
                {personalityContent}
              </Box>
            )}
            {tab === 5 && (
              <Box sx={{ color: "#fff" }} className="panel-ai-content">
                {scenariosContent}
              </Box>
            )}
            {tab === 6 && (
            <div className="panel-ai-content">
            <div className="panel-ai-test-section">
              <h2 className="panel-ai-heading">Probar los 4 endpoints de LIBIA</h2>
              <Text component="p" sx={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.8)", mb: 2 }}>
                Envía un mensaje a cada endpoint para verificar que libia.libertyclub.io responde correctamente.
              </Text>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <label className="panel-ai-field-label">Endpoint</label>
                    <Stack direction="row" flexWrap="wrap" spacing={1} sx={{ mb: 1 }}>
                      {LIBIA_ENDPOINTS.map((ep) => (
                        <button
                          key={ep.id}
                          type="button"
                          className={`panel-ai-tab ${testEndpoint === ep.id ? "panel-ai-tab-active" : "panel-ai-tab-inactive"}`}
                          onClick={() => setTestEndpoint(ep.id)}
                          style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                        >
                          {ep.label}
                        </button>
                      ))}
                    </Stack>
                    <Text component="span" sx={{ mt: 1, fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}>
                      {LIBIA_ENDPOINTS.find((e) => e.id === testEndpoint)?.desc}
                    </Text>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <label className="panel-ai-field-label">Mensaje de prueba</label>
                    <input
                      className="panel-ai-input"
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      placeholder="Escribe un mensaje..."
                      style={{ width: "100%", marginTop: 8 }}
                    />
                  </Grid>
                </Grid>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
                  <button
                    type="button"
                    className="panel-ai-save-btn"
                    onClick={handleTestLibia}
                    disabled={testLoading || !testMessage.trim()}
                  >
                    {testLoading ? "Enviando..." : "Enviar prueba"}
                  </button>
                  {(testEndpoint === "seller" || testEndpoint === "panel" || testEndpoint === "product") && (
                    <Text component="span" variant="small" sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem" }}>
                      (usa storeId: {storeId || "cargando..."})
                    </Text>
                  )}
                </Stack>
                {testResponse && (
                  <div className="panel-ai-test-response">
                    <strong style={{ color: "#00ff88", display: "block", marginBottom: 8 }}>Respuesta:</strong>
                    <div style={{ whiteSpace: "pre-wrap" }}>{testResponse}</div>
                  </div>
                )}
            </div>
            </div>
          )}
          </div>
        </Box>
      </Container>
    </Box>
  );
}
