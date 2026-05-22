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

  private api = 'https://upgrade-store.shop/api/ingresos';

  constructor(private http: HttpClient) {}

  getIngresos(): Observable<any> {
    return this.http.get(`${this.api}/getIngresos`, {
      withCredentials: true,
    });
  }

  getIngresoById(id: number): Observable<any> {
    return this.http.get(`${this.api}/findIngreso/${id}`);
  }

  createIngreso(data: Ingreso): Observable<any> {
    return this.http.post(`${this.api}/createIngreso`, data, {
      withCredentials: true,
    });
  }

  registrarSalida(id: number): Observable<any> {
    return this.http.put(`${this.api}/salida/${id}`, {}, {
      withCredentials: true,
    });
  }

  deleteIngreso(id: number): Observable<any> {
    return this.http.delete(`${this.api}/delete/${id}`, {
      withCredentials: true,
    });
  }
}
