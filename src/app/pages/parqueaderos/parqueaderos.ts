import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface Parqueadero {
  nombre: string;
  capacidadTotal: number;
  cuposDisponibles: number;
  ocupacionPct: number;
  disponibilidadPct: number;
  nota?: string;
}

@Component({
  selector: 'app-parqueaderos',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './parqueaderos.html',
  styleUrl: './parqueaderos.css',
})
export class ParqueaderosComponent {
  readonly items: Parqueadero[] = [
    {
      nombre: 'Parqueadero Biblioteca',
      capacidadTotal: 40,
      cuposDisponibles: 12,
      ocupacionPct: 70,
      disponibilidadPct: 30,
    },
    {
      nombre: 'Parqueadero Bavaria',
      capacidadTotal: 140,
      cuposDisponibles: 70,
      ocupacionPct: 50,
      disponibilidadPct: 50,
      nota:
        'Recuerda que el costo del servicio puede pagarse en taquilla del parqueadero o en línea a través del sistema. Presenta tu comprobante al ingreso.',
    },
    {
      nombre: 'Parqueadero Cúpula',
      capacidadTotal: 58,
      cuposDisponibles: 49,
      ocupacionPct: 15,
      disponibilidadPct: 85,
    },
  ];

  /** Verde &lt; 35 %, amarillo 35–75 %, rojo &gt; 75 % (según disponibilidad). */
  imagenCarro(disponibilidadPct: number): string {
    if (disponibilidadPct < 35) return '/assets/carroVerde.png';
    if (disponibilidadPct <= 75) return '/assets/carroAmarillo.png';
    return '/assets/carroRojo.png';
  }
}
