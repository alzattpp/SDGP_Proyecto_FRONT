import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private api = 'https://upgrade-store.shop/api/usuarios';

  constructor(private http: HttpClient) {}

  getUsuarios(): Observable<any> {
    return this.http.get(`${this.api}/getUsuarios`);
  }

  getUsuarioById(id: number): Observable<any> {
    return this.http.get(`${this.api}/findUsuarioById/${id}`);
  }

  createUsuario(data: any): Observable<any> {
    return this.http.post(`${this.api}/createUsuario`, data);
  }

  updateUsuario(id: number, data: any): Observable<any> {
    return this.http.put(`${this.api}/updateUsuario/${id}`, data);
  }

  deleteUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.api}/delete/${id}`);
  }

  login(data: { correo: string; contrasena: string }): Observable<any> {
    return this.http.post(`${this.api}/login`, data, {
      withCredentials: true
    });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.api}/logout`, {}, {
      withCredentials: true
    });
  }

  getCurrentUsuario(): Observable<any> {
    return this.http.get(`${this.api}/me`, {
      withCredentials: true
    });
  }

  
  getCantidadLogins(): Observable<unknown> {
    return this.http.get(`${this.api}/cantidadLogins`, {
      withCredentials: true,
    });
  }
}