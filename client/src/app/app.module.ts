import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { DashboardModule } from './dashboard/dashboard.module';
import { NgModule } from '@angular/core';
import { SharedModule } from './shared/shared.module';
import { StyleguideComponent } from './styleguide/styleguide.component';

@NgModule({
	declarations: [AppComponent, StyleguideComponent],
	imports: [BrowserModule, AppRoutingModule, SharedModule, DashboardModule],
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule {}
