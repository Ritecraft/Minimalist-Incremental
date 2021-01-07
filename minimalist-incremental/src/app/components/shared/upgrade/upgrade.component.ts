import {Component, Input} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { GameStateModel } from 'src/app/models/gamestate.model';
import { Upgrade } from 'src/app/models/upgrade.model';
import { GameStateService } from 'src/app/services/gamestate.service';
import { MessagesService } from 'src/app/services/messages.service';

@Component({
    selector: 'upgrade',
    templateUrl: './upgrade.component.html',
    styleUrls: ['./upgrade.component.scss']
  })
  export class UpgradeComponent  {
 
        @Input()
        public upgrade : Upgrade = new Upgrade('','',g => {return;});

      constructor(private gameStateService : GameStateService)
      {

      }

      applyUpgrade() {
        
        this.gameStateService.applyUpgrade(this.upgrade);
      }

 
  }