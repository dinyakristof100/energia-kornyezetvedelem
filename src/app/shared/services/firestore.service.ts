import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import {Observable, of, switchMap} from 'rxjs';
import {AngularFireAuth} from "@angular/fire/compat/auth";

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private fogyasztasiCollection = 'FogyasztasiAdatok';
  constructor(
    private firestore: AngularFirestore,
    private auth: AngularFireAuth
  ) {}

  /**
   * Lekérdezi az adott kollekció összes dokumentumát.
   * @param collectionName A kollekció neve
   */
  getCollection<T>(collectionName: string): Observable<T[]> {
    return this.firestore.collection<T>(collectionName).valueChanges({ idField: 'id' });
  }

  /**
   * Lekérdezi egy adott dokumentumot a kollekcióból.
   * @param collectionName A kollekció neve
   * @param docId A dokumentum azonosítója
   */
  getDocument<T>(collectionName: string, docId: string): Observable<T | undefined> {
    return this.firestore.collection<T>(collectionName).doc(docId).valueChanges();
  }

  /**
   * Létrehoz egy új dokumentumot egy adott kollekcióban.
   * @param collectionName A kollekció neve
   * @param data A mentendő adatok
   */
  createDocument<T>(collectionName: string, data: T): Promise<void> {
    const id = this.firestore.createId(); // Egyedi azonosító generálása
    return this.firestore.collection<T>(collectionName).doc(id).set(data);
  }

  /**
   * Frissíti egy adott dokumentum adatait.
   * @param collectionName A kollekció neve
   * @param docId A dokumentum azonosítója
   * @param data A frissítendő adatok
   */
  updateDocument<T>(collectionName: string, docId: string, data: T): Promise<void> {
    return this.firestore.collection<T>(collectionName).doc(docId).set(data, { merge: true });
  }

  /**
   * Töröl egy adott dokumentumot.
   * @param collectionName A kollekció neve
   * @param docId A dokumentum azonosítója
   */
  deleteDocument(collectionName: string, docId: string): Promise<void> {
    return this.firestore.collection(collectionName).doc(docId).delete();
  }

  /**
   * Fogyasztási adatok mentése Firestore-ba.
   * Minden új bejegyzés külön dokumentumként tárolódik.
   */
  saveFogyasztasiAdat(data: any): Promise<void> {
    return this.auth.authState.pipe(
      switchMap(user => {
        if (user) {
          const newId = this.firestore.createId(); // Egyedi dokumentum ID generálása
          data.userId = user.uid; // Felhasználói azonosító hozzáadása
          data.feltoltesDatum = new Date(); // Feltöltés dátuma
          return this.firestore.collection(this.fogyasztasiCollection).doc(newId).set(data);
        } else {
          return of(null);
        }
      })
    ).toPromise() as Promise<void>;
  }

  /**
   * Firestore egyedi dokumentum azonosító generálása.
   */
  createId(): string {
    return this.firestore.createId();
  }

  /**
   * Lekéri a bejelentkezett felhasználó összes fogyasztási adatát.
   */
  getFogyasztasiAdatok(): Observable<any[]> {
    return this.auth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.firestore.collection(this.fogyasztasiCollection, ref =>
            ref.where('userId', '==', user.uid) // Csak a bejelentkezett user adatait tölti be
          ).valueChanges({ idField: 'id' });
        } else {
          return of([]);
        }
      })
    );
  }
}
