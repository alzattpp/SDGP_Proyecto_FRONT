import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { TEST_PROVIDERS } from '../../../testing/test-providers';
import { ParqueaderosComponent } from './parqueaderos';

describe('ParqueaderosComponent', () => {
  let component: ParqueaderosComponent;
  let fixture: ComponentFixture<ParqueaderosComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParqueaderosComponent, HttpClientTestingModule, RouterTestingModule],
      providers: TEST_PROVIDERS,
    }).compileComponents();

    fixture = TestBed.createComponent(ParqueaderosComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    const reqLista = httpMock.expectOne(
      'https://upgrade-store.shop/api/parqueaderos/getParqueaderos',
    );
    reqLista.flush([]);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe inicializar lista vacía tras carga', () => {
    expect(component.cargando()).toBeFalse();
    expect(component.items().length).toBe(0);
    expect(component.errorMsg()).toBeNull();
  });

  it('debe cargar parqueaderos con estadísticas', () => {
    component.ngOnInit();
    const reqLista = httpMock.expectOne(
      'https://upgrade-store.shop/api/parqueaderos/getParqueaderos',
    );
    reqLista.flush([
      {
        idParqueadero: 2,
        nombre: 'Bavaria',
        capacidadMaxima: 140,
        requierePago: true,
      },
    ]);

    const reqStats = httpMock.expectOne(
      'https://upgrade-store.shop/api/parqueaderos/stats/2',
    );
    reqStats.flush({ cuposDisponibles: 50, ocupados: 90 });

    fixture.detectChanges();

    expect(component.cargando()).toBeFalse();
    expect(component.items().length).toBe(1);
    expect(component.items()[0].nombre).toBe('Bavaria');
    expect(component.items()[0].cuposDisponibles).toBe(50);
  });

  it('debe mostrar error si falla la lista', () => {
    component.ngOnInit();
    const reqLista = httpMock.expectOne(
      'https://upgrade-store.shop/api/parqueaderos/getParqueaderos',
    );
    reqLista.flush('Error', { status: 500, statusText: 'Error' });
    fixture.detectChanges();

    expect(component.errorMsg()).toContain('No se pudieron cargar');
    expect(component.items().length).toBe(0);
  });

  it('debe devolver imagen según ocupación', () => {
    expect(component.imagenCarro(10)).toContain('carroVerde');
    expect(component.imagenCarro(50)).toContain('carroAmarillo');
    expect(component.imagenCarro(80)).toContain('carroRojo');
  });
});
