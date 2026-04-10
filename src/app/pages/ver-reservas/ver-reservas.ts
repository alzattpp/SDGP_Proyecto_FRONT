import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import Swal from 'sweetalert2';

export interface Reserva {
  id: string;
  nombre: string;
  placa: string;
  parqueadero: string;
  hora: string;
  fecha: string;
  estadoPago: 'Pendiente' | 'Pagado';
}

@Component({
  selector: 'app-ver-reservas',
  imports: [RouterLink, RouterLinkActive, FormsModule, DecimalPipe],
  templateUrl: './ver-reservas.html',
  styleUrl: './ver-reservas.css',
})
export class VerReservasComponent {
  private readonly router = inject(Router);

  readonly parqueaderos = [
    'Biblioteca',
    'Parqueadero Bavaria',
    'Parqueadero Central',
    'Parqueadero Norte',
  ];

  readonly valorReservaCOP = 8000;

  reservas: Reserva[] = [
    {
      id: '1',
      nombre: 'Usuario',
      placa: 'NAM-407',
      parqueadero: 'Biblioteca',
      hora: '10:40 AM',
      fecha: '19/02/2026',
      estadoPago: 'Pendiente',
    },
  ];

  editOpen = false;
  private editingId: string | null = null;

  editPlaca = '';
  editParqueadero = '';
  editHora = '';

  pagoOpen = false;
  private pagoReservaId: string | null = null;
  metodoPago = 'Tarjeta';

  navReservasActivo(): boolean {
    const p = this.router.url.split('?')[0];
    return p === '/reservas' || p === '/ver-reservas';
  }

  openEdit(r: Reserva): void {
    this.editingId = r.id;
    this.editPlaca = r.placa;
    this.editParqueadero = r.parqueadero;
    this.editHora = this.toTimeInputValue(r.hora);
    this.editOpen = true;
  }

  closeEdit(): void {
    this.editOpen = false;
    this.editingId = null;
  }

  async guardarEdicion(): Promise<void> {
    const id = this.editingId;
    if (!id) return;

    const horaDisplay = this.formatTimeFromInput(this.editHora);

    this.reservas = this.reservas.map((row) =>
      row.id === id
        ? {
            ...row,
            placa: this.editPlaca.trim().toUpperCase(),
            parqueadero: this.editParqueadero,
            hora: horaDisplay,
          }
        : row,
    );

    this.closeEdit();

    await Swal.fire({
      title: 'Reserva editada correctamente',
      confirmButtonText: 'ACEPTAR',
      confirmButtonColor: '#f4d73b',
      color: '#1a2d4d',
    });
  }

  async confirmarEliminar(r: Reserva): Promise<void> {
    const result = await Swal.fire({
      title: '¿Eliminar reserva?',
      text: `Se eliminará la reserva de ${r.placa} (${r.parqueadero}).`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e53935',
      cancelButtonColor: '#0069a3',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    this.reservas = this.reservas.filter((row) => row.id !== r.id);

    await Swal.fire({
      title: 'Reserva eliminada',
      icon: 'success',
      confirmButtonText: 'ACEPTAR',
      confirmButtonColor: '#f4d73b',
      color: '#1a2d4d',
    });
  }

  reservaEnPago: Reserva | null = null;

  openPago(r: Reserva): void {
    if (r.estadoPago === 'Pagado') return;
    this.pagoReservaId = r.id;
    this.reservaEnPago = r;
    this.metodoPago = 'Tarjeta';
    this.pagoOpen = true;
  }

  closePago(): void {
    this.pagoOpen = false;
    this.pagoReservaId = null;
    this.reservaEnPago = null;
  }

  async confirmarPago(): Promise<void> {
    const id = this.pagoReservaId;
    if (!id) return;

    this.reservas = this.reservas.map((row) =>
      row.id === id ? { ...row, estadoPago: 'Pagado' as const } : row,
    );

    this.closePago();

    await Swal.fire({
      title: 'Pago registrado',
      text: 'La reserva quedó pagada.',
      icon: 'success',
      confirmButtonText: 'ACEPTAR',
      confirmButtonColor: '#f4d73b',
      color: '#1a2d4d',
    });
  }

  private toTimeInputValue(display: string): string {
    const m = display.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!m) return '10:40';
    let h = parseInt(m[1], 10);
    const min = m[2];
    const ap = m[3].toUpperCase();
    if (ap === 'PM' && h !== 12) h += 12;
    if (ap === 'AM' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${min}`;
  }

  private formatTimeFromInput(value: string): string {
    if (!value) return '';
    const [hStr, mStr = '00'] = value.split(':');
    const h24 = parseInt(hStr, 10);
    const min = mStr.slice(0, 2).padStart(2, '0');
    const ap = h24 >= 12 ? 'PM' : 'AM';
    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;
    return `${h12}:${min} ${ap}`;
  }
}
