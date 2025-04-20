import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GoogleDistanceApiService {

  private readonly baseUrl = '/maps/api/distancematrix/json';

  constructor(private http: HttpClient) {}

  getDistance(from: string, to: string, mode: string = 'driving'): Observable<any> {
    const params = new HttpParams()
      .set('origins', from)
      .set('destinations', to)
      .set('mode', mode);

    return this.http.get(this.baseUrl, { params });
  }
}
