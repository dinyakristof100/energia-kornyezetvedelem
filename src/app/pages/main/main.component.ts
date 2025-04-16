import {Component, OnInit, ViewChild} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {DocumentData} from "@angular/fire/firestore";
import {MagyarHirekComponent} from "./magyar-hirek/magyar-hirek.component";
import {KulfoldiHirekComponent} from "./kulfoldi-hirek/kulfoldi-hirek.component";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit{
  @ViewChild(MagyarHirekComponent) magyarHirekComponent!: MagyarHirekComponent;
  @ViewChild(KulfoldiHirekComponent) kulfoldiHirekComponent!: KulfoldiHirekComponent;

  nyelv: 'hu' | 'en' = 'hu';
  isAdmin = false;

  constructor(
    private translate: TranslateService,
    private auth: AngularFireAuth,
    private firestore: AngularFirestore
  ) {}

  ngOnInit(): void {
    this.auth.user.subscribe(user => {
      if (user) {
        const uid = user.uid;

        this.firestore.collection('Users').doc(uid).get().toPromise().then(snapshot => {
          if (snapshot?.exists) {
            const data = snapshot.data() as DocumentData;
            this.isAdmin = !!data?.['admin'];
          } else {
            this.isAdmin = false;
          }
        }).catch(err => {
          console.error('Admin státusz lekérdezése sikertelen:', err);
          this.isAdmin = false;
        });
      }
    });

    this.nyelv = this.translate.currentLang as 'hu' | 'en';

    this.translate.onLangChange.subscribe(langChangeEvent => {
      this.nyelv = langChangeEvent.lang as 'hu' | 'en';
    });
  }

  frissitsHireket(): void {
    if (this.nyelv === 'hu' && this.magyarHirekComponent) {
      this.magyarHirekComponent.reloadHirek();
    } else if (this.nyelv === 'en' && this.kulfoldiHirekComponent) {
      this.kulfoldiHirekComponent.reloadHirek();
    }
  }
}
