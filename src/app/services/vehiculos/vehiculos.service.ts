import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Vehiculo {
  idVehiculo?: number;
  placa: string;
  marca: string;
  idUsuario?: number;
}

@Injectable({
  providedIn: 'root',
})
export class VehiculosService {
  private api = 'https://upgrade-store.shop/api/vehiculos';

  constructor(private http: HttpClient) {}

  getVehiculos(): Observable<unknown> {
    return this.http.get(`${this.api}/getVehiculos`, {
      withCredentials: true,
    });
  }

  createVehiculo(data: Vehiculo): Observable<unknown> {
    return this.http.post(`${this.api}/createVehiculo`, data, {
      withCredentials: true,
    });
  }
}
