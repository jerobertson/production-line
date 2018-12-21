class Box {
    constructor(capacity = 0, 
                outputDirections = [], 
                outputDirectionCounts = [], 
                outputDirectionFilters = [], 
                delay = Number.MAX_SAFE_INTEGER, 
                rotation = 0) {
        for (var key in outputDirections) {
            if (!directions.includes(outputDirections[key])) throw "Invalid output direction!";
        }
        if (outputDirectionCounts.length != outputDirections.length) throw "Invalid output count size!";
        if (outputDirectionFilters.length != outputDirections.length) throw "Invalid output filters size!";
        if (!rotations.includes(rotation)) throw "Invalid rotation!";

        this.capacity = capacity;
        this.requested = null;

        this.outputDirections = outputDirections;
        this.outputDirectionCounts = outputDirectionCounts;
        this.outputDirectionFilters = outputDirectionFilters;
        this.outputDirectionPointer = 0;

        this.delay = delay;
        this.delayOffset = 0;

        this.rotation = rotation;

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
    
    consume(items) {
        if (this.getInventorySize() + this.buffer.length + items.length <= this.capacity) {
            this.buffer = this.buffer.concat(items)
            return true;
        } else {
            return false;
        }
    }

    getNextOutput() {
        if (this.hasTicked || this.outputDirections.length == 0) return [];
        return this.inventory.slice(0, this.outputDirectionCounts[this.outputDirectionPointer]);
    }

    getNextOutputDirection() {
        if (this.outputDirections.length == 0) return null;
        return resolveRotation(this.outputDirections[this.outputDirectionPointer], this.rotation);
    }

    produce() {
        if (this.hasTicked) return [];

        var output = this.getNextOutput();
        
        this.producedCount = output.length;
        this.hasTicked = true;
        if (output.length == 0) return output;

        for (var i = 0; i < output.length; i++) {
            this.inventory.shift();
        }

        if (this.outputDirections.length > 0) {
            this.outputDirectionPointer = (this.outputDirectionPointer + 1) % (this.outputDirections.length);
        }

        return output;
    }
}

class Empty extends Box {
    constructor() {
        super();
    }
}

class RecipeBox extends Box {
    constructor(capacity = 0, 
                outputDirections = [], 
                outputDirectionCounts = [], 
                outputDirectionFilters = [], 
                delay = Number.MAX_SAFE_INTEGER, 
                rotation = 0,
                recipe = null) {
        super (capacity, outputDirections, outputDirectionCounts, outputDirectionFilters, delay, rotation);
        
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
                this.storedItems.push(this.buffer[i].name);
                this.inventory[this.buffer[i].name] = 0;
            }
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

    hasRequiredItems() {
        for (var ingredient in this.recipe.ingredients) {
            if (!this.recipe.ingredients.hasOwnProperty(ingredient)) continue;
            if (!this.inventory.hasOwnProperty(ingredient)) return false;
            if (this.inventory[ingredient] < this.recipe.ingredients[ingredient]) return false;
        }
        return true;
    }

    getNextOutput() {
        if (this.hasTicked || this.outputDirections.length == 0 || this.recipe == null) return [];
        if (!this.hasRequiredItems()) return [];
        return [ItemFactory(this.recipe.result)];
    }

    produce() {
        if (this.hasTicked) return [];

        var output = this.getNextOutput();
        
        this.producedCount = output.length;
        this.hasTicked = true;
        if (output.length == 0) return output;

        for (var ingredient in this.recipe.ingredients) {
            if (!this.recipe.ingredients.hasOwnProperty(ingredient)) continue;
            
            this.inventory[ingredient] = this.inventory[ingredient] - this.recipe.ingredients[ingredient];
        }

        if (this.outputDirections.length > 0) {
            this.outputDirectionPointer = (this.outputDirectionPointer + 1) % (this.outputDirections.length);
        }

        return output;
    }
}

class Importer extends RecipeBox {
    constructor(recipe = null) {
        super(0, ["n"], [1], [[]], 2, 0);

        this.validRecipes = ["Aluminium", "Coal", "Copper", "Gold", "Iron", "Lead", "Silver", "Tin", "Zinc"];
        this.recipe = recipe;
    }
}

class Exporter extends Box {
    constructor() {
        super(Number.MAX_SAFE_INTEGER, [], [], [], Number.MAX_SAFE_INTEGER, 0);
    }

    consume(items) {
        if (items.length != 0) {} //console.log("Exported an item!");
        return true;
    }
}

class Conveyor extends Box {
    constructor() {
        super(1, ["n"], [1], [[]], 1, 0);
    }
}

class Splitter extends Box {
    constructor() {
        super(2, ["n", "s"], [1, 1], [[], []], 1, 0);
    }
}

class Furnace extends RecipeBox {
    constructor(recipe = null) {
        super(10, ["n"], [1], [[]], 5, 0);

        this.validRecipes = ["Brass", "Bronze", "Electrum", "Solder", "Steel"];
        this.recipe = recipe;
    }
}

function TileFactory(name, recipe = null, rotation = 0, delay = undefined, offset = 0) {
    switch (name) {
        case "Empty":
            return new Empty();
        case "Importer":
            var entity = new Importer(recipe);
            entity.rotation = rotation;
            if (delay !== undefined) entity.delay = delay;
            entity.delayOffset = offset;
            return entity;
        case "Exporter":
            var entity = new Exporter();
            entity.rotation = rotation;
            if (delay !== undefined) entity.delay = delay;
            entity.delayOffset = offset;
            return entity;
        case "Conveyor":
            var entity = new Conveyor();
            entity.rotation = rotation;
            if (delay !== undefined) entity.delay = delay;
            entity.delayOffset = offset;
            return entity;
        case "Splitter":
            var entity = new Splitter();
            entity.rotation = rotation;
            if (delay !== undefined) entity.delay = delay;
            entity.delayOffset = offset;
            return entity;
        case "Furnace":
            var entity = new Furnace(recipe);
            entity.rotation = rotation;
            if (delay !== undefined) entity.delay = delay;
            entity.delayOffset = offset;
            return entity;
        default:
            throw "Invalid tile name!";
    }
}