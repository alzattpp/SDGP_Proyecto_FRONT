import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminNavbarComponent } from '../../components/admin-navbar/admin-navbar';

export interface AdminParqueadero {
  id: string;
  nombre: string;
  capacidadTotal: number;
  cuposDisponibles: number;
}

@Component({
  selector: 'app-admin-parqueaderos',
  imports: [FormsModule, AdminNavbarComponent],
  templateUrl: './admin-parqueaderos.html',
  styleUrl: './admin-parqueaderos.css',
})
export class AdminParqueaderosComponent {
  readonly items = signal<AdminParqueadero[]>([
    { id: '1', nombre: 'Biblioteca', capacidadTotal: 40, cuposDisponibles: 28 },
    { id: '2', nombre: 'Cupula', capacidadTotal: 58, cuposDisponibles: 49 },
    { id: '3', nombre: 'Bavaria', capacidadTotal: 140, cuposDisponibles: 70 },
  ]);

  modalEditar = false;
  editId: string | null = null;
  editNombre = '';
  editCapacidad = '';

  modalEliminar = false;
  eliminarId: string | null = null;
  eliminarNombre = '';

  abrirEditar(p: AdminParqueadero): void {
    this.editId = p.id;
    this.editNombre = p.nombre;
    this.editCapacidad = String(p.capacidadTotal);
    this.modalEditar = true;
  }

  cerrarEditar(): void {
    this.modalEditar = false;
    this.editId = null;
  }

  guardarEditar(): void {
    const id = this.editId;
    if (!id) return;
    const cap = parseInt(this.editCapacidad, 10);
    const nombre = this.editNombre.trim();
    if (!nombre || !Number.isFinite(cap) || cap < 1) return;
    this.items.update((list) =>
      list.map((x) =>
        x.id === id
          ? {
              ...x,
              nombre,
              capacidadTotal: cap,
              cuposDisponibles: Math.min(x.cuposDisponibles, cap),
            }
          : x,
      ),
    );
    this.cerrarEditar();
  }

  abrirEliminar(p: AdminParqueadero): void {
    this.eliminarId = p.id;
    this.eliminarNombre = p.nombre;
    this.modalEliminar = true;
  }

  cerrarEliminar(): void {
    this.modalEliminar = false;
    this.eliminarId = null;
  }

  confirmarEliminar(): void {
    const id = this.eliminarId;
    if (!id) return;
    this.items.update((list) => list.filter((x) => x.id !== id));
    this.cerrarEliminar();
  }
}
