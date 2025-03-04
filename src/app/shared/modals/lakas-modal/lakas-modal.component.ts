import {ChangeDetectorRef, Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {Lakas} from "../../model/models";
import { FirestoreService } from "../../services/firestore.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import {TranslateService} from "@ngx-translate/core";
import {LakasService} from "../../services/lakas.service";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import { Input } from "@angular/core";

@Component({
  selector: 'app-lakas-modal',
  templateUrl: './lakas-modal.component.html',
  styleUrls: ['./lakas-modal.component.scss']
})
export class LakasModalComponent implements OnInit, OnChanges{
  @Input() lakas?: Lakas;

  lakasForm: FormGroup;
  futesTipusok: string[] = [];
  epitesiModok: string[] = [];


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

    console.log("constructor lefutott")
  }

  ngOnInit() {
    console.log("ngOnInit called");

    console.log("this.lakas:",this.lakas);
    if(this.lakas){
      this.lakasForm.patchValue(this.lakas);
      this.cd.detectChanges();
    }

    this.updateFutesTipusok();
    this.updateEpitesiModok();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['lakas'] && changes['lakas'].currentValue) {
      console.log("ngOnChanges lefutott, this.lakas:", this.lakas);
      if(this.lakas){
        this.lakasForm.patchValue(this.lakas);
      }
      this.cd.detectChanges();
    }
  }

  async beforeOpen(lakas?: Lakas){
    if (lakas) {
      console.log("beforeOpen metódus fut, kapott lakas:", lakas);
      this.lakas = lakas;
    }

    await this.updateEpitesiModok();
    await this.updateFutesTipusok();

    setTimeout(() => {
      if (this.lakas) {
        this.lakasForm.patchValue({
          id: this.lakas.id,
          lakasNev: this.lakas.lakasNev,
          lakasmeret: this.lakas.lakasmeret,
          epitesMod: this.lakas.epitesMod ,
          futesTipus: this.lakas.futesTipus,
          szigeteles: this.lakas.szigeteles,
          cim: {
            orszag: this.lakas.cim.orszag,
            iranyitoszam: this.lakas.cim.iranyitoszam,
            telepules: this.lakas.cim.telepules,
            utca: this.lakas.cim.utca,
            hazszam: this.lakas.cim.hazszam,
            epulet: this.lakas.cim.epulet,
            emelet: this.lakas.cim.emelet,
            ajto: this.lakas.cim.ajto
          },
          userId: this.lakas.userId
        });
        this.cd.detectChanges();
      }
    }, 100);
  }

  /**
  * Frissíti a fűtési típusokat a nyelv alapján.
*/
  async updateFutesTipusok(): Promise<void> {
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
  async updateEpitesiModok(): Promise<void> {
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
