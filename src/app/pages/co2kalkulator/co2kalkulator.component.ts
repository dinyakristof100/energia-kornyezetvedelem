import { Component } from '@angular/core';
import {KozlekedesiMod} from "../../shared/model/models";
import {GoogleDistanceApiService} from "../../shared/services/google-distance-api.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-co2kalkulator',
  templateUrl: './co2kalkulator.component.html',
  styleUrl: './co2kalkulator.component.scss'
})
export class Co2kalkulatorComponent {
  from: string = '';
  to: string = '';
  errorMessage: string = ''

  animacioFut = false;
  selected: KozlekedesiMod  | '' = '';
  eredmeny: { tav: number; co2: number; mod: string } | null = null;

  constructor(
    private distanceService: GoogleDistanceApiService,
    private translate: TranslateService
  ) {}

  szamol() {
    this.errorMessage = '';
    this.animacioFut = true;
    this.eredmeny = null;

    this.distanceService.getDistance(this.from, this.to, this.selected).subscribe(response => {
      const element = response.rows[0].elements[0];

      if (
        response.origin_addresses[0] === '' ||
        response.destination_addresses[0] === '' ||
        element.status !== 'OK'
      ) {
        this.animacioFut = false;
        this.translate.get('CO2.ERROR_INVALID_LOCATION').subscribe(szoveg => {
          this.errorMessage = szoveg;
        });
        return;
      }

      if (this.selected && element.status === 'OK') {
        const tavKm = element.distance.value / 1000;
        const faktorok: Record<KozlekedesiMod, number> = {
          auto: 0.21,
          busz: 0.10,
          vonat: 0.04,
          bicikli: 0,
          gyalog: 0
        };
        const co2 = +(tavKm * faktorok[this.selected]).toFixed(2);

        setTimeout(() => {
          this.animacioFut = false;
          this.eredmeny = { tav: +tavKm.toFixed(1), co2, mod: this.selected };
        }, 3000);
      } else {
        console.error('Távolság hiba:', element.status);
        this.animacioFut = false;
      }
    }, error => {
      console.error('API hívási hiba:', error);
      this.animacioFut = false;
    });
  }

  getTransportIconFlipped(mod: string): string {
    switch (mod) {
      case 'auto': return '🚗';
      case 'busz': return '🚌';
      case 'vonat': return '🚆';
      case 'bicikli': return '🚴‍♂️';
      case 'gyalog': return '🚶‍♂️';
      default: return '';
    }
  }

  selectTransport(mod: KozlekedesiMod) {
    this.selected = mod;
  }

}
