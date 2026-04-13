import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, finalize, map, of, switchMap } from 'rxjs';

import { UsuarioService } from '../../services/usuarios/usuario.service';

@Component({
  selector: 'app-admin-login',
  imports: [FormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css',
})
export class AdminLoginComponent {
  private readonly usuarioService = inject(UsuarioService);
  private readonly router = inject(Router);

  readonly correo = signal('');
  readonly contrasena = signal('');
  readonly loading = signal(false);
  readonly errorMsg = signal<string | null>(null);

  ingresar(): void {
    const correo = this.correo().trim();
    const contrasena = this.contrasena();
    if (!correo || !contrasena) {
      this.errorMsg.set('Completa correo y contraseña.');
      return;
    }
    this.errorMsg.set(null);
    this.loading.set(true);
    this.usuarioService
      .login({ correo, contrasena })
      .pipe(
        switchMap((loginRes) =>
          this.usuarioService.getCurrentUsuario().pipe(
            map((me) => this.combinarPerfilYLogin(me, loginRes)),
            catchError(() => of(loginRes)),
          ),
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
        if (!this.esAdmin(perfil)) {
          this.errorMsg.set('Esta cuenta no tiene rol de administrador.');
          return;
        }
        void this.router.navigateByUrl('/admin/perfil');
      });
  }

  private combinarPerfilYLogin(me: any, loginRes: any): any {
    const base = me && typeof me === 'object' ? me : {};
    const rol = base['rol'] ?? base['role'] ?? loginRes?.rol ?? loginRes?.role;
    return { ...base, rol };
  }

  private esAdmin(data: any): boolean {
    if (!data || typeof data !== 'object') return false;
    if (data.esAdmin === true || data.admin === true) return true;
    const anidado = data.usuario ?? data.user;
    if (anidado && this.esAdmin(anidado)) return true;
    const rol = String(data.rol ?? data.role ?? data.tipoUsuario ?? data.tipo ?? '').toLowerCase();
    return rol === 'admin' || rol.includes('admin') || rol.includes('administrador');
  }
}
