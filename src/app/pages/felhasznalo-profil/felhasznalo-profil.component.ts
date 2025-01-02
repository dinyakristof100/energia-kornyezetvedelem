import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-felhasznalo-profil',
  templateUrl: './felhasznalo-profil.component.html',
  styleUrls: ['./felhasznalo-profil.component.scss']
})
export class FelhasznaloProfilComponent implements OnInit {
  profilForm: FormGroup;
  futesTipusok: string[] = [];

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService) {
    this.profilForm = this.fb.group({
      vezetekNev: ['', Validators.required],
      keresztNev: ['', Validators.required],
      hazAlapterulet: [null, [Validators.required, Validators.min(1)]],
      szigeteles: [false, Validators.required],
      futesTipusa: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.updateFutesTipusok();

    this.translate.onLangChange.subscribe(() => {
      this.updateFutesTipusok();
    });
  }

  updateFutesTipusok(): void {
    this.futesTipusok = [
      this.translate.instant('PROFIL.FUTES.KONVEKTOR'),
      this.translate.instant('PROFIL.FUTES.GAZKAZAN'),
      this.translate.instant('PROFIL.FUTES.HAGYOMANYOS_KAZAN'),
      this.translate.instant('PROFIL.FUTES.VILLANYKAZAN'),
      this.translate.instant('PROFIL.FUTES.TAVFUTES'),
      this.translate.instant('PROFIL.FUTES.PADLOFUTES'),
      this.translate.instant('PROFIL.FUTES.ELEKTROMOS_FUTES')
    ];
  }

  onSubmit(): void {
    if (this.profilForm.valid) {
      console.log('Profil adatok:', this.profilForm.value);
      alert('A felhasználói adatok sikeresen frissítve!');
    } else {
      alert('Kérjük, töltsd ki az összes mezőt helyesen!');
    }
  }
}
