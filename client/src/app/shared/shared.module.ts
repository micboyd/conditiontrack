import { AppRoutingModule } from '../app-routing.module';
import { ButtonToggleComponent } from './components/button-toggle/button-toggle.component';
import { CommonModule } from '@angular/common';
import { ContainerComponent } from './components/container/container.component';
import { DatePickerComponent } from './components/date-picker/date-picker.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoadingIndicatorComponent } from './components/loading-indicator/loading-indicator.component';
import { MealFilterComponent } from './components/meal-filter/meal-filter.component';
import { MenuComponent } from './components/menu/menu.component';
import { NgModule } from '@angular/core';
import { SideDrawerComponent } from './components/side-drawer/side-drawer.component';
import { SubMenuComponent } from './components/sub-menu/sub-menu.component';
import { SelectComponent } from './components/select/select.component';

@NgModule({
	declarations: [MenuComponent, ContainerComponent, FooterComponent, SubMenuComponent, LoadingIndicatorComponent, ButtonToggleComponent, SideDrawerComponent, DatePickerComponent, SelectComponent, MealFilterComponent],
	imports: [CommonModule, AppRoutingModule],
	exports: [MenuComponent, ContainerComponent, FooterComponent, SubMenuComponent, LoadingIndicatorComponent, ButtonToggleComponent, SideDrawerComponent, DatePickerComponent, SelectComponent, MealFilterComponent],
})
export class SharedModule {}

