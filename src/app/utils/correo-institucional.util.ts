export const SUFIJO_CORREO_AUTONOMA = '@autonoma.edu.co';

export const MENSAJE_CORREO_AUTONOMA =
  'Solo se permite iniciar sesión con un correo @autonoma.edu.co.';

/** El dominio después de @ debe ser exactamente autonoma.edu.co */
export function esCorreoAutonoma(correo: string): boolean {
  const c = correo.trim().toLowerCase();
  const sufijo = SUFIJO_CORREO_AUTONOMA;
  if (!c.endsWith(sufijo)) return false;
  const local = c.slice(0, -sufijo.length);
  return local.length > 0 && !local.includes('@');
}
