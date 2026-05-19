import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, shareReplay, switchMap, tap } from 'rxjs';

import { AdministradorService } from '../services/administrador/administrador.service';
import { TrabajadorService } from '../services/trabajador/trabajador.service';
import { UsuarioService } from '../services/usuarios/usuario.service';
import type { AuthSession } from './auth-session.model';
import {
  extractMePayload,
  homeRouteForRole,
  normalizeAppRol,
  resolveRolFromResponse,
  type AppRole,
} from './auth-role.util';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly usuarioService = inject(UsuarioService);
  private readonly trabajadorService = inject(TrabajadorService);
  private readonly administradorService = inject(AdministradorService);

  private sessionCache: AuthSession | null | undefined;
  private sessionRequest$?: Observable<AuthSession | null>;

  /** Carga sesión desde cookie/token (GET /me según rol). */
  loadSession(force = false): Observable<AuthSession | null> {
    if (!force && this.sessionCache !== undefined) {
      return of(this.sessionCache);
    }
    if (!force && this.sessionRequest$) {
      return this.sessionRequest$;
    }

    this.sessionRequest$ = this.fetchSessionFromApi().pipe(
      tap((s) => {
        this.sessionCache = s;
        this.sessionRequest$ = undefined;
      }),
      catchError(() => {
        this.sessionCache = null;
        this.sessionRequest$ = undefined;
        return of(null);
      }),
      shareReplay(1),
    );

    return this.sessionRequest$;
  }

  refreshSession(): Observable<AuthSession | null> {
    this.clearSession();
    return this.loadSession(true);
  }

  clearSession(): void {
    this.sessionCache = undefined;
    this.sessionRequest$ = undefined;
  }

  getSessionSnapshot(): AuthSession | null {
    return this.sessionCache ?? null;
  }

  getHomeRoute(rol: AppRole): string {
    return homeRouteForRole(rol);
  }

  /** Tras login: rol del token debe coincidir con la ruta destino. */
  resolveRolFromLoginResponse(raw: unknown): AppRole | null {
    return resolveRolFromResponse(raw);
  }

  private fetchSessionFromApi(): Observable<AuthSession | null> {
    return this.usuarioService.getCurrentUsuario().pipe(
      switchMap((meRaw) => {
        const rol = resolveRolFromResponse(meRaw);
        if (!rol) return of(null);

        if (rol === 'trabajador') {
          return this.trabajadorService.getCurrentTrabajador().pipe(
            map((trabRaw) => this.buildSession('trabajador', meRaw, trabRaw)),
            catchError(() => of(null)),
          );
        }

        if (rol === 'administrador') {
          return this.administradorService.getCurrentAdministrador().pipe(
            map((adminRaw) => this.buildSession('administrador', meRaw, adminRaw)),
            catchError(() => of(null)),
          );
        }

        return of(this.buildSession('usuario', meRaw, null));
      }),
      catchError(() => of(null)),
    );
  }

  private buildSession(
    rolEsperado: AppRole,
    meRaw: unknown,
    rolRaw: unknown,
  ): AuthSession | null {
    const rolToken = resolveRolFromResponse(meRaw);
    if (!rolToken || rolToken !== rolEsperado) return null;

    const { u: uMe } = extractMePayload(meRaw);
    const idUsuario = this.pickId(uMe, ['idUsuario', 'id_usuario']);
    if (idUsuario <= 0) return null;

    if (rolEsperado === 'usuario') {
      return { rol: 'usuario', idUsuario };
    }

    const { u: uRol, rol: rolPerfilRaw } = extractMePayload(rolRaw);
    if (rolPerfilRaw.trim()) {
      const rolPerfil = normalizeAppRol(rolPerfilRaw);
      if (rolPerfil && rolPerfil !== rolEsperado) return null;
    }

    if (rolEsperado === 'trabajador') {
      const idTrabajador = this.pickId(uRol, ['idTrabajador', 'id_trabajador']);
      const idUsuarioTrab = this.pickId(uRol, ['idUsuario', 'id_usuario']);
      if (idTrabajador <= 0) return null;
      if (idUsuarioTrab > 0 && idUsuarioTrab !== idUsuario) return null;
      return { rol: 'trabajador', idUsuario, idTrabajador };
    }

    const idAdministrador = this.pickId(uRol, [
      'idAdministrador',
      'id_administrador',
      'idAdmin',
      'id_admin',
    ]);
    const idUsuarioAdmin = this.pickId(uRol, ['idUsuario', 'id_usuario']);
    if (idAdministrador <= 0) return null;
    if (idUsuarioAdmin > 0 && idUsuarioAdmin !== idUsuario) return null;
    return { rol: 'administrador', idUsuario, idAdministrador };
  }

  private pickId(u: Record<string, unknown>, keys: string[]): number {
    for (const k of keys) {
      const n = Number(u[k] ?? 0);
      if (Number.isFinite(n) && n > 0) return n;
    }
    return 0;
  }
}
