import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';

import { AuthService } from '../../auth/auth.service';
import { UsuarioService } from '../../services/usuarios/usuario.service';

@Component({
  selector: 'app-admin-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './admin-navbar.html',
  styleUrl: './admin-navbar.css',
})
export class AdminNavbarComponent {
  private readonly usuarioService = inject(UsuarioService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly menuAbierto = signal(false);

  @HostListener('document:click')
  onDocumentClick(): void {
    this.menuAbierto.set(false);
  }

  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.menuAbierto.update((v) => !v);
  }

  cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

  cerrarSesion(): void {
    this.menuAbierto.set(false);
    this.authService.clearSession();
    this.usuarioService
      .logout()
      .pipe(
        catchError(() => of(null)),
        finalize(() => void this.router.navigateByUrl('/admin/login')),
      )
      .subscribe();
  }
}
