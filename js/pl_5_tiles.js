class Box {
    constructor(capacity = 0, 
                outputDirections = [],
                delay = Number.MAX_SAFE_INTEGER, 
                rotation = 0,
                operationCost = 0,
                purchaseCost = 0) {
        for (var key in outputDirections) {
            if (!directions.includes(outputDirections[key])) throw "Invalid output direction!";
        }
        if (!rotations.includes(rotation)) throw "Invalid rotation!";

        this.capacity = capacity;

        this.outputDirections = outputDirections;

        this.delay = delay;
        this.delayOffset = 0;

        this.rotation = rotation;

        this.operationCost = operationCost;
        this.purchaseCost = purchaseCost;

        this.producedCount = 0;
        this.previousInventorySize = 0;
        this.buffer = [];
        this.inventory = [];
        this.hasTicked = false;
    }

    get capacity() {
        return this._capacity;
    }

    set capacity(capacity) {
        if (capacity < 0) throw "Invalid capacity!";
        this._capacity = capacity;
    }

    get delay() {
        return this._delay;
    }

    set delay(delay) {
        if (delay < 1) throw "Invalid delay!";
        this._delay = delay;
        this.delayOffset = this.delayOffset;
    }

    get delayOffset() {
        return this._delayOffset;
    }

    set delayOffset(delayOffset) {
        this._delayOffset = delayOffset % this.delay;
    }

    get rotation() {
        return this._rotation;
    }

    set rotation(rotation) {
        if (!rotations.includes(rotation)) throw "Invalid rotation!";
        this._rotation = rotation;
    }

    processBuffer() {
        this.inventory = this.inventory.concat(this.buffer);
        this.buffer = [];
        this.previousInventorySize = this.inventory.length;
    }

    getInventorySize() {
        return this.inventory.length;
    }

    getInventorySprite() {
        var imageName = this.inventory[this.inventory.length - 1].name;
        if (!images.hasOwnProperty(imageName)) {
            images[imageName] = new Image();
            images[imageName].src = "img/items/" + imageName + ".png";
        }
        var image = images[imageName];
        image.style.opacity = "0.55";
        return image;
    }
    
    consume(items) {
        var spaceRemaining = Math.min(this.capacity - this.buffer.length - this.getInventorySize(), items.length);
        for (var i = 0; i < spaceRemaining; i++) {
            this.buffer.push(items[i]);
        }
        return spaceRemaining;
    }

    getNextOutputDirection() {
        if (this.outputDirections.length == 0) return [];

        return resolveRotation(this.outputDirections[0], this.rotation);
    }

    getNextOutput() {
        if (this.hasTicked || this.outputDirections.length == 0) return [];
        return this.inventory.slice();
    }

    produce(itemCount) {
        if (this.hasTicked) return;
        
        this.producedCount = itemCount;
        this.hasTicked = true;

        for (var i = 0; i < this.producedCount; i++) {
            this.inventory.shift();
        }
    }
}

class Empty_0 extends Box {
    constructor() {
        super();
    }
}

class RecipeBox extends Box {
    constructor(capacity = Number.MAX_SAFE_INTEGER, 
                outputDirections = [],
                delay = Number.MAX_SAFE_INTEGER, 
                rotation = 0,
                operationCost = 0,
                purchaseCost = 0,
                recipe = null) {
        if (outputDirections.length !== 1) throw "RecipeBox must have exactly 1 output!";
        super (capacity, outputDirections, delay, rotation, operationCost, purchaseCost);
        
        this.storedItems = [];
        this.inventory = {};

        this.validRecipes = [];
        this.recipe = recipe;
    }

    get recipe() {
        return this._recipe;
    }

    set recipe(recipe) {
        if (recipe === undefined || 
            (recipe != null && !this.validRecipes.includes(recipe.result))) throw "Invalid recipe!";
        this._recipe = recipe;
    }

    processBuffer() {
        for (var i = 0; i < this.buffer.length; i++) {
            if (!this.inventory.hasOwnProperty(this.buffer[i].name)) {
                this.inventory[this.buffer[i].name] = 0;
            }
            if (this.inventory[this.buffer[i].name] === 0) this.storedItems.push(this.buffer[i].name);

            this.inventory[this.buffer[i].name]++;
        }
        this.buffer = [];

        this.previousInventorySize = 0;
        for (var i = 0; i < this.storedItems.length; i++) {
            this.previousInventorySize += this.inventory[this.storedItems[i]];
        }
    }

