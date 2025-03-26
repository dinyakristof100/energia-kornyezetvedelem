import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class EmailService {
  constructor(private firestore: AngularFirestore, private http: HttpClient) {}

  async kuldesJovahagyasEmail(faId: string) {
    const faDoc = await this.firestore.collection('Trees').doc(faId).get().toPromise();
    const fa = faDoc?.data() as any;
    const userEmail = await this.lekerUserEmail(fa?.user_id);

    this.http.post('/api/send-email', {
      to: userEmail,
      subject: 'Fád jóvá lett hagyva',
      body: 'A fád admin általi jóváhagyása megtörtént. Gratulálunk!'
    }).subscribe();
  }

  async kuldesTorlesEmail(userId: string) {
    const userEmail = await this.lekerUserEmail(userId);
    this.http.post('/api/send-email', {
      to: userEmail,
      subject: 'Fád törölve lett',
      body: 'Sajnáljuk, de az általad megadott fa nem lett jóváhagyva, és törlésre került.'
    }).subscribe();
  }

  private async lekerUserEmail(userId: string): Promise<string> {
    const userDoc = await this.firestore.collection('Users').doc(userId).get().toPromise();
    const data = userDoc?.data() as any;
    return data?.email;
  }
}
