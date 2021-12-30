import { Component, OnInit } from '@angular/core';
import { CommonService } from '../shared/common.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  userData: any;
  constructor(private commonService: CommonService, private router: Router, private dailog: MatDialog) { }

  ngOnInit(): void {

    this.commonService.userData.asObservable().subscribe(userNewVal => {
      this.userData = userNewVal;
      let userDataView =  JSON.parse(sessionStorage.getItem('userData'));
      if(userDataView && userDataView.userType && userDataView.userType == 'A'){
        this.userData = userDataView;
      }
      console.log(this.userData, 'user data');
    });

    if(sessionStorage.getItem('userData')){
      this.userData = JSON.parse(sessionStorage.getItem('userData'));
    }
  }

  logout(){

    let dailogReference = this.dailog.open(ConfirmationModalComponent, {
      width: '500px',
      data: {
        heading: 'Are you sure you want to logout your attendance will be also get logged out'
      }
    });

    dailogReference.afterClosed().subscribe(modalResponse => {
      if(modalResponse == "yes"){
        console.log(modalResponse, 'modal response');
        if(this.userData.userType == "E"){
          this.commonService.isUserLogout(true);
        }else {
          sessionStorage.removeItem('userData');
          sessionStorage.removeItem('attendanceData');
          this.commonService.setUserDetailData(null);
          this.router.navigate(['login']);
        }

      }
    })
  }

}
