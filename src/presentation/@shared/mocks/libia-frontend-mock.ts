/** Respuesta simulada del asistente Libia (sin API routes ni libia.libertyclub.io). */
export const LIBIA_MOCK_REPLY_HTML =
  '<p>Modo <strong>prototipo</strong>: no hay servidor Libia. Explorá el catálogo, agregá productos al carrito y completá el checkout para simular una compra.</p>';

export async function libiaMockReply(delayMs = 500): Promise<{ response: string }> {
  await new Promise((r) => setTimeout(r, delayMs));
  return { response: LIBIA_MOCK_REPLY_HTML };
}
