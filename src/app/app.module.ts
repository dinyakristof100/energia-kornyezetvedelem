import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { BaseChartDirective  } from 'ng2-charts';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainComponent } from './pages/main/main.component';
import { FogyasztasRogzitComponent } from './pages/fogyasztas-rogzit/fogyasztas-rogzit.component';
import { FaultetesComponent } from './pages/faultetes/faultetes.component';
import { FogyasztasDisplayComponent } from './pages/fogyasztas-display/fogyasztas-display.component';
import { MenuComponent } from './shared/menu/menu.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatGridListModule } from '@angular/material/grid-list';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ReactiveFormsModule } from '@angular/forms';
import { Chart } from 'chart.js';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

// Chart.js elemek importálása
import {
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  Title
} from 'chart.js';

// Elemek regisztrálása
Chart.register(
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  Title
);

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    FogyasztasRogzitComponent,
    FaultetesComponent,
    FogyasztasDisplayComponent,
    MenuComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatMenuModule,
    MatGridListModule,
    MatInputModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    BaseChartDirective,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      },
      defaultLanguage: 'hu'
    })
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
