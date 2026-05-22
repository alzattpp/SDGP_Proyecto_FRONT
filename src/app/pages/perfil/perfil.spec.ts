import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { TEST_PROVIDERS } from '../../../testing/test-providers';
import { AuthService } from '../../auth/auth.service';
import { PerfilComponent } from './perfil';

describe('PerfilComponent', () => {
  let component: PerfilComponent;
  let fixture: ComponentFixture<PerfilComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['loadSession']);
    authService.loadSession.and.returnValue(
      of({ rol: 'usuario', idUsuario: 5 }),
    );

    await TestBed.configureTestingModule({
      imports: [PerfilComponent, HttpClientTestingModule, FormsModule, RouterTestingModule],
      providers: [...TEST_PROVIDERS, { provide: AuthService, useValue: authService }],
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    flushPeticionesPerfil({
      me: { data: { nombreCompleto: 'Inicial', documento: '0', rol: 'usuario' } },
      logins: { totalLogins: 0 },
      vehiculos: { data: [] },
    });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar perfil con sesión válida', () => {
    expect(authService.loadSession).toHaveBeenCalled();
    expect(component.nombrePerfil()).toBe('Inicial');
    expect(component.documentoPerfil()).toBe('0');
    expect(component.perfilCargando()).toBeFalse();
    expect(component.placasCargando()).toBeFalse();
  });

  it('debe abrir y cerrar modal de placas', () => {
    component.openPlaca();
    expect(component.modalPlaca).toBeTrue();
    component.closePlaca();
    expect(component.modalPlaca).toBeFalse();
  });

  it('debe abrir modal de medios de pago', () => {
    component.openMedios();
    expect(component.modalMedios).toBeTrue();

    const reqMedios = httpMock.expectOne(
      'https://upgrade-store.shop/api/mediopagos/findUsuario/5',
    );
    reqMedios.flush({ data: [] });
    expect(component.mediosPago.length).toBe(0);
    expect(component.mediosCargando()).toBeFalse();
  });

  function flushPeticionesPerfil(payload: {
    me: object;
    logins: object;
    vehiculos: object;
  }): void {
    httpMock.expectOne('https://upgrade-store.shop/api/usuarios/me').flush(payload.me);
    httpMock
      .expectOne('https://upgrade-store.shop/api/usuarios/cantidadLogins')
      .flush(payload.logins);
    httpMock
      .expectOne('https://upgrade-store.shop/api/vehiculos/getVehiculos')
      .flush(payload.vehiculos);
    fixture.detectChanges();
  }
});
