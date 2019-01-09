class Grid {
    constructor() {
        this.grid = [];
        this.size = {"width": 0, "height": 0};
        this.tickAnimations = [];
        this.selectedCell = undefined;

        this.unlockedTiles = {"Empty": 0, "Conveyor": 0, "Importer": 0, "Exporter": 0}; //type:level
        
        this.maximumTileTypes = {"Importer": 3, "Exporter": 1}; //type:count

        this.unlockedRecipes = ["Aluminium", "Copper", "Iron", "Lead", "Silver", "Zinc"];

        this.money = 10000;

        this.expand(5, 5);
    }

    unlockTile(name, level, count = undefined) {
        if (!(this.unlockedTiles.hasOwnProperty(name) && this.unlockedTiles[name] > level)) {
            this.unlockedTiles[name] = level;
        }

        if (!(this.maximumTileTypes.hasOwnProperty(name) && this.maximumTileTypes[name] > count) &&
            count != undefined) {
            this.maximumTileTypes[name] = count;
        }
    }

    unlockRecipe(name) {
        if (this.unlockedRecipes.includes(name)) return;

        this.unlockedRecipes.push(name);
    }

    getExpansionCost(widthIncrease, heightIncrease) {
        var base = 1000;
        var coefficient = 1.04;
        
        var newWidth = this.size.width + widthIncrease;
        var newHeight = this.size.height + heightIncrease;
        var oldTileCount = this.size.width * this.size.height;
        var tileIncrease = newWidth * newHeight - oldTileCount;

        var cost = Math.floor(base * 
            (   (Math.pow(coefficient, oldTileCount) * (Math.pow(coefficient, tileIncrease) - 1)) / 
                (coefficient - 1)
            ));

        return cost;
    }

    expand(widthIncrease, heightIncrease, inverse, drawspace) {
        if (widthIncrease < 0 || heightIncrease < 0) throw "Grid cannot decrease in size!";

        var cost = this.getExpansionCost(widthIncrease, heightIncrease);

        if (this.money < cost && this.size.width + this.size.height > 0) return;
        if (this.size.width + this.size.height > 0) this.money -= cost;

        var newWidth = this.size.width + widthIncrease;
        var newHeight = this.size.height + heightIncrease;

        for (var y = 0; y < this.size.height; y++) {
            for (var x = this.size.width; x < newWidth; x++) {
                this.grid[y].push(TileFactory("Empty", 0));
            }
        }

        for (var y = this.size.height; y < newHeight; y++) {
            var row = [];
            for (var x = 0; x < newWidth; x++) {
                row.push(TileFactory("Empty", 0));
            }
            this.grid.push(row);
        }

        if (inverse) {
            for (var y = 0; y < heightIncrease; y++) {
                this.grid.unshift(this.grid.pop());
            }

            for (var x = 0; x < widthIncrease; x++) {
                for (var y = 0; y < newHeight; y++) {
                    this.grid[y].unshift(this.grid[y].pop());
                }
            }
        }

        this.size = {"width": newWidth, "height": newHeight};

        if (drawspace !== undefined) {
            drawspace.getDrawSpace();
            drawspace.calculateCanvasSizes();
            drawspace.reloadImages();
            drawspace.drawGrid();
        }
    }

    place(entity, x, y) {
        if (x >= this.size.width || y >= this.size.height ) throw "Invalid co-ords!";
        this.grid[y][x] = entity;
    }

    processEntity(curSecond, x, y, items, xO, yO) {
        if (this.grid[y] === undefined || this.grid[y][x] === undefined) return 0;
        if (this.grid[y][x].constructor.name == "Empty") return 0;
        
        var entity = this.grid[y][x];

        var consumedCount = entity.consume(items);

        var outputDir = entity.getNextOutputDirection();
        var output = entity.getNextOutput();
        var nextCoords = resolveTranslation(outputDir, x, y);
        var xN = nextCoords[0];
        var yN = nextCoords[1];
        if (output.length > 0 && 
                (x != xN || y != yN) &&
                (xN != xO || yN != yO) && 
                ((curSecond + (entity.delay - entity.delayOffset)) % entity.delay == 0)) {
            var itemsConsumed = this.processEntity(curSecond, xN, yN, output, x, y);
            if (itemsConsumed > 0) {
                entity.produce(itemsConsumed);
                if (this.tickAnimations[y] === undefined) this.tickAnimations[y] = [];
                this.tickAnimations[y][x] = new ItemAnimation(output, x, y, outputDir);
                consumedCount += entity.consume(items.slice(consumedCount, items.length));
                if (!entity.hasTicked) this.processEntity(curSecond, x, y, []);
            }
        }

        return consumedCount;
    }

    tick(curSecond) {
        this.tickAnimations = [];
        var operationCost = 0;
        var tickEvent = new TickEvent();

        for (var y = 0; y < this.size.height; y++) {
            for (var x = 0; x < this.size.width; x++) {
                var entity = this.grid[y][x];
                if (entity.constructor.name.split("_")[0] == "Exporter") {
                    for (var i = 0; i < entity.buffer.length; i++) {
                        this.money += entity.buffer[i].value * entity.multiplier;
                        tickEvent.exportedValue += entity.buffer[i].value * entity.multiplier;
                        if (!tickEvent.exportedItems.hasOwnProperty(entity.buffer[i].name)) {
                            tickEvent.exportedItems[entity.buffer[i].name] = 0;
                        }
                        tickEvent.exportedItems[entity.buffer[i].name]++;
                    }
                }
                entity.producedCount = 0;
                entity.processBuffer();
                entity.hasTicked = false;
                operationCost += entity.operationCost;
            }
        }

        tickEvent.money = this.money;

        if (operationCost > this.money) return tickEvent;

        this.money -= operationCost;
        tickEvent.operationCost = operationCost;

        for (var y = 0; y < this.size.height; y++) {
            for (var x = 0; x < this.size.width; x++) {
                this.processEntity(curSecond, x, y, []);
            }
        }

        tickEvent.money = this.money;
        return tickEvent;
    }
}