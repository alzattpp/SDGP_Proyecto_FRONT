import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { TEST_PROVIDERS } from '../../../testing/test-providers';
import { AuthService } from '../../auth/auth.service';
import { UsuarioService } from '../../services/usuarios/usuario.service';
import { MENSAJE_CORREO_AUTONOMA } from '../../utils/correo-institucional.util';
import { InicioComponent } from './inicio';

describe('InicioComponent', () => {
  let component: InicioComponent;
  let fixture: ComponentFixture<InicioComponent>;
  let usuarioService: UsuarioService;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', [
      'refreshSession',
      'clearSession',
      'getHomeRoute',
    ]);
    authService.refreshSession.and.returnValue(
      of({ rol: 'usuario', idUsuario: 1 }),
    );
    authService.getHomeRoute.and.returnValue('/principal');

    await TestBed.configureTestingModule({
      imports: [InicioComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [...TEST_PROVIDERS, { provide: AuthService, useValue: authService }],
    }).compileComponents();

    fixture = TestBed.createComponent(InicioComponent);
    component = fixture.componentInstance;
    usuarioService = TestBed.inject(UsuarioService);
    router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe inicializar señales vacías', () => {
    expect(component.email()).toBe('');
    expect(component.contrasena()).toBe('');
    expect(component.loading()).toBeFalse();
    expect(component.errorMsg()).toBeNull();
  });

  it('debe mostrar error si faltan credenciales', () => {
    component.iniciarSesion();
    expect(component.errorMsg()).toBe('Completa correo y contraseña.');
  });

  it('debe validar correo institucional', () => {
    component.email.set('user@gmail.com');
    component.contrasena.set('pass');
    component.iniciarSesion();
    expect(component.errorMsg()).toBe(MENSAJE_CORREO_AUTONOMA);
  });

  it('debe iniciar sesión y navegar al home del usuario', () => {
    spyOn(router, 'navigateByUrl').and.returnValue(Promise.resolve(true));
    component.email.set('user@autonoma.edu.co');
    component.contrasena.set('secret');

    component.iniciarSesion();

    const req = httpMock.expectOne('https://upgrade-store.shop/api/usuarios/login');
    expect(req.request.method).toBe('POST');
    req.flush({ rol: 'usuario' });

    expect(authService.refreshSession).toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/principal');
    expect(component.loading()).toBeFalse();
  });

  it('debe rechazar administrador en login de usuario', () => {
    authService.refreshSession.and.returnValue(
      of({ rol: 'administrador', idUsuario: 1, idAdministrador: 1 }),
    );
    component.email.set('admin@autonoma.edu.co');
    component.contrasena.set('secret');

    component.iniciarSesion();

    const req = httpMock.expectOne('https://upgrade-store.shop/api/usuarios/login');
    req.flush({ rol: 'administrador' });

    expect(component.errorMsg()).toContain('administración');
    expect(authService.clearSession).toHaveBeenCalled();
  });

  it('debe manejar error de login', () => {
    component.email.set('user@autonoma.edu.co');
    component.contrasena.set('bad');

    component.iniciarSesion();

    const req = httpMock.expectOne('https://upgrade-store.shop/api/usuarios/login');
    req.flush({ message: 'Credenciales inválidas' }, { status: 401, statusText: 'Unauthorized' });

    expect(component.errorMsg()).toBe('Credenciales inválidas');
    expect(authService.clearSession).toHaveBeenCalled();
  });

  it('debe llamar login del servicio', () => {
    spyOn(usuarioService, 'login').and.returnValue(
      throwError(() => ({ error: { mensaje: 'fallo' } })),
    );
    component.email.set('user@autonoma.edu.co');
    component.contrasena.set('x');
    component.iniciarSesion();
    expect(usuarioService.login).toHaveBeenCalledWith({
      correo: 'user@autonoma.edu.co',
      contrasena: 'x',
    });
  });
});
