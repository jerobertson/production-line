class Grid {
    constructor(width, height) {
        this.grid = [];
        this.size = {"width": width, "height": height};
        this.tickAnimations = [];
        this.selectedCell = undefined;

        for (var y = 0; y < this.size.height; y++) {
            var row = [];
            for (var x = 0; x < this.size.width; x++) {
                row.push(TileFactory("Empty"));
            }
            this.grid.push(row);
        }
    }

    place(entity, x, y) {
        if (x >= this.size.width || y >= this.size.height ) throw "Invalid co-ords!";
        this.grid[y][x] = entity;
    }

    processEntity(curSecond, x, y, items, xO, yO) {
        if (this.grid[y] === undefined || this.grid[y][x] === undefined) return false;
        
        var entity = this.grid[y][x];

        var consumedCount = entity.consume(items);

        var outputDirs = entity.getNextOutputDirections();
        var outputs = entity.getNextOutputs();
        if (outputDirs != []) {
            for (var i = 0; i < outputDirs.length; i++) {
                var outputDir = outputDirs[i];
                var output = outputs[outputDir];
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
                    }
                }
            }
        }

        return consumedCount;
    }

    tick(curSecond) {
        this.tickAnimations = [];

        for (var y = 0; y < this.size.height; y++) {
            for (var x = 0; x < this.size.width; x++) {
                var entity = this.grid[y][x];
                entity.producedCount = 0;
                entity.processBuffer();
                entity.hasTicked = false;
            }
        }
        for (var y = 0; y < this.size.height; y++) {
            for (var x = 0; x < this.size.width; x++) {
                this.processEntity(curSecond, x, y, []);
            }
        }
    }
}