import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {Lakas} from "../model/models";

@Injectable({
  providedIn: 'root'
})
export class LakasService {

  constructor() { }

  private lakasSubject = new BehaviorSubject<Lakas | null>(null);
  lakas$ = this.lakasSubject.asObservable();

  setLakas(lakas: Lakas | null) {
    this.lakasSubject.next(lakas || null);
  }
}
