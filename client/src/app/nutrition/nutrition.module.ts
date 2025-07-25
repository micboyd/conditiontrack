import { NgModule } from '@angular/core';
import { NutritionComponent } from './nutrition.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
	declarations: [NutritionComponent],
	imports: [SharedModule],
	exports: [NutritionComponent],
})
export class NutritionModule {
}

