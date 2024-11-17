import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FogyasztasDisplayComponent } from './fogyasztas-display.component';

describe('FogyasztasDisplayComponent', () => {
  let component: FogyasztasDisplayComponent;
  let fixture: ComponentFixture<FogyasztasDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FogyasztasDisplayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FogyasztasDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
