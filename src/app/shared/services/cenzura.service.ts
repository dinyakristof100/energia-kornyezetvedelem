import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CenzuraService {

  private tiltottSzavak: string[] = [
    'klímaváltozás', 'háború', 'katasztrófa', 'vészhelyzet' // csak példa
  ];

  /**
   * Lecenzúráz egy szöveget a tiltott szavak alapján.
   */
  cenzuraz(szoveg: string): string {
    let eredmeny = szoveg;

    this.tiltottSzavak.forEach(szo => {
      const regex = new RegExp(`\\b${szo}\\b`, 'gi');
      eredmeny = eredmeny.replace(regex, '***');
    });

    return eredmeny;
  }
}
