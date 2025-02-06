import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import {AuthService} from "../../shared/services/auth.service";
import { FirestoreService } from '../../shared/services/firestore.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-felhasznalo-profil',
  templateUrl: './felhasznalo-profil.component.html',
  styleUrls: ['./felhasznalo-profil.component.scss']
})
export class FelhasznaloProfilComponent implements OnInit {
  profilForm: FormGroup;
  futesTipusok: string[] = [];
  userId: string | null = null;
  collectionName = 'UserInformations';


  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private authService: AuthService,
    private firestoreService: FirestoreService,
    private auth: AngularFireAuth
  ) {
    this.profilForm = this.fb.group({
      vezetekNev: ['', Validators.required],
      keresztNev: ['', Validators.required],
      hazAlapterulet: [null, [Validators.required, Validators.min(1)]],
      szigeteles: [false, Validators.required],
      futesTipusa: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.updateFutesTipusok();

    this.translate.onLangChange.subscribe(() => {
      this.updateFutesTipusok();
    });

    this.auth.authState.subscribe(user => {
      if (user) {
        this.userId = user.uid;
        this.loadUserData();
      }
    });

  }

  /**
   * Betölti a felhasználó adatait Firestore-ból.
   */
  loadUserData(): void {
    if (!this.userId) return;

    this.firestoreService.getDocument(this.collectionName, this.userId).subscribe(data => {
      if (data) {
        this.profilForm.patchValue(data);
      }
    });
  }

  /**
   * Elmenti vagy frissíti a felhasználó adatait Firestore-ban.
   */
  onSubmit(): void {
    if (this.profilForm.valid && this.userId) {
      this.firestoreService.updateDocument(this.collectionName, this.userId, this.profilForm.value)
        .then(() => alert('Adatok sikeresen mentve!'))
        .catch(error => console.error('Hiba mentéskor:', error));
    }
  }

  updateFutesTipusok(): void {
    this.futesTipusok = [
      this.translate.instant('PROFIL.FUTES.KONVEKTOR'),
      this.translate.instant('PROFIL.FUTES.GAZKAZAN'),
      this.translate.instant('PROFIL.FUTES.HAGYOMANYOS_KAZAN'),
      this.translate.instant('PROFIL.FUTES.VILLANYKAZAN'),
      this.translate.instant('PROFIL.FUTES.TAVFUTES'),
      this.translate.instant('PROFIL.FUTES.PADLOFUTES'),
      this.translate.instant('PROFIL.FUTES.ELEKTROMOS_FUTES')
    ];
  }
}
