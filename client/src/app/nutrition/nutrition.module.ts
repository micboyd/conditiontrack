import { AppRoutingModule } from '../app-routing.module';
import { CommonModule } from '@angular/common';
import { EditMealComponent } from './meal-library/edit-meal/edit-meal.component';
import { FormsModule } from '@angular/forms';
import { MealLibraryComponent } from './meal-library/meal-library.component';
import { MealLibraryService } from './meal-library/meal-library.service';
import { MealPlansComponent } from './meal-plans/meal-plans.component';
import { MealPlansService } from './meal-plans/meal-plans.service';
import { NgModule } from '@angular/core';
import { NutritionComponent } from './nutrition.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';

@NgModule({
	declarations: [NutritionComponent, MealLibraryComponent, EditMealComponent, MealPlansComponent],
	imports: [CommonModule, AppRoutingModule, ReactiveFormsModule, FormsModule, SharedModule],
	providers: [MealLibraryService, MealPlansService],
	exports: [NutritionComponent],
})
export class NutritionModule {}
