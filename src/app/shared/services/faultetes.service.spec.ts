import { TestBed } from '@angular/core/testing';

import { FaultetesService } from './faultetes.service';

describe('FaultetesService', () => {
  let service: FaultetesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FaultetesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
