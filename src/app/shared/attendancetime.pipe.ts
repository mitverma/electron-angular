import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'attendancetime'
})
export class AttendancetimePipe implements PipeTransform {

  transform(value: any, type: any) {
    let calculateTime = value;
    if(value) value.toString();
    if(type == 'hours' && value){
      calculateTime = Math.floor(value / 60);
    }else if(type == 'minutes' && value){
      calculateTime = value % 60
    }
    return calculateTime;
  }

}
