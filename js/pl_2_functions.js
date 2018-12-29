var directions = ["n", "e", "s", "w"];
var rotations = [0, 1, 2, 3];
var images = {};

function resolveRotation(dir, rot) {
    var dirKey = -1;
    for (var i = 0; i < directions.length; i++) {
        if (directions[i] == dir) dirKey = i;
    }
    if (dirKey == -1) throw "Invalid direction!";

    if (!rotations.includes(rot)) throw "Invalid rotation!";

    var result = directions.slice();

    for (var i = 0; i < rot; i++) {
        first = result.shift();
        result.push(first);
    }

    return result[dirKey];
}

function resolveTranslation(dir, x, y) {
    switch (dir) {
        case "n":
            return [x, y + 1]
        case "e":
            return [x + 1, y]
        case "s":
            return [x, y - 1]
        case "w":
            return [x - 1, y]
        default:
            return [x, y]
    }
}

function initialise() {
    var grid = new Grid(64, 64);
    grid.place(TileFactory("Importer", RecipeFactory("Copper")), 0, 0);
    grid.place(TileFactory("Conveyor"), 0, 1);
    grid.place(TileFactory("Conveyor", null, 1), 0, 2);
    grid.place(TileFactory("Importer", RecipeFactory("Tin")), 1, 0);
    grid.place(TileFactory("Conveyor"), 1, 1);
    grid.place(TileFactory("Furnace", RecipeFactory("Bronze")), 1, 2);
    grid.place(TileFactory("Conveyor"), 1, 3);
    grid.place(TileFactory("Importer", RecipeFactory("Iron")), 0, 3);
    grid.place(TileFactory("Conveyor", null, 1), 0, 4);
    grid.place(TileFactory("Conveyor", null, 1), 1, 4);
    grid.place(TileFactory("Conveyor", null, 1), 2, 4);
    grid.place(TileFactory("Conveyor", null, 1), 3, 4);
    grid.place(TileFactory("Exporter"), 4, 4);

    grid.place(TileFactory("Importer", RecipeFactory("Aluminium")), 4, 0);
    grid.place(TileFactory("Conveyor"), 4, 1);
    grid.place(TileFactory("Distributor"), 4, 2);
    grid.place(TileFactory("Exporter"), 3, 2);
    grid.place(TileFactory("Conveyor"), 4, 3);
    grid.place(TileFactory("Exporter"), 5, 2);

    var drawspace = new Drawspace(grid, 128);
    setupInteractions(drawspace);

    var performanceLogger = new PerformanceLogger(100);
    cycle(0, drawspace, performanceLogger);
}

function cycle(timestamp, drawspace, performanceLogger = undefined) {
    var timeWarp = 1000; //1000 for normal, 500 for 2x speed, etc.

    var lastSecond = Math.floor(drawspace.lastRender / timeWarp);
    var curSecond = Math.floor(timestamp / timeWarp);
    
    while (lastSecond != curSecond) {
        lastSecond++;
        drawspace.grid.tick(lastSecond);
        if (lastSecond == curSecond) drawspace.drawGrid();
    }

    drawspace.render(timestamp % timeWarp / timeWarp);
    drawspace.lastRender = timestamp;

    if (performanceLogger !== undefined) {
        performanceLogger.addDatapoint(performance.now() - timestamp);
        $("#response-time").text("Average ttr: " + performanceLogger.getAverage().toFixed(1) + "ms");
    }

    requestAnimationFrame(function(timestamp) {
        cycle(timestamp, drawspace, performanceLogger);
    });
}