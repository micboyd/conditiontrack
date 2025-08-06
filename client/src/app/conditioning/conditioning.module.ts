import { AppRoutingModule } from '../app-routing.module';
import { CommonModule } from '@angular/common';
import { ConditioningComponent } from './conditioning.component';
import { ConditioningLibraryComponent } from './conditioning-library/conditioning-library.component';
import { ConditioningLibraryService } from './conditioning-library/conditioning-library.service';
import { ConditioningRecordsComponent } from './conditioning-records/conditioning-records.component';
import { EditRecordComponent } from './conditioning-records/edit-record/edit-record.component';
import { EditSessionComponent } from './conditioning-library/edit-session/edit-session.component';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';

@NgModule({
	declarations: [ConditioningComponent, ConditioningRecordsComponent, ConditioningLibraryComponent, EditSessionComponent, EditRecordComponent],
	imports: [CommonModule, SharedModule, AppRoutingModule, ReactiveFormsModule],
    providers: [ConditioningLibraryService],
	exports: [ConditioningComponent],
})
export class ConditioningModule {
}