    getInventorySize() {
        var size = 0;
        for (var i = 0; i < this.storedItems.length; i++) {
            size += this.inventory[this.storedItems[i]];
        }
        return size;
    }

    getInventorySprite() {
        var imageName = this.storedItems[this.storedItems.length - 1];
        if (!images.hasOwnProperty(imageName)) {
            images[imageName] = new Image();
            images[imageName].src = "img/items/" + imageName + ".png";
        }
        var image = images[imageName];
        return image;
    }

    hasRequiredItems() {
        for (var ingredient in this.recipe.ingredients) {
            if (!this.recipe.ingredients.hasOwnProperty(ingredient)) continue;
            if (!this.inventory.hasOwnProperty(ingredient)) return false;
            if (this.inventory[ingredient] < this.recipe.ingredients[ingredient]) return false;
        }
        return true;
    }

    getNextOutput() {
        if (this.hasTicked || this.recipe == null) return [];
        if (!this.hasRequiredItems()) return [];
        return [ItemFactory(this.recipe.result)];
    }

    produce() {
        if (this.hasTicked) return;

        var output = this.getNextOutput();
        
        this.producedCount = output.length;
        this.hasTicked = true;
        if (output.length == 0) return;

        for (var ingredient in this.recipe.ingredients) {
            if (!this.recipe.ingredients.hasOwnProperty(ingredient)) continue;
            
            this.inventory[ingredient] -= this.recipe.ingredients[ingredient];
            if (this.inventory[ingredient] === 0) {
                var index = this.storedItems.indexOf(ingredient);
                if (index !== -1) this.storedItems.splice(index, 1);
            }
        }
    }
}

class MultiBox extends Box {
    constructor(capacity = 0, 
                outputDirections = [], 
                outputDirectionCounts = [], 
                outputDirectionFilters = [], 
                delay = Number.MAX_SAFE_INTEGER, 
                rotation = 0,
                operationCost = 0,
                purchaseCost = 0) {
        if (outputDirectionCounts.length != outputDirections.length) throw "Invalid output count size!";
        if (outputDirectionFilters.length != outputDirections.length) throw "Invalid output filters size!";

        super(capacity, outputDirections, delay, rotation, operationCost, purchaseCost);

        this.outputDirectionCounts = outputDirectionCounts;
        this.outputDirectionPointer = 0;

        this.outputDirectionFilters = outputDirectionFilters;
    }

    buildOutputDirectionMap() {
        var outputDirectionMap = [];
        var directions = this.outputDirections;
        var ignoreCount = this.outputDirectionPointer;
        for (var i = 0; i < directions.length; i++) {
            for (var j = 0; j < this.outputDirectionCounts[i]; j++) {
                outputDirectionMap.push(resolveRotation(directions[i], this.rotation));
            }
        }
        for (var i = 0; i < ignoreCount; i++) {
            outputDirectionMap.push(outputDirectionMap.shift());
        }
        return outputDirectionMap;
    }

    getNextOutputDirection() {
        return this.buildOutputDirectionMap()[0];
    }

    getNextOutput() {
        var i = 0;
        var nextOutputDirection = this.getNextOutputDirection();
        var outputDirectionMap = this.buildOutputDirectionMap();
        while (outputDirectionMap[0] == nextOutputDirection && i < outputDirectionMap.length) {
            i++;
            outputDirectionMap.push(outputDirectionMap.shift());
        }
        return this.inventory.slice(0, i);
    }

    produce(itemCount) {
        if (this.hasTicked) return;

        this.producedCount += itemCount;
        
        var nextOutput = this.getNextOutput();
        var outputDirectionMap = this.buildOutputDirectionMap();

        if (itemCount < nextOutput.length) this.hasTicked = true;
        
        for (var i = 0; i < itemCount; i++) {
            this.inventory.shift();
            this.outputDirectionPointer = (this.outputDirectionPointer + 1) % outputDirectionMap.length;
        }
    }
}

