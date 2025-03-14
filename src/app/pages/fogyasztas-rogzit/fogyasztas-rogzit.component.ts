import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { FirestoreService } from "../../shared/services/firestore.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {FogyasztasiAdat, Lakas} from "../../shared/model/models";

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
  lakasok: Lakas[] = [];

  constructor(
    private fb: FormBuilder,
    private firestoreService: FirestoreService,
    private translate: TranslateService,
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
      this.loading = false;
    });
  }

  /**
   * Inicializálja a FormGroupot
   **/
  private initFormGroup(): void {
    this.fogyasztasForm = this.fb.group({
      datum: [new Date().toISOString(), Validators.required],
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

  changeLanguage(lang: string): void {
    this.translate.use(lang);
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
        .then(() => {
          this.snackBar.open('Fogyasztási adatok sikeresen mentve!', 'Bezárás', {
            duration: 3000,
            panelClass: ['bg-green-500', 'text-white'],
            verticalPosition: 'top'
          });
          this.fogyasztasForm.reset();
          setTimeout(() => this.initFormGroup(), 0);
          this.cd.detectChanges();
        })
        .catch(error => {
          console.error('Hiba mentéskor:', error);
          this.snackBar.open('Hiba történt mentés közben!', 'Bezárás', {
            duration: 3000,
            panelClass: ['bg-red-500', 'text-white'],
            verticalPosition: 'top'
          });
        })
        .finally(() => {
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
        panelClass: ['bg-red-500', 'text-white'],
        verticalPosition: "top"
      });
    }
  }

  private loadLakasok(): void {
    if (!this.userId) return;

    this.firestoreService.getCollection<Lakas>('Lakasok').subscribe(lakasok => {
      this.lakasok = lakasok.filter(lakas => lakas.userId === this.userId);
      this.cd.detectChanges();
    });
  }
}
