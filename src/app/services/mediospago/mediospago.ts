import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface mediosPago {
  idMedioPago?: number;
  idUsuario: number;
  tipo: string;
  numeroReferencia: string;
  cvv?: string;
  estado?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MedioPagoService {

  private api = 'http://localhost:3000/api/mediopagos';

  constructor(private http: HttpClient) {}

  // 🔹 GET todos los medios de pago
  getMediosPago(): Observable<any> {
    return this.http.get(`${this.api}/getMediosPago`);
  }

  // 🔹 GET medio de pago por ID
  getMedioPagoById(id: number): Observable<any> {
    return this.http.get(`${this.api}/findMedioPago/${id}`);
  }

  // 🔹 GET medios de pago por usuario
  getMediosPagoByUsuario(idUsuario: number): Observable<any> {
    return this.http.get(`${this.api}/findUsuario/${idUsuario}`, {
      withCredentials: true,
    });
  }

  // 🔹 CREATE medio de pago
  createMedioPago(data: mediosPago): Observable<any> {
    return this.http.post(
      `${this.api}/createMedioPago`,
      data,
      {
        withCredentials: true
      }
    );
  }

  // 🔹 UPDATE medio de pago
  updateMedioPago(
    id: number,
    data: mediosPago
  ): Observable<any> {

    return this.http.put(
      `${this.api}/updateMedioPago/${id}`,
      data,
      {
        withCredentials: true
      }
    );
  }

  // 🔹 DELETE medio de pago
  deleteMedioPago(id: number): Observable<any> {
    return this.http.delete(
      `${this.api}/delete/${id}`,
      {
        withCredentials: true
      }
    );
  }

}