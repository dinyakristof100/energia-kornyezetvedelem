import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {AngularFirestore, QueryDocumentSnapshot} from '@angular/fire/compat/firestore';
import {DocumentData} from "@angular/fire/firestore";


@Component({
  selector: 'app-cenzura-admin',
  templateUrl: './cenzura-admin.component.html',
  styleUrls: ['./cenzura-admin.component.scss']
})
export class CenzuraAdminComponent implements OnInit {
  @Output() cenzuraValtozott = new EventEmitter<void>();

  cenzurak: { id: string, text: string, idopont: Date }[] = [];
  ujCenzura = '';
  betoltes = false;
  tobbBetoltheto = true;
  aktualisOldalIndex = 1;
  pageReferences: QueryDocumentSnapshot<DocumentData>[] = [];
  private oldalMeret = 5;
  private utolsoDokumentum: any = null;

  constructor(private firestore: AngularFirestore) {}

  ngOnInit(): void {
    this.aktualisOldalIndex = 1;
    this.pageReferences = [];

    this.loadCenzurak();
  }

  async addCenzura(): Promise<void> {
    if (!this.ujCenzura.trim()) return;
    await this.firestore.collection('Cenzurak').add({
      text: this.ujCenzura.trim(),
      idopont: new Date()
    });
    this.ujCenzura = '';
    this.resetLista();
    this.cenzuraValtozott.emit();
  }

  async torolCenzurat(id: string): Promise<void> {
    await this.firestore.collection('Cenzurak').doc(id).delete();
    this.resetLista();
    this.cenzuraValtozott.emit();
  }

  private resetLista(): void {
    this.cenzurak = [];
    this.utolsoDokumentum = null;
    this.tobbBetoltheto = true;
    this.aktualisOldalIndex = 1;
    this.pageReferences = [];
    this.loadCenzurak();
  }

  async loadCenzurak(direction: 'next' | 'prev' | null = null): Promise<void> {
    if (this.betoltes || (direction === 'next' && !this.tobbBetoltheto)) return;

    this.betoltes = true;

    try {
      const collectionRef = this.firestore.collection('Cenzurak', ref => {
        let query = ref.orderBy('idopont', 'desc').limit(this.oldalMeret);

        if (direction === 'next' && this.aktualisOldalIndex > 0) {
          const ref = this.pageReferences[this.aktualisOldalIndex - 1];
          if (ref) query = query.startAfter(ref);
        }

        if (direction === 'prev' && this.aktualisOldalIndex > 1) {
          const ref = this.pageReferences[this.aktualisOldalIndex - 2];
          if (ref) query = query.startAt(ref);
        }

        return query;
      });

      const snapshot = await collectionRef.get().toPromise();

      if (!snapshot || snapshot.empty) {
        if (direction === 'next') this.tobbBetoltheto = false;
        return;
      }

      const ujCenzurak = snapshot.docs.map(doc => {
        const data = doc.data() as { text: string; idopont: any };
        return {
          id: doc.id,
          text: data.text,
          idopont: data.idopont.toDate()
        };
      });

      this.cenzurak = [...ujCenzurak];

      const lastDoc = snapshot.docs[snapshot.docs.length - 1] as QueryDocumentSnapshot<DocumentData>;

      if (direction === 'next') {
        if (this.pageReferences.length < this.aktualisOldalIndex + 1) {
          this.pageReferences.push(lastDoc);
        }
        this.aktualisOldalIndex++;
      } else if (direction === 'prev' && this.aktualisOldalIndex > 1) {
        this.aktualisOldalIndex--;
        this.tobbBetoltheto = true;
      } else if (!direction && this.pageReferences.length === 0) {
        // első betöltéskor elmentjük az első oldal utolsó elemét
        this.pageReferences.push(lastDoc);
      }

      this.tobbBetoltheto = snapshot.docs.length === this.oldalMeret;

    } catch (error) {
      console.error('Hiba a cenzúrák betöltésekor:', error);
    } finally {
      this.betoltes = false;
    }
  }


}
