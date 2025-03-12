import {ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Lakas} from "../../model/models";
import {FirestoreService} from "../../services/firestore.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {TranslateService} from "@ngx-translate/core";
import {LakasService} from "../../services/lakas.service";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-lakas-modal',
  templateUrl: './lakas-modal.component.html',
  styleUrls: ['./lakas-modal.component.scss']
})
export class LakasModalComponent implements OnInit, OnChanges{
  @Input() lakas?: Lakas;
  lakasForm: FormGroup;

  futesTipusokKeys: string[] = [
    'PANEL', 'FA', 'KONNYUSZERKEZET',
    'VALYOG', 'BETON', 'KONTAINER', 'KO'
  ];
  epitesiModokKeys: string[] = [
    'TEGLA','KONVEKTOR', 'GAZKAZAN', 'HAGYOMANYOS_KAZAN',
    'VILLANYKAZAN', 'TAVFUTES', 'PADLOFUTES', 'ELEKTROMOS_FUTES'
  ];

  futesTipusok: { key: string, label: string }[] = [];
  epitesiModok: { key: string, label: string }[] = [];

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

  ngOnInit() {
    console.log("ngOnInit called");
    if(this.lakas){
      this.lakasForm.patchValue(this.lakas);
      this.cd.detectChanges();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['lakas'] && changes['lakas'].currentValue) {
      if(this.lakas){
        this.lakasForm.patchValue(this.lakas);
      }
      this.cd.detectChanges();
    }
  }

  async beforeOpen(lakas?: Lakas) {
    const currentLang = this.translate.currentLang;

    if (currentLang === 'hu') {
      this.futesTipusok = [
        { key: 'KONVEKTOR', label: 'Konvektor' },
        { key: 'GAZKAZAN', label: 'Gázkazán' },
        { key: 'HAGYOMANYOS_KAZAN', label: 'Hagyományos kazán' },
        { key: 'VILLANYKAZAN', label: 'Villanykazán' },
        { key: 'TAVFUTES', label: 'Távfűtés' },
        { key: 'PADLOFUTES', label: 'Padlófűtés' },
        { key: 'ELEKTROMOS_FUTES', label: 'Elektromos fűtés' }
      ];
    } else {
      this.futesTipusok = [
        { key: 'KONVEKTOR', label: 'Convector' },
        { key: 'GAZKAZAN', label: 'Gas Boiler' },
        { key: 'HAGYOMANYOS_KAZAN', label: 'Traditional Boiler' },
        { key: 'VILLANYKAZAN', label: 'Electric Boiler' },
        { key: 'TAVFUTES', label: 'District Heating' },
        { key: 'PADLOFUTES', label: 'Underfloor Heating' },
        { key: 'ELEKTROMOS_FUTES', label: 'Electric Heating' }
      ];
    }
    if (currentLang === 'hu') {
      this.epitesiModok = [
        { key: 'TEGLA', label: 'Téglaépítésű' },
        { key: 'PANEL', label: 'Panelépület' },
        { key: 'FA', label: 'Fa szerkezetű' },
        { key: 'KONNYUSZERKEZET', label: 'Könnyűszerkezetes' },
        { key: 'VALYOG', label: 'Vályogház' },
        { key: 'BETON', label: 'Beton szerkezetű' },
        { key: 'KONTAINER', label: 'Konténerház' },
        { key: 'KO', label: 'Kőház' }
      ];
    } else {
      this.epitesiModok = [
        { key: 'TEGLA', label: 'Brick' },
        { key: 'PANEL', label: 'Panel' },
        { key: 'FA', label: 'Wooden' },
        { key: 'KONNYUSZERKEZET', label: 'Lightweight' },
        { key: 'VALYOG', label: 'Adobe' },
        { key: 'BETON', label: 'Concrete' },
        { key: 'KONTAINER', label: 'Container' },
        { key: 'KO', label: 'Stone' }
      ];
    }

    if (lakas) {
      this.lakas = { ...lakas };

      setTimeout(() => {
        this.lakasForm.patchValue({
          id: this.lakas?.id,
          lakasNev: this.lakas?.lakasNev,
          lakasmeret: this.lakas?.lakasmeret,
          epitesMod: this.lakas?.epitesMod,
          futesTipus: this.lakas?.futesTipus,
          szigeteles: this.lakas?.szigeteles,
          cim: {
            orszag: this.lakas?.cim.orszag,
            iranyitoszam: this.lakas?.cim.iranyitoszam,
            telepules: this.lakas?.cim.telepules,
            utca: this.lakas?.cim.utca,
            hazszam: this.lakas?.cim.hazszam,
            epulet: this.lakas?.cim.epulet,
            emelet: this.lakas?.cim.emelet,
            ajto: this.lakas?.cim.ajto
          },
          userId: this.lakas?.userId
        });

        this.cd.detectChanges();
      }, 100);
    }
  }

  onSave(): void {
    if (this.lakasForm.valid) {
      const lakasData: Lakas = this.lakasForm.value;

      if (lakasData.id) {
        this.firestoreService.updateDocument('Lakasok', lakasData.id, lakasData)
          .then(() => this.showSnackBar('Lakás adatai frissítve!'))
          .catch(error => console.error('Hiba a lakás frissítésekor:', error));
      } else {
        lakasData.id = this.firestoreService.createId();
        this.firestoreService.createDocument('Lakasok', lakasData)
          .then(() => this.showSnackBar('Új lakás sikeresen létrehozva!'))
          .catch(error => console.error('Hiba lakás mentésekor:', error));
      }


      this.activeModal.close(lakasData);
    }
  }

  onCancel(): void {
    this.activeModal.close(null);
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Bezárás', {
      duration: 3000,
      panelClass: ['custom-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

}
