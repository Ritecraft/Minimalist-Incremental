import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { EventsProvider, GameStateModel } from './models/gamestate.model';
import { GameStateService } from './services/gamestate.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  languages : string[] = ['en','pl']
  constructor(private gameStateService : GameStateService, private translateService: TranslateService)
  {

  }



uptick() {
  this.gameStateService.Tick();
}  

setLanguage(lang: string)
{
  this.translateService.use(lang);
}

ngOnInit() {
  EventsProvider.Init();
  setInterval(()=> {
    this.uptick(); },10); 
  }

}





//