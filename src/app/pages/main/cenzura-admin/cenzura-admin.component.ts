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

  constructor(private firestore: AngularFirestore) {}

  ngOnInit(): void {
    this.resetLista();
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
    this.pageReferences = [];
    this.tobbBetoltheto = true;
    this.aktualisOldalIndex = 1;
    this.loadCenzurak();
  }

  async loadCenzurak(direction: 'next' | 'prev' | null = null): Promise<void> {
    if (this.betoltes || (direction === 'next' && !this.tobbBetoltheto)) return;

    this.betoltes = true;

    // Index kezelése "Előző" műveletnél
    if (direction === 'prev' && this.aktualisOldalIndex > 1) {
      this.aktualisOldalIndex--;
    }

    try {
      const collectionRef = this.firestore.collection('Cenzurak', ref => {
        let query = ref.orderBy('idopont', 'desc').limit(this.oldalMeret);

        if (direction === 'next' && this.aktualisOldalIndex > 0) {
          const ref = this.pageReferences[this.aktualisOldalIndex - 1];
          if (ref) query = query.startAfter(ref);
        }

        if (direction === 'prev' && this.aktualisOldalIndex > 1) {
          const ref = this.pageReferences[this.aktualisOldalIndex - 2];
          if (ref) query = query.startAfter(ref);
        }

        return query;
      });

      const snapshot = await collectionRef.get().toPromise();

      if (!snapshot || snapshot.empty) {
        this.tobbBetoltheto = false;
        return;
      }

      this.cenzurak = snapshot.docs.map(doc => ({
        id: doc.id,
        text: (doc.data() as { text: string }).text,
        idopont: (doc.data() as { idopont: any }).idopont.toDate()
      }));

      const lastDoc = snapshot.docs[snapshot.docs.length - 1] as QueryDocumentSnapshot<DocumentData>;

      if (direction === 'next') {
        this.pageReferences.push(lastDoc);
        this.aktualisOldalIndex++;
      } else if (direction === null) {
        this.pageReferences = [lastDoc];
      }

      this.tobbBetoltheto = snapshot.docs.length === this.oldalMeret;

    } catch (error) {
      console.error('Hiba a cenzúrák betöltésekor:', error);
    } finally {
      this.betoltes = false;
    }
  }
}
