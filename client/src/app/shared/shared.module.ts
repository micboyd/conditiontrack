import { AppRoutingModule } from '../app-routing.module';
import { CommonModule } from '@angular/common';
import { ContainerComponent } from './components/container/container.component';
import { FooterComponent } from './components/footer/footer.component';
import { MenuComponent } from './components/menu/menu.component';
import { NgModule } from '@angular/core';
import { SubMenuComponent } from './components/sub-menu/sub-menu.component';
import { LoadingIndicatorComponent } from './components/loading-indicator/loading-indicator.component';

@NgModule({
	declarations: [MenuComponent, ContainerComponent, FooterComponent, SubMenuComponent, LoadingIndicatorComponent],
	imports: [CommonModule, AppRoutingModule],
	exports: [MenuComponent, ContainerComponent, FooterComponent, SubMenuComponent, LoadingIndicatorComponent],
})
export class SharedModule {}

