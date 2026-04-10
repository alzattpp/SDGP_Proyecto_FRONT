import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminNavbarComponent } from '../../components/admin-navbar/admin-navbar';

export interface AdminPagoRow {
  placa: string;
  entrada: string;
  salida: string;
  fecha: string;
  total: string;
  detalle: string;
  referencia: string;
  medioPago: string;
  notasInternas: string;
}

@Component({
  selector: 'app-admin-pagos',
  imports: [FormsModule, AdminNavbarComponent],
  templateUrl: './admin-pagos.html',
  styleUrl: './admin-pagos.css',
})
export class AdminPagosComponent {
  readonly filas = signal<AdminPagoRow[]>([
    {
      placa: 'NAM-487',
      entrada: '10:40 AM',
      salida: '11:50 AM',
      fecha: '19/02/2026',
      total: '$10.000',
      detalle: 'Servicio parqueadero Biblioteca. Duración 1h 10m.',
      referencia: 'ADM-PAG-001',
      medioPago: 'Nequi',
      notasInternas: '',
    },
  ]);

  modalDetalle = false;
  /** Copias para el formulario del modal */
  fPlaca = '';
  fEntrada = '';
  fSalida = '';
  fFecha = '';
  fTotal = '';
  fReferencia = '';
  fMedio = '';
  fDetalle = '';
  fNotasAdmin = '';

  abrirDetalle(row: AdminPagoRow): void {
    this.fPlaca = row.placa;
    this.fEntrada = row.entrada;
    this.fSalida = row.salida;
    this.fFecha = row.fecha;
    this.fTotal = row.total;
    this.fReferencia = row.referencia;
    this.fMedio = row.medioPago;
    this.fDetalle = row.detalle;
    this.fNotasAdmin = row.notasInternas;
    this.modalDetalle = true;
  }

  cerrarDetalle(): void {
    this.modalDetalle = false;
  }

  guardarDetalle(): void {
    const placa = this.fPlaca;
    this.filas.update((list) =>
      list.map((p) =>
        p.placa === placa
          ? {
              ...p,
              entrada: this.fEntrada.trim() || p.entrada,
              salida: this.fSalida.trim() || p.salida,
              fecha: this.fFecha.trim() || p.fecha,
              total: this.fTotal.trim() || p.total,
              referencia: this.fReferencia.trim() || p.referencia,
              medioPago: this.fMedio.trim() || p.medioPago,
              detalle: this.fDetalle.trim() || p.detalle,
              notasInternas: this.fNotasAdmin.trim(),
            }
          : p,
      ),
    );
    this.cerrarDetalle();
  }
}
