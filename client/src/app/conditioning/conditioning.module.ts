import { ConditioningComponent } from './conditioning.component';
import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { ConditioningRecordsComponent } from './conditioning-records/conditioning-records.component';
import { ConditioningLibraryComponent } from './conditioning-library/conditioning-library.component';
import { EditSessionComponent } from './conditioning-library/edit-session/edit-session.component';
import { EditRecordComponent } from './conditioning-records/edit-record/edit-record.component';

@NgModule({
	declarations: [ConditioningComponent, ConditioningRecordsComponent, ConditioningLibraryComponent, EditSessionComponent, EditRecordComponent],
	imports: [SharedModule],
	exports: [ConditioningComponent],
})
export class ConditioningModule {
}

