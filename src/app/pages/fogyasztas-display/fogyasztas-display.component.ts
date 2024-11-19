import { Component, OnInit } from '@angular/core';
import { ChartData, ChartType, ChartOptions } from 'chart.js';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-fogyasztas-display',
  templateUrl: './fogyasztas-display.component.html',
  styleUrls: ['./fogyasztas-display.component.scss'],
})
export class FogyasztasDisplayComponent implements OnInit {
  // Mock-adatok
  fogyasztasiAdatok = [
    { datum: '2024-01', viz: 25.3, gaz: 45.8, villany: 350, melegViz: 15.5 },
    { datum: '2024-02', viz: 30.1, gaz: 50.2, villany: 400, melegViz: 20.3 },
    { datum: '2024-03', viz: 28.4, gaz: 48.0, villany: 370, melegViz: 18.1 },
    { datum: '2024-04', viz: 32.0, gaz: 53.5, villany: 420, melegViz: 22.0 },
  ];

  // Diagram adatok
  public fogyasztasChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [],
  };

  // Diagram konfiguráció
  public fogyasztasChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    },
    scales: {
      x: {},
      y: {
        beginAtZero: true,
      },
    },
  };

  public fogyasztasChartType: ChartType = 'bar';

  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
    this.updateChart();
    this.translate.onLangChange.subscribe(() => {
      this.updateChart();
    });
  }

  updateChart(): void {
    this.translate.get(['WATER', 'GAS', 'ELECTRICITY', 'HOT_WATER']).subscribe((translations) => {
      this.fogyasztasChartData = {
        labels: this.fogyasztasiAdatok.map((adat) => adat.datum),
        datasets: [
          {
            data: this.fogyasztasiAdatok.map((adat) => adat.viz),
            label: translations['WATER'],
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
          {
            data: this.fogyasztasiAdatok.map((adat) => adat.gaz),
            label: translations['GAS'],
            backgroundColor: 'rgba(255, 159, 64, 0.7)',
            borderColor: 'rgba(255, 159, 64, 1)',
            borderWidth: 1,
          },
          {
            data: this.fogyasztasiAdatok.map((adat) => adat.villany),
            label: translations['ELECTRICITY'],
            backgroundColor: 'rgba(75, 192, 192, 0.7)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
          {
            data: this.fogyasztasiAdatok.map((adat) => adat.melegViz),
            label: translations['HOT_WATER'],
            backgroundColor: 'rgba(153, 102, 255, 0.7)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1,
          },
        ],
      };
    });
  }
}
