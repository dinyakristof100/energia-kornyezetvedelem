import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Fa } from "../../shared/model/models";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {FaModalComponent} from "../../shared/modals/fa-modal/fa-modal.component";
import { Timestamp } from 'firebase/firestore';
import { DocumentData } from '@angular/fire/firestore';
import {MatSnackBar} from "@angular/material/snack-bar";
import {EmailService} from "../../shared/services/email.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-faultetes',
  templateUrl: './faultetes.component.html'
})
export class FaultetesComponent implements OnInit {
  trees: Fa[] = [];
  userId: string = '';

  showTooltip: boolean = false;

  loading = true;
  private isAdmin = false;

  readonly fajtaNovesiSebesseg: { [key: string]: 'lassu' | 'kozepes' | 'gyors' } = {
    TOLGY: 'lassu',
    BUKK: 'lassu',
    GYERTYAN: 'kozepes',
    AKAC: 'gyors',
    FEHER_NYAR: 'gyors',
    KOCSANYOS_TOLGY: 'lassu',
    HARS: 'kozepes',
    JUHAR: 'kozepes',
    NYIR: 'gyors',
    SZIL: 'kozepes',
    KORIS: 'kozepes',
    FUZ: 'gyors',
    CSONTOS_FENYO: 'lassu',
    ERDEI_FENYO: 'kozepes',
    LUCFENYO: 'lassu',
    EZUSTFENYO: 'lassu',
    TUJAFELE: 'lassu',
    CSONTOS_HARS: 'kozepes',
    KIS_LEVELU_HARS: 'kozepes',
    CSERESZNYEFA: 'kozepes'
  };

  readonly novekedesiFaktor: { [key: string]: number } = {
    lassu: 8,
    kozepes: 14,
    gyors: 21
  };

  constructor(
    private firestore: AngularFirestore,
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private modalService: NgbModal,
    private cd: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private emailService: EmailService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.auth.user.subscribe(user => {
      if (user) {
        this.userId = user.uid;

        this.firestore.collection('Users').doc(user.uid).get().toPromise().then(snapshot => {
          if (snapshot) {
            const data = snapshot.data() as DocumentData;
            this.isAdmin = !!data?.['admin'];
          } else {
            this.isAdmin = false;
          }
          this.betoltFak();
        }).catch(error => {
          console.error('Admin státusz lekérdezése sikertelen:', error);
          this.isAdmin = false;
          this.betoltFak();
        });

        this.betoltFak();
      } else {
        console.warn('Nincs bejelentkezett felhasználó!');
      }
    });
  }

  megnyitUjFaModal() {
    const modalRef = this.modalService.open(FaModalComponent, {
      size: 'lg',
      centered: true,
      backdrop: "static"
    });

    modalRef.result.then((result) => {
      if (result === 'saved') {
        this.snackBar.open(
          this.translate.instant('SNACKBAR.SUCCESS'),
          'OK',
          { duration: 5000 }
        );

        this.betoltFak();
      }
    }).catch(() => {});
  }

  betoltFak(): void {
    const refBuilder = this.firestore.collection<Fa>('Trees', ref => {
      let query: firebase.default.firestore.Query = ref;
      if (!this.isAdmin) {
        query = query.where('user_id', '==', this.userId);
        query = query.where('jovahagyott', '==', true);
      }

      return query;
    });

    refBuilder.valueChanges({ idField: 'id' }).subscribe(async fak => {
      const promises = fak.map(async (fa) => {
        const ultetesIdo = (fa.ultetes_ideje as Timestamp)?.toDate?.() ?? null;

        if (fa.kep?.photo_url) {
          try {
            const url = await this.storage.ref(fa.kep.photo_url).getDownloadURL().toPromise();
            return {
              ...fa,
              ultetes_ideje: ultetesIdo,
              kep: {
                ...fa.kep,
                photo_url: url
              }
            };
          } catch (error) {
            console.error('Nem sikerült lekérni a képet:', error);
            return fa;
          }
        }

        return {
          ...fa,
          ultetes_ideje: ultetesIdo
        };
      });

      this.trees = await Promise.all(promises);
      this.loading = false;
      this.cd.detectChanges();
    });
  }

  jovahagyFa(faId: string) {
    this.firestore.collection('Trees').doc(faId).update({
      jovahagyott: true
    }).then(() => {
      this.emailService.kuldesFaJovahagyasEmail(faId);
      this.betoltFak();
    }).catch(err => console.error('Hiba a jóváhagyáskor:', err));
  }

  torolFa(faId: string) {
    this.firestore.collection('Trees').doc(faId).get().toPromise().then(async doc => {
      const fa = doc?.data() as Fa;
      if (!fa) {
        console.error('Fa nem található törlés előtt.');
        return;
      }

      await this.emailService.kuldesFaTorlesEmail(faId);

      this.firestore.collection('Trees').doc(faId).delete().then(() => {
        this.betoltFak();
      }).catch(err => console.error('Hiba a fa törlésekor:', err));

    }).catch(err => console.error('Nem sikerült lekérni a fát törlés előtt:', err));
  }

  adminElerheto(): boolean {
    return this.isAdmin;
  }

  szamolCO2Megkotes(ultetesDatum: Date, fajta: string): number {
    const ma = new Date();
    const elteltEv = (ma.getTime() - new Date(ultetesDatum).getTime()) / (1000 * 60 * 60 * 24 * 365.25);

    const sebesseg = this.fajtaNovesiSebesseg[fajta.toUpperCase()] || 'kozepes';
    const faktor = this.novekedesiFaktor[sebesseg];

    // Az éves megkötés nő lineárisan: év * faktor
    // Összes CO2 = Σ (év * faktor), közelítve: (év * (év+1)/2) * faktor
    const co2 = (elteltEv * (elteltEv + 1)) / 2 * (faktor * 1.5); // 1.5x szorzó: CO2 megkötés becslés
    return Math.round(co2 * 10) / 10;
  }

  szamolO2Termeles(ultetesDatum: Date, fajta: string): number {
    const ma = new Date();
    const elteltEv = (ma.getTime() - new Date(ultetesDatum).getTime()) / (1000 * 60 * 60 * 24 * 365.25);

    const sebesseg = this.fajtaNovesiSebesseg[fajta.toUpperCase()] || 'kozepes';
    const faktor = this.novekedesiFaktor[sebesseg];

    // Hasonló növekedés, de O2 termelés valamivel nagyobb: 2.1x szorzó
    const o2 = (elteltEv * (elteltEv + 1)) / 2 * (faktor * 2.1);
    return Math.round(o2 * 10) / 10;
  }

  getTranslatedFajta(fajta: string): string {
    const fajtaKey = fajta.toUpperCase().replace('É', 'E').replace('Ő', 'O').replace('Ű', 'U').replace('Ö','O'); // biztos ami biztos
    const kulcs = `FAULTETES.FAJTA.${fajtaKey}`;
    return this.translate.instant(kulcs);
  }


}
