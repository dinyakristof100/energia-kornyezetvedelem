import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {FirestoreService} from "../../shared/services/firestore.service";

@Component({
  selector: 'app-fogyasztas-rogzit',
  templateUrl: './fogyasztas-rogzit.component.html',
  styleUrls: ['./fogyasztas-rogzit.component.scss']
})
export class FogyasztasRogzitComponent implements OnInit {
  fogyasztasForm!: FormGroup;
  userId: string | null = null;
  loading = true;

  constructor(
    private fb: FormBuilder,
    private firestoreService: FirestoreService,
    private translate: TranslateService,
    private auth: AngularFireAuth
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.auth.authState.subscribe(user => {
      if (user) {
        this.userId = user.uid;
      }
      this.loading = false;
    });
  }

  private initForm(): void {
    this.fogyasztasForm = this.fb.group({
      cim: this.fb.group({
        orszag: ['Magyarország', Validators.required],
        iranyitoszam: ['', Validators.required],
        telepules: ['', Validators.required],
        utca: ['', Validators.required],
        hazszam: ['', Validators.required],
        epulet: [''],
        emelet: [''],
        ajto: ['']
      }),
      datum: [new Date(), Validators.required],
      feltoltesDatum: [new Date(), Validators.required],
      userId: ['', Validators.required],
      viz: this.fb.group({
        osszfogyasztas: [0, [Validators.required, Validators.min(0)]],
        hidegViz: [0, [Validators.required, Validators.min(0)]],
        szivargas: [false],
        minoseg: ['', Validators.required],
        meresModja: ['', Validators.required]
      }),
      gaz: this.fb.group({
        osszfogyasztas: [0, [Validators.required, Validators.min(0)]],
        csucsidoFogyasztas: [0, [Validators.required, Validators.min(0)]],
        alacsonyNyomas: [false],
        evesBecsult: [0, [Validators.required, Validators.min(0)]],
        biztonsagiEllenorzes: [false]
      }),
      villany: this.fb.group({
        osszfogyasztas: [0, [Validators.required, Validators.min(0)]],
        csucsidofogyasztas: [0, [Validators.required, Validators.min(0)]],
        aramkimaradas: [false],
        zoldEnergiaAranya: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
        tarifak: this.fb.group({})
      }),
      melegViz: this.fb.group({
        osszfogyasztas: [0, [Validators.required, Validators.min(0)]],
        vizhomerseklet: [0, [Validators.required, Validators.min(0)]],
        bojlerTipus: ['', Validators.required],
        bojlerAllapot: ['', Validators.required],
        hoveszteseg: [0, [Validators.required, Validators.min(0)]]
      }),
      megjegyzesek: ['']
    });
  }

  changeLanguage(lang: string): void {
    this.translate.use(lang);
  }

  /**
   * Fogyasztási adatok mentése Firestore-ba
   */
  onSubmit(): void {
    if (this.fogyasztasForm.valid) {
      this.loading = true;

      this.firestoreService.saveFogyasztasiAdat(this.fogyasztasForm.value)
        .then(() => {
          alert('Fogyasztási adatok sikeresen mentve!');
          this.fogyasztasForm.reset();
        })
        .catch(error => {
          console.error('Hiba mentéskor:', error);
          alert('Hiba történt mentés közben!');
        })
        .finally(() => {
          this.loading = false;
        });

    } else {
      alert('Kérjük, töltsd ki az összes mezőt helyesen!');
    }
  }
}
