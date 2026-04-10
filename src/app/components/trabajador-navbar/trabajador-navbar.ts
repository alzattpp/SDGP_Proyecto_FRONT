import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

/** Barra superior compartida del rol trabajador (mockups UAM). */
@Component({
  selector: 'app-trabajador-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './trabajador-navbar.html',
  styleUrl: './trabajador-navbar.css',
})
export class TrabajadorNavbarComponent {
  /** Texto opcional encima de la barra (ej. GESTIÓN DE PARQUEADEROS). */
  readonly topLabel = input<string | null>(null);
}
