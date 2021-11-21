import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  userDetailData: any;
  userData = new BehaviorSubject('');
  constructor() { }

  getUserDetailData(){
    return this.userDetailData;
  }

  setUserDetailData(data){
    this.userDetailData = data;
    this.userData.next(data);
  }

}
