import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { FirestoreService } from "../../shared/services/firestore.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-fogyasztas-rogzit',
  templateUrl: './fogyasztas-rogzit.component.html',
  styleUrls: ['./fogyasztas-rogzit.component.scss']
})
export class FogyasztasRogzitComponent implements OnInit {
  fogyasztasForm!: FormGroup;
  userId: string | null = null;
  loading = true;

  bojlerTipusok: string[] = [];
  lakasok: string[] = [];

  constructor(
    private fb: FormBuilder,
    private firestoreService: FirestoreService,
    private translate: TranslateService,
    private auth: AngularFireAuth,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.bojlerTipusok = [
      'elektromos',
      'gaz',
      'hőszivattyús',
      'napkollektoros'
    ];

    this.lakasok = [
      'Lakás 1',
      'Lakás 2',
      'Lakás 3'
    ];

    this.initFormGroup();

    this.auth.authState.subscribe(user => {
      if (user) {
        this.userId = user.uid;
        this.fogyasztasForm.patchValue({ userId: this.userId });
      }
      this.loading = false;
    });
  }

  /**
   * Inicializálja a FormGroupot
   **/
  private initFormGroup(): void {
    this.fogyasztasForm = this.fb.group({
      cim: this.fb.group({
        sajatLakas: [false],
        valasztottLakas: [{ value: '', disabled: true }],
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
        hidegViz: [0, [Validators.required, Validators.min(0)]],
        melegViz: [0, [Validators.required, Validators.min(0)]],
        bojlerTipus: ['', Validators.required]
      }),

      gaz: this.fb.group({
        osszfogyasztas: [0, [Validators.required, Validators.min(0)]]
      }),

      villany: this.fb.group({
        osszfogyasztas: [0, [Validators.required, Validators.min(0)]],
        aramkimaradas: [false],
        kimaradasIdotartam: [{ value: null, disabled: true }, [Validators.min(0)]]
      }),

      megjegyzesek: ['']
    });

    this.fogyasztasForm.get('cim.sajatLakas')?.valueChanges.subscribe(value => {
      const valasztottLakasControl = this.fogyasztasForm.get('cim.valasztottLakas');

      if (value) {
        valasztottLakasControl?.enable();
      } else {
        valasztottLakasControl?.disable();
        valasztottLakasControl?.setValue('');
      }
    });

    this.fogyasztasForm.get('villany.aramkimaradas')?.valueChanges.subscribe(value => {
      const kimaradasControl = this.fogyasztasForm.get('villany.kimaradasIdotartam');
      if (value) {
        kimaradasControl?.enable();
      } else {
        kimaradasControl?.disable();
        kimaradasControl?.setValue(null);
      }
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
      this.snackBar.open('Kérlek minden adatot tölts ki!', 'Bezárás', {
        duration: 3000,
        panelClass: ['bg-red-500', 'text-white', 'text-center'],
        verticalPosition: "top"
      });
    }
  }
}
