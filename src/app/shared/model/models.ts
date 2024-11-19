export interface FogyasztasiAdat {
   id?: number;
   datum: Date | string;
   feltoltesDatum: Date | string;
   cim: Cim;
   userId: number;

  // Vízfogyasztás
   viz: {
     osszfogyasztas: number;
     hidegViz: number;
     szivargas: boolean;
     minoseg: string;
     meresModja: string;
  };

  // Gázfogyasztás
   gaz: {
     osszfogyasztas: number;
     csucsidoFogyasztas: number;
     alacsonyNyomas: boolean;
     evesBecsult: number;
     biztonsagiEllenorzes: boolean;
  };

  // Villamosenergia fogyasztás
   villany: {
     osszfogyasztas: number;
     csucsidofogyasztas: number;
     aramkimaradas: boolean;
     zoldEnergiaAranya: number;
     tarifak: { [id: string]: number };
  };

  // Melegvíz fogyasztás
   melegViz: {
     osszfogyasztas: number;
     vizhomerseklet: number;
     bojlerTipus: string;
     bojlerAllapot: string;
     hoveszteseg: number;
  };

   megjegyzesek?: string;
}

export interface Cim {
   orszag: string;
   iranyitoszam: string;
   telepules: string;
   utca: string;
   hazszam: string;
   epulet?: string;
   emelet?: string;
   ajto?: string;
}
