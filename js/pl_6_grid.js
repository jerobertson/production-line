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

        var hasConsumed = entity.consume(items);

        var output = entity.getNextOutput();
        var outputDir = entity.getNextOutputDirection();
        var nextCoords = resolveTranslation(outputDir, x, y);
        var xN = nextCoords[0];
        var yN = nextCoords[1];
        if (output.length > 0 && 
                (x != xN || y != yN) &&
                (xN != xO || yN != yO) && 
                ((curSecond + entity.delayOffset) % entity.delay == 0) &&
                this.processEntity(curSecond, xN, yN, output, x, y)) {
            entity.produce();
            if (this.tickAnimations[y] === undefined) this.tickAnimations[y] = [];
            this.tickAnimations[y][x] = new ItemAnimation(output, x, y, outputDir);
            if (!hasConsumed) hasConsumed = entity.consume(items);
        }

        return hasConsumed;
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