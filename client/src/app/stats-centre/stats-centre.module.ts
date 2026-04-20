import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { StatsCentreComponent } from './stats-centre.component';
import { StrengthStatsComponent } from './strength-stats/strength-stats.component';
import { BodyCompositionStatsComponent } from './body-composition-stats/body-composition-stats.component';
import { CardioStatsComponent } from './cardio-stats/cardio-stats.component';
import { BaseChartDirective } from 'ng2-charts';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ExerciseService } from '../strength/exercise-library/exercise.service';
import { MeasurementsService } from '../progress/measurements/measurements.service';

@NgModule({
    declarations: [
        StatsCentreComponent,
        StrengthStatsComponent,
        BodyCompositionStatsComponent,
        CardioStatsComponent,
    ],
    imports: [CommonModule, FormsModule, RouterModule, SharedModule, BaseChartDirective],
    providers: [ExerciseService, MeasurementsService, provideCharts(withDefaultRegisterables())],
})
export class StatsCentreModule {}
