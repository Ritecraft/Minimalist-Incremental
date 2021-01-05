import {Component, Input} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { GameStateModel } from 'src/app/models/gamestate.model';
import { GameStateService } from 'src/app/services/gamestate.service';
import { MessagesService } from 'src/app/services/messages.service';

@Component({
    selector: 'time-travel-lab',
    templateUrl: './time-travel-lab.component.html',
    styleUrls: ['./time-travel-lab.component.scss']
  })
  export class TimeTravelLabComponent  {
    @Input()
    public gameState : GameStateModel = new GameStateModel();
    paradoxNames = [
        "buttons.timeTravel.paradoxes.washington",
        "buttons.timeTravel.paradoxes.ancestor",
        "buttons.timeTravel.paradoxes.beethoven",
        "buttons.timeTravel.paradoxes.pastTravel",
        "buttons.timeTravel.paradoxes.noPlague",
        "buttons.timeTravel.paradoxes.yesPlague",
        "buttons.timeTravel.paradoxes.saveDodos",
        "buttons.timeTravel.paradoxes.killMoskitos",
        "buttons.timeTravel.paradoxes.greekGenes",
        "buttons.timeTravel.paradoxes.stopSwans",
        "buttons.timeTravel.paradoxes.moonLanding",
        "buttons.timeTravel.paradoxes.apple",
        "buttons.timeTravel.paradoxes.mafia",
        "buttons.timeTravel.paradoxes.backToTheFuture",
        "buttons.timeTravel.paradoxes.futureTravel",
        "buttons.timeTravel.paradoxes.honestAbe",
        "buttons.timeTravel.paradoxes.stop"
      ];
      constructor(private gameStateService : GameStateService)
      {

      }


      
      buyParadox() {
        this.gameStateService.BuyParadox();
      }
      
      buyButterfly() {
        this.gameStateService.BuyButterfly();
      }
      
      buyCrystal() {
        this.gameStateService.BuyCrystal();
      }
      
 
  }