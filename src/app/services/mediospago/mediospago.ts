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

  private api = 'https://upgrade-store.shop/api/mediopagos';

  constructor(private http: HttpClient) {}

  getMediosPago(): Observable<any> {
    return this.http.get(`${this.api}/getMediosPago`);
  }

  getMedioPagoById(id: number): Observable<any> {
    return this.http.get(`${this.api}/findMedioPago/${id}`);
  }

  getMediosPagoByUsuario(idUsuario: number): Observable<any> {
    return this.http.get(`${this.api}/findUsuario/${idUsuario}`, {
      withCredentials: true,
    });
  }

  createMedioPago(data: mediosPago): Observable<any> {
    return this.http.post(
      `${this.api}/createMedioPago`,
      data,
      {
        withCredentials: true
      }
    );
  }

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

  deleteMedioPago(id: number): Observable<any> {
    return this.http.delete(
      `${this.api}/delete/${id}`,
      {
        withCredentials: true
      }
    );
  }

}