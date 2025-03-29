import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { FirestoreService } from '../../shared/services/firestore.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {Lakas} from "../../shared/model/models";
import {HttpClient} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";
import {LakasModalComponent} from "../../shared/modals/lakas-modal/lakas-modal.component";
import {LakasService} from "../../shared/services/lakas.service";
import {ModalDismissReasons, NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-felhasznalo-profil',
  templateUrl: './felhasznalo-profil.component.html',
  styleUrls: ['./felhasznalo-profil.component.scss']
})
export class FelhasznaloProfilComponent implements OnInit {
  profilForm: FormGroup;
  lakasForm: FormGroup;
  futesTipusok: string[] = [];
  epitesiModok: string[] = [];
  lakasok: any[] = [];
  userId: string | null = null;
  collectionName = 'Users';
  dialogRef!: MatDialogRef<any>;

  iranyitoszamok: { [key: string]: string} = {};

  @ViewChild('lakasDialog') lakasDialog!: TemplateRef<any>;

  get profilFormValue(){
    return this.lakasForm.getRawValue();
  }

  get lakasFormValue(){
    return this.lakasForm.getRawValue();
  }

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private firestoreService: FirestoreService,
    private auth: AngularFireAuth,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private lakasService: LakasService,
    private modalService: NgbModal
  ) {
    this.profilForm = this.fb.group({
      id: [null],
      nev: this.fb.group({
        vezeteknev: ['', Validators.required],
        keresztnev: ['', Validators.required]
      }),
      email: [null, Validators.required],
      username: [null,Validators.required]
    });

    this.lakasForm = this.fb.group({
      id: [null],
      lakasNev: ['', Validators.required],
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
      lakasmeret: [null, [Validators.min(1)]],
      epitesMod: ['', Validators.required],
      futesTipus: ['', Validators.required],
      szigeteles: [false],
      userId: [null]
    });
  }

  ngOnInit(): void {
    this.updateFutesTipusok();
    this.loadIranyitoszamok();
    this.setupAutoFillListeners();

    this.translate.onLangChange.subscribe(() => {
      this.updateEpitesiModok();
      this.updateFutesTipusok();
    });

    this.auth.authState.subscribe(user => {
      if (user) {
        this.userId = user.uid;
        this.loadUserData();
        this.loadLakasok();

      }
    });
  }

  /**
   * Betölti a felhasználóhoz tartozó lakásokat Firestore-ból.
   */
  loadLakasok(): void {
    if (!this.userId) return;

    this.firestoreService.getCollection<Lakas>('Lakasok').subscribe(lakasok => {
      this.lakasok = lakasok.filter(lakas => lakas.userId === this.userId).map(lakas => ({
        ...lakas,
        cim: {
          orszag: lakas.cim?.orszag || '',
          iranyitoszam: lakas.cim?.iranyitoszam || '',
          telepules: lakas.cim?.telepules || '',
          utca: lakas.cim?.utca || '',
          hazszam: lakas.cim?.hazszam || '',
          epulet: lakas.cim?.epulet || '',
          emelet: lakas.cim?.emelet || '',
          ajto: lakas.cim?.ajto || ''
        }
      }));
      this.cd.detectChanges();
    });
  }


  /**
   * Megnyitja a lakás hozzáadása modalt.
   */
