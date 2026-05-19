import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Administrador {
  idAdmin?: number;
  idUsuario?: number;
  nombreCompleto: string;
  correo: string;
  contrasena: string;
  documento: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdministradorService {

  private api = 'http://localhost:3000/api/administradores';

  constructor(private http: HttpClient) {}

  // 🔹 GET todos los administradores
  getAdministradores(): Observable<any> {
    return this.http.get(`${this.api}/getAdministradores`);
  }

  // 🔹 GET administrador por ID
  getAdministradorById(id: number): Observable<any> {
    return this.http.get(`${this.api}/findAdministradorById/${id}`);
  }

  // 🔹 CREATE administrador
  createAdministrador(data: Administrador): Observable<any> {
    return this.http.post(`${this.api}/createAdministrador`, data);
  }

  // 🔹 UPDATE administrador
  updateAdministrador(id: number, data: Partial<Administrador>): Observable<any> {
    return this.http.put(`${this.api}/updateAdministrador/${id}`, data);
  }

  // 🔹 DELETE administrador (usa idUsuario 🔥)
  deleteAdministrador(idUsuario: number): Observable<any> {
    return this.http.delete(`${this.api}/delete/${idUsuario}`);
  }


getCurrentAdministrador(): Observable<any> {
  return this.http.get(`${this.api}/me`, {
    withCredentials: true,
  });
}
}