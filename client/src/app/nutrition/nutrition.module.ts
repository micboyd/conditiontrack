import { NgModule } from '@angular/core';
import { NutritionComponent } from './nutrition.component';
import { SharedModule } from '../shared/shared.module';
import { AppRoutingModule } from '../app-routing.module';
import { MealLibraryComponent } from './meal-library/meal-library.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { EditMealComponent } from './meal-library/edit-meal/edit-meal.component';

@NgModule({
	declarations: [NutritionComponent, MealLibraryComponent, EditMealComponent],
	imports: [CommonModule, AppRoutingModule, ReactiveFormsModule, SharedModule],
	exports: [NutritionComponent],
})
export class NutritionModule {}

