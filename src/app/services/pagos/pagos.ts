import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Pago {
  idPago?: number;
  idIngreso?: number;
  idUsuario: number;
  idMedioPago: number;
  fecha?: string;
  monto: number;
  estado?: string;
}

@Injectable({
  providedIn: 'root'
})
export class Pagos {

  private api = 'https://upgrade-store.shop/api/pagos';

  constructor(
    private http: HttpClient
  ) {}

  // 🔹 GET todos los pagos
  getPagos(): Observable<any> {
    return this.http.get(`${this.api}/getPagos`, {
      withCredentials: true,
    });
  }

  // 🔹 GET pago por ID
  getPagoById(
    id:number
  ): Observable<any> {

    return this.http.get(
      `${this.api}/findPago/${id}`
    );

  }

  // 🔹 GET pagos por usuario
  getPagosByUsuario(
    idUsuario:number
  ): Observable<any> {

    return this.http.get(
      `${this.api}/findUsuario/${idUsuario}`,
      {
        withCredentials:true
      }
    );

  }

  // 🔹 CREATE pago
  createPago(
    data:Pago
  ): Observable<any>{

    return this.http.post(
      `${this.api}/createPago`,
      data,
      {
        withCredentials:true
      }
    );

  }

  // 🔹 UPDATE pago
  updatePago(
    id:number,
    data:Pago
  ): Observable<any>{

    return this.http.put(
      `${this.api}/updatePago/${id}`,
      data,
      {
        withCredentials:true
      }
    );

  }

  // 🔹 DELETE pago
  deletePago(
    id:number
  ): Observable<any>{

    return this.http.delete(
      `${this.api}/delete/${id}`,
      {
        withCredentials:true
      }
    );

  }

}