class Importer_0 extends RecipeBox {
    constructor(recipe = null) {
        super(0, ["n"], 4, 0, 5, 3000);

        this.validRecipes = ["Aluminium", "Coal", "Copper", "Gold", "Iron", "Lead", "Silver", "Tin", "Zinc"];
        this.recipe = recipe;
    }
}

class Importer_1 extends Importer_0 {
    constructor(recipe = null) {
        super(recipe);

        this.delay = 2;
        this.purchaseCost = 30000;
        this.operationCost = 10;
    }
}

class Importer_2 extends Importer_1 {
    constructor(recipe = null) {
        super(recipe);

        this.purchaseCost = 300000;
    }

    getNextOutput() {
        if (this.hasTicked || this.recipe == null) return [];
        if (!this.hasRequiredItems()) return [];
        var output = ItemFactory(this.recipe.result);
        return [output, output];
    }
}

class Importer_3 extends Importer_2 {
    constructor(recipe = null) {
        super(recipe);

        this.purchaseCost = 3000000;
        this.operationCost = 0;
    }

    getNextOutput() {
        if (this.hasTicked || this.recipe == null) return [];
        if (!this.hasRequiredItems()) return [];
        var output = ItemFactory(this.recipe.result);
        return [output, output, output];
    }
}

class Importer_4 extends Importer_3 {
    constructor(recipe = null) {
        super(recipe);

        this.purchaseCost = 30000000;
    }

    getNextOutput() {
        if (this.hasTicked || this.recipe == null) return [];
        if (!this.hasRequiredItems()) return [];
        var output = ItemFactory(this.recipe.result);
        return [output, output, output, output, output];
    }
}

class Importer_5 extends Importer_4 {
    constructor(recipe = null) {
        super(recipe);

        this.purchaseCost = 300000000;
        this.delay = 1;
    }

    getNextOutput() {
        if (this.hasTicked || this.recipe == null) return [];
        if (!this.hasRequiredItems()) return [];
        var output = ItemFactory(this.recipe.result);
        return [output, output, output, output, output, output, output, output];
    }
}

class Exporter_0 extends Box {
    constructor() {
        super(Number.MAX_SAFE_INTEGER, [], Number.MAX_SAFE_INTEGER, 0, 0, 10000);

        this.multiplier = 1;
    }

    consume(items) {
        return items.length;
    }
}

class Exporter_1 extends Exporter_0 {
    constructor() {
        super();

        this.purchaseCost = 100000;
        this.multiplier = 2;
    }
}

class Exporter_2 extends Exporter_1 {
    constructor() {
        super();

        this.purchaseCost = 1000000;
        this.multiplier = 4;
    }
}

class Exporter_3 extends Exporter_2 {
    constructor() {
        super();

        this.purchaseCost = 10000000;
        this.multiplier = 10;
    }
}

class Exporter_4 extends Exporter_3 {
    constructor() {
        super();

        this.purchaseCost = 100000000;
        this.multiplier = 20;
    }
}

class Exporter_5 extends Exporter_4 {
    constructor() {
        super();

        this.purchaseCost = 1000000000;
        this.multiplier = 100;
    }
}

class Conveyor_0 extends Box {
    constructor() {
        super(1, ["n"], 1, 0, 1, 500);
    }
}

class Conveyor_1 extends Conveyor_0 {
    constructor() {
        super();

        this.capacity = 2;
        this.purchaseCost = 1000;
        this.operationCost = 2;
    }
}

class Conveyor_2 extends Conveyor_1 {
    constructor() {
        super();

        this.capacity = 4;
        this.purchaseCost = 2000;
    }
}

class Conveyor_3 extends Conveyor_2 {
    constructor() {
        super();

        this.capacity = 10;
        this.purchaseCost = 5000;
        this.operationCost = 0;
    }
}

class Conveyor_4 extends Conveyor_3 {
    constructor() {
        super();

        this.capacity = 20;
        this.purchaseCost = 10000;
    }
}

class Conveyor_5 extends Conveyor_4 {
    constructor() {
        super();

        this.capacity = 100;
        this.purchaseCost = 20000;
    }
}

class Splitter_0 extends MultiBox {
    constructor() {
        super(1, ["n", "s"], [1, 1], [[], []], 1, 0, 5, 50000);
    }

