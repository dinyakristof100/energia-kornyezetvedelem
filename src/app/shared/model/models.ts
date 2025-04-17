export interface  FogyasztasiAdat {
   id?: string;
   datum: Date | string; //melyik időszak fogyasztása
   feltoltes_datum: Date | string;
   user_id: string;
   lakas_id: string;
   viz: number; //m^3
   gaz: number; //m^3
   villany: number; //kw/h
   meleg_viz: number; //m^3
   megjegyzes?: string;
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
  readonly admin: boolean
  fogyasztasi_adatok?: [FogyasztasiAdat];
  lakasok?: [Lakas];
  ultetett_fak?: [Fa];
}

export interface Fa {
  id: string;
  nev: string
  fajta: string;
  ultetes_ideje: any;
  ultetes_helye: Cim;
  user_id: string;
  jovahagyott: boolean;
  kep?: Kep;
}

export interface Lakas{
  id: string;
  lakasNev: string;
  cim: Cim;
  alapterulet?: number; //m^2
  szigeteles?: boolean;
  epitesMod: string;
  futesTipus: string;
  userId: string;
}

export interface Kep{
  id: string;
  photo_url?: string;
  username: string;
  user_id: string;
}

export interface Velemeny {
  id?: any;
  idopont: any;
  elbiralva: boolean;
  uzenet: string;
  userid: string;
  username: string;
}

export interface Cenzura{
  text: string;
  idopont: Date;
}


export type KozlekedesiMod = 'auto' | 'busz' | 'vonat' | 'bicikli' | 'gyalog';
