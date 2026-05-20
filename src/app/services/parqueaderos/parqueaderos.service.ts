import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Parqueadero {
  idParqueadero?: number;
  nombre: string;
  capacidadMaxima: number;
  requierePago: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ParqueaderoService {

  private api = 'https://upgrade-store.shop/api/parqueaderos';

  constructor(private http: HttpClient) {}

  // 🔹 GET todos los parqueaderos
  getParqueaderos(): Observable<any> {
    return this.http.get(`${this.api}/getParqueaderos`);
  }

  // 🔹 GET parqueadero por ID
  getParqueaderoById(id: number): Observable<any> {
    return this.http.get(`${this.api}/findParqueadero/${id}`);
  }

  // 🔹 CREATE parqueadero
  createParqueadero(data: Parqueadero): Observable<any> {
    return this.http.post(`${this.api}/createParqueadero`, data);
  }

  // 🔹 UPDATE parqueadero
  updateParqueadero(id: number, data: Partial<Parqueadero>): Observable<any> {
    return this.http.put(`${this.api}/updateParqueadero/${id}`, data);
  }

  // 🔹 DELETE parqueadero
  deleteParqueadero(id: number): Observable<any> {
    return this.http.delete(`${this.api}/delete/${id}`);
  }

  // 🔹 STATS — usa el idParqueadero del trabajador (/me)
  getParqueaderoStats(id: number): Observable<any> {
    return this.http.get(`${this.api}/stats/${id}`, {
      withCredentials: true,
    });
  }
}