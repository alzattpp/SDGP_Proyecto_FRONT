import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, finalize, of, switchMap } from 'rxjs';

import { AuthService } from '../../auth/auth.service';
import { UsuarioService } from '../../services/usuarios/usuario.service';
import {
  esCorreoAutonoma,
  MENSAJE_CORREO_AUTONOMA,
} from '../../utils/correo-institucional.util';

@Component({
  selector: 'app-admin-login',
  imports: [FormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css',
})
export class AdminLoginComponent {
  private readonly usuarioService = inject(UsuarioService);
  private readonly authService = inject(AuthService);
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
    if (!esCorreoAutonoma(correo)) {
      this.errorMsg.set(MENSAJE_CORREO_AUTONOMA);
      return;
    }
    this.errorMsg.set(null);
    this.loading.set(true);
    this.usuarioService
      .login({ correo, contrasena })
      .pipe(
        switchMap(() => this.authService.refreshSession()),
        catchError((err) => {
          const body = err?.error;
          const msg =
            (typeof body === 'string' ? body : null) ??
            body?.message ??
            body?.mensaje ??
            'No se pudo iniciar sesión.';
          this.errorMsg.set(msg);
          this.authService.clearSession();
          return of(null);
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((session) => {
        if (!session) {
          if (!this.errorMsg()) {
            this.errorMsg.set('Sesión inválida.');
          }
          return;
        }
        if (session.rol !== 'administrador') {
          this.errorMsg.set('Esta cuenta no tiene rol de administrador.');
          this.authService.clearSession();
          return;
        }
        void this.router.navigateByUrl('/admin/perfil');
      });
  }
}
