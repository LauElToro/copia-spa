import { redirect } from "next/navigation";

/** Ruta de Mensajería eliminada; redirige al panel principal */
export default function Page() {
  redirect("/admin/panel/panel-proliberter");
} 