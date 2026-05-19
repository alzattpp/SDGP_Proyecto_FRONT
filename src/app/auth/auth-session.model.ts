import type { AppRole } from './auth-role.util';

/** Sesión validada: rol del token + ids del perfil /me del mismo rol. */
export interface AuthSession {
  rol: AppRole;
  idUsuario: number;
  idTrabajador?: number;
  idAdministrador?: number;
}
