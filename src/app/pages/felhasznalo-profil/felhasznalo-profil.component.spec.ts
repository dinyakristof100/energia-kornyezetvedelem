import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FelhasznaloProfilComponent } from './felhasznalo-profil.component';

describe('FelhasznaloProfilComponent', () => {
  let component: FelhasznaloProfilComponent;
  let fixture: ComponentFixture<FelhasznaloProfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FelhasznaloProfilComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FelhasznaloProfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
