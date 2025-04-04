import { Component } from '@angular/core';
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  nyelv: 'hu' | 'en' = 'hu';

  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
    this.nyelv = this.translate.currentLang as 'hu' | 'en';

    this.translate.onLangChange.subscribe(langChangeEvent => {
      this.nyelv = langChangeEvent.lang as 'hu' | 'en';
    });
  }
}
