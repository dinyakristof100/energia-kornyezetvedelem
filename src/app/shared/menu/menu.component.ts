import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent implements OnInit  {
  @Output() selectedPage: EventEmitter<string> = new EventEmitter<string>();
  currentTitle: string = '';

  constructor(
    private translate: TranslateService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    this.translate.setDefaultLang('hu');
  }

  ngOnInit() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => {
          let route = this.activatedRoute;
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route.snapshot.data['title'];
        })
      )
      .subscribe((titleKey) => {
        this.updateTitle(titleKey);
        this.emitSelectedPage(titleKey);
      });
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
    const route = this.getActivatedRoute();
    const titleKey = route.snapshot.data['title'];
    this.currentTitle = this.translate.instant(titleKey || 'MAIN_PAGE');
  }

  private getActivatedRoute(): ActivatedRoute {
    let route = this.activatedRoute;
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }

  private updateTitle(titleKey: string) {
    this.currentTitle = this.translate.instant(titleKey || 'MAIN_PAGE');
  }

  private emitSelectedPage(titleKey: string) {
    this.selectedPage.emit(titleKey);
  }
}
