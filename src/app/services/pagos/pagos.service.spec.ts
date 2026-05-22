import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { TEST_PROVIDERS } from '../../../testing/test-providers';
import { Pago, Pagos } from './pagos';

describe('Pagos', () => {
  let service: Pagos;
  let httpMock: HttpTestingController;
  const api = 'https://upgrade-store.shop/api/pagos';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: TEST_PROVIDERS,
    });
    service = TestBed.inject(Pagos);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('debe obtener pagos', () => {
    const mockData = [{ idPago: 1, monto: 3500 }];

    service.getPagos().subscribe((res) => {
      expect(res).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${api}/getPagos`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBeTrue();
    req.flush(mockData);
  });

  it('debe obtener pago por id', () => {
    const mockData = { idPago: 2, monto: 5000 };

    service.getPagoById(2).subscribe((res) => {
      expect(res).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${api}/findPago/2`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('debe obtener pagos por usuario', () => {
    const mockData = [{ idPago: 3, idUsuario: 5 }];

    service.getPagosByUsuario(5).subscribe((res) => {
      expect(res).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${api}/findUsuario/5`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBeTrue();
    req.flush(mockData);
  });

  it('debe crear pago', () => {
    const body: Pago = {
      idUsuario: 1,
      idMedioPago: 2,
      monto: 3500,
      idIngreso: 10,
    };
    const mockData = { idPago: 1, ...body };

    service.createPago(body).subscribe((res) => {
      expect(res).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${api}/createPago`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBeTrue();
    req.flush(mockData);
  });

  it('debe actualizar pago', () => {
    const body: Pago = {
      idUsuario: 1,
      idMedioPago: 2,
      monto: 4000,
    };
    const mockData = { idPago: 1, ...body };

    service.updatePago(1, body).subscribe((res) => {
      expect(res).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${api}/updatePago/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockData);
  });

  it('debe eliminar pago', () => {
    service.deletePago(1).subscribe((res) => {
      expect(res).toEqual({ ok: true });
    });

    const req = httpMock.expectOne(`${api}/delete/1`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.withCredentials).toBeTrue();
    req.flush({ ok: true });
  });

  it('debe manejar error al obtener pagos', () => {
    service.getPagos().subscribe({
      next: () => fail('debía fallar'),
      error: (err) => expect(err.status).toBe(500),
    });

    const req = httpMock.expectOne(`${api}/getPagos`);
    req.flush('Error', { status: 500, statusText: 'Server Error' });
  });
});
