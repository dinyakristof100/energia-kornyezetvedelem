import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent{
  page: string = 'MAIN_PAGE';

  changePage(selectedPage: string){
    this.page = selectedPage;
    // console.log('Selected page:', selectedPage);
  }
}
