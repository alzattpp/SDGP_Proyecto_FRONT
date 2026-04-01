import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-reservas',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './reservas.html',
  styleUrl: './reservas.css',
})
export class ReservasComponent {
  private readonly router = inject(Router);

  navReservasActivo(): boolean {
    const p = this.router.url.split('?')[0];
    return p === '/reservas' || p === '/ver-reservas';
  }
}
