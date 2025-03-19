import { Component, OnInit,ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { TranslateService } from '@ngx-translate/core';
import { Lakas, FogyasztasiAdat } from '../../shared/model/models';
import {
  ChartComponent, ChartType,
} from 'ng-apexcharts';

@Component({
  selector: 'app-fogyasztas-display',
  templateUrl: './fogyasztas-display.component.html',
  styleUrls: ['./fogyasztas-display.component.scss'],
})
export class FogyasztasDisplayComponent implements OnInit {
  @ViewChild("chart") chart!: ChartComponent;

  lakasok: Lakas[] = [];
  fogyasztasiAdatok: FogyasztasiAdat[] = [];
  selectedLakasId: string | null = null;
  selectedType: 'viz' | 'gaz' | 'villany' | 'meleg_viz' = 'viz';

  fogyasztasiTipusok = [
    { key: 'viz', label: 'WATER' },
    { key: 'gaz', label: 'GAS' },
    { key: 'villany', label: 'ELECTRICITY' },
    { key: 'melegViz', label: 'HOT_WATER' }
  ];

  // ApexChart adatok
  chartData = {
    series: [] as { name: string; data: number[] }[],
  };

  chartOptions = {
    chart: {
      type: 'line' as ChartType,
      height: 350,
    },
    xaxis: {
      categories: [] as string[]
    },
    title: {
      text: '',
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 1,
    },
    colors: ['#1E88E5'],
  };

  constructor(private firestore: AngularFirestore, private translate: TranslateService) {}

  ngOnInit(): void {
    this.loadLakasok();
  }

  /**
   * Lekérdezi a felhasználóhoz tartozó lakásokat
   */
  private loadLakasok(): void {
    this.firestore.collection<Lakas>('Lakasok').valueChanges().subscribe(lakasok => {
      this.lakasok = lakasok;
    });
  }

  /**
   * Lakás kiválasztása után betölti a fogyasztási adatokat
   */
  onLakasChange(lakasId: string): void {
    this.selectedLakasId = lakasId;
    this.firestore.collection<FogyasztasiAdat>('FogyasztasiAdatok', ref =>
      ref.where('lakas_id', '==', lakasId)
    ).valueChanges().subscribe(adatok => {
      this.fogyasztasiAdatok = adatok;
      this.updateChart();
    });
  }

  /**
   * Frissíti a diagramot a kiválasztott fogyasztási típus alapján
   */
  updateChart(): void {
    if (!this.fogyasztasiAdatok.length || !this.selectedType) return;

    const labels = this.fogyasztasiAdatok.map(adat => String(adat.datum));  // 🔹 Biztosítjuk, hogy `string` típus legyen
    const values = this.fogyasztasiAdatok.map(adat => {
      return typeof adat[this.selectedType] === 'number' ? adat[this.selectedType] as number : 0;
    });
    const typeObj = this.fogyasztasiTipusok.find(t => t.key === this.selectedType);
    if (!typeObj) return;

    this.translate.get(typeObj.label).subscribe(label => {
      this.chartData = { series: [{ name: label, data: values }] };
      this.chartOptions = { ...this.chartOptions, xaxis: { categories: labels }, title: { text: label } };
    });
  }
}
