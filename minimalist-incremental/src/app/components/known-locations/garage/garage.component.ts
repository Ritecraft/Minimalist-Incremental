import {Component, Input} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { GameStateModel } from 'src/app/models/gamestate.model';
import { GameStateService } from 'src/app/services/gamestate.service';
import { MessagesService } from 'src/app/services/messages.service';

@Component({
    selector: 'garage',
    templateUrl: './garage.component.html',
    styleUrls: ['./garage.component.scss']
  })
  export class GarageComponent  {
    @Input()
    public gameState : GameStateModel = new GameStateModel();

      constructor(private gameStateService : GameStateService)
      {

      }

      buyMine() {
        this.gameStateService.BuyMine();
      }
      
      buyQuarry() {
        this.gameStateService.BuyQuarry();
      }
      
      buyTimeMachine() {
        this.gameStateService.BuyTimeMachine();
      }
      

 
  }