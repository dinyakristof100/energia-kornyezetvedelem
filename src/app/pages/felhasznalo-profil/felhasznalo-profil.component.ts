import {ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import {AuthService} from "../../shared/services/auth.service";
import { FirestoreService } from '../../shared/services/firestore.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {MatDialog, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-felhasznalo-profil',
  templateUrl: './felhasznalo-profil.component.html',
  styleUrls: ['./felhasznalo-profil.component.scss']
})
export class FelhasznaloProfilComponent implements OnInit {
  profilForm: FormGroup;
  lakasForm: FormGroup;
  futesTipusok: string[] = [];
  userId: string | null = null;
  collectionName = 'UserInformations';
  dialogRef!: MatDialogRef<any>;

  @ViewChild('lakasDialog') lakasDialog!: TemplateRef<any>;

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private authService: AuthService,
    private firestoreService: FirestoreService,
    private auth: AngularFireAuth,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef
  ) {
    this.profilForm = this.fb.group({
      vezetekNev: ['', Validators.required],
      keresztNev: ['', Validators.required],
      hazAlapterulet: [null, [Validators.required, Validators.min(1)]],
      szigeteles: [false, Validators.required],
      futesTipusa: ['', Validators.required]
    });

    this.lakasForm = this.fb.group({
      lakasNev: ['', Validators.required],
      orszag: ['Magyarország', Validators.required],
      iranyitoszam: ['', Validators.required],
      telepules: ['', Validators.required],
      utca: ['', Validators.required],
      hazszam: ['', Validators.required],
      epitesu: ['', Validators.required],
      futes: ['', Validators.required],
      szigeteles: [false]
    });
  }

  ngOnInit(): void {
    this.updateFutesTipusok();

    this.translate.onLangChange.subscribe(() => {
      this.updateFutesTipusok();
      this.loadUserData();
    });

    this.auth.authState.subscribe(user => {
      if (user) {
        this.userId = user.uid;
        this.loadUserData();
      }
    });

  }

  /**
   * Megnyitja a lakás hozzáadása modalt.
   */
  openLakasModal(): void {
    this.dialogRef = this.dialog.open(this.lakasDialog);
  }

  /**
   * A felhasználó által bevitt lakásadatokat kiírja a konzolra,
   * majd bezárja a modalt.
   */
  saveLakas(): void {
    console.log("Mentett lakás:", this.lakasForm.value);
    this.dialogRef.close();
  }

  /**
   * Betölti a felhasználó adatait Firestore-ból.
   */
  loadUserData(): void {
    if (!this.userId) return;

    this.firestoreService.getDocument(this.collectionName, this.userId).subscribe(data => {
      if (data) {
        this.profilForm.patchValue(data);
        this.updateFutesTipusok();
        this.cd.detectChanges();
      }
    });
  }

  /**
   * Elmenti vagy frissíti a felhasználó adatait Firestore-ban.
   */
  onSubmit(): void {
    if (this.profilForm.valid && this.userId) {
      this.firestoreService.updateDocument(this.collectionName, this.userId, this.profilForm.value)
        .then(() => alert('Adatok sikeresen mentve!'))
        .catch(error => console.error('Hiba mentéskor:', error));
    }
  }

  updateFutesTipusok(): void {
    const futesMapping: { [key: string]: string } = {
      "Convector": this.translate.instant('PROFIL.FUTES.KONVEKTOR'),
      "Gas Boiler": this.translate.instant('PROFIL.FUTES.GAZKAZAN'),
      "Traditional Boiler": this.translate.instant('PROFIL.FUTES.HAGYOMANYOS_KAZAN'),
      "Electric Boiler": this.translate.instant('PROFIL.FUTES.VILLANYKAZAN'),
      "District Heating": this.translate.instant('PROFIL.FUTES.TAVFUTES'),
      "Underfloor Heating": this.translate.instant('PROFIL.FUTES.PADLOFUTES'),
      "Electric Heating": this.translate.instant('PROFIL.FUTES.ELEKTROMOS_FUTES')
    };

    this.futesTipusok = Object.values(futesMapping);

    const currentValue = this.profilForm.get('futesTipusa')?.value;
    if (currentValue && futesMapping[currentValue]) {
      this.profilForm.patchValue({ futesTipusa: futesMapping[currentValue] });
    }
  }
}
