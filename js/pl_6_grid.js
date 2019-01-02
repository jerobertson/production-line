class Grid {
    constructor(width, height) {
        this.grid = [];
        this.size = {"width": width, "height": height};
        this.tickAnimations = [];
        this.selectedCell = undefined;

        this.money = 20000;

        for (var y = 0; y < this.size.height; y++) {
            var row = [];
            for (var x = 0; x < this.size.width; x++) {
                row.push(TileFactory("Empty", 0));
            }
            this.grid.push(row);
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
        if (entity.constructor.name.split("_")[0] == "Exporter") {
            for (var i = 0; i < items.length; i++) {
                this.money += items[i].value;
            }
        }

        var outputDir = entity.getNextOutputDirection();
        var output = entity.getNextOutput();
        var nextCoords = resolveTranslation(outputDir, x, y);
        var xN = nextCoords[0];
        var yN = nextCoords[1];
        if (output.length > 0 && 
                (x != xN || y != yN) &&
                (xN != xO || yN != yO) && 
                ((curSecond + entity.delayOffset) % entity.delay == 0)) {
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

        for (var y = 0; y < this.size.height; y++) {
            for (var x = 0; x < this.size.width; x++) {
                var entity = this.grid[y][x];
                entity.producedCount = 0;
                entity.processBuffer();
                entity.hasTicked = false;
                operationCost += entity.operationCost;
            }
        }
        if (operationCost > this.money) return;
        this.money -= operationCost;
        for (var y = 0; y < this.size.height; y++) {
            for (var x = 0; x < this.size.width; x++) {
                this.processEntity(curSecond, x, y, []);
            }
        }
    }
}