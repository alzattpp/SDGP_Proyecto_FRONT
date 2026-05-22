import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { TEST_PROVIDERS } from '../../../testing/test-providers';
import { UsuarioService } from './usuario.service';

describe('UsuarioService', () => {
  let service: UsuarioService;
  let httpMock: HttpTestingController;
  const api = 'https://upgrade-store.shop/api/usuarios';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: TEST_PROVIDERS,
    });
    service = TestBed.inject(UsuarioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('debe obtener usuarios', () => {
    const mockData = [{ idUsuario: 1, nombreCompleto: 'Juan' }];

    service.getUsuarios().subscribe((res) => {
      expect(res).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${api}/getUsuarios`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('debe obtener usuario por id', () => {
    const mockData = { idUsuario: 2, nombreCompleto: 'Ana' };

    service.getUsuarioById(2).subscribe((res) => {
      expect(res).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${api}/findUsuarioById/2`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('debe crear usuario', () => {
    const body = { nombreCompleto: 'Nuevo', correo: 'n@autonoma.edu.co' };
    const mockData = { idUsuario: 3, ...body };

    service.createUsuario(body).subscribe((res) => {
      expect(res).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${api}/createUsuario`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(mockData);
  });

  it('debe actualizar usuario', () => {
    const body = { telefono: '300' };
    const mockData = { idUsuario: 1, ...body };

    service.updateUsuario(1, body).subscribe((res) => {
      expect(res).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${api}/updateUsuario/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockData);
  });

  it('debe eliminar usuario', () => {
    service.deleteUsuario(1).subscribe((res) => {
      expect(res).toEqual({ ok: true });
    });

    const req = httpMock.expectOne(`${api}/delete/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ ok: true });
  });

  it('debe hacer login con credenciales', () => {
    const body = { correo: 'u@autonoma.edu.co', contrasena: 'x' };
    const mockData = { token: 'abc' };

    service.login(body).subscribe((res) => {
      expect(res).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${api}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBeTrue();
    req.flush(mockData);
  });

  it('debe hacer logout', () => {
    service.logout().subscribe((res) => {
      expect(res).toEqual({ ok: true });
    });

    const req = httpMock.expectOne(`${api}/logout`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBeTrue();
    req.flush({ ok: true });
  });

  it('debe obtener usuario actual', () => {
    const mockData = { data: { nombreCompleto: 'Yo' }, rol: 'usuario' };

    service.getCurrentUsuario().subscribe((res) => {
      expect(res).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${api}/me`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBeTrue();
    req.flush(mockData);
  });

  it('debe manejar error al obtener usuarios', () => {
    service.getUsuarios().subscribe({
      next: () => fail('debía fallar'),
      error: (err) => expect(err.status).toBe(500),
    });

    const req = httpMock.expectOne(`${api}/getUsuarios`);
    req.flush('Error', { status: 500, statusText: 'Server Error' });
  });
});
