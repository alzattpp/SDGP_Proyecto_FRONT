import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { TEST_PROVIDERS } from '../../../testing/test-providers';
import { Trabajador, TrabajadorService } from './trabajador.service';

describe('TrabajadorService', () => {
  let service: TrabajadorService;
  let httpMock: HttpTestingController;
  const api = 'https://upgrade-store.shop/api/trabajadores';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: TEST_PROVIDERS,
    });
    service = TestBed.inject(TrabajadorService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('debe obtener trabajadores', () => {
    const mockData = [{ idTrabajador: 1, nombreCompleto: 'Pedro' }];

    service.getTrabajadores().subscribe((res) => {
      expect(res).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${api}/getTrabajadores`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('debe obtener trabajador por id', () => {
    const mockData = { idTrabajador: 3, nombreCompleto: 'Luis' };

    service.getTrabajadorById(3).subscribe((res) => {
      expect(res).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${api}/findTrabajadorById/3`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('debe crear trabajador', () => {
    const body: Trabajador = {
      nombreCompleto: 'Nuevo',
      correo: 't@autonoma.edu.co',
      contrasena: 'x',
      documento: '1',
      telefono: '300',
      idParqueadero: 2,
    };
    const mockData = { idTrabajador: 4, ...body };

    service.createTrabajador(body).subscribe((res) => {
      expect(res).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${api}/createTrabajador`);
    expect(req.request.method).toBe('POST');
    req.flush(mockData);
  });

  it('debe actualizar trabajador', () => {
    const body = { telefono: '301' };
    const mockData = { idTrabajador: 1, ...body };

    service.updateTrabajador(1, body).subscribe((res) => {
      expect(res).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${api}/updateTrabajador/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockData);
  });

  it('debe eliminar trabajador', () => {
    service.deleteTrabajador(9).subscribe((res) => {
      expect(res).toEqual({ ok: true });
    });

    const req = httpMock.expectOne(`${api}/delete/9`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ ok: true });
  });

  it('debe obtener trabajador actual', () => {
    const mockData = { data: { nombreCompleto: 'Yo' }, rol: 'trabajador' };

    service.getCurrentTrabajador().subscribe((res) => {
      expect(res).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${api}/me`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBeTrue();
    req.flush(mockData);
  });

  it('debe manejar error al obtener trabajadores', () => {
    service.getTrabajadores().subscribe({
      next: () => fail('debía fallar'),
      error: (err) => expect(err.status).toBe(500),
    });

    const req = httpMock.expectOne(`${api}/getTrabajadores`);
    req.flush('Error', { status: 500, statusText: 'Server Error' });
  });
});
