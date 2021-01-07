import { stringify } from "@angular/compiler/src/util";
import { Upgrade } from "./upgrade.model";
function copyMap<TVal>(arr : {[key: string] : TVal}) : {[key:string]:TVal} {
    let result : {[key: string]:TVal} = {};
    let keys = Object.keys(arr);
    keys.forEach(element => {
        result[element] = arr[element];
    });
    return result;
}

export class GameStateModel {

public money: number;
public eventCashLevel: number;
    canBuyMine = false;
    canBuyQuarry = false;
    income = 0;
    bottlecaps = 0;
    baseQuarryCost: number;
    baseMineCost: number;
    cachedCosts: {[baseCost: number] : number};
    totalTime: number;
    timeTravel: TimeTravelState;
    mineLevel: number;
    quarryLevel: number;
    adventure: AdventureState;
    skills : SkillsState;

    constructor(money = 0, timeTravel = new TimeTravelState(), mineLevel = 0, quarryLevel = 0, totalTime = 0, eventCashLevel = 0,bottlecaps = 0, adventure = new AdventureState(), skills = new SkillsState()) {
       
         this.baseQuarryCost = 2e5,
        this.baseMineCost = 2000,
       
        this.cachedCosts = {},
        this.totalTime = 0,
        this.money = money,
        this.timeTravel = timeTravel,
        this.mineLevel = mineLevel,
        this.quarryLevel = quarryLevel,
        this.totalTime = totalTime,
        this.adventure = adventure,
        this.eventCashLevel = eventCashLevel,
        this.skills = skills;
        this.bottlecaps = bottlecaps;
        this.setParent();
        this.setBuys()
    }

    setParent() {
        this.adventure.setParent(this);
        this.timeTravel.setParent(this);
        this.skills.setParent(this);
    }

    fakeLog(t: number) {
        return t.toString().length;
    }

    BuyTimeMachine() {
        if (this.timeTravel.canBuyTimeMachine) {
            if(this.timeTravel.intervalLevel == 0)
            {
                this.timeTravel.foundedDay = this.adventure.days;
            }

            this.money -= this.getTimeMachineCost(),
            this.timeTravel.intervalLevel += 1;
            this.skills.increase(SkillsProvider.Engineering, Math.ceil(this.timeTravel.intervalLevel/4));
            let t = this.timeTravel.intervalLevel % 3 + 1;
            this.timeTravel.entropy += t,
      
            this.timeTravel.maxEntropy += t,
            this.timeTravel.entropySigils = this.fakeLog(this.timeTravel.maxEntropy)
        }
    }

    BuildTimeTravelUpgrade()
    {
        let result = new Upgrade('timeTravel.intervalLevel',this.timeTravel.intervalLevel > 0? 'buttons.timeTravel.powerNode' : 'buttons.timeTravel.timeMachine', g => {(g as GameStateModel).BuyTimeMachine()}, this.timeTravel.intervalLevel)
        result.AddRequirement('skills.Inventing', 1, this.skills.getValue(SkillsProvider.Inventing));
        result.AddCost('resources.Money', this.getTimeMachineCost(), this.money);
        return result;
    }

    GetPossibleUpgrades() : Upgrade[] {
        let result : Upgrade[] = [] ;
        if(this.skills.getValue(SkillsProvider.Inventing) > 0)
         result.push(this.BuildTimeTravelUpgrade());
        return result;

        


    }

