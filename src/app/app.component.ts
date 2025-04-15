import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  page: string = 'MAIN_PAGE';
  pageClass: string = 'main';
  leaves: any[] = [];

  constructor(
    private router: Router
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const path = event.urlAfterRedirects.split('/')[1];
        this.pageClass = path || 'main';
      }
    });
  }

  ngOnInit(): void {
    for (let i = 0; i < 30; i++) {
      const delay = Math.random() * 3;
      const left = Math.random() * 100;
      const duration = 10 + Math.random() * 20;
      const size = 20 + Math.random() * 30;

      this.leaves.push({
        style: {
          left: `${left}%`,
          width: `${size}px`,
          height: `${size}px`,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`
        }
      });
    }
  }

  changePage(selectedPage: string){
    this.page = selectedPage;
  }
}
