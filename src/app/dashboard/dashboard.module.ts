import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { SharedModule } from '../shared/shared.module';
import { DashboardComponent } from './dashboard.component';
import { EmployeeFormComponent } from './components/employee-form/employee-form.component';
import { UserComponent } from './components/user/user.component';


@NgModule({
  declarations: [
    DashboardComponent,
    EmployeeFormComponent,
    UserComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule
  ],
  entryComponents: [
    EmployeeFormComponent
  ]
})
export class DashboardModule { }