    BuyQuarry() {
        this.canBuyQuarry && (this.money -= this.getQuarryCost(), this.quarryLevel += 1)
    }
    BuyMine() {
        this.canBuyMine && (this.money -= this.getMineCost(), this.mineLevel += 1)
    }
    copy() {
        return new GameStateModel(this.money, this.timeTravel.copy(), this.mineLevel, this.quarryLevel, this.totalTime, this.eventCashLevel,this.bottlecaps, this.adventure.copy(), this.skills.copy())
    }
    getMultiplier(t: number) {
        let e = 1 + 1 / Math.sqrt(t);
        return Math.pow(.995, Math.sqrt(this.quarryLevel)) * e
    }
    getCost(baseCost: number, level: number) {
        return this.cachedCosts[baseCost] || (this.cachedCosts[baseCost] = baseCost * Math.pow(this.getMultiplier(baseCost), level)),
        this.cachedCosts[baseCost]
    }
    getQuarryCost() {
        return this.getCost(this.baseQuarryCost, this.quarryLevel)
    }
    getMineCost() {
        return this.getCost(this.baseMineCost, this.mineLevel)
    }
    getTimeMachineCost() {
        return this.getCost(this.timeTravel.baseCost, this.timeTravel.intervalLevel - (this.timeTravel.getSigilCount()))
    }
    setBuys() {
        this.canBuyMine = this.money >= this.getMineCost(),
        this.canBuyQuarry = this.money >= this.getQuarryCost(),
        this.timeTravel.setBuys(this.money >= this.getTimeMachineCost()),
        this.income = 1e3 / this.GetInterval() * this.GetMoneyDelta()
    }
    Tick(timePassed : number) {
        let e = this.GetInterval(),
        n = this.GetMoneyDelta();
        for (this.totalTime += timePassed; this.totalTime > e; )
            this.totalTime -= e, this.money += n, this.adventure.Tick()
    }
    GetInterval() {
        return this.timeTravel.GetInterval()
    }
    GetMoneyDelta() {
        return this.mineLevel > 0 ? this.mineLevel + this.eventCashLevel : this.eventCashLevel
    }
}

abstract class BaseInnerState {
    public parent!: GameStateModel; 

    setParent(parent : GameStateModel) 
    {
        this.parent = parent;
    }
}

export class SkillsProvider {
    public static GettingBored = 'GettingBored';
    public static Inventing = 'Inventing';
    public static Dreaming ='Dreaming';
    public static Adventuring = 'Adventuring';
    public static Drawing = 'Drawing';
    public static Athletics = 'Athletics';
    public static AnimalHandling = 'AnimalHandling';
    public static Geology = "Geology";
    public static Diplomacy = "Diplomacy";
    public static Combat ='Combat';
    public static Music = "Music";
    public static Finance = "Finance";
    public static History ='History';
    public static Engineering = "Engineering";
    public static Medicine = "Medicine";
    public static Biology ='Biology';
    public static Suits = 'Suits';
    public static Luck = 'Luck';
    public static Categories = {
        Esoteric: "Esoteric",
        NaturalSciences: "NaturalSciences",
        Technical: "Technical",
        Heroic: "Heroic",
        Artistic: "Artistic",
        SocialSciences: "SocialSciences"
    }

    public static Skills : string[] = SkillsProvider.GetAllSkills();

    public static GetAllSkills() : string[] 
    {
        function getProperty<T, K extends keyof T>(o: T, propertyName: K): T[K] {
            return o[propertyName]; // o[propertyName] is of type T[K]
        }

        let keys = Object.getOwnPropertyNames(SkillsProvider) as Array<keyof SkillsProvider>;;
        let obj = {...SkillsProvider};
        let result = keys.filter(

            r=> (getProperty(obj, r) + '') === (getProperty(obj,r))
        ).map(r => getProperty(obj, r));
    
        console.log(result);
        return result;
    }

    public static SkillCategories : {[id: string] : string[]} = SkillsProvider.GetSkillCategories();


    public static GetSkillCategories() {
       let result : {[id: string] : string[]} = {};
       result[SkillsProvider.Categories.Heroic] = [SkillsProvider.Adventuring, SkillsProvider.Athletics, SkillsProvider.Combat];
       result[SkillsProvider.Categories.Esoteric] = [SkillsProvider.GettingBored, SkillsProvider.Dreaming, SkillsProvider.Luck];
       result[SkillsProvider.Categories.Technical] = [SkillsProvider.Inventing, SkillsProvider.Engineering, SkillsProvider.Suits];
       result[SkillsProvider.Categories.Artistic] = [SkillsProvider.Drawing, SkillsProvider.Music];
       result[SkillsProvider.Categories.NaturalSciences] = [SkillsProvider.AnimalHandling, SkillsProvider.Geology, SkillsProvider.Biology, SkillsProvider.Medicine];
       result[SkillsProvider.Categories.SocialSciences] = [SkillsProvider.History, SkillsProvider.Finance, SkillsProvider.Diplomacy]
       return result;
    }
}

