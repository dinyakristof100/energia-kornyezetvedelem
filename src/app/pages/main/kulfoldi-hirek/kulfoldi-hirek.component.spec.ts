import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KulfoldiHirekComponent } from './kulfoldi-hirek.component';

describe('KulfoldiHirekComponent', () => {
  let component: KulfoldiHirekComponent;
  let fixture: ComponentFixture<KulfoldiHirekComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [KulfoldiHirekComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(KulfoldiHirekComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
