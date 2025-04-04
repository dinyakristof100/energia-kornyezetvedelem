import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import {catchError, from, Observable, of, switchMap} from 'rxjs';
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {map} from "rxjs/operators";

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
    return this.firestore.collection<T>(collectionName).doc(docId).update(data);
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
  saveFogyasztasiAdat(data: any): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.auth.authState.pipe(
        switchMap(user => {
          if (!user) {
            console.error("Hiba: Nincs bejelentkezett felhasználó.");
            return of(false);
          }

          const newId = this.firestore.createId();
          data.feltoltesDatum = new Date();

          const convertToFloat = (value: any) =>
            typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;

          data.viz = convertToFloat(data.viz);
          data.meleg_viz = convertToFloat(data.meleg_viz);
          data.gaz = convertToFloat(data.gaz);
          data.villany = convertToFloat(data.villany);

          return from(this.firestore.collection(this.fogyasztasiCollection).doc(newId).set(data))
            .pipe(
              map(() => true),
              catchError(error => {
                console.error("Firestore mentési hiba:", error);
                reject(error);
                return of(false);
              })
            );
        })
      ).subscribe({
        next: (result) => resolve(result),
        error: (err) => reject(err)
      });
    });
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
