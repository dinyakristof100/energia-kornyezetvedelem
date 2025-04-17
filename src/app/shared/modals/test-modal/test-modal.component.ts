import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-test-modal',
  templateUrl: './test-modal.component.html'
})
export class TestModalComponent {
  constructor(public activeModal: NgbActiveModal) {}

  close() {
    this.activeModal.close('confirmed');
  }

  cancel() {
    this.activeModal.dismiss('cancelled');
  }
}
