import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  userDetailData: any;
  userData = new BehaviorSubject('');
  userLogout = new BehaviorSubject(false);
  constructor(private snackBar: MatSnackBar) { }

  getUserDetailData(){
    return this.userDetailData;
  }

  setUserDetailData(data){
    this.userDetailData = data;
    this.userData.next(data);
  }

  isUserLogout(value: boolean){
    this.userLogout.next(value);
  }

  toasterMessage(message){
    this.snackBar.open(message, 'close');
  }

}
