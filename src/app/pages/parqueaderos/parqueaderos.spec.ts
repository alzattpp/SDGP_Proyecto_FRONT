import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ParqueaderosComponent } from './parqueaderos';

describe('ParqueaderosComponent', () => {
  let component: ParqueaderosComponent;
  let fixture: ComponentFixture<ParqueaderosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParqueaderosComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ParqueaderosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