    produce(itemCount) {
        if (this.hasTicked) return [];
        
        this.producedCount = itemCount;
        this.hasTicked = true;

        for (var i = 0; i < this.producedCount; i++) {
            this.inventory.shift();
        }

        if (itemCount > 0) this.outputDirectionPointer = (this.outputDirectionPointer + 1) % this.outputDirections.length;
    }
}

class Splitter_1 extends Splitter_0 {
    constructor() {
        super();

        this.capacity = 2;
        this.purchaseCost = 100000;
        this.operationCost = 10;
    }
}

class Splitter_2 extends Splitter_1 {
    constructor() {
        super();

        this.capacity = 4;
        this.purchaseCost = 200000;
    }
}

class Splitter_3 extends Splitter_2 {
    constructor() {
        super();

        this.capacity = 10;
        this.purchaseCost = 500000;
        this.operationCost = 0;
    }
}

class Splitter_4 extends Splitter_3 {
    constructor() {
        super();

        this.capacity = 20;
        this.purchaseCost = 1000000;
    }
}

class Splitter_5 extends Splitter_4 {
    constructor() {
        super();

        this.capacity = 100;
        this.purchaseCost = 2000000;
    }
}

class Furnace_0 extends RecipeBox {
    constructor(recipe = null) {
        super(Number.MAX_SAFE_INTEGER, ["n"], 10, 0, 5, 90000);

        this.validRecipes = ["Brass", "Bronze", "Electrum", "Solder", "Steel"];
        this.recipe = recipe;
    }
}

class Furnace_1 extends Furnace_0 {
    constructor(recipe = null) {
        super(recipe);

        this.delay = 8;
        this.operationCost = 6;
        this.purchaseCost = 180000;
    }
}

class Furnace_2 extends Furnace_1 {
    constructor(recipe = null) {
        super(recipe);

        this.delay = 6;
        this.operationCost = 8;
        this.purchaseCost = 360000;
    }
}

class Furnace_3 extends Furnace_2 {
    constructor(recipe = null) {
        super(recipe);

        this.delay = 4;
        this.operationCost = 12;
        this.purchaseCost = 720000;
    }
}

class Furnace_4 extends Furnace_3 {
    constructor(recipe = null) {
        super(recipe);

        this.delay = 2;
        this.operationCost = 25;
        this.purchaseCost = 1500000;
    }
}

class Furnace_5 extends Furnace_4 {
    constructor(recipe = null) {
        super(recipe);

        this.delay = 1;
        this.operationCost = 50;
        this.purchaseCost = 5000000;
    }
}

class Assembler_0 extends RecipeBox {
    constructor(recipe = null) {
        super(Number.MAX_SAFE_INTEGER, ["n"], 10, 0, 5, 10000);

        this.validRecipes = ["Chip"];
        this.recipe = recipe;
    }
}

class Assembler_1 extends Assembler_0 {
    constructor(recipe = null) {
        super(recipe);

        this.delay = 8;
        this.operationCost = 6;
        this.purchaseCost = 100000;
    }
}

class Assembler_2 extends Assembler_1 {
    constructor(recipe = null) {
        super(recipe);

        this.delay = 6;
        this.operationCost = 8;
        this.purchaseCost = 1000000;
    }
}

class Assembler_3 extends Assembler_2 {
    constructor(recipe = null) {
        super(recipe);

        this.delay = 4;
        this.operationCost = 12;
        this.purchaseCost = 10000000;
    }
}

class Assembler_4 extends Assembler_3 {
    constructor(recipe = null) {
        super(recipe);

        this.delay = 2;
        this.operationCost = 25;
        this.purchaseCost = 100000000;
    }
}

class Assembler_5 extends Assembler_4 {
    constructor(recipe = null) {
        super(recipe);

        this.delay = 1;
        this.operationCost = 50;
        this.purchaseCost = 1000000000;
    }
}

class Drawer_0 extends RecipeBox {
    constructor(recipe = null) {
        super(Number.MAX_SAFE_INTEGER, ["n"], 10, 0, 5, 20000);

        this.validRecipes = ["Aluminium Coil", "Brass Coil", "Bronze Coil",
            "Copper Coil", "Electrum Coil", "Gold Coil", 
            "Iron Coil", "Lead Coil", "Silver Coil", 
            "Solder Coil", "Steel Coil", "Tin Coil", 
            "Zinc Coil"];
        this.recipe = recipe;
    }
}

