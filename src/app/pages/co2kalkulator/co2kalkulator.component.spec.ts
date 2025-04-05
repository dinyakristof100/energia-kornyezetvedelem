import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Co2kalkulatorComponent } from './co2kalkulator.component';

describe('Co2kalkulatorComponent', () => {
  let component: Co2kalkulatorComponent;
  let fixture: ComponentFixture<Co2kalkulatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Co2kalkulatorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Co2kalkulatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
