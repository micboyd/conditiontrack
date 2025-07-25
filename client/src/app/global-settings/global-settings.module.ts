import { GlobalSettingsComponent } from './global-settings.component';
import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';

@NgModule({
    declarations: [GlobalSettingsComponent],
    imports: [SharedModule],
    exports: [],
})
export class GlobalSettingsModule {
}

