import {AfterViewInit, ChangeDetectorRef, Component} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss']
})
export class ConfirmModalComponent implements AfterViewInit {
  constructor(
    public activeModal: NgbActiveModal,
    private cd: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    console.log("ngAfterViewInit called")
    this.cd.detectChanges();
  }

  onCancel(): void {
    this.activeModal.close('cancel');
  }

  onConfirm() {
    this.activeModal.close('confirm');
  }
}
