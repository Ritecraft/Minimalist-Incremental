import {Component, Input} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { GameStateModel } from 'src/app/models/gamestate.model';
import { Upgrade } from 'src/app/models/upgrade.model';
import { GameStateService } from 'src/app/services/gamestate.service';
import { MessagesService } from 'src/app/services/messages.service';

@Component({
    selector: 'upgrades',
    templateUrl: './upgrades.component.html',
    styleUrls: ['./upgrades.component.scss']
  })
  export class UpgradesComponent  {
 
        @Input()
        public upgrades : Upgrade[] = [];

      constructor()
      {

      }

      trackByFn(index : number, element : Upgrade) {
          return element.id;
      }

 
  }