class Drawer_1 extends Drawer_0 {
    constructor(recipe = null) {
        super(recipe);

        this.delay = 8;
        this.operationCost = 6;
        this.purchaseCost = 40000;
    }
}

class Drawer_2 extends Drawer_1 {
    constructor(recipe = null) {
        super(recipe);

        this.delay = 6;
        this.operationCost = 8;
        this.purchaseCost = 80000;
    }
}

class Drawer_3 extends Drawer_2 {
    constructor(recipe = null) {
        super(recipe);

        this.delay = 4;
        this.operationCost = 12;
        this.purchaseCost = 160000;
    }
}

class Drawer_4 extends Drawer_3 {
    constructor(recipe = null) {
        super(recipe);

        this.delay = 2;
        this.operationCost = 25;
        this.purchaseCost = 320000;
    }
}

class Drawer_5 extends Drawer_4 {
    constructor(recipe = null) {
        super(recipe);

        this.delay = 1;
        this.operationCost = 50;
        this.purchaseCost = 650000;
    }
}

class Press_0 extends RecipeBox {
    constructor(recipe = null) {
        super(Number.MAX_SAFE_INTEGER, ["n"], 10, 0, 5, 30000);

        this.validRecipes = ["Aluminium Plate", "Brass Plate", "Bronze Plate",
            "Copper Plate", "Electrum Plate", "Gold Plate", 
            "Iron Plate", "Lead Plate", "Silver Plate", 
            "Solder Plate", "Steel Plate", "Tin Plate", 
            "Zinc Plate"];
        this.recipe = recipe;
    }
}

class Press_1 extends Press_0 {
    constructor(recipe = null) {
        super(recipe);

        this.delay = 8;
        this.operationCost = 6;
        this.purchaseCost = 60000;
    }
}

class Press_2 extends Press_1 {
    constructor(recipe = null) {
        super(recipe);

        this.delay = 6;
        this.operationCost = 8;
        this.purchaseCost = 120000;
    }
}

class Press_3 extends Press_2 {
    constructor(recipe = null) {
        super(recipe);

        this.delay = 4;
        this.operationCost = 12;
        this.purchaseCost = 240000;
    }
}

class Press_4 extends Press_3 {
    constructor(recipe = null) {
        super(recipe);

        this.delay = 2;
        this.operationCost = 25;
        this.purchaseCost = 480000;
    }
}

class Press_5 extends Press_4 {
    constructor(recipe = null) {
        super(recipe);

        this.delay = 1;
        this.operationCost = 50;
        this.purchaseCost = 1000000;
    }
}

class Distributor_0 extends MultiBox {
    constructor() {
        super(10, ["w", "n", "e"], [1, 1, 1], [[], [], []], 1, 0, 5, 150000);

        this.maxSplit = 3;
    }

    //TODO: Add function that allows user to change outputDirectionCount.
}

class Distributor_1 extends Distributor_0 {
    constructor() {
        super();

        this.capacity = 20;
        this.maxSplit = 6;
        this.operationCost = 10;
        this.purchaseCost = 300000;
    }
}

class Distributor_2 extends Distributor_1 {
    constructor() {
        super();

        this.capacity = 40;
        this.maxSplit = 12;
        this.purchaseCost = 600000;
    }
}

class Distributor_3 extends Distributor_2 {
    constructor() {
        super();

        this.capacity = 100;
        this.maxSplit = 30;
        this.operationCost = 0;
        this.purchaseCost = 1200000;
    }
}

class Distributor_4 extends Distributor_3 {
    constructor() {
        super();

        this.capacity = 200;
        this.maxSplit = 60;
        this.purchaseCost = 2400000;
    }
}

class Distributor_5 extends Distributor_4 {
    constructor() {
        super();

        this.capacity = 1000;
        this.maxSplit = 300;
        this.purchaseCost = 5000000;
    }
}