class SkillsState extends BaseInnerState {
    public skills : string[];
    public skillLevels: {[name: string] : number};   
    copy(): SkillsState  {
       return new SkillsState(copyMap(this.skillLevels));
    }

    getValue(id: string)
    {
    
        return this.skillLevels[id];
    }

    increase(id: string, delta: number)
    {
        this.skillLevels[id]+=delta;
    }

    constructor(skillLevels: {[name:string]:number} = {}) {
        super();
       this.skills = SkillsProvider.Skills;

        this.skills.forEach(element => {
            if(!skillLevels[element]) skillLevels[element] = 0;
        });
        this.skillLevels = skillLevels;
    }
}

class AdventureGuildState {
    canAccess : boolean;
    gotBike : boolean;
    constructor(canAccess = false, gotBike = false)
    {
        this.canAccess = canAccess;
        this.gotBike = gotBike;
    }

    copy() : AdventureGuildState {
        return new AdventureGuildState(this.canAccess, this.gotBike);
    }
}

class AdventureState extends BaseInnerState {
    coolDown: number;
    
    days: number;
    guild: AdventureGuildState;
    knownEvents: {[id: number]: number};
    adventuringCooldown: number;
    eventCooldownReducer: number;
    eventCooldownReducerTime: number;
   
    constructor(coolDown = 0, knownEvents = {},  days = 0,  eventCooldownReducer = 0, eventCooldownReducerTime = 0, guild = new AdventureGuildState) {
      super();
        this.coolDown = coolDown,
        this.knownEvents = knownEvents
     
        this.days = days;
        this.guild = guild;
        this.eventCooldownReducer = eventCooldownReducer;
        this.eventCooldownReducerTime = eventCooldownReducerTime;
        this.adventuringCooldown = 7;
       
    }

    setParent(parent : GameStateModel)
    {
        super.setParent(parent);
        this.adventuringCooldown = Math.ceil(Math.pow(0.99, parent.skills.getValue(SkillsProvider.Adventuring))*7)
        if(this.guild.gotBike) this.adventuringCooldown-= 1;
        if(this.adventuringCooldown < 1) this.adventuringCooldown = 1;
    }

    setReducer(value : number, time:number)
    {
        if(value > this.eventCooldownReducer) {
            this.eventCooldownReducer = value;
        }
        if(time > this.eventCooldownReducerTime) {
            this.eventCooldownReducerTime = time;
        }
    }

    copy() {
        return new AdventureState( this.coolDown, this.knownEvents, this.days,  this.eventCooldownReducer, this.eventCooldownReducerTime, this.guild.copy())
    }

    HandleCooldown()
    {
        let result = this.adventuringCooldown;
        if(this.eventCooldownReducerTime > 0)
    {
        this.eventCooldownReducerTime -= 1;
        result -= this.eventCooldownReducer;
        if(result < 0) result = 0;
        if(this.eventCooldownReducerTime == 0) this.eventCooldownReducer = 0;

    }
    return result;
    }

