import { AppRoutingModule } from '../app-routing.module';
import { ButtonToggleComponent } from './components/button-toggle/button-toggle.component';
import { CommonModule } from '@angular/common';
import { ContainerComponent } from './components/container/container.component';
import { DataTableComponent } from './components/data-table/data-table.component';
import { DatePickerComponent } from './components/date-picker/date-picker.component';
import { EditRecordComponent } from '../conditioning/conditioning-records/edit-record/edit-record.component';
import { EditWorkoutRecordsComponent } from '../strength/workout-records/edit-workout-records/edit-workout-record.component';
import { EmptyStateComponent } from './components/empty-state/empty-state.component';
import { FooterComponent } from './components/footer/footer.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoadingIndicatorComponent } from './components/loading-indicator/loading-indicator.component';
import { MealFilterComponent } from './components/meal-filter/meal-filter.component';
import { MenuComponent } from './components/menu/menu.component';
import { NgModule } from '@angular/core';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { RowActionsComponent } from './components/row-actions/row-actions.component';
import { SegmentedControlComponent } from './components/segmented-control/segmented-control.component';
import { SessionDetailComponent } from './components/session-detail/session-detail.component';
import { SideDrawerComponent } from './components/side-drawer/side-drawer.component';
import { StatTileComponent } from './components/stat-tile/stat-tile.component';
import { SubMenuComponent } from './components/sub-menu/sub-menu.component';
import { SelectComponent } from './components/select/select.component';

@NgModule({
	declarations: [
		MenuComponent, ContainerComponent, FooterComponent, SubMenuComponent,
		LoadingIndicatorComponent, ButtonToggleComponent, SideDrawerComponent,
		DatePickerComponent, SelectComponent, MealFilterComponent,
		EditWorkoutRecordsComponent, EditRecordComponent,
		PageHeaderComponent, EmptyStateComponent, StatTileComponent, SegmentedControlComponent,
		DataTableComponent, RowActionsComponent, SessionDetailComponent,
	],
	imports: [CommonModule, AppRoutingModule, FormsModule, ReactiveFormsModule],
	exports: [
		MenuComponent, ContainerComponent, FooterComponent, SubMenuComponent,
		LoadingIndicatorComponent, ButtonToggleComponent, SideDrawerComponent,
		DatePickerComponent, SelectComponent, MealFilterComponent,
		EditWorkoutRecordsComponent, EditRecordComponent,
		PageHeaderComponent, EmptyStateComponent, StatTileComponent, SegmentedControlComponent,
		DataTableComponent, RowActionsComponent, SessionDetailComponent,
	],
})
export class SharedModule {}

