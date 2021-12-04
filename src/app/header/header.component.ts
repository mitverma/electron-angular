import { Component, OnInit } from '@angular/core';
import { CommonService } from '../shared/common.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  userData: any;
  constructor(private commonService: CommonService, private router: Router) { }

  ngOnInit(): void {

    this.commonService.userData.asObservable().subscribe(userNewVal => {
      this.userData = userNewVal;
      console.log(this.userData, 'user data');
    });

    if(sessionStorage.getItem('userData')){
      this.userData = JSON.parse(sessionStorage.getItem('userData'));
    }
  }

  logout(){
    sessionStorage.removeItem('userData');
    sessionStorage.removeItem('attendanceData');
    this.commonService.setUserDetailData(null);
    this.router.navigate(['login']);
  }

}