    randomIntFromInterval(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }
    getRandomEvent(gameState: GameStateModel) {
      
        if (this.coolDown > 0)
            return "";
        let e = EventsProvider.GetAllEvents();
        if (e = e.filter(e => this.isValid(e, gameState)), this.coolDown = this.HandleCooldown(), 0 == e.length)
            return "";
        let n = 0;
        for (let o = 0; o < e.length; o++)
        {
            if(e[o].id == 2 ) 
            {
                console.log('boring chance ' + e[o].weight(gameState) )
            }
            n += e[o].weight(gameState);
        }
        console.log('all chance ' + n);
        let r = n - Math.floor(n),
        s = 1;
        r > 0 && (s = 1 / r),
        n *= s;
        let i = this.randomIntFromInterval(0, n - 1);
        i.toString();
        for (let o = 0; o < e.length; o++) {
            if (i < e[o].weight(gameState) * s)
            {
                if(this.parent) this.parent.skills.increase(SkillsProvider.Adventuring,1);
                return e[o].apply(gameState), this.knownEvents[e[o].id] += 1, e[o].message;
            }
            i -= e[o].weight(gameState) * s
        }
        return ""
    }
    Tick() {
        this.days += 1;
        this.coolDown > 0 && (this.coolDown -= 1)
    }
    isValid(event: EventModel, gameState: GameStateModel) {
        return this.knownEvents[event.id] || (this.knownEvents[event.id] = 0),
        this.knownEvents[event.id] < event.maxCount && event.isValid(gameState)
    }
}
class EventModel {
    id: number;
    message: string;
    maxCount: number;
    weight: any;
    isValid: any;
    apply: any;
    constructor(id : number, maxCount : number, weight : (g :GameStateModel) => number, isValid : (g :GameStateModel) => boolean, apply : (g: GameStateModel) => void, message : string) {
        this.id = id,
        this.message = message,
        this.maxCount = maxCount,
        this.weight = weight,
        this.isValid = isValid,
        this.apply = apply
    }
}
export class EventsProvider {
    static events: EventModel[];
    static Init() {
        this.events = [],
        this.events.push(
            new EventModel(9, 1, g => 1000, t=> true, t => (t.skills.increase(SkillsProvider.Inventing,1), t),"story.inventor.head"),
            new EventModel(14, 1 ,g =>  g.adventure.knownEvents[8]/6, g => true, g => (g.skills.increase(SkillsProvider.Luck,5),g.adventure.setReducer(1,2),g.adventure.guild.gotBike, g), 'story.events.sodaLuck'  ),
            new EventModel(13, 1, g => 1, g => g.skills.getValue(SkillsProvider.Adventuring) > 10, g => (g.skills.increase(SkillsProvider.AnimalHandling, 1),g.skills.increase(SkillsProvider.Athletics, 1),g), "story.adventurer.cat"),
            new EventModel(12, 1, g => 100, g => g.skills.getValue(SkillsProvider.Adventuring) > 100, g => (g.adventure.guild.canAccess = true,g), "story.adventurer.guild"),
            new EventModel(0, 1,g =>  2, t => !0, t => (t.eventCashLevel += 1, t), "story.events.surveys"), 
            new EventModel(8, 6, g => 1.2, g => true, t => (t.adventure.setReducer(1,2),t.bottlecaps+=1, t), "story.events.soda" ),
            new EventModel(10, 5,g =>  8, g=> g.timeTravel.getSigilCount() >= 3, g => (g.skills.increase(SkillsProvider.Dreaming,1), g), "story.events.unknownDreams"),
            new EventModel(11, 5,g =>  4, g=> g.timeTravel.getSigilCount() >= 4 && g.skills.getValue(SkillsProvider.Dreaming)>=5, g => (g.skills.increase(SkillsProvider.Dreaming,2),g.skills.increase(SkillsProvider.Adventuring,1), g), "story.events.travelDreams"),
            new EventModel(1, 20,g =>  1, t => !0, t => (t.money += 1,t.skills.increase(SkillsProvider.Luck,5), t), "story.events.coin"), 
            new EventModel(2, 1e8,g =>  (Math.round(1800 * Math.pow(0.995, (4 * g.skills.getValue(SkillsProvider.Luck) + g.skills.getValue(SkillsProvider.Adventuring) /13)))/1000), t => !0, t => (t.skills.increase(SkillsProvider.GettingBored,1),t), "story.events.nothing"),
            new EventModel(3, 1, g => .1, t => t.money >= 20, t => (t.eventCashLevel += 1, t.money -= 20, t), "story.events.discord"), 
            new EventModel(4, 20,g =>  .4, t => t.skills.getValue(SkillsProvider.GettingBored) >= 5, t => (t.skills.increase(SkillsProvider.GettingBored,1), t.money += 10, t), "story.events.shift"), 
            new EventModel(5, 1, g => .1, t => t.skills.getValue(SkillsProvider.GettingBored) >= 10 && t.eventCashLevel > 1, t => (t.eventCashLevel += 1, t.skills.increase(SkillsProvider.Diplomacy, 1), t), "story.events.cultStart"), 
            new EventModel(6, 1, g => 1.1, t => t.skills.getValue(SkillsProvider.GettingBored) >= 20 && t.timeTravel.maxEntropy > 1, t => (t.timeTravel.eventSigils += 1,t.skills.increase(SkillsProvider.Drawing,1), t), "story.events.doodleSigil"),
            new EventModel(7, 1, g => 2, t => t.adventure.days - t.timeTravel.foundedDay >= 365 && t.timeTravel.maxEntropy > 1 && t.money > 20, t => (t.timeTravel.eventSigils += 1, t.money -= 20, t), "story.events.paintSigil"));

    }
    static GetAllEvents() {
        return this.events
    }
}

