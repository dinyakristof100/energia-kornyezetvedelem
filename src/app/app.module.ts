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
import {TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { Chart } from 'chart.js';
import { NgApexchartsModule } from "ng-apexcharts";
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatNativeDateModule, MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';


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
import { LoginComponent } from './pages/login/login.component';
import {MatFormFieldModule} from "@angular/material/form-field";
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import {AngularFireModule} from "@angular/fire/compat";
import {environment} from "../environments/environment";
import { RegisterComponent } from './pages/register/register.component';
import { FelhasznaloProfilComponent } from './pages/felhasznalo-profil/felhasznalo-profil.component';
import {MatOption, MatSelect} from "@angular/material/select";
import {MatDialogActions, MatDialogContent, MatDialogModule} from "@angular/material/dialog";
import {MatTable} from "@angular/material/table";
import { LakasModalComponent } from './shared/modals/lakas-modal/lakas-modal.component';
import {NgbModalModule, NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from "@angular/material/datepicker";
import {FaModalComponent} from "./shared/modals/fa-modal/fa-modal.component";
import { AiErtekelesModalComponent } from './shared/modals/ai-ertekeles-modal/ai-ertekeles-modal.component';
import { MagyarHirekComponent } from './pages/main/magyar-hirek/magyar-hirek.component';
import { KulfoldiHirekComponent } from './pages/main/kulfoldi-hirek/kulfoldi-hirek.component';
import { Co2kalkulatorComponent } from './pages/co2kalkulator/co2kalkulator.component';

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
    MenuComponent,
    LoginComponent,
    RegisterComponent,
    FelhasznaloProfilComponent,
    LakasModalComponent,
    FaModalComponent,
    AiErtekelesModalComponent,
    MagyarHirekComponent,
    KulfoldiHirekComponent,
    Co2kalkulatorComponent,
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
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    NgbModule,
    NgbModalModule,
    HttpClientModule,
    NgApexchartsModule,
    MatNativeDateModule,
    MatNativeDateModule,
    AngularFireModule.initializeApp(environment.firebase),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      },
      defaultLanguage: 'hu'
    }),
    MatSelect,
    MatOption,
    MatDialogActions,
    MatDialogContent,
    MatTable,
    FormsModule,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepicker
  ],
  providers: [
    provideAnimationsAsync(),
    // provideFirebaseApp(() => initializeApp({
    //   "projectId":"energia-kornyezetvedelem",
    //   "appId":"1:849156197038:web:bb637306611f255907bb3f",
    //   "storageBucket":"energia-kornyezetvedelem.firebasestorage.app",
    //   "apiKey":"AIzaSyBh2hODUZA-ZXcXWMhHxpbBrVEHCyTZoCE",
    //   "authDomain":"energia-kornyezetvedelem.firebaseapp.com",
    //   "messagingSenderId":"849156197038",
    //   "measurementId":"G-95N5THHTS0"
    // })),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    { provide: MAT_DATE_LOCALE, useValue: 'hu-HU' }
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {
  constructor(private translate: TranslateService) {
    translate.setDefaultLang('hu');
    translate.use('hu');
  }
}
