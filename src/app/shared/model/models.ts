export interface  FogyasztasiAdat {
   id?: string;
   datum: Date | string; //melyik időszak fogyasztása
   feltoltes_datum: Date | string; //mikor töltötte fel a user az adatokat
   user_id: string;
   lakas_id: string;
   viz: number; //m^3
   gaz: number; //m^3
   villany: number; //kw/h
   meleg_viz: number; //m^3
   megjegyzes?: string;

  //  viz: {
  //    osszfogyasztas: number;
  //    hidegViz: number;
  //    szivargas: boolean;
  //    minoseg: string;
  //    meres_modja: string;
  // };
  //
  //  gaz: {
  //    osszfogyasztas: number;
  //    csucsidoFogyasztas: number;
  //    alacsonyNyomas: boolean;
  //    evesBecsult: number;
  //    biztonsagi_ellenorzes: boolean;
  // };
  //
  //  villany: {
  //    osszfogyasztas: number;
  //    csucsidofogyasztas: number;
  //    aramkimaradas: boolean;
  //    zoldEnergiaAranya: number;
  //    tarifak: { [id: string]: number };
  // };
  //
  //  meleg_viz: {
  //    osszfogyasztas: number;
  //    vizhomerseklet: number;
  //    bojler_tipus: string;
  //    bojler_allapot: string;
  //    hoveszteseg: number;
  // };
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

export interface User {
  id: string;
  email: string;
  username?: string;
  nev:{
    vezeteknev: string;
    keresztnev: string;
  };
  fogyasztasi_adatok?: [FogyasztasiAdat]
  lakasok?: [Lakas]
  ultetett_fak?: [Fa];
}

export interface Fa {
  id: string;
  fajta: string;
  ultetes_ideje: Date;
  ultetes_helye: Cim;
  user_id: string;
  kep?: Kep;
}

export interface Lakas{
  id: string;
  cim: Cim;
  lakasmeret?: number; //m^2
  szigeteles?: boolean;
  epitesu: string;
  futes?: string;
}

export interface Kep{
  id: string;
  image_url?: string;
  photo_url?: string;
  username: string;
  user_id: string;
}
