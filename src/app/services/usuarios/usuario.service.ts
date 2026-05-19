import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private api = 'http://localhost:3000/api/usuarios';

  constructor(private http: HttpClient) {}

  // 🔹 GET todos los usuarios
  getUsuarios(): Observable<any> {
    return this.http.get(`${this.api}/getUsuarios`);
  }

  // 🔹 GET usuario por ID
  getUsuarioById(id: number): Observable<any> {
    return this.http.get(`${this.api}/findUsuarioById/${id}`);
  }

  // 🔹 CREATE usuario
  createUsuario(data: any): Observable<any> {
    return this.http.post(`${this.api}/createUsuario`, data);
  }

  // 🔹 UPDATE usuario
  updateUsuario(id: number, data: any): Observable<any> {
    return this.http.put(`${this.api}/updateUsuario/${id}`, data);
  }

  // 🔹 DELETE usuario
  deleteUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.api}/delete/${id}`);
  }

  // 🔹 LOGIN (el API espera correo + contrasena, como en Postman)
  login(data: { correo: string; contrasena: string }): Observable<any> {
    return this.http.post(`${this.api}/login`, data, {
      withCredentials: true // 🔥 importante para cookies
    });
  }

  // 🔹 LOGOUT
  logout(): Observable<any> {
    return this.http.post(`${this.api}/logout`, {}, {
      withCredentials: true
    });
  }

  // 🔹 USUARIO ACTUAL (/me)
  getCurrentUsuario(): Observable<any> {
    return this.http.get(`${this.api}/me`, {
      withCredentials: true
    });
  }

  /** Cantidad de logins del usuario autenticado (cookie/token). → { totalLogins } */
  getCantidadLogins(): Observable<unknown> {
    return this.http.get(`${this.api}/cantidadLogins`, {
      withCredentials: true,
    });
  }
}