import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { TEST_PROVIDERS } from '../../../testing/test-providers';
import { AdminTrabajadoresComponent } from './admin-trabajadores';

describe('AdminTrabajadoresComponent', () => {
  let component: AdminTrabajadoresComponent;
  let fixture: ComponentFixture<AdminTrabajadoresComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AdminTrabajadoresComponent,
        HttpClientTestingModule,
        FormsModule,
        RouterTestingModule,
      ],
      providers: TEST_PROVIDERS,
    }).compileComponents();

    fixture = TestBed.createComponent(AdminTrabajadoresComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    flushCargaInicial([], []);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe inicializar modales cerrados', () => {
    expect(component.filas().length).toBe(0);
    expect(component.modalAgregar).toBeFalse();
    expect(component.modalEditar).toBeFalse();
    expect(component.cargando()).toBeFalse();
  });

  it('debe cargar trabajadores y parqueaderos', () => {
    component.recargarDatos();
    flushCargaInicial(
      [{ idParqueadero: 2, nombre: 'Bavaria' }],
      [
        {
          idTrabajador: 1,
          idUsuario: 10,
          nombreCompleto: 'Pedro',
          correo: 'p@autonoma.edu.co',
          documento: '1',
          telefono: '300',
          idParqueadero: 2,
        },
      ],
    );

    expect(component.cargando()).toBeFalse();
    expect(component.filas().length).toBe(1);
    expect(component.filas()[0].nombreCompleto).toBe('Pedro');
    expect(component.parqueaderosOpciones().length).toBe(1);
  });

  it('debe abrir modal agregar', () => {
    component.abrirAgregar();
    expect(component.modalAgregar).toBeTrue();
    expect(component.addNombreCompleto).toBe('');
  });

  it('debe cerrar modal agregar', () => {
    component.modalAgregar = true;
    component.cerrarAgregar();
    expect(component.modalAgregar).toBeFalse();
  });

  function flushCargaInicial(parqueaderos: unknown[], trabajadores: unknown[]): void {
    const reqPq = httpMock.expectOne(
      'https://upgrade-store.shop/api/parqueaderos/getParqueaderos',
    );
    const reqTr = httpMock.expectOne(
      'https://upgrade-store.shop/api/trabajadores/getTrabajadores',
    );
    reqPq.flush(parqueaderos);
    reqTr.flush(trabajadores);
    fixture.detectChanges();
  }
});
