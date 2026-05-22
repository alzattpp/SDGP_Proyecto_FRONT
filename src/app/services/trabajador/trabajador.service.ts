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

  getTrabajadores(): Observable<any> {
    return this.http.get(`${this.api}/getTrabajadores`);
  }

  getTrabajadorById(id: number): Observable<any> {
    return this.http.get(`${this.api}/findTrabajadorById/${id}`);
  }

  createTrabajador(data: Trabajador): Observable<any> {
    return this.http.post(`${this.api}/createTrabajador`, data);
  }

  updateTrabajador(id: number, data: Partial<Trabajador>): Observable<any> {
    return this.http.put(`${this.api}/updateTrabajador/${id}`, data);
  }

  deleteTrabajador(idUsuario: number): Observable<any> {
    return this.http.delete(`${this.api}/delete/${idUsuario}`);
  }

  getCurrentTrabajador(): Observable<any> {
    return this.http.get(`${this.api}/me`, {
      withCredentials: true,
    });
  }
}