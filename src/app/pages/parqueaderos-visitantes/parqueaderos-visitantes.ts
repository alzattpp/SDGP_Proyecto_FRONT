import { DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { UsuarioNavbarComponent } from '../../components/usuario-navbar/usuario-navbar';

@Component({
  selector: 'app-parqueaderos-visitantes',
  imports: [RouterLink, DecimalPipe, UsuarioNavbarComponent],
  templateUrl: './parqueaderos-visitantes.html',
  styleUrl: './parqueaderos-visitantes.css',
})
export class ParqueaderosVisitantesComponent {
  readonly bavaria = {
    nombre: 'Parqueadero Bavaria',
    capacidadTotal: 140,
    cuposDisponibles: 60,
    costoHora: 5000,
    ocupacionPct: 30,
    disponibilidadPct: 70,
  };

  imagenCarro(disponibilidadPct: number): string {
    if (disponibilidadPct < 35) return '/assets/carroVerde.png';
    if (disponibilidadPct <= 75) return '/assets/carroAmarillo.png';
    return '/assets/carroRojo.png';
  }
}
