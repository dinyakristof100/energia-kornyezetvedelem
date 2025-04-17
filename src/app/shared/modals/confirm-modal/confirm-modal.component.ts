import { Component, Input} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.scss'
})
export class ConfirmModalComponent {
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() megse: string = '';
  @Input() elfogad: string = '';

  constructor(public activeModal: NgbActiveModal) {}
  onCancel(): void {
    this.activeModal.close('cancel');
  }

  onConfirm(): void {
    this.activeModal.close('confirm');
  }
}
