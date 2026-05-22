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

  getParqueaderos(): Observable<any> {
    return this.http.get(`${this.api}/getParqueaderos`);
  }

  getParqueaderoById(id: number): Observable<any> {
    return this.http.get(`${this.api}/findParqueadero/${id}`);
  }

  createParqueadero(data: Parqueadero): Observable<any> {
    return this.http.post(`${this.api}/createParqueadero`, data);
  }

  updateParqueadero(id: number, data: Partial<Parqueadero>): Observable<any> {
    return this.http.put(`${this.api}/updateParqueadero/${id}`, data);
  }

  deleteParqueadero(id: number): Observable<any> {
    return this.http.delete(`${this.api}/delete/${id}`);
  }

  getParqueaderoStats(id: number): Observable<any> {
    return this.http.get(`${this.api}/stats/${id}`, {
      withCredentials: true,
    });
  }
}