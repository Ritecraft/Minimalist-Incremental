import { Component, OnInit } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { EventsProvider, GameStateModel, SkillsProvider } from '../models/gamestate.model';
import { GameStateService } from '../services/gamestate.service';
import {MatDialog} from '@angular/material/dialog';
import { StoryComponent } from './story/story.component';
import { MessagesService } from '../services/messages.service';
import { TranslateService } from '@ngx-translate/core';
import { StringFormatter } from './shared/format.pipe';
import { MessageModel } from '../models/message.model';
import { analyzeAndValidateNgModules } from '@angular/compiler';
import { stringify } from '@angular/compiler/src/util';
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

  expandedMap : {[id: string] : boolean} = {};

uptick() {

}  

toggle(id: string)
{
  if(!this.expandedMap[id])
  {
    this.expandedMap[id] = true;
  }
  else
  {
    this.expandedMap[id] = false;
  }
}

isExpanded(id: string)
{
  if(this.expandedMap[id] === false)
  {
    return false;
  }
  if(this.expandedMap[id] === true)
  {
    return true;
  }
  this.expandedMap[id] = true;
  return this.expandedMap[id];
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
  class InnerDescription
  {
    name: string;
    value: number;
    info: string;
    public constructor(name: string, value: number, info: string)
    {
      this.name = name;
      this.value = value;
      this.info = info;
    }
  }

  class DescriptionCollection
  {
    name: string;
    descriptions: InnerDescription[];
    public constructor(name: string, descriptions: InnerDescription[])
    {
      this.name = name;
      this.descriptions = descriptions;
    }
  }

  let res : DescriptionCollection[] = [];
  var keys = Object.keys(SkillsProvider.Categories);
  for(let i = 0; i < keys.length; i++)
  {
    let res2 : InnerDescription[] = [];
  for(let j = 0; j < SkillsProvider.SkillCategories[keys[i]].length ; j++)
  {
    let key = SkillsProvider.SkillCategories[keys[i]][j];
    let value = g.skills.skillLevels[key];
    let info = '';
    if(key == SkillsProvider.Adventuring)
    {
      info = (g.adventure.adventuringCooldown < 5?(StringFormatter.TranslateAndFormat(this.translationService, 'infos.adventuring' ,(5 - g.adventure.adventuringCooldown))):'');
    }
    res2.push(new InnerDescription('skills.' + key, value, info));
  }
  res2 = res2.filter(r => r.value > 0);
  if(res2.length > 0)
  {
    res.push(new DescriptionCollection('skills.Categories.' + keys[i], res2));
  }
}

  return res;
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

trackByFn(index: number, element: any) {
  return element.name;
}



}

//