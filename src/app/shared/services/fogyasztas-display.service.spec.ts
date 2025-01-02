import { TestBed } from '@angular/core/testing';

import { FogyasztasDisplayService } from './fogyasztas-display.service';

describe('FogyasztasDisplayService', () => {
  let service: FogyasztasDisplayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FogyasztasDisplayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
