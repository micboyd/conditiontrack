import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ContainerComponent } from './components/container/container.component';

@NgModule({
	declarations: [ContainerComponent],
	imports: [CommonModule],
	exports: [ContainerComponent],
})
export class SharedModule {}