function TileFactory(name, power, recipe = null, rotation = 0, offset = 0) {
    var ccat = name + "_" + power;
    var entity = {};
    switch (ccat) {
        case "Empty_0":
        case "Empty_1":
        case "Empty_2":
        case "Empty_3":
        case "Empty_4":
        case "Empty_5":
            return new Empty_0();
        case "Importer_0":
            entity = new Importer_0(recipe);
            break;
        case "Importer_1":
            entity = new Importer_1(recipe);
            break;
        case "Importer_2":
            entity = new Importer_2(recipe);
            break;
        case "Importer_3":
            entity = new Importer_3(recipe);
            break;
        case "Importer_4":
            entity = new Importer_4(recipe);
            break;
        case "Importer_5":
            entity = new Importer_5(recipe);
            break;
        case "Exporter_0":
            entity = new Exporter_0();
            break;
        case "Exporter_1":
            entity = new Exporter_1();
            break;
        case "Exporter_2":
            entity = new Exporter_2();
            break;
        case "Exporter_3":
            entity = new Exporter_3();
            break;
        case "Exporter_4":
            entity = new Exporter_4();
            break;
        case "Exporter_5":
            entity = new Exporter_5();
            break;
        case "Conveyor_0":
            entity = new Conveyor_0();
            break;
        case "Conveyor_1":
            entity = new Conveyor_1();
            break;
        case "Conveyor_2":
            entity = new Conveyor_2();
            break;
        case "Conveyor_3":
            entity = new Conveyor_3();
            break;
        case "Conveyor_4":
            entity = new Conveyor_4();
            break;
        case "Conveyor_5":
            entity = new Conveyor_5();
            break;
        case "Splitter_0":
            entity = new Splitter_0();
            break;
        case "Splitter_1":
            entity = new Splitter_1();
            break;
        case "Splitter_2":
            entity = new Splitter_2();
            break;
        case "Splitter_3":
            entity = new Splitter_3();
            break;
        case "Splitter_4":
            entity = new Splitter_4();
            break;
        case "Splitter_5":
            entity = new Splitter_5();
            break;
        case "Furnace_0":
            entity = new Furnace_0(recipe);
            break;
        case "Furnace_1":
            entity = new Furnace_1(recipe);
            break;
        case "Furnace_2":
            entity = new Furnace_2(recipe);
            break;
        case "Furnace_3":
            entity = new Furnace_3(recipe);
            break;
        case "Furnace_4":
            entity = new Furnace_4(recipe);
            break;
        case "Furnace_5":
            entity = new Furnace_5(recipe);
            break;
        case "Assembler_0":
            entity = new Assembler_0(recipe);
            break;
        case "Assembler_1":
            entity = new Assembler_1(recipe);
            break;
        case "Assembler_2":
            entity = new Assembler_2(recipe);
            break;
        case "Assembler_3":
            entity = new Assembler_3(recipe);
            break;
        case "Assembler_4":
            entity = new Assembler_4(recipe);
            break;
        case "Assembler_5":
            entity = new Assembler_5(recipe);
            break;
        case "Drawer_0":
            entity = new Drawer_0(recipe);
            break;
        case "Drawer_1":
            entity = new Drawer_1(recipe);
            break;
        case "Drawer_2":
            entity = new Drawer_2(recipe);
            break;
        case "Drawer_3":
            entity = new Drawer_3(recipe);
            break;
        case "Drawer_4":
            entity = new Drawer_4(recipe);
            break;
        case "Drawer_5":
            entity = new Drawer_5(recipe);
            break;
        case "Press_0":
            entity = new Press_0(recipe);
            break;
        case "Press_1":
            entity = new Press_1(recipe);
            break;
        case "Press_2":
            entity = new Press_2(recipe);
            break;
        case "Press_3":
            entity = new Press_3(recipe);
            break;
        case "Press_4":
            entity = new Press_4(recipe);
            break;
        case "Press_5":
            entity = new Press_5(recipe);
            break;
        case "Distributor_0":
            entity = new Distributor_0();
            break;
        case "Distributor_1":
            entity = new Distributor_1(recipe);
            break;
        case "Distributor_2":
            entity = new Distributor_2(recipe);
            break;
        case "Distributor_3":
            entity = new Distributor_3(recipe);
            break;
        case "Distributor_4":
            entity = new Distributor_4(recipe);
            break;
        case "Distributor_5":
            entity = new Distributor_5(recipe);
            break;
        default:
            throw "Invalid tile name!";
    }
    entity.rotation = rotation;
    entity.delayOffset = offset;
    return entity;
}