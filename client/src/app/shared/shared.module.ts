import { AppRoutingModule } from '../app-routing.module';
import { ButtonToggleComponent } from './components/button-toggle/button-toggle.component';
import { CommonModule } from '@angular/common';
import { ContainerComponent } from './components/container/container.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoadingIndicatorComponent } from './components/loading-indicator/loading-indicator.component';
import { MenuComponent } from './components/menu/menu.component';
import { NgModule } from '@angular/core';
import { SideDrawerComponent } from './components/side-drawer/side-drawer.component';
import { SubMenuComponent } from './components/sub-menu/sub-menu.component';

@NgModule({
	declarations: [MenuComponent, ContainerComponent, FooterComponent, SubMenuComponent, LoadingIndicatorComponent, ButtonToggleComponent, SideDrawerComponent],
	imports: [CommonModule, AppRoutingModule],
	exports: [MenuComponent, ContainerComponent, FooterComponent, SubMenuComponent, LoadingIndicatorComponent, ButtonToggleComponent, SideDrawerComponent],
})
export class SharedModule {}

