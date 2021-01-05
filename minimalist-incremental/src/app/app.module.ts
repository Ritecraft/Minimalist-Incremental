import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {HttpClientModule, HttpClient} from '@angular/common/http';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GameStateService } from './services/gamestate.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatButtonModule} from '@angular/material/button'
import {MatCardModule} from '@angular/material/card'
import { StoryComponent } from './components/story/story.component';
import { MatDialogModule } from '@angular/material/dialog';
import {MatTabsModule} from '@angular/material/tabs'
import { MessagesService } from './services/messages.service';
import {MatSelectModule} from '@angular/material/select';
import { MainComponent } from './components/main.component';
import { StringFormatPipe } from './components/format.pipe';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatMenuModule} from '@angular/material/menu';
import { KnownLocationsComponent } from './components/known-locations/known-locations.component';
import { GarageComponent } from './components/known-locations/garage/garage.component';
import { TimeTravelLabComponent } from './components/known-locations/time-travel-lab/time-travel-lab.component';
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
@NgModule({
  declarations: [
    AppComponent,
    StoryComponent,
    MainComponent,
    StringFormatPipe,
    KnownLocationsComponent,
    GarageComponent,
    TimeTravelLabComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatTabsModule,
    MatSelectModule,
    MatToolbarModule,
    HttpClientModule,
    MatMenuModule,
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
    }
  })
  ],
  providers: [
    GameStateService,
    MessagesService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
