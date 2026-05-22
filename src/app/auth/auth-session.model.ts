import type { AppRole } from './auth-role.util';

export interface AuthSession {
  rol: AppRole;
  idUsuario: number;
  idTrabajador?: number;
  idAdministrador?: number;
}
