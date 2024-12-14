import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './pages/main/main.component';
import { FaultetesComponent } from './pages/faultetes/faultetes.component';
import { FogyasztasRogzitComponent } from './pages/fogyasztas-rogzit/fogyasztas-rogzit.component';
import { FogyasztasDisplayComponent } from './pages/fogyasztas-display/fogyasztas-display.component';
import {LoginComponent} from "./pages/login/login.component";


const routes: Routes = [
  { path: '', redirectTo: 'main', pathMatch: 'full' },
  { path: 'main', component: MainComponent, data: { title: 'MAIN_PAGE' } },
  { path: 'faultetes', component: FaultetesComponent, data: { title: 'FA_ULTETES' } },
  { path: 'fogyasztas-rogzit', component: FogyasztasRogzitComponent, data: { title: 'FOGYASZTAS_ADD' } },
  { path: 'fogyasztas-display', component: FogyasztasDisplayComponent, data: { title: 'FOGYASZTAS_DISPLAY' } },
  { path: 'login', component: LoginComponent, data: { title: 'LOGIN.TITLE' } },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
