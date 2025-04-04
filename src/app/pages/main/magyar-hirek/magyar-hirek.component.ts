import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-magyar-hirek',
  templateUrl: './magyar-hirek.component.html',
  styleUrl: './magyar-hirek.component.scss'
})
export class MagyarHirekComponent implements OnInit {
  hirek: any[] = [];
  loading = true;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const rssUrl = encodeURIComponent('https://greenfo.hu/feed/');
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`;

    this.http.get<any>(apiUrl).subscribe(response => {
      this.hirek = response.items || [];
      this.loading = false;
    });
  }

  extractImageUrl(content: string): string {
    const match = content.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : '';
  }
}
