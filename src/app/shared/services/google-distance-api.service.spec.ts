import { TestBed } from '@angular/core/testing';

import { GoogleDistanceApiService } from './google-distance-api.service';

describe('GoogleDistanceApiService', () => {
  let service: GoogleDistanceApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoogleDistanceApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
