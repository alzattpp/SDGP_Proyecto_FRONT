import { Component } from '@angular/core';
import { AdminNavbarComponent } from '../../components/admin-navbar/admin-navbar';

export interface AdminReservaRow {
  nombre: string;
  placa: string;
  parqueadero: string;
  hora: string;
  fecha: string;
  total: string;
}

@Component({
  selector: 'app-admin-reservas',
  imports: [AdminNavbarComponent],
  templateUrl: './admin-reservas.html',
  styleUrl: './admin-reservas.css',
})
export class AdminReservasComponent {
  readonly filas: AdminReservaRow[] = [
    {
      nombre: 'Nombre - Apellido',
      placa: 'NAM-487',
      parqueadero: 'Biblioteca',
      hora: '10:40 AM',
      fecha: '19/02/2026',
      total: '$10.000',
    },
  ];
}
