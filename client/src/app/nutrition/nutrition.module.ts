import { AppRoutingModule } from '../app-routing.module';
import { CommonModule } from '@angular/common';
import { EditMealComponent } from './meal-library/edit-meal/edit-meal.component';
import { MealLibraryComponent } from './meal-library/meal-library.component';
import { MealLibraryService } from './meal-library/meal-library.service';
import { NgModule } from '@angular/core';
import { NutritionComponent } from './nutrition.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';

@NgModule({
	declarations: [NutritionComponent, MealLibraryComponent, EditMealComponent],
	imports: [CommonModule, AppRoutingModule, ReactiveFormsModule, SharedModule],
    providers: [MealLibraryService],
	exports: [NutritionComponent],
})
export class NutritionModule {}

