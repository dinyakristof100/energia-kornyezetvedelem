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

  loading = true;
  private isAdmin = false;

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
    console.log("betoltFak called");

    const refBuilder = this.firestore.collection<Fa>('Trees', ref => {
      let query: firebase.default.firestore.Query = ref;
      if (this.isAdmin) {
        query = query.where('jovahagyott', '==', false);
      } else {
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
      // this.emailService.kuldesJovahagyasEmail(faId);
      this.betoltFak();
    }).catch(err => console.error('Hiba a jóváhagyáskor:', err));
  }

  torolFa(faId: string, userId: string) {
    this.firestore.collection('Trees').doc(faId).delete().then(() => {
      // this.emailService.kuldesTorlesEmail(userId);
      this.betoltFak();
    }).catch(err => console.error('Hiba a törléskor:', err));
  }

  adminElerheto(): boolean {
    return this.isAdmin;
  }

}
