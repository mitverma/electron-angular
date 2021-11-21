import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-employee-form',
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.scss']
})
export class EmployeeFormComponent implements OnInit {
  employeeForm: FormGroup;
  constructor(private dailogRef: MatDialogRef<EmployeeFormComponent>, @Inject(MAT_DIALOG_DATA) public modalData: any) {
    this.employeeForm = new FormGroup({
      userId: new FormControl(),
      name: new FormControl(null, [Validators.required]),
      employeeId: new FormControl(null,[Validators.required]),
      password: new FormControl(),
      email: new FormControl(null, [Validators.required]),
      contactNo: new FormControl(null, [Validators.required]),
      userType: new FormControl(),
      designation: new FormControl(),
    })
  }

  ngOnInit(): void {
    console.log(this.modalData, 'modal data');

    if(this.modalData && this.modalData.employeeData){
      // && this.modalData.employeeData.userId
      console.log(this.employeeForm, 'employee form');
      this.employeeForm.patchValue({
        userId: this.modalData.employeeData.userId,
        name: this.modalData.employeeData.name,
        employeeId: this.modalData.employeeData.employeeId,
        password: this.modalData.employeeData.password,
        email: this.modalData.employeeData.email,
        contactNo: this.modalData.employeeData.contactNo,
        userType: this.modalData.employeeData.userType,
        designation: this.modalData.employeeData.designation
      });
      
      this.employeeForm.get('employeeId').disable();
    }
  }

  submitEmployeeData(formData){
    if(formData.valid){
      this.dailogRef.close(this.employeeForm.getRawValue());
    }
  }

}
