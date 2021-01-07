
class UpgradeCost
{
    public name: string;
    public cost: number;
    public haveEnough: boolean;
    public constructor(name: string, cost: number, haveEnough: boolean)
    {
        this.name = name;
        this.cost = cost;
        this.haveEnough = haveEnough;
    }
}

class UpgradeRequirement
{
    public name: string;
    public value: number;
    public haveEnough: boolean;
    public constructor(name: string, value: number, haveEnough: boolean)
    {
        this.name = name;
        this.value = value;
        this.haveEnough = haveEnough;
    }
}

export class Upgrade
{
    public id: string
    public name: string;
    public description: string;
    public costs: UpgradeCost[];
    public requirements: UpgradeRequirement[];
    public haveEnough = true;
    public currentLevel = 0;
    public apply: (g: any) => void;

    public constructor(name: string, description : string, apply: (g: any) => void, currentLevel = 0)
    {
        this.name = name;
        this.description = description;
        this.apply = apply;
        this.costs = [];
        this.requirements = [];
        this.currentLevel = currentLevel;
        this.id = this.name + '_' + this.currentLevel;
    }

    public Apply(g: any)
    {
        if(!this.haveEnough) return;
        this.apply(g);
    }

    public AddCost(name: string, cost: number, current: number)
    {
        let haveEnough = current>=cost;
        this.costs.push(new UpgradeCost(name, cost, haveEnough));
        this.haveEnough &&= haveEnough;
    }

    public AddRequirement(name: string, value: number, current: number)
    {
        let haveEnough = current>=value;
        this.requirements.push(new UpgradeRequirement(name, value, haveEnough));
        this.haveEnough &&= haveEnough;
    }

}