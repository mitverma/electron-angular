import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss']
})
export class ConfirmationModalComponent implements OnInit {

  constructor(private dailog: MatDialogRef<ConfirmationModalComponent>, @Inject(MAT_DIALOG_DATA) public modalData: any) { }

  ngOnInit(): void {
  }

  closeModal(type){
    this.dailog.close(type);
  }

}
