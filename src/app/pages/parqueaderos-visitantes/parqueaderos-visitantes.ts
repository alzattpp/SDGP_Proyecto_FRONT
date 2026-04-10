import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-parqueaderos-visitantes',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './parqueaderos-visitantes.html',
  styleUrl: './parqueaderos-visitantes.css',
})
export class ParqueaderosVisitantesComponent {
  private readonly router = inject(Router);

  readonly bavaria = {
    nombre: 'Parqueadero Bavaria',
    capacidadTotal: 140,
    cuposDisponibles: 60,
    costoHora: 5000,
    ocupacionPct: 30,
    disponibilidadPct: 70,
  };

  navParqueaderosActivo(): boolean {
    const p = this.router.url.split('?')[0];
    return p === '/parqueaderos' || p === '/parqueaderos-visitantes';
  }

  imagenCarro(disponibilidadPct: number): string {
    if (disponibilidadPct < 35) return '/assets/carroVerde.png';
    if (disponibilidadPct <= 75) return '/assets/carroAmarillo.png';
    return '/assets/carroRojo.png';
  }
}
