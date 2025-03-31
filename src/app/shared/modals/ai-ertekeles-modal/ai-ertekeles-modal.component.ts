import {Component, Input} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";


@Component({
  selector: 'app-ai-ertekeles-modal',
  templateUrl: './ai-ertekeles-modal.component.html',
  styleUrl: './ai-ertekeles-modal.component.scss'
})
export class AiErtekelesModalComponent {
  @Input() ertekelesSzoveg: string = '';

  constructor(
    protected modal: NgbActiveModal
  ) {  }


}
