import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { HttpClient } from '@angular/common/http';
import emailjs, {EmailJSResponseStatus} from 'emailjs-com';


@Injectable({ providedIn: 'root' })
export class EmailService {
  constructor(private firestore: AngularFirestore, private http: HttpClient) {}

  sendEmail(form: HTMLFormElement) {
    emailjs.sendForm('service_7jgg6go', 'template_re7qclc', form, 'gWEmghC_h7wI4Yw9s')
      .then((result: EmailJSResponseStatus) => {
        console.log('E-mail sikeresen elküldve:', result.text);
      }, (error) => {
        console.error('Hiba az e-mail küldésekor:', error.text);
      });
  }

}
