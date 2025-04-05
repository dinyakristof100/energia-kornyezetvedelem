import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './pages/main/main.component';
import { FaultetesComponent } from './pages/faultetes/faultetes.component';
import { FogyasztasRogzitComponent } from './pages/fogyasztas-rogzit/fogyasztas-rogzit.component';
import { FogyasztasDisplayComponent } from './pages/fogyasztas-display/fogyasztas-display.component';
import {LoginComponent} from "./pages/login/login.component";
import {RegisterComponent} from "./pages/register/register.component";
import {FelhasznaloProfilComponent} from "./pages/felhasznalo-profil/felhasznalo-profil.component";
import { authGuard } from "./shared/services/auth.guard";
import {Co2kalkulatorComponent} from "./pages/co2kalkulator/co2kalkulator.component";


const routes: Routes = [
  { path: '', redirectTo: 'main', pathMatch: 'full' },
  { path: 'main', component: MainComponent, data: { title: 'MAIN_PAGE' } },
  { path: 'faultetes', component: FaultetesComponent, data: { title: 'FA_ULTETES' }, canActivate: [authGuard] },
  { path: 'co2kalkulator', component: Co2kalkulatorComponent, data: { title: 'CO2.TITLE' }, canActivate: [authGuard] },
  { path: 'fogyasztas-rogzit', component: FogyasztasRogzitComponent, data: { title: 'FOGYASZTAS_ADD' }, canActivate: [authGuard]  },
  { path: 'fogyasztas-display', component: FogyasztasDisplayComponent, data: { title: 'FOGYASZTAS_DISPLAY' }, canActivate: [authGuard]  },
  { path: 'login', component: LoginComponent, data: { title: 'LOGIN.TITLE' } },
  { path: 'register', component: RegisterComponent, data: { title: 'REGISTER.TITLE' } },
  { path: 'profil', component: FelhasznaloProfilComponent, data: { title: 'PROFIL.TITLE' }, canActivate: [authGuard]  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
