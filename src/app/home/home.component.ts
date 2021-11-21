import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { CommonService } from '../shared/common.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  calendarData: Array<any> = [];
  calenderForm: FormGroup;
  monthList = moment.months();
  yearList: Array<String>;
  currentMonthYear = moment().format('MM-YYYY');
  currentDate = moment().format('DD-MM-YYYY');
  userData: any;
  constructor(private firestore: AngularFirestore, private commonService: CommonService) {
    this.calenderForm = new FormGroup({
      month: new FormControl(moment().month()),
      year: new FormControl(moment().year().toString())
    })
  }

  ngOnInit(): void {
    this.yearList = this.getPreviousYears(3);
    this.userData = this.commonService.getUserDetailData() || JSON.parse(sessionStorage.getItem('userData'));
    console.log(this.userData,'userData');
    this.showCalendar(this.calenderForm.value.month, this.calenderForm.value.year);
    console.log(this.firestore, 'firestore');
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


  // firestore check if key is present
  checkFireBaseKeyPresent(month, date): Promise<any>{
    let promise = new Promise((resolve, reject) => {
      this.firestore.collection('attendance').doc(month).collection(date).get().subscribe(res => {
        resolve(res.size);
      })
    });
    return promise
   
  };


  checkIsDatePresent(month, date, userId):Promise<any>{
    let promise = new Promise((resolve, reject) => {
      this.firestore.collection('attendance').doc(month).collection(userId).doc(userId).collection(date).get().subscribe(res => {
        resolve(res.size);
      })
    });

    return promise;
  }


  // create current date and add attendance
  async addTodayAttendance(attendanceObj){
    // check if current month is created
    let currentTime = moment().format('hh:mm:ss');
    console.log(this.currentMonthYear, 'month', this.currentDate, 'date', typeof(this.currentDate));
    let isMonthPresentLength = await this.checkFireBaseKeyPresent(this.currentMonthYear, this.currentDate);
    console.log(isMonthPresentLength, 'is month present');
    if(isMonthPresentLength == 0){
      let data = [attendanceObj];
      this.firestore.collection('attendance').doc(this.currentMonthYear).collection(this.userData.userId).doc(this.userData.userId).collection(this.currentDate).doc(currentTime).set(attendanceObj)
      // this.firestore.collection('attendance').doc(this.currentMonthYear).collection(this.userData.userId).doc(this.userData.userId).collection(this.currentDate).doc(this.currentDate).set({[this.currentDate]: data})
    }else {
      let isDatePresentLength = await this.checkIsDatePresent(this.currentMonthYear, this.currentDate, this.userData.userId);
      if(isDatePresentLength == 0){
        // this.firestore.collection('attendance').doc(this.currentMonthYear).collection(this.userData.userId).doc(this.userData.userId).collection(this.currentDate).add(attendanceObj);
        this.firestore.collection('attendance').doc(this.currentMonthYear).collection(this.userData.userId).doc(this.userData.userId).collection(this.currentDate).doc(currentTime).set(attendanceObj);
      }else {
        // this.firestore.collection('attendance').doc(this.currentMonthYear).collection(this.userData.userId).doc(this.userData.userId).collection(this.currentDate).add(attendanceObj);
        this.firestore.collection('attendance').doc(this.currentMonthYear).collection(this.userData.userId).doc(this.userData.userId).collection(this.currentDate).doc(currentTime).set(attendanceObj);
      }
    }
  }
  // create current date and add attendance end

  startDay(){
    let attendanceData = {
      startTime: moment().format('hh:mm:ss'),
      currentTime: new Date().valueOf(),
      endTime: '',
      breakTime: '',
      totalWorkTime: '',
      breakInTime: '',
      breakOutTime: '',
      type: 'start'
    }
    this.addTodayAttendance(attendanceData).then(res => {
      let localData = {
        startTime: moment().format('hh:mm:ss'),
        currentTime: new Date().valueOf(),
        endTime: '',
        breakInTime: '',
        breakOutTime: '',
      }
      sessionStorage.setItem('attendanceData',JSON.stringify(localData));
    });
  }

  async endDay(){
    let getTodayAttendanceData = JSON.parse(sessionStorage.getItem('attendanceData'));
    let attendanceData = {
      startTime: getTodayAttendanceData.startTime,
      currentTime: new Date().valueOf(),
      endTime: moment().format('hh:mm:ss'),
      breakTime: getTodayAttendanceData.breakTime || '',
      totalWorkTime: getTodayAttendanceData.totalWorkTime || '',
      breakInTime: '',
      breakOutTime: '',
      type: 'end'
    }
    let calculateData = await this.calculateEndTime();
    if(calculateData && calculateData.data.type == 'break-out'){
      attendanceData.totalWorkTime = calculateData.calculatedTotalDifference;
    }else if(calculateData && calculateData.data.type == "break-in"){
      attendanceData.breakTime = calculateData.calculatedTotalDifference;
    }
    this.addTodayAttendance(attendanceData);
  }
  async breakIn(){
    let getTodayAttendanceData = JSON.parse(sessionStorage.getItem('attendanceData'));
    let attendanceData = {
      startTime: getTodayAttendanceData.startTime,
      currentTime: new Date().valueOf(),
      endTime: '',
      breakTime: getTodayAttendanceData.breakTime || '',
      totalWorkTime: getTodayAttendanceData.totalWorkTime || '',
      breakInTime: moment().format('hh:mm:ss'),
      breakOutTime: '',
      type: 'break-in'
    }
    let calculateWorkTime = await this.calculateWorkTime();
    attendanceData.totalWorkTime = calculateWorkTime;
    this.addTodayAttendance(attendanceData).then(res => {
      getTodayAttendanceData.totalWorkTime = calculateWorkTime;
      sessionStorage.setItem('attendanceData', JSON.stringify(getTodayAttendanceData));
    });
  }

 async breakOut(){
    let getTodayAttendanceData = JSON.parse(sessionStorage.getItem('attendanceData'));
    let attendanceData = {
      startTime: getTodayAttendanceData.startTime,
      currentTime: new Date().valueOf(),
      endTime: '',
      breakTime: getTodayAttendanceData.breakTime || '',
      totalWorkTime: getTodayAttendanceData.totalWorkTime || '',
      breakInTime: '',
      breakOutTime: moment().format('hh:mm:ss'),
      type: 'break-out'
    }
    let calculateBreak = await this.calculateBreakTime();
    attendanceData.breakTime = calculateBreak;
    this.addTodayAttendance(attendanceData).then(res => {
      getTodayAttendanceData.breakTime = calculateBreak;
      sessionStorage.setItem('attendanceData', JSON.stringify(getTodayAttendanceData));
    });
  }
 

  calculateBreakTime(): Promise<any>{
    let promise = new Promise((resolve, reject) => {
      this.firestore.collection('attendance').doc(this.currentMonthYear).collection(this.userData.userId).doc(this.userData.userId).collection(this.currentDate).get().subscribe(response => {
        if(response) {
          let attendanceList = response.docs.map(list => list.data());
          if(attendanceList && attendanceList.length){
            let getLastBreakIn = attendanceList[attendanceList.length - 1];
            let breakStart = moment(getLastBreakIn.breakInTime, 'hh:mm:ss');
            let breakEnd = moment(moment().format('hh:mm:ss'), 'hh:mm:ss');
            // let totalDifference = breakStart.diff(breakEnd, 'minutes');
            let totalDifference = breakEnd.diff(breakStart, 'minutes');
            totalDifference = getLastBreakIn.breakTime != '' ? getLastBreakIn.breakTime + totalDifference: totalDifference;
            resolve(totalDifference);
          }
        }
      })
    });
    return promise;
  }

  calculateWorkTime(): Promise<any>{
    // same call while end and break in time
    let promise = new Promise((resolve, reject) => {
      this.firestore.collection('attendance').doc(this.currentMonthYear).collection(this.userData.userId).doc(this.userData.userId).collection(this.currentDate).get().subscribe(response => {
        if(response) {
          let getTime;
          let attendanceList = response.docs.map(list => list.data());
          if(attendanceList && attendanceList.length){
            let getLastData = attendanceList[attendanceList.length - 1];
            // if there is first break then get last data and current data
            if(attendanceList.length == 1){
              getTime = moment(getLastData.startTime, 'hh:mm:ss');
            }
            // if there is first break then get last data and current data end
            // and if there is more then one data then get last break-out-time
            if(attendanceList.length > 1) {
              getTime = moment(getLastData.breakOutTime, 'hh:mm:ss');
            }
            // and if there is more then one data then get last break-out-time end
            // let workTime = moment(getLastData.totalWorkTime, 'hh:mm:ss');
            let breakIn = moment(moment().format('hh:mm:ss'), 'hh:mm:ss');
            // let totalDifference = breakStart.diff(breakEnd, 'minutes');
            let totalDifference = breakIn.diff(getTime, 'minutes');
            totalDifference = getLastData.totalWorkTime != '' ? getLastData.totalWorkTime + totalDifference: totalDifference;
            resolve(totalDifference);
          }
        }
      })
    });

    return promise;
  }


  calculateEndTime(): Promise<any>{
    let promise = new Promise((resolve,reject) => {
      this.firestore.collection('attendance').doc(this.currentMonthYear).collection(this.userData.userId).doc(this.userData.userId).collection(this.currentDate).get().subscribe(response => {
        if(response){
          let attendance = response.docs.map(list => list.data());
          let getTime;
          if(attendance && attendance.length) {
            let getLastData = attendance[attendance.length - 1];
            let endTime = moment(moment().format('hh:mm:ss'), 'hh:mm:ss');
            let totalDifference;

            // if last data input was break-out
            if(getLastData && getLastData.type == 'break-out'){
              getTime = moment(getLastData.breakOutTime, 'hh:mm:ss');
              totalDifference = endTime.diff(getTime, 'minutes');
              totalDifference = getLastData.totalWorkTime != '' ? getLastData.totalWorkTime + totalDifference : totalDifference;
              // if last data input was break-out end
            }else if(getLastData && getLastData.type == 'break-in'){
              getTime = moment(getLastData.breakInTime, 'hh:mm:ss');
              totalDifference = endTime.diff(getTime, 'minutes');
              totalDifference = getLastData.breakTime != '' ? getLastData.breakTime + totalDifference : totalDifference;
            }

            let endData = {
              calculatedTotalDifference: totalDifference,
              data: getLastData
            }
            resolve(endData);
          }
        }
      })
    });
    return promise;
  }


  // var range = XLSX.utils.decode_range(ws['!ref']);
  //   for(var C = range.s.r; C <= range.e.r; ++C) {
  //     var address = XLSX.utils.encode_col(C) + "1"; // <-- first row, column number C
  //     if(!ws[address]) continue;
  //      ws[address].v = ws[address].v.toUpperCase();
  //     ws[address].s = {
  //       font: {
  //         sz: 24,
  //         bold: true,
  //         color: { rgb: "FFFFAA00" }
  //       },
  //     }
  //   }
}
