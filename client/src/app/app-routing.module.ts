import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { NgModule } from '@angular/core';
import { StyleguideComponent } from './styleguide/styleguide.component';

const routes: Routes = [
    { path: '**', redirectTo: 'dashboard' },
	{
		path: 'dashboard',
		component: DashboardComponent,
	},
    	{
		path: 'styleguide',
		component: StyleguideComponent,
	},
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
