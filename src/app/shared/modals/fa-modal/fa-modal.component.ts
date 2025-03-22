import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FirestoreService } from "../../services/firestore.service";
import { AuthService } from "../../services/auth.service";
import {Fa} from "../../model/models";

@Component({
  selector: 'app-fa-modal',
  templateUrl: './fa-modal.component.html'
})
export class FaModalComponent {
   faAdat: Fa = {
    id: '',
    nev: '',
    fajta: '',
    ultetes_ideje: new Date(),
    ultetes_helye: {
      orszag: 'Magyarország',
      iranyitoszam: '',
      telepules: '',
      utca: '',
      hazszam: ''
    },
    user_id: ''
  };

  constructor(
    public activeModal: NgbActiveModal,
    private firestoreService: FirestoreService
  ) {}
  async mentes() {
    if (!this.faAdat.nev || !this.faAdat.fajta || !this.faAdat.ultetes_ideje || !this.faAdat.ultetes_helye.telepules) {
      alert('Kérlek, tölts ki minden kötelező mezőt!');
      return;
    }

    const id = this.firestoreService.createId();
    const fa: Fa = {
      ...this.faAdat,
      id,
      ultetes_ideje: new Date(this.faAdat.ultetes_ideje)
    };

    try {
      await this.firestoreService.createDocument<Fa>('Trees', fa);
      this.activeModal.close('saved');
    } catch (error) {
      console.error('Hiba a fa mentésekor:', error);
      alert('Hiba történt a mentés közben.');
    }
  }

  megse() {
    this.activeModal.dismiss();
  }
}
