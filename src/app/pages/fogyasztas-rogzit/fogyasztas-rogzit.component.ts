import {ChangeDetectorRef, Component, NgZone, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { FirestoreService } from "../../shared/services/firestore.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {FogyasztasiAdat, Lakas} from "../../shared/model/models";
import moment from 'moment';

@Component({
  selector: 'app-fogyasztas-rogzit',
  templateUrl: './fogyasztas-rogzit.component.html',
  styleUrls: ['./fogyasztas-rogzit.component.scss']
})
export class FogyasztasRogzitComponent implements OnInit {
  fogyasztasForm!: FormGroup;
  userId: string | null = null;
  loading = false;

  bojlerTipusok: string[] = [];
  lakasok: Lakas[] = [];

  maxDate: Date = new Date();

  constructor(
    private fb: FormBuilder,
    private firestoreService: FirestoreService,
    private auth: AngularFireAuth,
    private snackBar: MatSnackBar,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.bojlerTipusok = [
      'elektromos',
      'gaz',
      'hőszivattyús',
      'napkollektoros'
    ];

    this.auth.authState.subscribe(user => {
      if (user) {
        this.userId = user.uid;
        this.initFormGroup();
        this.fogyasztasForm.patchValue({ user_id: this.userId });
        this.loadLakasok();
      }
    });

    this.initFormGroup();
  }

  /**
   * Inicializálja a FormGroupot
   **/
  private initFormGroup(): void {
    this.fogyasztasForm = this.fb.group({
      datum: [null, Validators.required],
      feltoltes_datum: [new Date().toISOString(), Validators.required],
      user_id: ['', Validators.required],
      lakas_id: ['', Validators.required],
      viz: [0, [Validators.required, Validators.min(0)]],
      gaz: [0, [Validators.required, Validators.min(0)]],
      villany: [0, [Validators.required, Validators.min(0)]],
      meleg_viz: [0, [Validators.required, Validators.min(0)]],
      megjegyzes: ['']
    });
  }

  /**
   * Fogyasztási adatok mentése Firestore-ba
   */
  onSubmit(): void {
    if (this.fogyasztasForm.valid) {
      this.loading = true;

      this.fogyasztasForm.patchValue({ user_id: this.userId });
      const fogyasztasiAdat: FogyasztasiAdat = this.fogyasztasForm.value;

      this.firestoreService.saveFogyasztasiAdat(fogyasztasiAdat)
        .then(success => {
          if (success) {
            console.log("Sikeres mentés Firestore-ba!");

            this.fogyasztasForm.patchValue({
              datum: '',
              feltoltes_datum: '',
              user_id: '',
              lakas_id: '',
              viz: 0,
              gaz: 0,
              villany: 0,
              meleg_viz: 0,
              megjegyzes: ''
            });

            this.snackBar.open('Fogyasztási adatok sikeresen mentve!', 'Bezárás', {
              duration: 3000,
              panelClass: ['bg-red-500', 'text-white', 'text-center'],
              verticalPosition: 'top'
            });

          }
        })
        .catch(error => {
          console.error('Hiba mentéskor:', error);

          this.snackBar.open('Hiba történt mentés közben!', 'Bezárás', {
            duration: 3000,
            panelClass: ['bg-red-500', 'text-white', 'text-center']
          })
        }).finally(() =>{
            this.loading = false;
        });
    } else {
      const invalidControls = Object.keys(this.fogyasztasForm.controls)
        .filter(key => this.fogyasztasForm.get(key)?.invalid)
        .map(key => ({
          field: key,
          errors: this.fogyasztasForm.get(key)?.errors
        }));

      console.warn('A form érvénytelen! Hibás mezők:', invalidControls);

        this.snackBar.open('Kérlek minden adatot tölts ki, és helyes adatokkal dolgozz!', 'Bezárás', {
          duration: 3000,
          panelClass: ['bg-red-500', 'text-white', 'text-center']
        });
    }
  }

  /**
   * Amikor a dátum kiválasztásra kerül, a megfelelő formátumba alakítjuk
   */
  onDateSelected(): void {
    const selectedDate: Date = this.fogyasztasForm.value.datum;
    if (selectedDate) {
      const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
      this.fogyasztasForm.patchValue({ datum: formattedDate });
    }
  }

  /**
   * Betölti a lakásokat
   */
  private loadLakasok(): void {
    if (!this.userId) return;

    this.firestoreService.getCollection<Lakas>('Lakasok').subscribe(lakasok => {
      this.lakasok = lakasok.filter(lakas => lakas.userId === this.userId);
      this.cd.detectChanges();
    });
  }
}
