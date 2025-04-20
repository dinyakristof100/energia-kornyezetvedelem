import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class OpenaiService {
  // private apiUrl = 'https://api.openai.com/v1/chat/completions';
  // private apiKey = environment.OPENAI_API_KEY;
  private apiUrl = 'https://us-central1-energia-kornyezetvedelem.cloudfunctions.net/proxyOpenai/openai';

  constructor(private http: HttpClient) { }

  public generateText(prompt: string): Observable<any> {
    return this.http.post(this.apiUrl, { prompt });
  }
}
