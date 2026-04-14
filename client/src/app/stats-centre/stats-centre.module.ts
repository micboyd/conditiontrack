import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { StatsCentreComponent } from './stats-centre.component';
import { BaseChartDirective } from 'ng2-charts';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ExerciseService } from '../strength/exercise-library/exercise.service';

@NgModule({
    declarations: [StatsCentreComponent],
    imports: [CommonModule, SharedModule, BaseChartDirective],
    providers: [ExerciseService, provideCharts(withDefaultRegisterables())],
})
export class StatsCentreModule {}
