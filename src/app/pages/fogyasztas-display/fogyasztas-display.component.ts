import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {AngularFirestore, DocumentSnapshot} from '@angular/fire/compat/firestore';
import { TranslateService } from '@ngx-translate/core';
import {Lakas, FogyasztasiAdat, Velemeny} from '../../shared/model/models';
import {
  ChartComponent, ChartType,
} from 'ng-apexcharts';
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {OpenaiService} from "../../shared/services/openai.service";
import {AiErtekelesModalComponent} from "../../shared/modals/ai-ertekeles-modal/ai-ertekeles-modal.component";
import {MatSnackBar} from "@angular/material/snack-bar";
import {DocumentData} from "@angular/fire/firestore";
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-fogyasztas-display',
  templateUrl: './fogyasztas-display.component.html',
  styleUrls: ['./fogyasztas-display.component.scss'],
})
export class FogyasztasDisplayComponent implements OnInit {
  @ViewChild("chart") chart!: ChartComponent;

  aiLoading: boolean = false;
  loadingVelemenyek: boolean = true;

  lakasok: Lakas[] = [];
  velemenyek: Velemeny[] = [];
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

  private isAdmin = false;

  oldalMeret = 1;
  utolsoDokumentum: any = null;
  elsoDokumentum: any = null;
  tobbOldalVan = true;
  betoltesFolyamatban = false;
  aktualisOldalIndex: number = 0;
  pageReferences: any[] = [];

  constructor(
    private firestore: AngularFirestore,
    private translate: TranslateService,
    private auth: AngularFireAuth,
    private openaiService: OpenaiService,
    private modalService: NgbModal,
    private snackBar: MatSnackBar,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.auth.user.subscribe(user => {
      if (user) {
        const uid = user.uid;

        this.firestore.collection('Users').doc(uid).get().toPromise().then(snapshot => {
          if (snapshot?.exists) {
            const data = snapshot.data() as DocumentData;
            this.isAdmin = !!data?.['admin'];

            if (this.isAdmin) {
              this.loadVelemenyek();
            }
          } else {
            this.isAdmin = false;
          }
        }).catch(err => {
          console.error('Admin státusz lekérdezése sikertelen:', err);
          this.isAdmin = false;
        });
      }
    });

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

  igenylesSzakertoiVelemeny(): void {
    this.aiLoading = true;

    const lakas = this.lakasok.find(l => l.id === this.selectedLakasId);
    const tipus = this.fogyasztasiTipusok.find(t => t.key === this.selectedType);

    if (!lakas || !tipus) return;

    const adatokSzoveg = this.fogyasztasiAdatok.map(adat => {
      const datum = (adat.datum as any)?.toDate?.().toISOString().split('T')[0] ?? new Date(adat.datum).toISOString().split('T')[0];
      const ertek = adat[this.selectedType];
      return `- ${datum}: ${ertek}`;
    }).join('\n');

    const egysegek: { [key: string]: string } = {
      viz: 'm³',
      gaz: 'm³',
      villany: 'kWh',
      meleg_viz: 'm³'
    };

    const egyseg = egysegek[this.selectedType] ?? '';

    const lakasInfo = `
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
  `.trim();

    const prompt = `
      Tisztelt Szakértő!

      Kérem, segítsen értékelni az alábbi magyarországi háztartás ${tipus.label.toLowerCase()} fogyasztását. Kíváncsiak vagyunk arra, hogy Ön milyen tendenciákat lát az adatok alapján, és milyen javaslatokat tudna adni a hatékonyabb energiafelhasználás érdekében.

      Az alábbiakban megtalálja a lakás alapadatait, valamint a mért fogyasztási értékeket időrendben.

      Lakás adatai:
      ${lakasInfo}

      Fogyasztási típus: ${tipus.label} (${egyseg})
      Mért adatok időrendben:
      ${adatokSzoveg}

      Előre is köszönjük a segítségét és a véleményét!
      `.trim();

    this.auth.currentUser.then(user => {
      if (user) {
        const velemeny = {
          idopont: new Date(),
          elbiralva: false,
          uzenet: prompt,
          userid: user.uid,
          username: user.displayName ?? 'ismeretlen'
        };

        this.firestore.collection('Velemenyek').add(velemeny).then(() => {
          this.aiLoading = false;
          this.translate.get('SZAKERTOI_IGENY_SIKER').subscribe(msg =>
            this.snackBar.open(msg, undefined, { duration: 4000 })
          );
        }).catch(err => {
          this.aiLoading = false;
          console.error('Hiba a Firestore mentés közben:', err);
          this.translate.get('SZAKERTOI_IGENY_HIBA').subscribe(msg =>
            this.snackBar.open(msg, undefined, { duration: 4000 })
          );
        });
      } else {
        this.aiLoading = false;
        console.warn('Nincs bejelentkezett felhasználó, nem menthető a vélemény.');
        this.translate.get('SZAKERTOI_IGENY_HIBA').subscribe(msg =>
          this.snackBar.open(msg, undefined, { duration: 4000 })
        );
      }
    });
  }

  adminElerheto(): boolean {
    return this.isAdmin;
  }

  protected async loadVelemenyek(direction: 'next' | 'prev' = 'next'): Promise<void> {
    if (!this.isAdmin || this.betoltesFolyamatban) return;

    this.betoltesFolyamatban = true;

    try {
      const collectionRef = this.firestore.collection<Velemeny>('Velemenyek', ref => {
        let query = ref.orderBy('idopont', 'desc').limit(this.oldalMeret);

        if (direction === 'next' && this.aktualisOldalIndex > 0) {
          const ref = this.pageReferences[this.aktualisOldalIndex - 1];
          if (ref) query = query.startAfter(ref);
        }

        if (direction === 'prev' && this.aktualisOldalIndex > 1) {
          const ref = this.pageReferences[this.aktualisOldalIndex - 2];
          if (ref) query = query.startAt(ref);
        }

        return query;
      });

      const snapshot = await firstValueFrom(collectionRef.get());

      if (!snapshot || snapshot.empty) {
        if (direction === 'next') this.tobbOldalVan = false;
        return;
      }

      const ujVelemenyek: Velemeny[] = snapshot.docs.map(doc => {
        const data = doc.data() as Velemeny;
        return {
          ...data,
          id: doc.id,
          idopont: data.idopont instanceof Date
            ? data.idopont
            : new Date(data.idopont?.toDate?.() ?? data.idopont)
        };
      });

      this.velemenyek = [...ujVelemenyek];

      // Mentjük az oldalt (csak ha előrelépés történt és van mit menteni)
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];

      if (direction === 'next') {
        if (this.pageReferences.length < this.aktualisOldalIndex + 1) {
          this.pageReferences.push(lastDoc);
        }
        this.aktualisOldalIndex++;
      } else if (direction === 'prev' && this.aktualisOldalIndex > 1) {
        this.aktualisOldalIndex--;
      }

      this.tobbOldalVan = snapshot.docs.length === this.oldalMeret;

    } catch (error) {
      console.error('Hiba a vélemények betöltésekor:', error);
    } finally {
      this.betoltesFolyamatban = false;
      this.loadingVelemenyek = false;
      this.cd.detectChanges();
    }
  }

}
