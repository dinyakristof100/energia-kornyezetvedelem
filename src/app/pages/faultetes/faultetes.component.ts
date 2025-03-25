import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Fa } from "../../shared/model/models";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {FaModalComponent} from "../../shared/modals/fa-modal/fa-modal.component";
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-faultetes',
  templateUrl: './faultetes.component.html'
})
export class FaultetesComponent implements OnInit {
  trees: Fa[] = [];
  userId: string = '';

  constructor(
    private firestore: AngularFirestore,
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.auth.authState.subscribe(user => {
      if (user) {
        this.userId = user.uid;
        this.betoltFak();
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
        this.betoltFak();
      }
    }).catch(() => {});
  }

  betoltFak(): void {
    console.log("betoltFak called");
    console.trace();
    this.firestore.collection<Fa>('Trees', ref =>
      ref.where('user_id', '==', this.userId)
    ).valueChanges({ idField: 'id' }).subscribe(async fak => {
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
        return fa;
      });

      this.trees = await Promise.all(promises);
    });
  }

}
