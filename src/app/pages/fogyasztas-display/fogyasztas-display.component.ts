import { Component, OnInit,ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { TranslateService } from '@ngx-translate/core';
import { Lakas, FogyasztasiAdat } from '../../shared/model/models';
import {
  ChartComponent, ChartType,
} from 'ng-apexcharts';
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {OpenaiService} from "../../shared/services/openai.service";
import {AiErtekelesModalComponent} from "../../shared/modals/ai-ertekeles-modal/ai-ertekeles-modal.component";

@Component({
  selector: 'app-fogyasztas-display',
  templateUrl: './fogyasztas-display.component.html',
  styleUrls: ['./fogyasztas-display.component.scss'],
})
export class FogyasztasDisplayComponent implements OnInit {
  @ViewChild("chart") chart!: ChartComponent;

  aiLoading: boolean = false;

  lakasok: Lakas[] = [];
  fogyasztasiAdatok: FogyasztasiAdat[] = [];
  selectedLakasId: string | null = null;
  selectedType: 'viz' | 'gaz' | 'villany' | 'meleg_viz' = 'viz';

  fogyasztasiTipusok = [
    { key: 'viz', label: 'WATER' },
    { key: 'gaz', label: 'GAS' },
    { key: 'villany', label: 'ELECTRICITY' },
    { key: 'meleg_viz', label: 'HOT_WATER' }
  ];

  // ApexChart adatok
  chartData = {
    series: [] as { name: string; data: number[] }[],
  };

  chartOptions = {
    chart: {
      type: 'line' as ChartType,
      height: 350,
      toolbar: {
        show: false,
      },
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

  constructor(
    private firestore: AngularFirestore,
    private translate: TranslateService,
    private auth: AngularFireAuth,
    private openaiService: OpenaiService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadLakasok();

    this.translate.onLangChange.subscribe(() => {
      this.updateChart();
    });
  }

  /**
   * Lekérdezi a felhasználóhoz tartozó lakásokat
   */
  private loadLakasok(): void {
    this.auth.authState.subscribe( user => {
      if(user && user.uid){
        this.firestore.collection<Lakas>('Lakasok', ref =>
          ref.where('userId', '==', user.uid)
        ).valueChanges().subscribe( lakasok => {
          this.lakasok = lakasok;
        });
      }
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
      this.fogyasztasiAdatok.sort((a, b) => {
        const dateA = (a.datum as any)?.toDate?.() ?? new Date(a.datum);
        const dateB = (b.datum as any)?.toDate?.() ?? new Date(b.datum);
        return dateA.getTime() - dateB.getTime();
      });
      this.updateChart();
    });
  }

  /**
   * Frissíti a diagramot a kiválasztott fogyasztási típus alapján
   */
  updateChart(): void {
    if (!this.fogyasztasiAdatok.length || !this.selectedType) return;

    const labels = this.fogyasztasiAdatok.map(adat => {
      const date = (adat.datum as any)?.toDate?.() ?? new Date(adat.datum);
      return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}`;
    });
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

  igenylesAiErtekeles(): void {
    this.aiLoading = true;

    const lakas = this.lakasok.find(l => l.id === this.selectedLakasId);
    const tipus = this.fogyasztasiTipusok.find(t => t.key === this.selectedType);
    const nyelv = this.translate.currentLang as 'hu' | 'en';

    if (!lakas || !tipus) return;

    const adatokSzoveg = this.fogyasztasiAdatok.map(adat => {
      const datum = (adat.datum as any)?.toDate?.().toISOString().split('T')[0] ?? new Date(adat.datum).toISOString().split('T')[0];
      const ertek = adat[this.selectedType];
      return `- ${datum}: ${ertek}`;
    }).join('\n');

    const egysegek: { [key: string]: { hu: string, en: string } } = {
      viz: { hu: 'm³', en: 'm³' },
      gaz: { hu: 'm³', en: 'm³' },
      villany: { hu: 'kWh', en: 'kWh' },
      meleg_viz: { hu: 'm³', en: 'm³' }
    };

    const egyseg = egysegek[this.selectedType]?.[nyelv] ?? '';

    const lakasInfo = nyelv === 'hu' ? `
      Név: ${lakas.lakasNev}
      Cím:
        - Irányítószám: ${lakas.cim.iranyitoszam}
        - Település: ${lakas.cim.telepules}
        - Utca: ${lakas.cim.utca}
        - Házszám: ${lakas.cim.hazszam}
      Alapterület: ${lakas.alapterulet ?? 'nincs megadva'} m²
      Szigetelés: ${lakas.szigeteles === true ? 'van' : lakas.szigeteles === false ? 'nincs' : 'nincs megadva'}
      Építés módja: ${lakas.epitesMod}
      Fűtés típusa: ${lakas.futesTipus}
        `.trim() : `
      Name: ${lakas.lakasNev}
      Address:
        - ZIP: ${lakas.cim.iranyitoszam}
        - City: ${lakas.cim.telepules}
        - Street: ${lakas.cim.utca}
        - House number: ${lakas.cim.hazszam}
      Floor area: ${lakas.alapterulet ?? 'not provided'} m²
      Insulation: ${lakas.szigeteles === true ? 'yes' : lakas.szigeteles === false ? 'no' : 'not provided'}
      Building type: ${lakas.epitesMod}
      Heating type: ${lakas.futesTipus}
        `.trim();

    const prompt = nyelv === 'hu' ? `
      Te egy mesterséges intelligencia vagy, amelynek feladata kiértékelni egy magyarországi háztartás **${tipus.label.toLowerCase()}** fogyasztását. Röviden értékeld a felhasználó fogyasztási szokásait, írd le a megfigyelhető tendenciákat, és adj maximum három javaslatot a hatékonyabb energiafelhasználás érdekében.

      **Lakás adatai**:
      ${lakasInfo}

      **Fogyasztási típus**: ${tipus.label} (${egyseg})
      **Mért adatok időrendben**:
      ${adatokSzoveg}
      `.trim() : `
      You are an AI assistant tasked with evaluating the **${tipus.label.toLowerCase()}** consumption of a Hungarian household. Briefly assess the user's consumption habits, describe any observable trends, and provide a maximum of three suggestions to improve energy efficiency.

      **Household information**:
      ${lakasInfo}

      **Consumption type**: ${tipus.label} (${egyseg})
      **Measured data (in chronological order)**:
      ${adatokSzoveg}
      `.trim();

    this.openaiService.generateText(prompt).subscribe(res => {
      const valasz = res.choices?.[0]?.message?.content ?? 'Nem sikerült értékelést kapni.';
      const modalRef = this.modalService.open(AiErtekelesModalComponent,         {
          size: 'lg' ,

        });
      modalRef.componentInstance.ertekelesSzoveg = valasz;
      this.aiLoading = false;
    }, err => {
      console.error('Hiba az AI értékelés kérés közben:', err);
    });
  }


}
