import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  calendarData: Array<any> = [];
  calenderForm: FormGroup;
  monthList = moment.months();
  yearList: Array<String>;
  currentDate = moment().format('DD-MM-YYYY');
  constructor() {
    this.calenderForm = new FormGroup({
      month: new FormControl(moment().month()),
      year: new FormControl(moment().year().toString())
    })
  }

  ngOnInit(): void {
    this.yearList = this.getPreviousYears(3);
    this.showCalendar(this.calenderForm.value.month, this.calenderForm.value.year);
  }


  showCalendar(month, year){
    let getDay = month+ '-01-'+ year;
    let day = moment(getDay).day();
    let totalDaysInMonth = moment(getDay).daysInMonth();
    totalDaysInMonth = totalDaysInMonth + day;
    let monthCount = 43;
    for(var i = 1; i < monthCount; i++){
      let obj = {}
      if(i > day && i <= totalDaysInMonth){
        obj = {
          dateNo: i - day
        };
      }else {
        obj = {
          dateNo : null
        }
      }

      // if colum is more then 35 and total day in month is less then 35 then break the loop for avoiding extra row
      if(i > 35 && totalDaysInMonth < 36){
        break;
      }

      this.calendarData.push(obj);
    }
  }

  getPreviousYears(yearsLength){
    let yearArray = [];
    for(var i = 0; i < yearsLength; i++){
      yearArray.push(moment().subtract(i, 'years').format('YYYY'));
    }
    return yearArray;
  }


  filterCalendar(formValue){
    let setMonthValue = (formValue.month+1).toString();
    this.calendarData = [];
    this.showCalendar(setMonthValue, formValue.year)
  }

}
