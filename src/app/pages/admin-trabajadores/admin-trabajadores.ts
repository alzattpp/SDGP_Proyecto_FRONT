import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminNavbarComponent } from '../../components/admin-navbar/admin-navbar';

export interface AdminTrabajador {
  id: string;
  nombre: string;
  documento: string;
  telefono: string;
  parqueadero: string;
}

@Component({
  selector: 'app-admin-trabajadores',
  imports: [FormsModule, AdminNavbarComponent],
  templateUrl: './admin-trabajadores.html',
  styleUrl: './admin-trabajadores.css',
})
export class AdminTrabajadoresComponent {
  readonly filas = signal<AdminTrabajador[]>([
    {
      id: '1',
      nombre: 'Nombre - Apellido',
      documento: '1050000000',
      telefono: '3100000000',
      parqueadero: 'Biblioteca',
    },
  ]);

  modalAgregar = false;
  addNombre = '';
  addDoc = '';
  addTel = '';
  addParq = '';

  modalEditar = false;
  editId: string | null = null;
  editNombre = '';
  editDoc = '';
  editTel = '';
  editParq = '';

  abrirAgregar(): void {
    this.addNombre = '';
    this.addDoc = '';
    this.addTel = '';
    this.addParq = '';
    this.modalAgregar = true;
  }

  cerrarAgregar(): void {
    this.modalAgregar = false;
  }

  guardarAgregar(): void {
    const nombre = this.addNombre.trim();
    if (!nombre || !this.addDoc.trim()) return;
    const id = `${Date.now()}`;
    this.filas.update((r) => [
      ...r,
      {
        id,
        nombre,
        documento: this.addDoc.trim(),
        telefono: this.addTel.trim() || '—',
        parqueadero: this.addParq.trim() || '—',
      },
    ]);
    this.cerrarAgregar();
  }

  abrirEditar(row: AdminTrabajador): void {
    this.editId = row.id;
    this.editNombre = row.nombre;
    this.editDoc = row.documento;
    this.editTel = row.telefono;
    this.editParq = row.parqueadero;
    this.modalEditar = true;
  }

  cerrarEditar(): void {
    this.modalEditar = false;
    this.editId = null;
  }

  guardarEditar(): void {
    const id = this.editId;
    if (!id) return;
    const nombre = this.editNombre.trim();
    if (!nombre) return;
    this.filas.update((rows) =>
      rows.map((x) =>
        x.id === id
          ? {
              ...x,
              nombre,
              documento: this.editDoc.trim(),
              telefono: this.editTel.trim(),
              parqueadero: this.editParq.trim(),
            }
          : x,
      ),
    );
    this.cerrarEditar();
  }

  eliminar(row: AdminTrabajador): void {
    this.filas.update((r) => r.filter((x) => x.id !== row.id));
  }
}
