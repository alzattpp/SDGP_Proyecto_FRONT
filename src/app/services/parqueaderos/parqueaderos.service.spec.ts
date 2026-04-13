import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { ParqueaderoService } from './parqueaderos.service';

describe('ParqueaderoService', () => {
  let service: ParqueaderoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
    service = TestBed.inject(ParqueaderoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
