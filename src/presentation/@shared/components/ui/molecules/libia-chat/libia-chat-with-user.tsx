"use client";

import React from "react";
import { usePathname } from "next/navigation";
import LibiaChat from "./libia-chat";
import { useUserProfile } from "@/presentation/@shared/hooks/use-user-profile";
import { useSubscription } from "@/presentation/@shared/hooks/use-subscription";
import { useLibiaPageContext } from "@/presentation/@shared/contexts/libia-page-context";
import { useLibiaAssistantConfig } from "@/presentation/admin/panel/commerce/hooks/use-libia-assistant-config";

const DEFAULT_AVATAR = "/images/libia-avatar.svg";

/**
 * Wrapper de LibiaChat que inyecta datos del usuario y el contexto correcto.
 * Endpoints: /chat/user | /chat/seller/plan | /chat/seller/plan/panel | /chat/seller/plan/product
 * En contexto comercio usa la config del asistente IA (logo, nombre, empresa) si está configurada.
 */
export default function LibiaChatWithUser() {
  const pathname = usePathname();
  const libiaPage = useLibiaPageContext();
  const { userProfile } = useUserProfile();
  const { subscription } = useSubscription(userProfile?.id);
  const { config } = useLibiaAssistantConfig();

  const isCommerce = userProfile?.accountType === "seller" || userProfile?.accountType === "commerce";
  const isInPanel = pathname?.includes("/admin/panel/panel-proliberter") ?? false;

  // Si estamos en contexto producto (página de detalle), usar endpoint product
  const productContext = libiaPage?.context.type === "product" ? libiaPage.context : null;

  const userType = productContext
    ? "product"   // /chat/seller/plan/product
    : isCommerce
      ? isInPanel
        ? "panel"   // /chat/seller/plan/panel
        : "seller"  // /chat/seller/plan
      : "user";    // /chat/user

  const plan = subscription?.plan?.name ?? undefined;
  const codigoComercio = productContext?.storeId ?? (isCommerce ? userProfile?.id : undefined);

  // Personalización según config del comercio (solo en contexto seller/panel/product)
  const title = userType !== "user" && config?.nombre_ia ? config.nombre_ia : "Libia";
  const subtitle =
    userType !== "user" && config?.empresa?.nombre
      ? config.empresa.nombre
      : "Asistente de LibertyClub";
  const avatarUrl =
    userType !== "user" && config?.imagen_url ? config.imagen_url : DEFAULT_AVATAR;

  return (
    <LibiaChat
      endpoint="/api/v1/libia/ask"
      userType={userType}
      codigoIdentificacionUsuario={userProfile?.id ?? undefined}
      codigoIdentificacionComercio={codigoComercio}
      productId={productContext?.productId}
      plan={plan}
      budget={null}
      title={title}
      subtitle={subtitle}
      avatarUrl={avatarUrl}
      brandColor="#99999cff"
      position="bottom-right"
      openByDefault={false}
      placeholder="Escribe tu mensaje..."
      sendLabel="Enviar"
    />
  );
}
