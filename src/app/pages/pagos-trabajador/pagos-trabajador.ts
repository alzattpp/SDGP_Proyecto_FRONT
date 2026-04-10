import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { TrabajadorNavbarComponent } from '../../components/trabajador-navbar/trabajador-navbar';

export interface PagoTrabajadorRow {
  placa: string;
  horaPago: string;
  estado: string;
  medio: string;
  detalle: string;
}

@Component({
  selector: 'app-pagos-trabajador',
  imports: [TrabajadorNavbarComponent],
  templateUrl: './pagos-trabajador.html',
  styleUrl: './pagos-trabajador.css',
})
export class PagosTrabajadorComponent {
  readonly filas: PagoTrabajadorRow[] = [
    {
      placa: 'NAM - 789',
      horaPago: '10:40 AM',
      estado: 'Confirmada',
      medio: 'Nequi',
      detalle: 'Pago móvil · Referencia UAM-2026-001 · Valor $3.600 COP',
    },
  ];

  async verDetalle(row: PagoTrabajadorRow): Promise<void> {
    await Swal.fire({
      title: 'Detalle del pago',
      html: `<p style="text-align:left;margin:0;line-height:1.5">${row.detalle}</p>`,
      icon: 'info',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#f2d03b',
      color: '#1a2d4d',
    });
  }
}
