import {ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Lakas} from "../../model/models";
import {FirestoreService} from "../../services/firestore.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {TranslateService} from "@ngx-translate/core";
import {LakasService} from "../../services/lakas.service";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {HttpClient} from "@angular/common/http";
import {AngularFireAuth} from "@angular/fire/compat/auth";

@Component({
  selector: 'app-lakas-modal',
  templateUrl: './lakas-modal.component.html',
  styleUrls: ['./lakas-modal.component.scss']
})
export class LakasModalComponent implements OnInit, OnChanges{
  @Input() lakas?: Lakas;
  lakasForm: FormGroup;
  iranyitoszamok: Record<string, string> = {};
  userId: string | null = null;
  loading = false;

  futesTipusok: { key: string, label: string }[] = [];
  epitesiModok: { key: string, label: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private firestoreService: FirestoreService,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private cd: ChangeDetectorRef,
    private http: HttpClient,
    public activeModal: NgbActiveModal,
    private auth: AngularFireAuth
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
    this.loading = true;

    if(this.lakas){
      this.lakasForm.patchValue(this.lakas);
      this.cd.detectChanges();
    }

    this.loadIranyitoszamok();
    this.setupFormListeners();

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

    if (this.lakas) {
      this.lakas = { ...this.lakas };

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

    this.auth.authState.subscribe(user => {
      if (user) {
        this.userId = user.uid;
      }});
    this.loading = false;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['lakas'] && changes['lakas'].currentValue) {
      if(this.lakas){
        this.lakasForm.patchValue(this.lakas);
      }
      this.cd.detectChanges();
    }
  }

  private loadIranyitoszamok(): void {
    this.http.get<Record<string, string>>('/assets/iranyitoszamok/iranyitoszamok.json')
      .subscribe(data => {
        this.iranyitoszamok = data;
      });
  }

  private setupFormListeners(): void {
    const cimGroup = this.lakasForm.get('cim');

    cimGroup?.get('iranyitoszam')?.valueChanges.subscribe(value => {
      if (this.iranyitoszamok[value]) {
        cimGroup.get('telepules')?.setValue(this.iranyitoszamok[value], { emitEvent: false });
      }
    });

    cimGroup?.get('telepules')?.valueChanges.subscribe(value => {
      const foundEntry = Object.entries(this.iranyitoszamok).find(([, city]) => city.toLowerCase() === value.toLowerCase());
      if (foundEntry) {
        cimGroup.get('iranyitoszam')?.setValue(foundEntry[0], { emitEvent: false });
      }
    });
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

    this.auth.authState.subscribe(user => {
      if (user) {
        this.userId = user.uid;
      }});

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

      this.lakasForm.patchValue({userId: this.userId});
      const lakasData: Lakas = this.lakasForm.value;

      if (lakasData.id) {
        this.firestoreService.updateDocument('Lakasok', lakasData.id, lakasData)
          .then(() => this.showTranslatedSnackBar('LAKAS.FRISSITES_SIKERES'))
          .catch(error => console.error('Hiba a lakás frissítésekor:', error));
      } else {
        lakasData.id = this.firestoreService.createId();
        this.firestoreService.createDocument('Lakasok', lakasData)
          .then(() => this.showTranslatedSnackBar('LAKAS.MENTES_SIKERES'))
          .catch(error => console.error('Hiba lakás mentésekor:', error));
      }


      this.activeModal.close(lakasData);
    }
  }

  onCancel(): void {
    this.activeModal.close(null);
  }

  private showTranslatedSnackBar(messageKey: string): void {
    this.translate.get([messageKey, 'LAKAS.BEZARAS']).subscribe(t => {
      this.snackBar.open(t[messageKey], t['LAKAS.BEZARAS'], {
        duration: 3000,
        panelClass: ['custom-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    });
  }
}
