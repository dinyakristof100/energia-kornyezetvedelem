import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {Lakas} from "../../model/models";
import { FirestoreService } from "../../services/firestore.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import {TranslateService} from "@ngx-translate/core";
import {LakasService} from "../../services/lakas.service";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-lakas-modal',
  templateUrl: './lakas-modal.component.html',
  styleUrls: ['./lakas-modal.component.scss']
})
export class LakasModalComponent implements OnInit {
  lakasForm: FormGroup;
  futesTipusok: string[] = [];
  epitesiModok: string[] = [];

  dataLoaded = false;

  constructor(
    private fb: FormBuilder,
    private firestoreService: FirestoreService,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private cd: ChangeDetectorRef,
    private lakasService: LakasService,
    public activeModal: NgbActiveModal
  ) {
    this.lakasForm = this.fb.group({
      id: [null],
      lakasNev: ['', Validators.required],
      lakasmeret: [null, [Validators.min(1)]],
      epitesMod: ['', Validators.required],
      futesTipus: ['', Validators.required],
      szigeteles: [false],
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
      userId: [null]
    });
  }

  ngOnInit(): void {
    console.log("ngOnInit called");

    this.translate.onLangChange.subscribe(() => {
      this.updateEpitesiModok();
      this.updateFutesTipusok();
    });

    this.updateEpitesiModok();
    this.updateFutesTipusok();

    this.lakasService.lakas$.subscribe(lakas => {
      if (lakas) {
        this.lakasForm.patchValue(lakas);
      }
    });

    this.cd.detectChanges();
  }

  /**
  * Frissíti a fűtési típusokat a nyelv alapján.
*/
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

    const currentValue = this.lakasForm.get('futesTipus')?.value;
    if (currentValue && futesMapping[currentValue]) {
      this.lakasForm.patchValue({ futesTipus: futesMapping[currentValue] });
    }
  }

  /**
   * Frissíti az építési módokat a nyelv alapján.
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

  onSave(): void {
    if (this.lakasForm.valid) {
      const lakasData: Lakas = this.lakasForm.value;


        lakasData.id = this.firestoreService.createId();
        this.firestoreService.createDocument<Lakas>('Lakasok', lakasData)
          .then(() => this.showSnackBar('Lakás sikeresen mentve!'))
          .catch(error => console.error('Hiba lakás mentésekor:', error));


      this.activeModal.close(lakasData);
    }
  }

  onCancel(): void {
    this.activeModal.close(null);
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Bezárás', {
      duration: 3000,
      panelClass: ['bg-green-500', 'text-white', 'text-center']
    });
  }
}
