import {Component, Input} from '@angular/core';
import { GameStateModel } from 'src/app/models/gamestate.model';

@Component({
    selector: 'known-locations',
    templateUrl: './known-locations.component.html',
    styleUrls: ['./known-locations.component.scss']
  })
  export class KnownLocationsComponent  {
    @Input()
    public gameState : GameStateModel = new GameStateModel();

  }