class SkillValue {
    name: string;
    value: number;
    /**
     *
     */
    constructor(name: string, value:number) {
        this.name = name;
        this.value = value;
        
    }
}

class ParadoxDescription
{
    name: string;
    requirements: SkillValue[];
    gains: SkillValue[];
    constructor(name: string, requirements: SkillValue[], gains: SkillValue[])
    {
        this.name = name;
        this.requirements = requirements;
        this.gains = gains;
    }
}

class TimeTravelState extends BaseInnerState {
    static primeCosts = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 1000000001];
    cachedDilation: number;
    intervalLevel: number;
    entropy: number;
    timeCrystalLevel: number;
    paradoxEngineLevel: number;
    butterflyResonatorLevel: number;
    interval: number;
    maxEntropy: number;
    entropySigils: number;
    baseCost: number;
    canBuyTimeMachine: boolean;
    canBuyCrystal: boolean;
    canBuyButterfly: boolean;
    canBuyParadox: boolean;
    eventSigils: number;
    foundedDay: number;
    constructor(intervalLevel = 0, butterflyResonatorLevel = 0, paradoxEngineLevel = 0, timeCrystalLevel = 0, entropy = 0, entropySigils = 0, maxEntropy = 0, eventSigils = 0, foundedDay = 0) {
        super();
        this.intervalLevel = 0,
        this.entropy = 0,
        this.timeCrystalLevel = 0,
        this.paradoxEngineLevel = 0,
        this.butterflyResonatorLevel = 0,
        this.interval = 1e3,
        this.maxEntropy = 0,
        this.entropySigils = 0,
        this.baseCost = 20,
        this.canBuyTimeMachine = false,
        this.canBuyCrystal = false,
        this.canBuyButterfly = false,
        this.canBuyParadox = false,
        this.cachedDilation = 0,
        this.entropy = entropy,
        this.maxEntropy = maxEntropy,
        this.entropySigils = entropySigils,
        this.timeCrystalLevel = timeCrystalLevel,
        this.paradoxEngineLevel = paradoxEngineLevel,
        this.butterflyResonatorLevel = butterflyResonatorLevel,
        this.intervalLevel = intervalLevel
        this.eventSigils = eventSigils;
        this.foundedDay = foundedDay;
    }
    copy() {
        return new TimeTravelState(this.intervalLevel, this.butterflyResonatorLevel, this.paradoxEngineLevel, this.timeCrystalLevel, this.entropy, this.entropySigils, this.maxEntropy, this.eventSigils, this.foundedDay)
    }
    BuyTimeCrystal() {
        this.canBuyCrystal && (this.entropy -= TimeTravelState.primeCosts[this.timeCrystalLevel],this.parent.skills.increase(SkillsProvider.Geology, this.timeCrystalLevel+1) ,this.timeCrystalLevel += 1);
    }

    levelSkillsFromParadox()
    {
        for(let i = 0; i < TimeTravelState.paradoxes[this.paradoxEngineLevel].gains.length; i++)
        {
            let skill = TimeTravelState.paradoxes[this.paradoxEngineLevel].gains[i];
            this.parent.skills.increase(skill.name, skill.value);
        }
    }

    BuyParadox() {
        this.canBuyParadox && (this.entropy -= TimeTravelState.primeCosts[this.paradoxEngineLevel],this.levelSkillsFromParadox(),  this.paradoxEngineLevel += 1)
    }
    BuyButterfly() {
        this.canBuyButterfly && (this.entropy -= TimeTravelState.primeCosts[this.butterflyResonatorLevel], this.butterflyResonatorLevel += 1,this.parent?.skills.increase(SkillsProvider.AnimalHandling, this.butterflyResonatorLevel))
    }
    GetTimeDilation() {
        if (this.cachedDilation > 0)
            return this.cachedDilation;
        let t = .005,
        e = .995,
        n = e - t * (this.butterflyResonatorLevel + this.getSigilCount()),
        r = 0;
        for (; n < t; )
            r += e / t - (this.butterflyResonatorLevel + this.getSigilCount() + r), e = t, t /= 10, n = e - t * (this.butterflyResonatorLevel + this.getSigilCount());
        return this.cachedDilation = n,
        n
    }
    GetInterval() {
        return (this.interval - (this.timeCrystalLevel + this.getSigilCount())) * Math.pow(this.GetTimeDilation(), this.intervalLevel + this.paradoxEngineLevel + this.getSigilCount())
    }
    setBuys(canBuy : boolean) {
        this.canBuyTimeMachine = canBuy,
        this.canBuyCrystal = this.intervalLevel > 1 && this.entropy >= TimeTravelState.primeCosts[this.timeCrystalLevel],
        this.canBuyButterfly = this.intervalLevel > 1 && this.entropy >= TimeTravelState.primeCosts[this.butterflyResonatorLevel],
        this.canBuyParadox = this.intervalLevel > 1 && this.entropy >= TimeTravelState.primeCosts[this.paradoxEngineLevel]
    }

    getSigilCount()
    {
        return this.eventSigils + this.entropySigils;
    }

  

    static paradoxes = [
        new ParadoxDescription("buttons.timeTravel.paradoxes.washington", [new SkillValue(SkillsProvider.Diplomacy, 0)], [new SkillValue(SkillsProvider.Diplomacy, 1)]),
        new ParadoxDescription("buttons.timeTravel.paradoxes.ancestor", [new SkillValue(SkillsProvider.Combat, 10)], [new SkillValue(SkillsProvider.Combat, 2)]),
        new ParadoxDescription("buttons.timeTravel.paradoxes.beethoven", [new SkillValue(SkillsProvider.Music, 20)], [new SkillValue(SkillsProvider.Music, 3)]),
        new ParadoxDescription("buttons.timeTravel.paradoxes.pastTravel", [new SkillValue(SkillsProvider.Engineering, 15), new SkillValue(SkillsProvider.History, 15)], [new SkillValue(SkillsProvider.Engineering, 2), new SkillValue(SkillsProvider.History, 2)]),
        new ParadoxDescription("buttons.timeTravel.paradoxes.noPlague", [new SkillValue(SkillsProvider.Biology, 20), new SkillValue(SkillsProvider.Medicine, 20)], [new SkillValue(SkillsProvider.Medicine, 3), new SkillValue(SkillsProvider.Biology, 2)]),
        new ParadoxDescription("buttons.timeTravel.paradoxes.yesPlague", [new SkillValue(SkillsProvider.Biology, 25), new SkillValue(SkillsProvider.Medicine, 25)], [new SkillValue(SkillsProvider.Medicine, 2), new SkillValue(SkillsProvider.Biology, 4)]),
        new ParadoxDescription("buttons.timeTravel.paradoxes.saveDodos", [new SkillValue(SkillsProvider.Biology, 30), new SkillValue(SkillsProvider.Combat, 30)], [new SkillValue(SkillsProvider.Combat, 3), new SkillValue(SkillsProvider.Biology, 4)]),
        new ParadoxDescription("buttons.timeTravel.paradoxes.killMoskitos", [new SkillValue(SkillsProvider.Biology, 35), new SkillValue(SkillsProvider.Combat, 35)], [new SkillValue(SkillsProvider.Combat, 5), new SkillValue(SkillsProvider.Biology,3)]),
        new ParadoxDescription("buttons.timeTravel.paradoxes.greekGenes", [new SkillValue(SkillsProvider.Biology, 50), new SkillValue(SkillsProvider.History, 30)], [new SkillValue(SkillsProvider.Biology, 6), new SkillValue(SkillsProvider.History, 3)]),
        new ParadoxDescription("buttons.timeTravel.paradoxes.stopSwans", [new SkillValue(SkillsProvider.Diplomacy, 45), new SkillValue(SkillsProvider.Combat, 45)], [new SkillValue(SkillsProvider.Diplomacy, 5), new SkillValue(SkillsProvider.Combat, 5)]),
        new ParadoxDescription("buttons.timeTravel.paradoxes.moonLanding", [new SkillValue(SkillsProvider.Engineering, 30), new SkillValue(SkillsProvider.Athletics, 35), new SkillValue(SkillsProvider.Suits, 35)], [new SkillValue(SkillsProvider.Engineering, 1), new SkillValue(SkillsProvider.Athletics,4), new SkillValue(SkillsProvider.Suits, 4)]),
        new ParadoxDescription("buttons.timeTravel.paradoxes.apple", [new SkillValue(SkillsProvider.History, 30), new SkillValue(SkillsProvider.Finance, 80)], [new SkillValue(SkillsProvider.History, 3), new SkillValue(SkillsProvider.Finance, 9)]),
        new ParadoxDescription("buttons.timeTravel.paradoxes.mafia", [new SkillValue(SkillsProvider.Finance, 60), new SkillValue(SkillsProvider.Diplomacy, 60)], [new SkillValue(SkillsProvider.Diplomacy, 13)]),
        new ParadoxDescription("buttons.timeTravel.paradoxes.backToTheFuture", [new SkillValue(SkillsProvider.Diplomacy, 80), new SkillValue(SkillsProvider.Music, 50)], [new SkillValue(SkillsProvider.Music, 14)]),
        new ParadoxDescription("buttons.timeTravel.paradoxes.futureTravel", [new SkillValue(SkillsProvider.Engineering, 140)], [new SkillValue(SkillsProvider.Engineering, 15)]),
        new ParadoxDescription("buttons.timeTravel.paradoxes.honestAbe", [new SkillValue(SkillsProvider.Diplomacy, 85), new SkillValue(SkillsProvider.History, 65)], [new SkillValue(SkillsProvider.History, 8), new SkillValue(SkillsProvider.Diplomacy,8)]),
        new ParadoxDescription("buttons.timeTravel.paradoxes.stop", [new SkillValue(SkillsProvider.History, 2000), new SkillValue(SkillsProvider.Combat, 2000)], [new SkillValue(SkillsProvider.Combat, 1)]),

      ];

      BuildCrystalUpgrade()
    {
        let result = new Upgrade('timeTravel.crystals', 'buttons.timeTravel.timeCrystal', g => {(g as GameStateModel).timeTravel.BuyTimeCrystal()}, this.timeCrystalLevel)
        result.AddRequirement('skills.' + SkillsProvider.AnimalHandling, (this.timeCrystalLevel)*10, this.parent.skills.getValue(SkillsProvider.Geology) );
        result.AddCost('resources.Entropy',  TimeTravelState.primeCosts[this.timeCrystalLevel],  this.entropy);
        return result;
    }

    BuildButterflyUpgrade()
    {
        let result = new Upgrade('timeTravel.butterfly', 'buttons.timeTravel.butterfly', g => {(g as GameStateModel).timeTravel.BuyButterfly()}, this.butterflyResonatorLevel)
        result.AddCost('resources.Entropy',  TimeTravelState.primeCosts[this.butterflyResonatorLevel],  this.entropy);
        result.AddRequirement('skills.' + SkillsProvider.AnimalHandling, (this.butterflyResonatorLevel)*10, this.parent.skills.getValue(SkillsProvider.AnimalHandling) );
        return result;
    }

    BuildParadoxUpgrade()
    {
        let result = new Upgrade('timeTravel.paradox', TimeTravelState.paradoxes[this.paradoxEngineLevel].name , g => {(g as GameStateModel).timeTravel.BuyParadox()}, this.paradoxEngineLevel)
        result.AddCost('resources.Entropy',  TimeTravelState.primeCosts[this.paradoxEngineLevel],  this.entropy);
        for(let i = 0; i < TimeTravelState.paradoxes[this.paradoxEngineLevel].requirements.length; i++)
        {
            let skill = TimeTravelState.paradoxes[this.paradoxEngineLevel].requirements[i];
            result.AddRequirement('skills.' + skill.name, skill.value, this.parent.skills.getValue(skill.name) );
        }
        return result;
    }


    GetPossibleUpgrades() : Upgrade[] {
        let result : Upgrade[] = [] ;
        if(this.intervalLevel > 1)
        {
         result.push(this.BuildCrystalUpgrade());
         result.push(this.BuildButterflyUpgrade());
         result.push(this.BuildParadoxUpgrade());
        }
        return result;

        
    }
}