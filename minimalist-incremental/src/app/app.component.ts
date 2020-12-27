import { Component, OnInit } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { EventProvider, GameStateModel } from './models/gamestate.model';
import { GameStateService } from './services/gamestate.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  paradoxNames = ['Meet George Washington','Kill an ancestor','Teach Beethoven 9th symphony','Invent time travel in the past','Prevent the plague','Recause the plague','Stop Dodo extinction','Cause moskito extinction','Teach ancient greeks gene-splicing','Stop swan-people invasion','Replace Armstrong on the moon','Buy Apple stocks','Defeat the Big Fruit Mafia','Get your dad to take mom to prom','Invent time travel in the future','Befriend Honest Abe','Stop yourself from inventing time travel'];
  gameState$ : Observable<GameStateModel>;
  messages: string[];
  constructor(private gameStateService : GameStateService)
  {
    this.gameState$ = gameStateService.gameState$;
    this.messages = [];
  }



uptick() {
  this.gameStateService.Tick();
}  


ngOnInit() {
  EventProvider.Init();
  setInterval(()=> {
    this.uptick(); },10); 
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

buyParadox() {
  this.gameStateService.BuyParadox();
}

buyButterfly() {
  this.gameStateService.BuyButterfly();
}

buyCrystal() {
  this.gameStateService.BuyCrystal();
}

getAdventure() {
  let message = this.gameStateService.getEvent();
  if(message.length > 0)
  {
    this.messages.push(message);
    if(this.messages.length > 20)
    {
      this.messages.splice(0,1);
    }
  }
}

}

