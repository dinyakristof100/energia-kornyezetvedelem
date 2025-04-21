import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BadgeInfo } from "../model/models";

@Injectable({
  providedIn: 'root'
})
export class JutalomService {

  private readonly badgeLevels: BadgeInfo[] = [
    { key: 'ENERGIABAJNOK', icon: '🏆', minDarab: 100, label: '' },
    { key: 'ENERGIAMESTER', icon: '🔥', minDarab: 50, label: '' },
    { key: 'ENERGIAGYUJTO', icon: '⚡', minDarab: 10, label: '' },
    { key: 'ZOLDFULU', icon: '🌱', minDarab: 0, label: '' }
  ];

  constructor(private translate: TranslateService) {}

  /**
   * Visszaadja a megfelelő kitűző információt a darabszám alapján.
   */
  getBadgeInfo(darab: number | null | undefined): BadgeInfo | null {
    const validDarab = darab ?? 0;
    const found = this.badgeLevels.find(b => validDarab >= b.minDarab);
    if (!found) return null;

    const translatedLabel = this.translate.instant(`PROFIL.KITUZO_LABEL.${found.key}`);
    return {
      ...found,
      label: `${translatedLabel}`
    };
  }

  getAvailableBadges(darab: number | null | undefined): BadgeInfo[] {
    const validDarab = darab ?? 0;
    return this.badgeLevels
      .filter(b => validDarab >= b.minDarab)
      .map(b => ({
        ...b,
        label: `${this.translate.instant(`PROFIL.KITUZO_LABEL.${b.key}`)}`
      }));
  }


  /**
   * Kitűzők listája fordítva (legmagasabbtól).
   */
  getAllBadgesWithStatus(darab: number): (BadgeInfo & { elert: boolean })[] {
    return this.badgeLevels.map(b => ({
      ...b,
      elert: darab >= b.minDarab,
      label: `${this.translate.instant(`PROFIL.KITUZO_LABEL.${b.key}`)}`
    }));
  }


  getBadgeInfoByKey(key: string): BadgeInfo | null {
    const badge = this.badgeLevels.find(b => b.key === key);
    if (!badge) return null;
    return {
      ...badge,
      label: `${this.translate.instant(`PROFIL.KITUZO_LABEL.${badge.key}`)}`
    };
  }

}
