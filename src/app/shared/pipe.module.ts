import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendancetimePipe } from './attendancetime.pipe';



@NgModule({
  declarations: [
    AttendancetimePipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    AttendancetimePipe
  ]
})
export class PipeModule { }
