import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FirestoreService } from "../../services/firestore.service";
import { AuthService } from "../../services/auth.service";
import {Fa} from "../../model/models";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {HttpClient} from "@angular/common/http";
import {TranslateService} from "@ngx-translate/core";
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-fa-modal',
  templateUrl: './fa-modal.component.html'
})
export class FaModalComponent implements OnInit{
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
    user_id: '',
    jovahagyott: false
  };

  fajtak: string[] = [
    'TOLGY', 'BUKK', 'GYERTYAN', 'AKAC', 'FEHER_NYAR',
    'KOCSANYOS_TOLGY', 'HARS', 'JUHAR', 'NYIR', 'SZIL',
    'KORIS', 'FUZ', 'CSONTOS_FENYO', 'ERDEI_FENYO', 'LUCFENYO',
    'EZUSTFENYO', 'TUJAFELE', 'CSONTOS_HARS', 'KIS_LEVELU_HARS', 'CSERESZNYEFA'
  ];

  formValid: boolean = false;

  maxDate: Date = new Date();
  iranyitoszamok: Record<string, string> = {};

  selectedFile: File | null = null;
  uploading: boolean = false;

  userCollection = 'UserInformations';
  userId: any;
  userData: any

  imagePreview: string | null = null;

  constructor(
    public activeModal: NgbActiveModal,
    private firestoreService: FirestoreService,
    private auth: AngularFireAuth,
    private http: HttpClient,
    private storage: AngularFireStorage,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.auth.authState.subscribe(user => {
      if (user) {
        this.userId = user.uid;
        this.faAdat.user_id = this.userId;
      }
    });

    this.loadIranyitoszamok();
    this.setupFormListeners();
    this.ellenorizMezok();
  }

  async mentes() {
    if (!this.faAdat.nev || !this.faAdat.fajta || !this.faAdat.ultetes_ideje || !this.faAdat.ultetes_helye.telepules || !this.selectedFile) {
      alert('Kérlek, tölts ki minden kötelező mezőt!');
      return;
    }
    this.uploading = true;

    const id = this.firestoreService.createId();
    const fa: Fa = {
      ...this.faAdat,
      id,
      ultetes_ideje: new Date(this.faAdat.ultetes_ideje)
    };

    try {
      if (this.selectedFile) {
        this.uploading = true;
        const filePath = `trees/${id}.jpg`;
        const fileRef = this.storage.ref(filePath);
        const task = this.storage.upload(filePath, this.selectedFile);

        task.snapshotChanges().pipe(
          finalize(async () => {
            const downloadURL = await fileRef.getDownloadURL().toPromise();

            this.firestoreService.getDocument(this.userCollection, this.userId).subscribe(data => {
              if (data) {
                this.userData = data;
              }
            });

            fa.kep = {
              id: this.firestoreService.createId(),
              photo_url: filePath,
              username: this.userData ? this.userData.vezetekNev+' '+this.userData.keresztNev : 'Ismeretlen',
              user_id: this.userId
            };

            await this.firestoreService.createDocument<Fa>('Trees', fa);
            this.uploading = false;
            this.activeModal.close('saved');
          })
        ).subscribe();
      } else {
        await this.firestoreService.createDocument<Fa>('Trees', fa);
        this.uploading = false;
        this.activeModal.close('saved');
      }
    } catch (error) {
      console.error('Hiba a fa mentésekor:', error);
      alert('Hiba történt a mentés közben.');
      this.uploading = false;
    }
  }

  megse() {
    this.activeModal.dismiss();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
    this.ellenorizMezok();
  }

  private loadIranyitoszamok(): void {
    this.http.get<Record<string, string>>('/assets/iranyitoszamok/iranyitoszamok.json')
      .subscribe(data => {
        this.iranyitoszamok = data;
      });
  }

  setupFormListeners(): void {
    const iranyitoElem = document.querySelector<HTMLInputElement>('input[name="iranyitoszam"]');
    const telepulesElem = document.querySelector<HTMLInputElement>('input[name="telepules"]');

    iranyitoElem?.addEventListener('input', () => {
      const irsz = iranyitoElem.value;
      if (this.iranyitoszamok[irsz]) {
        this.faAdat.ultetes_helye.telepules = this.iranyitoszamok[irsz];
      }
    });

    telepulesElem?.addEventListener('input', () => {
      const foundEntry = Object.entries(this.iranyitoszamok).find(([, city]) => city.toLowerCase() === telepulesElem.value.toLowerCase());
      if (foundEntry) {
        this.faAdat.ultetes_helye.iranyitoszam = foundEntry[0];
      }
    });
  }

  ellenorizMezok() {
    const a = this.faAdat;
    this.formValid = !!(
      a.nev?.trim().length &&
      a.fajta?.trim().length &&
      a.ultetes_ideje &&
      a.ultetes_helye?.iranyitoszam?.trim().length &&
      a.ultetes_helye?.telepules?.trim().length &&
      a.ultetes_helye?.utca?.trim().length &&
      a.ultetes_helye?.hazszam?.trim().length &&
      this.selectedFile
    );
    this.cd.detectChanges();
  }

}
