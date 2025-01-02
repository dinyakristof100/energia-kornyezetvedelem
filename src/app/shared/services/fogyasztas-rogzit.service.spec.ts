import { TestBed } from '@angular/core/testing';

import { FogyasztasRogzitService } from './fogyasztas-rogzit.service';

describe('FogyasztasRogzitService', () => {
  let service: FogyasztasRogzitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FogyasztasRogzitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
