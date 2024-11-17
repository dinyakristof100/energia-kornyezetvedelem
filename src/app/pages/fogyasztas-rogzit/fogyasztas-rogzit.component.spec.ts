import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FogyasztasRogzitComponent } from './fogyasztas-rogzit.component';

describe('FogyasztasRogzitComponent', () => {
  let component: FogyasztasRogzitComponent;
  let fixture: ComponentFixture<FogyasztasRogzitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FogyasztasRogzitComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FogyasztasRogzitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
