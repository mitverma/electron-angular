import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { CommonService } from '../shared/common.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  constructor(private firestore: AngularFirestore, private router: Router, private commonService: CommonService) {
    this.loginForm = new FormGroup({
      employeeId: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [Validators.required]),
    })
  }

  ngOnInit(): void {
  }

  login(formData){
    console.log(formData, 'formData', formData.value);
    this.firestore.collection('users').get().subscribe((res) => {
      let userList =  res.docs.map(list =>  list.data());
      if(userList && userList.length){
        let isUserPresent: any =  userList.find((item: any) => (item.employeeId == formData.value.employeeId && item.password == formData.value.password));
        if(isUserPresent){
          sessionStorage.setItem('userData', JSON.stringify(isUserPresent));
          this.commonService.setUserDetailData(isUserPresent);
          if(isUserPresent.userType == 'A'){
            this.router.navigate(['dashboard']);
          }else {
            this.router.navigate(['home'])
          }
        }else {
          this.commonService.toasterMessage('Please enter valid Employee Id & Password');
        }
      }
    })
  }
}
