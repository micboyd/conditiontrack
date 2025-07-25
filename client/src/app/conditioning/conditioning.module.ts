import { ConditioningComponent } from './conditioning.component';
import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';

@NgModule({
	declarations: [ConditioningComponent],
	imports: [SharedModule],
	exports: [ConditioningComponent],
})
export class ConditioningModule {
}

