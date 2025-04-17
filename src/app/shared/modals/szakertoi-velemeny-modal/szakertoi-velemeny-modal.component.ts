import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Velemeny } from '../../model/models';
import { EmailService } from '../../services/email.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {TranslateService} from "@ngx-translate/core";
import {FirestoreService} from "../../services/firestore.service";

@Component({
  selector: 'app-szakertoi-velemeny-modal',
  templateUrl: './szakertoi-velemeny-modal.component.html',
  styleUrls: ['./szakertoi-velemeny-modal.component.scss']
})
export class SzakertoiVelemenyModalComponent {
  @Input() velemeny!: Velemeny;

  valaszSzoveg: string = '';

  constructor(
    public activeModal: NgbActiveModal,
    private emailService: EmailService,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private firestoreService: FirestoreService,
  ) {}

  kuldes() {
    if (!this.valaszSzoveg.trim()) return;

    this.emailService.kuldesSzakertoiValaszEmail(this.velemeny.userid, this.valaszSzoveg)
      .then(() => {
        return this.firestoreService.deleteDocument('Velemenyek', this.velemeny?.id);
      })
      .then(() => {
        this.translate.get('SZAKERTOI_VELEMENYEK.KULDES_SIKER').subscribe(text => {
          this.snackBar.open(text, undefined, { duration: 3000 });
        });
        this.activeModal.close();
      })
      .catch(() => {
        this.translate.get('SZAKERTOI_VELEMENYEK.KULDES_HIBA').subscribe(text => {
          this.snackBar.open(text, undefined, { duration: 3000 });
        });
      });
  }

  megse() {
    this.activeModal.dismiss();
  }
}
