import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import {AuthService} from "../services/auth.service";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent implements OnInit  {
  @Output() selectedPage: EventEmitter<string> = new EventEmitter<string>();
  @Input() pageClass: string = '';
  currentTitle: string = '';
  loggedInUser?: firebase.default.User | null;
  currentLang: string = 'hu';

  constructor(
    private translate: TranslateService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    protected authService: AuthService
  ) {
    this.translate.setDefaultLang('hu');
  }

  ngOnInit() {
    this.currentLang = this.translate.currentLang || 'hu';
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

    this.authService.isUserLoggedIn().subscribe(user => {
      this.loggedInUser = user;
      // console.log('loggedInUser:', this.loggedInUser);
      localStorage.setItem('user', JSON.stringify(this.loggedInUser));
    }, error =>{
      console.error(error);
      localStorage.setItem('user', JSON.stringify('null'));
    })
  }

  changeLanguage(lang: string) {
    this.currentLang = lang;
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

  logout(){
    this.authService.logout().then(() =>{
      console.log("Logged out succesfully");
      this.router.navigateByUrl('/main');
    }).catch(error =>{
      console.error(error);
    });
  }

  getLangBgClass(): string {
    switch (this.pageClass) {
      case 'main': return 'bg-[#ebfbee] text-green-900';
      case 'faultetes': return 'bg-[#e0f7fa] text-cyan-900';
      case 'fogyasztas-rogzit': return 'bg-[#fff3e0] text-orange-900';
      case 'fogyasztas-display': return 'bg-[#e3f2fd] text-blue-900';
      case 'login': return 'bg-[#f5f5f5] text-gray-900';
      case 'register': return 'bg-[#ede7f6] text-purple-900';
      case 'profil': return 'bg-[#e8f5e9] text-green-800';
      case 'co2kalkulator': return 'bg-[#f1f8e9] text-lime-900';
      default: return 'bg-white text-gray-800';
    }
  }

}
