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
            let t = this.timeTravel.intervalLevel % 3 + 1;
            this.timeTravel.entropy += t,
          
            this.timeTravel.maxEntropy += t,
            this.timeTravel.entropySigils = this.fakeLog(this.timeTravel.maxEntropy)
        }
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
    public parent: GameStateModel | undefined ;

    setParent(parent : GameStateModel) 
    {
        this.parent = parent;
    }
}

class SkillsState extends BaseInnerState {
    copy(): SkillsState  {
       return new SkillsState(this.boredom,this.adventuring, this.drawing, this.inventing, this.dreaming);
    }
    boredom: number;
    adventuring: number;
    drawing: number;
    inventing: number;
    dreaming: number;

    constructor(boredom = 0,  adventuring = 0,  drawing = 0, inventing = 0, dreaming = 0) {
       super();

        this.boredom = boredom;
        this.adventuring = adventuring;
        this.drawing = drawing;
        this.inventing = inventing;
        this.dreaming = dreaming;
    }
}

class AdventureGuildState {
    canAccess : boolean;
    constructor(canAccess = false)
    {
        this.canAccess = canAccess;
    }

    copy() : AdventureGuildState {
        return new AdventureGuildState(this.canAccess);
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
        this.adventuringCooldown = 5;
       
    }

    setParent(parent : GameStateModel)
    {
        super.setParent(parent);
        this.adventuringCooldown = Math.ceil(Math.pow(0.99, parent.skills.adventuring)*5)
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
            n += e[o].weight;
        let r = n - Math.floor(n),
        s = 1;
        r > 0 && (s = 1 / r),
        n *= s;
        let i = this.randomIntFromInterval(0, n - 1);
        i.toString();
        for (let o = 0; o < e.length; o++) {
            if (i < e[o].weight * s)
            {
                if(this.parent) this.parent.skills.adventuring += 1;
                return e[o].apply(gameState), this.knownEvents[e[o].id] += 1, e[o].message;
            }
            i -= e[o].weight * s
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
    weight: number;
    isValid: any;
    apply: any;
    constructor(id : number, maxCount : number, weight : number, isValid : (g :GameStateModel) => boolean, apply : (g: GameStateModel) => void, message : string) {
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
            new EventModel(9, 1, 1000, t=> true, t => (t.skills.inventing+=1, t),"story.inventor.head"),
            new EventModel(12, 1, 100, g => g.skills.adventuring > 100, g => (g.adventure.guild.canAccess = true,g), "story.adventurer.guild"),
            new EventModel(0, 1, 2, t => !0, t => (t.eventCashLevel += 1, t), "story.events.surveys"), 
            new EventModel(8, 6, 1.2, g => true, t => (t.adventure.setReducer(1,2),t.bottlecaps+=1, t), "story.events.soda" ),
            new EventModel(10, 5, 8, g=> g.timeTravel.getSigilCount() >= 3, g => (g.skills.dreaming+=1, g), "story.events.unknownDreams"),
            new EventModel(11, 5, 4, g=> g.timeTravel.getSigilCount() >= 4 && g.skills.dreaming>=5, g => (g.skills.dreaming+=2,g.skills.adventuring+=1, g), "story.events.travelDreams"),
            new EventModel(1, 20, 6, t => !0, t => (t.money += 1, t), "story.events.coin"), 
            new EventModel(2, 1e8, 1.8, t => !0, t => (t.skills.boredom+=1,t), "story.events.nothing"),
            new EventModel(3, 1, .1, t => t.money >= 20, t => (t.eventCashLevel += 1, t.money -= 20, t), "story.events.discord"), 
            new EventModel(4, 20, .4, t => t.skills.boredom >= 5, t => (t.skills.boredom += 2, t.money += 10, t), "story.events.shift"), 
            new EventModel(5, 1, .1, t => t.skills.boredom >= 10 && t.eventCashLevel > 1, t => (t.eventCashLevel += 1, t), "story.events.cultStart"), 
            new EventModel(6, 1, 1.1, t => t.skills.boredom >= 20 && t.timeTravel.maxEntropy > 1, t => (t.timeTravel.eventSigils += 1,t.skills.drawing+=1, t), "story.events.doodleSigil"),
            new EventModel(7, 1, 2, t => t.adventure.days - t.timeTravel.foundedDay >= 365 && t.timeTravel.maxEntropy > 1 && t.money > 20, t => (t.timeTravel.eventSigils += 1, t.money -= 20, t), "story.events.paintSigil"));

    }
    static GetAllEvents() {
        return this.events
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
        this.canBuyCrystal && (this.entropy -= TimeTravelState.primeCosts[this.timeCrystalLevel], this.timeCrystalLevel += 1)
    }
    BuyParadox() {
        this.canBuyParadox && (this.entropy -= TimeTravelState.primeCosts[this.paradoxEngineLevel], this.paradoxEngineLevel += 1)
    }
    BuyButterfly() {
        this.canBuyButterfly && (this.entropy -= TimeTravelState.primeCosts[this.butterflyResonatorLevel], this.butterflyResonatorLevel += 1)
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
}