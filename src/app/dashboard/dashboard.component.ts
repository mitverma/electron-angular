 import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { EmployeeFormComponent } from './components/employee-form/employee-form.component';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { CommonService } from '../shared/common.service';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import * as moment from 'moment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  userData: Array<any>;
  displayedColumns : Array<String> = ['position', 'name', 'employeeId','email', 'contact', 'action'];
  dataSource = new MatTableDataSource<any>();
  constructor(public dailog: MatDialog, public commonService: CommonService, private router : Router, private firestore: AngularFirestore) { }

  async ngOnInit() {
    let userObj = {
      userId: '',
      name: 'Admin',
      employeeId: 'RC99',
      password: 'admin@1234',
      email: 'testing@test.com',
      contactNo: '8655568110',
      userType: 'A',
      designation: 'Admin'
    }
    this.userData = await this.getUserList()
    console.log(this.userData);
    this.dataSource = new MatTableDataSource(this.userData);
    // this.dataSource.filter = "";

    console.log(this.firestore, 'firestore');
    // this.addTodayAttendance();
  }

  applyFilter(event: Event){
    let filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


  openEmployeeModal(data, type, index = null){
    let dailogReference = this.dailog.open(EmployeeFormComponent, {
      width: '500px',
      data: {
        modalType: type,
        employeeData: data
      }
    });
    dailogReference.afterClosed().subscribe(modalResponse => {
      console.log(modalResponse, 'modal response');
      if(type == 'add' && modalResponse){
        console.log(modalResponse, 'response');
        modalResponse.userType = "E"
        let createPassword = modalResponse.employeeId + "@1234"
        modalResponse.password = createPassword;
        this.addUser(modalResponse).then(response => {
          let updateUserId = {
            userId: response.id
          }
          this.updateUserData(updateUserId, updateUserId.userId).then(() => {    
            this.dataSource.data.push(modalResponse);
            this.dataSource.filter = "";
          });
        });
      }else if(type == 'edit' && modalResponse){
        this.updateUserData(modalResponse, modalResponse.userId);
        if(index != -1 && index != null){
          this.dataSource.data[index] = modalResponse;
          this.dataSource.filter = "";
        }
      }
    })
  }

  deleteEmployeeModal(userData, index){
    let dailogReference = this.dailog.open(ConfirmationModalComponent, {
      width: '500px',
      data: {
        heading: 'Are you sure you want to delete the employee data, All data will be deleted'
      }
    });

    dailogReference.afterClosed().subscribe(modalResponse => {
      if(modalResponse == 'yes'){
        console.log(userData.userId, 'id');
        this.deleteUserData(userData.userId).then(res => {
          this.dataSource.data.splice(index, 1);
          this.dataSource.filter = "";
        })
      }
    })
  }


  viewMore(userData){
    this.commonService.setUserDetailData(userData);
    // this.router.navigate(['/dashboard/user']);
    this.router.navigate(['/home']);
  }

  addUser(userData){
    return this.firestore.collection('users').add(userData)
  }

  updateUserData(userData, key){
    return this.firestore.doc('users/'+ key).update(userData);
  }

  deleteUserData(key){
    return this.firestore.doc('users/'+key).delete();
  }

  getUserList(): Promise<any>{
    let promise = new Promise((resolve, reject) => {
      this.firestore.collection('users').get().subscribe(userResponse => {
         let userArray = userResponse.docs.map(user => user.data());
         let filterArrayEmployee = userArray.filter(list => list['userType'] != 'A');
         resolve(filterArrayEmployee);
      });
    });
    return promise;
    
  }
}
