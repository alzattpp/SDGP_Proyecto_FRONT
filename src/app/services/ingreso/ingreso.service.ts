import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Ingreso {
  idIngreso?: number;
  placa: string;
  idParqueadero: number;
  horaIngreso?: string;
  horaSalida?: string;
  estado?: string;
}

@Injectable({
  providedIn: 'root'
})
export class IngresoService {

  private api = 'http://localhost:3000/api/ingresos';

  constructor(private http: HttpClient) {}

  // 🔹 GET todos los ingresos
  getIngresos(): Observable<any> {
    return this.http.get(`${this.api}/getIngresos`, {
      withCredentials: true,
    });
  }

  // 🔹 GET ingreso por ID
  getIngresoById(id: number): Observable<any> {
    return this.http.get(`${this.api}/findIngreso/${id}`);
  }

  // 🔹 CREATE ingreso (entrada al parqueadero)
  createIngreso(data: Ingreso): Observable<any> {
    return this.http.post(`${this.api}/createIngreso`, data, {
      withCredentials: true,
    });
  }

  // 🔹 UPDATE salida (🔥 registrar salida del vehículo)
  registrarSalida(id: number): Observable<any> {
    return this.http.put(`${this.api}/salida/${id}`, {}, {
      withCredentials: true,
    });
  }

  // 🔹 DELETE ingreso (salida / baja del registro)
  deleteIngreso(id: number): Observable<any> {
    return this.http.delete(`${this.api}/delete/${id}`, {
      withCredentials: true,
    });
  }
}
