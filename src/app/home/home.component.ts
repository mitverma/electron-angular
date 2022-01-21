import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { CommonService } from '../shared/common.service';
import { Router } from '@angular/router';
// import { IpcRenderer } from 'electron';
import { ElectronService } from 'ngx-electron';
// import * as Electron from 'electron';

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
  attendanceUserData: any;
  todayAttendance: any;
  viewStartBtn: boolean = true;
  viewBreakInBtn: boolean = false;
  viewBreakoutBtn: boolean = false;
  viewEndBtn: boolean = false;
  isAdmin: boolean = false;
  ipc: any;

  constructor(private firestore: AngularFirestore, private commonService: CommonService, private router: Router, private electronService: ElectronService) {
    this.calenderForm = new FormGroup({
      month: new FormControl(moment().month()),
      year: new FormControl(moment().year().toString())
    })


    // if ((<any>window).require) {
    //   try {
    //     this.ipc = (<any>window).require('electron').ipcRenderer;
    //     this.ipc.on('lockscreen', (event) => {
    //       console.log(event);
    //     })
    //   } catch (e) {
    //     throw e;
    //   }
    // } else {
    //   console.warn('App not running inside Electron!');
    //   this.ipc = (<any>window).require('electron').ipcRenderer;
    //     this.ipc.on('lockscreen', (event) => {
    //       console.log(event);
    //     })
    // }

    var triggerElement = document.getElementById('bantai');
    if(triggerElement){
      triggerElement.addEventListener('click', () => {
        console.log('bro triggered'); 
      })
    }

    console.log(this.electronService, 'ES');
    if(this.electronService.isElectronApp){
      this.electronService.ipcRenderer.on('lockscreen', (event, arg) => {
        console.log(event, 'lock screen event', arg);
        let getTodayAttendanceData =  JSON.parse(sessionStorage.getItem('attendanceData'));
        if(!this.isAdmin && getTodayAttendanceData && getTodayAttendanceData.type == "start" || getTodayAttendanceData.type == "break-out"){
          this.breakInNew();
        }
      });
  
      this.electronService.ipcRenderer.on('unlockscreen', (event, arg) => {
        console.log(event, 'unlock screen event', arg);
        let getTodayAttendanceData =  JSON.parse(sessionStorage.getItem('attendanceData'));
        if(!this.isAdmin && getTodayAttendanceData && getTodayAttendanceData.type == "break-in"){
          this.breakOutNew();
        }
      })
    }
    
  }

  ngOnInit(): void {
    this.yearList = this.getPreviousYears(3);
    this.userData = this.commonService.getUserDetailData() || JSON.parse(sessionStorage.getItem('userData'));
    console.log(this.userData,'userData');
    this.showCalendar((this.calenderForm.value.month+1), this.calenderForm.value.year);
    this.calculateTodayAttendance();
    console.log(this.firestore, 'firestore');

    this.getAttendanceListByUser(this.currentMonthYear).then(currentMonthAttendanceArray => {
      if(currentMonthAttendanceArray){
        this.calendarData = this.calendarData.map(item => {
          let getByDate = currentMonthAttendanceArray.find(list => list.dateNo == item.dateNo);
          if(getByDate) {
            item.totalWorkTime = getByDate.totalWorkTime;
            item.breakTime = getByDate.breakTime;
            item.date = getByDate.date
          };
          return item;
        })
      }
      console.log(this.calendarData, 'calendar data');
    });


    // if user is getting logout then call data attendance method accordingly
    this.commonService.userLogout.asObservable().subscribe(res => {
      if(res) {
        let getTodayAttendanceData = JSON.parse(sessionStorage.getItem('attendanceData'));
        if((getTodayAttendanceData && getTodayAttendanceData.type == 'start') || (getTodayAttendanceData && getTodayAttendanceData.type == 'break-out')){
          this.endDayNew().then(() => {
            sessionStorage.removeItem('userData');
            sessionStorage.removeItem('attendanceData');
            this.commonService.setUserDetailData(null);
            this.router.navigate(['login']);
            this.commonService.isUserLogout(false);
          });
        }else if(getTodayAttendanceData && getTodayAttendanceData.type == 'break-in'){
          this.breakOutNew().then(response => {
            this.endDayNew().then(() => {
              sessionStorage.removeItem('userData');
              sessionStorage.removeItem('attendanceData');
              this.commonService.setUserDetailData(null);
              this.router.navigate(['login']);
              this.commonService.isUserLogout(false);
            });
          });
        }else {
          sessionStorage.removeItem('userData');
          sessionStorage.removeItem('attendanceData');
          this.commonService.setUserDetailData(null);
          this.router.navigate(['login']);
          this.commonService.isUserLogout(false);
        }
      }      
    })
    // if user is getting logout then call data attendance method accordingly end

    // check if user is admin
    let getUserLoggedInData: any = JSON.parse(sessionStorage.getItem('userData'));
    if(getUserLoggedInData.userType == "A"){
      this.isAdmin = true;
    }
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
    this.showCalendar(setMonthValue, formValue.year);
    let setFilteredMonthYear = (setMonthValue < 9 ? '0'+setMonthValue: setMonthValue)+'-'+formValue.year;
    this.getAttendanceListByUser(setFilteredMonthYear).then(currentMonthAttendanceArray => {
      if(currentMonthAttendanceArray){
        this.calendarData = this.calendarData.map(item => {
          let getByDate = currentMonthAttendanceArray.find(list => list.dateNo == item.dateNo);
          if(getByDate) {
            item.totalWorkTime = getByDate.totalWorkTime;
            item.breakTime = getByDate.breakTime;
            item.date = getByDate.date
          };
          return item;
        })
      }
    });
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
    let currentTime = moment().format('HH:mm:ss');
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
      startTime: moment().format('HH:mm:ss'),
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
        startTime: moment().format('HH:mm:ss'),
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
      endTime: moment().format('HH:mm:ss'),
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
      breakInTime: moment().format('HH:mm:ss'),
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
      breakOutTime: moment().format('HH:mm:ss'),
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
            let breakStart = moment(getLastBreakIn.breakInTime, 'HH:mm:ss');
            let breakEnd = moment(moment().format('HH:mm:ss'), 'HH:mm:ss');
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
              getTime = moment(getLastData.startTime, 'HH:mm:ss');
            }
            // if there is first break then get last data and current data end
            // and if there is more then one data then get last break-out-time
            if(attendanceList.length > 1) {
              getTime = moment(getLastData.breakOutTime, 'HH:mm:ss');
            }
            // and if there is more then one data then get last break-out-time end
            // let workTime = moment(getLastData.totalWorkTime, 'HH:mm:ss');
            let breakIn = moment(moment().format('HH:mm:ss'), 'HH:mm:ss');
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
            let endTime = moment(moment().format('HH:mm:ss'), 'HH:mm:ss');
            let totalDifference;

            // if last data input was break-out
            if(getLastData && getLastData.type == 'break-out'){
              getTime = moment(getLastData.breakOutTime, 'HH:mm:ss');
              totalDifference = endTime.diff(getTime, 'minutes');
              totalDifference = getLastData.totalWorkTime != '' ? getLastData.totalWorkTime + totalDifference : totalDifference;
              // if last data input was break-out end
            }else if(getLastData && getLastData.type == 'break-in'){
              getTime = moment(getLastData.breakInTime, 'HH:mm:ss');
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



  //new collection testing-attendance

  // get attendance list by user and current month year
  getAttendanceListByUser(currentMonthYear) : Promise<any>{
    let promise = new Promise((resolve, reject) => {
      let userKeyByMonthYear = this.userData.userId+'-'+currentMonthYear;
      this.firestore.collection('testing-attendance').get().subscribe(res => {
        this.attendanceUserData = res.docs.map(item => item.data()).find(itemList => itemList['key'] == userKeyByMonthYear);
        console.log(this.attendanceUserData, 'attendance user data');
        if(this.attendanceUserData){
          let getLastDataOfDate = this.attendanceUserData.attendanceData.map(list => {
            let getDateObjKey = Object.keys(list)[0];
            let getDateArrayData = list[getDateObjKey]
            let obj = {
              dateNo: moment(getDateObjKey, 'DD-MM-YYYY').date(),
              date: getDateObjKey,
              ...getDateArrayData[getDateArrayData.length - 1]
            };
            return obj;
          });
          console.log(getLastDataOfDate, 'get last date of data');
          resolve(getLastDataOfDate);
        }
      })
    });
    return promise;
  }

  // add attendance 
  async addTodayAttendanceNew(attendanceObj){
    // check if user data is present by current month
    let userAttendanceCurrentMonth = await this.checkUserAttendCurrentMonth();
    if(userAttendanceCurrentMonth && userAttendanceCurrentMonth['key']){
      let index = userAttendanceCurrentMonth.attendanceData.findIndex(arrayObj => Object.keys(arrayObj)[0] == this.currentDate);
      let isDayPresent = await this.checkUserAttendCurrentDate(userAttendanceCurrentMonth);
      if(isDayPresent){
        userAttendanceCurrentMonth.attendanceData[index][this.currentDate].push(attendanceObj);
        this.firestore.collection('testing-attendance').doc(userAttendanceCurrentMonth['key']).update(userAttendanceCurrentMonth);
        this.attendanceUserData = userAttendanceCurrentMonth;
        console.log(this.attendanceUserData, 'userattendance is user present');
      }else {
        let dateObjArray = {
          [this.currentDate]: [attendanceObj] // adding object to array
        }
        userAttendanceCurrentMonth.attendanceData.push(dateObjArray);
        this.firestore.collection('testing-attendance').doc(userAttendanceCurrentMonth['key']).update(userAttendanceCurrentMonth);
        this.attendanceUserData = userAttendanceCurrentMonth;
        console.log(this.attendanceUserData, 'userattendance if date is not present add date');
      }
    }else {
      // if user is adding attendance for the first time for current month and current date
      let addNewUserData = {
        userId: this.userData.userId,
        createdAt: new Date().valueOf(),
        key: this.userData.userId+'-'+this.currentMonthYear,
        attendanceData: [
          {
            [this.currentDate]: [attendanceObj] // adding object to array
          }
        ]
      }

      // add fresh data for userId and current month, create new object with attendanceData array 
      this.firestore.collection('testing-attendance').doc(addNewUserData.key).set(addNewUserData).then(res => {
        this.getAttendanceListByUser(this.currentMonthYear);
      });

    }
  }


  // start a day attendance
  async startDayNew(){
    let attendanceData = {
      startTime: moment().format('HH:mm:ss'),
      currentTime: new Date().valueOf(),
      endTime: '',
      breakTime: '',
      totalWorkTime: '',
      breakInTime: '',
      breakOutTime: '',
      type: 'start'
    }
    let startDayData = await this.calculateStartTimeNew();
    if(startDayData){
      attendanceData.breakTime = startDayData.breakTime;
      attendanceData.totalWorkTime = startDayData.totalWorkTime
    }
    this.addTodayAttendanceNew(attendanceData).then(res => {
      let localData = {
        startTime: moment().format('HH:mm:ss'),
        currentTime: new Date().valueOf(),
        endTime: '',
        breakInTime: '',
        breakOutTime: '',
        totalWorkTime: attendanceData.totalWorkTime,
        breakTime: attendanceData.breakTime,
        type: 'start'
      }
      sessionStorage.setItem('attendanceData',JSON.stringify(localData));
      

      //button views
      this.viewStartBtn = false;
      this.viewBreakInBtn = true;
    });
  }

  // end day attendance
  async endDayNew(){
    let getTodayAttendanceData = JSON.parse(sessionStorage.getItem('attendanceData'));
    let attendanceData = {
      startTime: getTodayAttendanceData.startTime,
      currentTime: new Date().valueOf(),
      endTime: moment().format('HH:mm:ss'),
      breakTime: getTodayAttendanceData.breakTime || '',
      totalWorkTime: getTodayAttendanceData.totalWorkTime || '',
      breakInTime: '',
      breakOutTime: '',
      type: 'end'
    }
    let calculateData = await this.calculateEndTimeNew();
    if(calculateData && calculateData.data.type == 'break-out'){
      attendanceData.totalWorkTime = calculateData.calculatedTotalDifference;
    }else if(calculateData && calculateData.data.type == "break-in"){
      attendanceData.breakTime = calculateData.calculatedTotalDifference;
    }
    this.addTodayAttendanceNew(attendanceData);
  }

  // break in
  async breakInNew(){
    let getTodayAttendanceData = JSON.parse(sessionStorage.getItem('attendanceData'));
    let attendanceData = {
      startTime: getTodayAttendanceData.startTime,
      currentTime: new Date().valueOf(),
      endTime: '',
      breakTime: getTodayAttendanceData.breakTime || '',
      totalWorkTime: getTodayAttendanceData.totalWorkTime || '',
      breakInTime: moment().format('HH:mm:ss'),
      breakOutTime: '',
      type: 'break-in'
    }
    let calculateWorkTime = await this.calculateWorkTimeNew();
    attendanceData.totalWorkTime = calculateWorkTime;
    this.addTodayAttendanceNew(attendanceData).then(res => {
      getTodayAttendanceData.totalWorkTime = calculateWorkTime;
      getTodayAttendanceData.type = "break-in";
      sessionStorage.setItem('attendanceData', JSON.stringify(getTodayAttendanceData));

      
      //button views
      this.viewBreakInBtn = false;
      this.viewBreakoutBtn = true;
    });
  }

  // break out
  async breakOutNew(){
    let getTodayAttendanceData = JSON.parse(sessionStorage.getItem('attendanceData'));
    let attendanceData = {
      startTime: getTodayAttendanceData.startTime,
      currentTime: new Date().valueOf(),
      endTime: '',
      breakTime: getTodayAttendanceData.breakTime || '',
      totalWorkTime: getTodayAttendanceData.totalWorkTime || '',
      breakInTime: '',
      breakOutTime: moment().format('HH:mm:ss'),
      type: 'break-out'
    }
    let calculateBreak = await this.calculateBreakTimeNew();
    attendanceData.breakTime = calculateBreak;
    this.addTodayAttendanceNew(attendanceData).then(res => {
      getTodayAttendanceData.breakTime = calculateBreak;
      getTodayAttendanceData.breakOutTime = attendanceData.breakOutTime;
      getTodayAttendanceData.type = "break-out";
      sessionStorage.setItem('attendanceData', JSON.stringify(getTodayAttendanceData));

      //button views
      this.viewBreakInBtn = true;
      this.viewBreakoutBtn = false;
      
    });
  }


  // current user attendance with current month
  checkUserAttendCurrentMonth(): Promise<any> {
    let userKeyByMonthYear = this.userData.userId+'-'+this.currentMonthYear;
    let promise = new Promise((resolve, reject) => {
      this.firestore.collection('testing-attendance').get().subscribe(res => {
        let isUserPresent = res.docs.map(list => list.data()).find(item => item['key'] == userKeyByMonthYear);
        resolve(isUserPresent);
      })
    });
    return promise;
  }


  // check if current date is present in user attendance obj or array
  checkUserAttendCurrentDate(attendanceUserObj): Promise<any>{
    let promise = new Promise((resolve,reject) => {
      if(attendanceUserObj && attendanceUserObj.attendanceData && attendanceUserObj.attendanceData.length){
        let isDatePresent = false;
        for(let list of attendanceUserObj.attendanceData){
          isDatePresent = list.hasOwnProperty(this.currentDate);
          if(isDatePresent) break;
        }

        resolve(isDatePresent);
      }
    });
    return promise;
  }

  // calculate end time
  calculateEndTimeNew(): Promise<any>{
    let promise = new Promise((resolve, reject) => {
      // find index of current date from attendance list
      let index = this.attendanceUserData.attendanceData.findIndex(arrayObj => Object.keys(arrayObj)[0] == this.currentDate);
      let attendanceListCurrentDate = this.attendanceUserData.attendanceData[index][this.currentDate];
      let getTime;
      if(attendanceListCurrentDate && attendanceListCurrentDate.length) {
        let getLastData = attendanceListCurrentDate[attendanceListCurrentDate.length - 1];
        let endTime = moment(moment().format('HH:mm:ss'), 'HH:mm:ss');
        let totalDifference;

        // if last data input was break-out
        if(getLastData && getLastData.type == 'break-out'){
          getTime = moment(getLastData.breakOutTime, 'HH:mm:ss');
          totalDifference = endTime.diff(getTime, 'minutes');
          totalDifference = getLastData.totalWorkTime != '' ? getLastData.totalWorkTime + totalDifference : totalDifference;
          // if last data input was break-out end
        }else if(getLastData && getLastData.type == 'break-in'){
          getTime = moment(getLastData.breakInTime, 'HH:mm:ss');
          totalDifference = endTime.diff(getTime, 'minutes');
          totalDifference = getLastData.breakTime != '' ? getLastData.breakTime + totalDifference : totalDifference;
        }

        let endData = {
          calculatedTotalDifference: totalDifference,
          data: getLastData
        }
        resolve(endData);
      }
    });
    return promise;
  }

  // calculate work time
  calculateWorkTimeNew(): Promise<any>{
    let promise = new Promise((resolve, reject) => {
      let getTime;
      // find index of current date from attendance list
      let index = this.attendanceUserData.attendanceData.findIndex(arrayObj => Object.keys(arrayObj)[0] == this.currentDate);
      let attendanceListCurrentDate = this.attendanceUserData.attendanceData[index][this.currentDate];
      if(attendanceListCurrentDate && attendanceListCurrentDate.length){
        let getLastData = attendanceListCurrentDate[attendanceListCurrentDate.length - 1];
        // if there is first break then get last data and current data
        if(attendanceListCurrentDate.length == 1){
          getTime = moment(getLastData.startTime, 'HH:mm:ss');
        }
        // if there is first break then get last data and current data end
        // and if there is more then one data then get last break-out-time
        if(attendanceListCurrentDate.length > 1) {
          // if last data is starttime bcoz user ended or might technically issue ended
          if(getLastData && getLastData.type == 'start'){
            getTime = moment(getLastData.startTime, 'HH:mm:ss');
          }
          // if last data is break-out-time
          else if(getLastData && getLastData.type == 'break-out'){
            getTime = moment(getLastData.breakOutTime, 'HH:mm:ss');
          }
        }
        // and if there is more then one data then get last break-out-time end
        // let workTime = moment(getLastData.totalWorkTime, 'HH:mm:ss');
        let breakIn = moment(moment().format('HH:mm:ss'), 'HH:mm:ss');
        // let totalDifference = breakStart.diff(breakEnd, 'minutes');
        let totalDifference = breakIn.diff(getTime, 'minutes');
        totalDifference = getLastData.totalWorkTime != '' ? getLastData.totalWorkTime + totalDifference: totalDifference;
        resolve(totalDifference);
      }
    });
    return promise;
  }

  // calculate break time
  calculateBreakTimeNew(): Promise<any>{
    let promise = new Promise((resolve, reject) => {
     // find index of current date from attendance list
     let index = this.attendanceUserData.attendanceData.findIndex(arrayObj => Object.keys(arrayObj)[0] == this.currentDate);
     let attendanceListCurrentDate = this.attendanceUserData.attendanceData[index][this.currentDate];

    if(attendanceListCurrentDate && attendanceListCurrentDate.length){
      let getLastBreakIn = attendanceListCurrentDate[attendanceListCurrentDate.length - 1];
      let breakStart = moment(getLastBreakIn.breakInTime, 'HH:mm:ss');
      let breakEnd = moment(moment().format('HH:mm:ss'), 'HH:mm:ss');
      // let totalDifference = breakStart.diff(breakEnd, 'minutes');
      let totalDifference = breakEnd.diff(breakStart, 'minutes');
      totalDifference = getLastBreakIn.breakTime != '' ? getLastBreakIn.breakTime + totalDifference: totalDifference;
      resolve(totalDifference);
     }
    });
    return promise;
  }


  //calculate start time if user has been logged out techical issue or manually ended session
  calculateStartTimeNew(): Promise<any>{
    let promise = new Promise((resolve, reject) => {
      if(this.attendanceUserData && this.attendanceUserData.attendanceData && this.attendanceUserData.attendanceData.length){
        let index = this.attendanceUserData.attendanceData.findIndex(arrayObj => Object.keys(arrayObj)[0] == this.currentDate);
        if(index != -1) {
          let attendanceListCurrentDate = this.attendanceUserData.attendanceData[index][this.currentDate];
          if(attendanceListCurrentDate && attendanceListCurrentDate.length){
            let getLastData = attendanceListCurrentDate[attendanceListCurrentDate.length - 1];
            resolve(getLastData);
          }
        }else {
          resolve(null);
        }
      }else {
        resolve(null);
      }
      
    });
    return promise;
  }

  // calculate todays attendance data
  calculateTodayAttendance(){
    let userKeyByMonthYear = this.userData.userId+'-'+this.currentMonthYear;
    this.firestore.collection('testing-attendance').get().subscribe(res => {
      let getAttendanceList =  res.docs.map(item => item.data()).find(list => list['key'] == userKeyByMonthYear);
      if(getAttendanceList &&  getAttendanceList['attendanceData']){
        let index = getAttendanceList['attendanceData'].findIndex(arrayObj => Object.keys(arrayObj)[0] == this.currentDate);
        if(index != -1) {
          let getLastData = getAttendanceList['attendanceData'][index][this.currentDate];
          this.todayAttendance = getLastData[getLastData.length - 1];
          sessionStorage.setItem('attendanceData', JSON.stringify(this.todayAttendance));

          // set button values 
          this.viewStartBtn = false;
          this.viewBreakInBtn = false;
          this.viewBreakoutBtn = false;
          this.viewEndBtn = false;
          if(this.todayAttendance && this.todayAttendance.type == "start" || this.todayAttendance.type == "break-out") {
            this.viewBreakInBtn = true;
            this.viewBreakoutBtn = false;
          }else if(this.todayAttendance && this.todayAttendance.type == "break-in"){
            this.viewBreakInBtn = false;
            this.viewBreakoutBtn = true;
          }else {
            this.viewStartBtn = true;
          }
          // set button values end
        }
      }
    })
  }
}
