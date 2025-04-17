import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { HttpClient } from '@angular/common/http';
import emailjs, {EmailJSResponseStatus} from 'emailjs-com';
import {Fa, User} from "../model/models";


@Injectable({ providedIn: 'root' })
export class EmailService {
  constructor(private firestore: AngularFirestore, private http: HttpClient) {}

  async kuldesFaJovahagyasEmail(faId: string): Promise<void> {
    try {
      const faDoc = await this.firestore.collection('Trees').doc(faId).get().toPromise();
      const fa = faDoc?.data() as Fa;
      if (!fa || !fa.user_id) throw new Error('Nincs user_id a fában.');

      const userDoc = await this.firestore.collection('Users').doc(fa.user_id).get().toPromise();
      const user = userDoc?.data() as User;
      if (!user || !user.email) throw new Error('Nincs email a felhasználónál.');

      const teljesNev = `${user.nev.vezeteknev ?? ''} ${user.nev.keresztnev ?? ''}`.trim();

      const templateParams = {
        name: teljesNev,
        to_email: user.email
      };

      await emailjs.send(
        'service_7jgg6go',
        'template_re7qclc',
        templateParams,
        'gWEmghC_h7wI4Yw9s'
      );

      console.log('Email elküldve:', user.email);
    } catch (error) {
      console.error('Hiba az email küldés közben:', error);
    }
  }

  async kuldesFaTorlesEmail(faId: string): Promise<void> {
    try {
      // Lekérjük a fát
      const faDoc = await this.firestore.collection('Trees').doc(faId).get().toPromise();
      const fa = faDoc?.data() as Fa;
      if (!fa || !fa.user_id) throw new Error('Nincs user_id a fában.');

      const userDoc = await this.firestore.collection('Users').doc(fa.user_id).get().toPromise();
      const user = userDoc?.data() as User;
      if (!user || !user.email) throw new Error('Nincs email a felhasználónál.');

      const teljesNev = `${user.nev.vezeteknev ?? ''} ${user.nev.keresztnev ?? ''}`.trim();

      const templateParams = {
        name: teljesNev,
        to_email: user.email
      };

      await emailjs.send(
        'service_7jgg6go',
        'template_g3e8fjz',
        templateParams,
        'gWEmghC_h7wI4Yw9s'
      );

      console.log('Törlés e-mail elküldve:', user.email);
    } catch (error) {
      console.error('Hiba a törlés e-mail küldés közben:', error);
    }
  }

  async kuldesSzakertoiValaszEmail(userId: string, valaszSzoveg: string): Promise<void> {
    try {
      const userDoc = await this.firestore.collection('Users').doc(userId).get().toPromise();
      const user = userDoc?.data() as User;
      if (!user || !user.email) throw new Error('Nincs email a felhasználónál.');

      const teljesNev = `${user.nev?.vezeteknev ?? ''} ${user.nev?.keresztnev ?? ''}`.trim();

      const templateParams = {
        name: teljesNev,
        to_email: user.email,
        valasz: valaszSzoveg
      };

      await emailjs.send(
        'service_7jgg6go',
        'template_vaomwgr',
        templateParams,
        'gWEmghC_h7wI4Yw9s'
      );

      console.log('Szakértői válasz e-mail elküldve:', user.email);
    } catch (error) {
      console.error('Hiba a szakértői válasz e-mail küldés közben:', error);
    }
  }

}
