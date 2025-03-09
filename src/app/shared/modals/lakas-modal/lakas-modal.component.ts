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

  futesTipusok: string[] = [
    'PANEL', 'FA', 'KONNYUSZERKEZET',
    'VALYOG', 'BETON', 'KONTAINER', 'KO'
  ];
  epitesiModok: string[] = [
    'TEGLA','KONVEKTOR', 'GAZKAZAN', 'HAGYOMANYOS_KAZAN',
    'VILLANYKAZAN', 'TAVFUTES', 'PADLOFUTES', 'ELEKTROMOS_FUTES'
  ];



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
    if (lakas) {
      this.lakas = { ...lakas };

      setTimeout(() => {
        this.lakasForm.patchValue(this.lakas!);
        this.cd.detectChanges();
      }, 100);
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
