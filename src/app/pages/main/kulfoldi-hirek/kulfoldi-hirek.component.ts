import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-kulfoldi-hirek',
  templateUrl: './kulfoldi-hirek.component.html',
  styleUrl: './kulfoldi-hirek.component.scss'
})
export class KulfoldiHirekComponent implements OnInit {
  hirek: any[] = [];
  loading = true;
  cenzurak: string[] = [];

  constructor(
    private http: HttpClient,
    private firestore: AngularFirestore
  ) {}

  ngOnInit(): void {
    this.loadCenzurak().then(() => this.loadHirek());
  }

  private async loadCenzurak(): Promise<void> {
    const snapshot = await this.firestore.collection('Cenzurak', ref =>
      ref.orderBy('idopont', 'desc')
    ).get().toPromise();

    this.cenzurak = snapshot?.docs.map(doc => {
      const adat = doc.data() as { text: string };
      return adat.text?.toLowerCase();
    }) ?? [];
  }

  private loadHirek(): void {
    const rssUrl = encodeURIComponent('https://earth911.com/feed/');
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`;

    this.http.get<any>(apiUrl).subscribe(response => {
      const items = response.items || [];
      this.hirek = items.map((hir: any) => ({
        ...hir,
        title: this.cenzurazSzoveg(hir.title),
        description: this.cenzurazSzoveg(hir.description),
        content: this.cenzurazSzoveg(hir.content),
      }));
      this.loading = false;
    });
  }

  private cenzurazSzoveg(szoveg: string): string {
    if (!szoveg) return szoveg;

    let modositott = szoveg;
    for (const szo of this.cenzurak) {
      const regex = new RegExp(`\\b${szo}\\b`, 'gi');
      modositott = modositott.replace(regex, '***');
    }

    return modositott;
  }

  public reloadHirek(): void {
    this.loading = true;
    this.loadCenzurak().then(() => this.loadHirek());
  }

}
