import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, finalize, map, of, switchMap } from 'rxjs';

import { UsuarioService } from '../../services/usuarios/usuario.service';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, FormsModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class InicioComponent {
  private readonly usuarioService = inject(UsuarioService);
  private readonly router = inject(Router);

  readonly email = signal('');
  readonly contrasena = signal('');
  readonly loading = signal(false);
  readonly errorMsg = signal<string | null>(null);

  iniciarSesion(): void {
    const email = this.email().trim();
    const contrasena = this.contrasena();
    if (!email || !contrasena) {
      this.errorMsg.set('Completa correo y contraseña.');
      return;
    }
    this.errorMsg.set(null);
    this.loading.set(true);
    this.usuarioService
      .login({ correo: email, contrasena })
      .pipe(
        switchMap((loginRes) =>
          this.usuarioService.getCurrentUsuario().pipe(catchError(() => of(loginRes))),
        ),
        catchError((err) => {
          const body = err?.error;
          const msg =
            (typeof body === 'string' ? body : null) ??
            body?.message ??
            body?.mensaje ??
            'No se pudo iniciar sesión.';
          this.errorMsg.set(msg);
          return of(null);
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((perfil) => {
        if (!perfil) return;
        const destino = this.esTrabajador(perfil) ? '/trabajador' : '/principal';
        void this.router.navigateByUrl(destino);
      });
  }

  /** Mantiene el `rol` del login si /me no lo trae (ej. solo { message, rol } en POST). */
  private combinarPerfilYLogin(me: any, loginRes: any): any {
    const base = me && typeof me === 'object' ? me : {};
    const rol = base.rol ?? base.role ?? loginRes?.rol ?? loginRes?.role;
    return { ...base, rol };
  }

  /** `rol` del API: "trabajador" → vista trabajador; "usuario" (u otro) → principal. */
  private esTrabajador(data: any): boolean {
    if (!data || typeof data !== 'object') return false;
    if (data.esTrabajador === true || data.es_trabajador === true || data.trabajador === true) {
      return true;
    }
    const anidado = data.usuario ?? data.user;
    if (anidado && this.esTrabajador(anidado)) return true;
    const rol = String(data.rol ?? data.role ?? data.tipoUsuario ?? data.tipo ?? '').toLowerCase();
    if (rol === 'trabajador' || rol.includes('trabajador') || rol === 'worker' || rol.includes('empleado')) {
      return true;
    }
    return false;
  }
}
