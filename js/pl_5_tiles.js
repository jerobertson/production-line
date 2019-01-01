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
        this.requested = null;

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
    constructor(capacity = 0, 
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

class Exporter_0 extends Box {
    constructor() {
        super(Number.MAX_SAFE_INTEGER, [], Number.MAX_SAFE_INTEGER, 0, 0, 10000);
    }

    consume(items) {
        return items.length;
    }
}

class Conveyor_0 extends Box {
    constructor() {
        super(1, ["n"], 1, 0, 1, 500);
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

class Furnace_0 extends RecipeBox {
    constructor(recipe = null) {
        super(10, ["n"], 10, 0, 5, 10000);

        this.validRecipes = ["Brass", "Bronze", "Electrum", "Solder", "Steel"];
        this.recipe = recipe;
    }
}

class Drawer_0 extends RecipeBox {
    constructor(recipe = null) {
        super(10, ["n"], 10, 0, 5, 30000);

        this.validRecipes = ["Aluminium Coil", "Brass Coil", "Bronze Coil",
            "Copper Coil", "Electrum Coil", "Gold Coil", 
            "Iron Coil", "Lead Coil", "Silver Coil", 
            "Solder Coil", "Steel Coil", "Tin Coil", 
            "Zinc Coil"];
        this.recipe = recipe;
    }
}

class Press_0 extends RecipeBox {
    constructor(recipe = null) {
        super(10, ["n"], 10, 0, 5, 40000);

        this.validRecipes = ["Aluminium Plate", "Brass Plate", "Bronze Plate",
            "Copper Plate", "Electrum Plate", "Gold Plate", 
            "Iron Plate", "Lead Plate", "Silver Plate", 
            "Solder Plate", "Steel Plate", "Tin Plate", 
            "Zinc Plate"];
        this.recipe = recipe;
    }
}

class Distributor_0 extends MultiBox {
    constructor() {
        super(10, ["w", "n", "e"], [1, 1, 1], [[], [], []], 1, 0, 5, 100000);
    }
}

function TileFactory(name, power, recipe = null, rotation = 0, delay = undefined, offset = 0) {
    var ccat = name + "_" + power;
    switch (ccat) {
        case "Empty_0":
            return new Empty_0();
        case "Importer_0":
            var entity = new Importer_0(recipe);
            entity.rotation = rotation;
            if (delay !== undefined) entity.delay = delay;
            entity.delayOffset = offset;
            return entity;
        case "Exporter_0":
            var entity = new Exporter_0();
            entity.rotation = rotation;
            if (delay !== undefined) entity.delay = delay;
            entity.delayOffset = offset;
            return entity;
        case "Conveyor_0":
            var entity = new Conveyor_0();
            entity.rotation = rotation;
            if (delay !== undefined) entity.delay = delay;
            entity.delayOffset = offset;
            return entity;
        case "Splitter_0":
            var entity = new Splitter_0();
            entity.rotation = rotation;
            if (delay !== undefined) entity.delay = delay;
            entity.delayOffset = offset;
            return entity;
        case "Furnace_0":
            var entity = new Furnace_0(recipe);
            entity.rotation = rotation;
            if (delay !== undefined) entity.delay = delay;
            entity.delayOffset = offset;
            return entity;
        case "Drawer_0":
            var entity = new Drawer_0(recipe);
            entity.rotation = rotation;
            if (delay !== undefined) entity.delay = delay;
            entity.delayOffset = offset;
            return entity;
        case "Press_0":
            var entity = new Press_0(recipe);
            entity.rotation = rotation;
            if (delay !== undefined) entity.delay = delay;
            entity.delayOffset = offset;
            return entity;
        case "Distributor_0":
            var entity = new Distributor_0();
            entity.rotation = rotation;
            if (delay !== undefined) entity.delay = delay;
            entity.delayOffset = offset;
            return entity;
        default:
            throw "Invalid tile name!";
    }
}