// felhasznalo-profil.component.ts
  openLakasModal(lakas?: Lakas): void {

      const modalRef = this.modalService.open(LakasModalComponent, {
        size: 'lg',
        centered: true,
        backdrop: "static"
      });

    modalRef.componentInstance.lakas = lakas;
    modalRef.componentInstance.beforeOpen(lakas);


    modalRef.result.then(
        (result) => {
          console.log("Modal result:", result);
          this.loadLakasok();
        },
        (error) => {
          console.error("Modal dismissed with error:", error);
        }
      );

  }

  /**
   * Bezárja a lakás hozzáadása / szerkesztése modált.
   */
  closeLakasModal(): void {
    this.dialogRef.close();
  }

  /**
   * Ellenőrzi, hogy a lakás már létezik-e, majd elmenti.
   */
  saveLakas(lakasData?: Lakas): void {
    if (this.lakasForm.valid && this.userId) {
      const lakasId = this.firestoreService.createId();

      if(!lakasData){
        const lakasAdatok: Lakas = {
          id: lakasId,
          lakasNev: this.lakasForm.value.lakasNev,
          cim: {
            orszag: this.lakasForm.value.cim.orszag,
            iranyitoszam: this.lakasForm.value.cim.iranyitoszam,
            telepules: this.lakasForm.value.cim.telepules,
            utca: this.lakasForm.value.cim.utca,
            hazszam: this.lakasForm.value.cim.hazszam,
            epulet: this.lakasForm.value.cim.epulet,
            emelet: this.lakasForm.value.cim.emelet,
            ajto: this.lakasForm.value.cim.ajto
          },
          lakasmeret: this.lakasForm.value.lakasmeret,
          epitesMod: this.lakasForm.value.epitesMod,
          futesTipus: this.lakasForm.value.futesTipus,
          szigeteles: this.lakasForm.value.szigeteles,
          userId: this.userId
        };

        const duplicateLakas = this.lakasok.some(lakas =>
          lakas.lakasNev.toLowerCase() === lakasAdatok.lakasNev.toLowerCase()
        );

        if (duplicateLakas) {
          this.translate.get(['PROFIL.LAKAS_DUPLICATE', 'PROFIL.CLOSE']).subscribe(t => {
            this.snackBar.open(t['PROFIL.LAKAS_DUPLICATE'], t['PROFIL.CLOSE'], {
              duration: 3000,
              panelClass: ['bg-red-500', 'text-white', 'text-center'],
              verticalPosition: 'top'
            });
          });
          return;
        }

        this.firestoreService.createDocument<Lakas>('Lakasok', lakasAdatok)
          .then(() => {
            this.loadLakasok();

            this.translate.get(['PROFIL.EMAIL_PASSWORD_ERROR', 'PROFIL.CLOSE']).subscribe(t => {
              this.snackBar.open(t['PROFIL.EMAIL_PASSWORD_ERROR'], t['PROFIL.CLOSE'], {
                duration: 3000,
                panelClass: ['bg-red-500', 'text-white', 'text-center'],
                verticalPosition: 'top'
              });
            });


            this.dialogRef.close();
          })
          .catch(error => console.error('Hiba lakás mentésekor:', error));
      }else{
        const exists = this.lakasok.some(lakas =>
          lakas.lakasNev.toLowerCase() === lakasData.lakasNev.toLowerCase()
        );

        if (exists) {
          this.translate.get(['PROFIL.LAKAS_DUPLICATE_EXISTING', 'PROFIL.CLOSE']).subscribe(t => {
            this.snackBar.open(t['PROFIL.LAKAS_DUPLICATE_EXISTING'], t['PROFIL.CLOSE'], {
              duration: 3000,
              panelClass: ['bg-red-500', 'text-white', 'text-center']
            });
          });

          return;
        }

        this.firestoreService.createDocument<Lakas>('Lakasok', lakasData)
          .then(() => this.loadLakasok())
          .catch(error => console.error('Hiba lakás mentésekor:', error));
      }
    } else {
      console.error('A lakás mentése sikertelen: hiányzó adatok vagy felhasználó ID.');
    }
  }

  /**
   * Betölti a felhasználó adatait Firestore-ból.
   */
  loadUserData(): void {
    if (!this.userId) return;


    this.firestoreService.getDocument(this.collectionName, this.userId).subscribe(data => {
      if (data) {
        this.profilForm.patchValue(data);
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
        .then(() => {
          this.translate.get('PROFIL.ADATOK_SIKERES_MENTESE').subscribe((message: string) => {
            alert(message);
          });
        })
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

  /**
   * Nyelvváltásra reagáló építési módok betöltése.
   */
  updateEpitesiModok(): void {
    const epitesiMapping: { [key: string]: string } = {
      "Brick": this.translate.instant('CIM.EPITES_MOD.TEGLA'),
      "Panel": this.translate.instant('CIM.EPITES_MOD.PANEL'),
      "Wooden": this.translate.instant('CIM.EPITES_MOD.FA'),
      "Lightweight": this.translate.instant('CIM.EPITES_MOD.KONNYUSZERKEZET'),
      "Adobe": this.translate.instant('CIM.EPITES_MOD.VALYOG'),
      "Concrete": this.translate.instant('CIM.EPITES_MOD.BETON'),
      "Container": this.translate.instant('CIM.EPITES_MOD.KONTAINER'),
      "Stone": this.translate.instant('CIM.EPITES_MOD.KO')
    };

    this.epitesiModok = Object.values(epitesiMapping);

    const currentValue = this.lakasForm.get('epitesMod')?.value;
    if (currentValue && epitesiMapping[currentValue]) {
      this.lakasForm.patchValue({ epitesMod: epitesiMapping[currentValue] });
    }
  }

  onClose(){
    this.lakasForm.reset(null);
    this.dialogRef.close();
  }

  /**
   * Betölti az irányítószámokat az assets JSON fájlból.
   */
  loadIranyitoszamok(): void {
    this.http.get<{ [key: string]: string }>('/assets/iranyitoszamok/iranyitoszamok.json')
      .subscribe(data => {
        this.iranyitoszamok = data;
      });
  }
  /**
   * Figyeli az irányítószám és település mezőket, és automatikusan kitölti a megfelelő mezőt.
   */
  setupAutoFillListeners(): void {
    this.lakasForm.get('cim.iranyitoszam')?.valueChanges.subscribe(value => {
      if (value && this.iranyitoszamok[value]) {
        this.lakasForm.patchValue({
          cim: { telepules: this.iranyitoszamok[value] }
        }, { emitEvent: false });
      }
    });

    this.lakasForm.get('cim.telepules')?.valueChanges.subscribe(value => {
      if (value) {
        const foundEntry = Object.entries(this.iranyitoszamok).find(([key, city]) => city.toLowerCase() === value.toLowerCase());
        if (foundEntry) {
          this.lakasForm.patchValue({
            cim: { iranyitoszam: foundEntry[0] }
          }, { emitEvent: false });
        }
      }
    });
  }

}
