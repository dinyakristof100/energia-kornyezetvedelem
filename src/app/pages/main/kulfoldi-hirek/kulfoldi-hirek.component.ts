import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-kulfoldi-hirek',
  templateUrl: './kulfoldi-hirek.component.html',
  styleUrl: './kulfoldi-hirek.component.scss'
})
export class KulfoldiHirekComponent implements OnInit {
  hirek: any[] = [];
  loading = true;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const rssUrl = encodeURIComponent('https://earth911.com/feed/');
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`;

    this.http.get<any>(apiUrl).subscribe(response => {
      this.hirek = response.items || [];
      this.loading = false;
    });
  }
}
