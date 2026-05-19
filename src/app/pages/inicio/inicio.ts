import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, finalize, of, switchMap } from 'rxjs';

import { AuthService } from '../../auth/auth.service';
import { UsuarioService } from '../../services/usuarios/usuario.service';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, FormsModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class InicioComponent {
  private readonly usuarioService = inject(UsuarioService);
  private readonly authService = inject(AuthService);
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
            this.errorMsg.set('Sesión inválida o rol no reconocido.');
          }
          return;
        }
        if (session.rol === 'administrador') {
          this.errorMsg.set('Usa el acceso de administración en /admin/login.');
          this.authService.clearSession();
          return;
        }
        void this.router.navigateByUrl(this.authService.getHomeRoute(session.rol));
      });
  }
}
