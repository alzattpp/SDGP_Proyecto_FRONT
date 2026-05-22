import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReporteOcupacion {
  idParqueadero: number;
  nombre: string;
  ocupados: number;
  disponibles: number;
}

export interface ReporteIngreso {
  idIngreso: number;
  placa: string;
  horaIngreso: string;
  horaSalida?: string;
  estado: string;
  nombre: string;
}

export interface ReportePagos {
  totalPagos: number;
  totalRecaudado: number;
  promedioPago: number;
  pagoMayor: number;
  pagoMenor: number;
}

@Injectable({
  providedIn: 'root'
})
export class Reportes {

  private api='https://upgrade-store.shop/api/reportes';

  constructor(
    private http: HttpClient
  ) {}



  // 🔹 ocupacion todos
  getOcupacion(): Observable<any>{

    return this.http.get(
      `${this.api}/ocupacion`,
      {
        withCredentials:true
      }
    );

  }



  // 🔹 ocupacion por parqueadero
  getOcupacionByParqueadero(
    idParqueadero:number
  ):Observable<any>{

    return this.http.get(
      `${this.api}/ocupacion/${idParqueadero}`,
      {
        withCredentials:true
      }
    );

  }



  // 🔹 ingresos todos
  getIngresosReporte():Observable<any>{

    return this.http.get(
      `${this.api}/ingresos`,
      {
        withCredentials:true
      }
    );

  }



  // 🔹 ingresos por parqueadero
  getIngresosReporteByParqueadero(
    idParqueadero:number
  ):Observable<any>{

    return this.http.get(
      `${this.api}/ingresos/${idParqueadero}`,
      {
        withCredentials:true
      }
    );

  }



  // 🔹 pagos
  getPagosReporte():Observable<any>{

    return this.http.get(
      `${this.api}/pagos`,
      {
        withCredentials:true
      }
    );

  }

}