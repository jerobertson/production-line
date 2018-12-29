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

    var drawspace = new Drawspace(grid, 128);
    setupInteractions(drawspace);

    var eventLogger = new EventLogger(100);
    cycle(0, drawspace, eventLogger);
}

function cycle(timestamp, drawspace, eventLogger = undefined) {
    var timeWarp = 500; //1000 for normal, 500 for 2x speed, etc.

    var lastSecond = Math.floor(drawspace.lastRender / timeWarp);
    var curSecond = Math.floor(timestamp / timeWarp);
    
    var t0 = performance.now();
    while (lastSecond != curSecond) {
        var ttt = performance.now();

        lastSecond++;

        var m0 = drawspace.grid.money;
        drawspace.grid.tick(lastSecond);
        eventLogger.addMoneyDatapoint((drawspace.grid.money - m0) * (1000 / timeWarp));

        if (eventLogger !== undefined) {
            eventLogger.addTickDatapoint(performance.now() - ttt);
            $("#response-time").text("r: " + 
                eventLogger.getAverageRender().toFixed(1) + "ms | t: " + 
                eventLogger.getAverageTick().toFixed(1) + "ms");
        }

        if (lastSecond == curSecond) drawspace.drawGrid();
    }
    var t1 = performance.now() - t0;

    drawspace.render(timestamp % timeWarp / timeWarp);
    drawspace.lastRender = timestamp;

    if (eventLogger !== undefined) {
        eventLogger.addRenderDatapoint(performance.now() - timestamp - t1);
        $("#response-time").text("r: " + 
            eventLogger.getAverageRender().toFixed(1) + "ms | t: " + 
            eventLogger.getAverageTick().toFixed(1) + "ms");
    }

    var moneyPrefix = "&pound;"
    var money = drawspace.grid.money;
    var avgMoneyPrefix = "+ &pound;";
    var avgMoney = eventLogger.getAverageMoney();
    if (avgMoney < 0) {
        avgMoneyPrefix = "- &pound;";
        avgMoney *= -1;
    }
    money = money.toLocaleString(undefined, {maximumFractionDigits: 0});
    avgMoney = avgMoney.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    $("#money-value").html(moneyPrefix + money + " (<span id='money-avg'>" + avgMoneyPrefix + avgMoney + "/s</span>)");
    if (eventLogger.getAverageMoney() < 0) {
        $("#money-avg").css('color', 'red');
    } else {
        $("#money-avg").css('color', 'green');
    }

    requestAnimationFrame(function(timestamp) {
        cycle(timestamp, drawspace, eventLogger);
    });
}