import { Component, OnInit } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { EventsProvider, GameStateModel } from '../models/gamestate.model';
import { GameStateService } from '../services/gamestate.service';
import {MatDialog} from '@angular/material/dialog';
import { StoryComponent } from './story/story.component';
import { MessagesService } from '../services/messages.service';
import { TranslateService } from '@ngx-translate/core';
import { StringFormatter } from './format.pipe';
import { MessageModel } from '../models/message.model';
@Component({
  selector: 'game-main',
  templateUrl: './main.component.html'
})
export class MainComponent implements OnInit {

  gameState$ : Observable<GameStateModel>;
  messages$: Observable<MessageModel[]>;
  constructor(private gameStateService : GameStateService, private messagesService: MessagesService ,private translationService: TranslateService ,private dialog : MatDialog)
  {
    this.gameState$ = gameStateService.gameState$;

    this.messages$ = messagesService.messages$;
  }



uptick() {

}  


ngOnInit() {

  }


  getAdventure() {
    let message = this.gameStateService.getEvent();
  
  }

GetTitle(g: GameStateModel)
{
  if(g.timeTravel.intervalLevel > 0) {
      return  StringFormatter.TranslateAndFormat(this.translationService,"titles.timeTravel", g.timeTravel.foundedDay);
  }
  return this.translationService.instant("titles.house");
}



GetResources(g: GameStateModel)
{
  let result = [];
  result.push({name:'resources.Money', value: g.money.toFixed(2), info: g.income.toFixed(2) + '$/s'});
  if(g.bottlecaps > 0)   result.push({name:'resources.Bottlecaps', value: g.bottlecaps, info: ''});
  if(g.timeTravel.maxEntropy > 0) result.push({name: 'resources.Entropy', value: g.timeTravel.entropy.toString(), info: StringFormatter.TranslateAndFormat(this.translationService, 'infos.entropy', ((g.timeTravel.intervalLevel + 1 )%3 + 1))});
  if(g.timeTravel.maxEntropy > 0) result.push({name: 'resources.Sigils', value: g.timeTravel.getSigilCount().toString(), info: ''});
  return result;
}


GetSkills(g: GameStateModel)
{
  return [{name: 'skills.Inventing', value: g.skills.inventing.toString, info: ''},
  {name: 'skills.GettingBored', value: g.skills.boredom, info: ''},
   {name: 'skills.Adventuring', value: g.skills.adventuring, info: (g.adventure.adventuringCooldown < 5?(StringFormatter.TranslateAndFormat(this.translationService, 'infos.adventuring' ,(5 - g.adventure.adventuringCooldown))):'')},
   {name: 'skills.Drawing', value: g.skills.drawing, info: ''},
   {name: 'skills.Dreaming', value: g.skills.dreaming, info: ''}
    
  ].filter(r => r.value > 0).map(r => {return {name: r.name, value: r.value.toString(), info: r.info }});
}

GetStatuses(g : GameStateModel)
{
  let result = [{name: 'categories.Resources', values: this.GetResources(g)}, {name: 'categories.Skills', values: this.GetSkills(g)}].filter(r => r.values.length > 0);
  return result;
}



viewStory(g: GameStateModel)
{
  let dialogRef = this.dialog.open(StoryComponent, {
    height: '400px',
    width: '600px',
    data: {messages: this.gameStateService.GetStoryMessages(g, this.translationService)}
  });
  
}



}

//