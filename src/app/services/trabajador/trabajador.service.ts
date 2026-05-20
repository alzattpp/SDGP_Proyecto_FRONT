import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Trabajador {
  idTrabajador?: number;
  idUsuario?: number;
  nombreCompleto: string;
  correo: string;
  contrasena: string;
  documento: string;
  telefono: string;
  idParqueadero: number;
}

@Injectable({
  providedIn: 'root'
})
export class TrabajadorService {

  private api = 'https://upgrade-store.shop/api/trabajadores';

  constructor(private http: HttpClient) {}

  // 🔹 GET todos
  getTrabajadores(): Observable<any> {
    return this.http.get(`${this.api}/getTrabajadores`);
  }

  // 🔹 GET por ID
  getTrabajadorById(id: number): Observable<any> {
    return this.http.get(`${this.api}/findTrabajadorById/${id}`);
  }

  // 🔹 CREATE
  createTrabajador(data: Trabajador): Observable<any> {
    return this.http.post(`${this.api}/createTrabajador`, data);
  }

  // 🔹 UPDATE
  updateTrabajador(id: number, data: Partial<Trabajador>): Observable<any> {
    return this.http.put(`${this.api}/updateTrabajador/${id}`, data);
  }

  // 🔹 DELETE (usa idUsuario 🔥 importante)
  deleteTrabajador(idUsuario: number): Observable<any> {
    return this.http.delete(`${this.api}/delete/${idUsuario}`);
  }

  // 🔹 TRABAJADOR ACTUAL (/me)
  getCurrentTrabajador(): Observable<any> {
    return this.http.get(`${this.api}/me`, {
      withCredentials: true,
    });
  }
}