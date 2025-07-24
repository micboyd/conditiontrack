import { AppRoutingModule } from '../app-routing.module';
import { CommonModule } from '@angular/common';
import { ContainerComponent } from './components/container/container.component';
import { FooterComponent } from './components/footer/footer.component';
import { MenuComponent } from './components/menu/menu.component';
import { NgModule } from '@angular/core';

@NgModule({
	declarations: [MenuComponent, ContainerComponent, FooterComponent],
	imports: [CommonModule, AppRoutingModule],
	exports: [MenuComponent, ContainerComponent, FooterComponent],
})
export class SharedModule {
}

