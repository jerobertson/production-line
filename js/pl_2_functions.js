var directions = ["n", "e", "s", "w"];
var rotations = [0, 1, 2, 3];
var images = {};
var showDetailedRenderStatistics = false;
var running = true;

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

function updateCostString(drawspace, initial) {
    var out = initial;

    var value = initial.split("\u00A3");
    if (value.length == 1) value = initial.split("&pound;");
    if (value.length == 2) {
        var valueString = value[0];
        var valueAmount = parseInt(value[1].replace(/,/g, ""));
        if (valueString.split(" ")[1] == "cost:" && drawspace.grid.money > valueAmount) {
            out = valueString + 
                "<span style='color: green'>&pound;" + 
                valueAmount.toLocaleString("en-GB", {maximumFractionDigits: 0}) +
                "</span>";
        } else if (valueString.split(" ")[1] == "cost:") {
            out = valueString + 
                "<span style='color: red'>&pound;" + 
                valueAmount.toLocaleString("en-GB", {maximumFractionDigits: 0}) +
                "</span>";
        } else {
            out = valueString + 
                "&pound;" + 
                valueAmount.toLocaleString("en-GB", {maximumFractionDigits: 0});
        }
    }

    $("#tile-value").html(out);

    $("#floorspace-right").removeClass("btn-outline-danger").addClass("btn-outline-success");
    $("#floorspace-left").removeClass("btn-outline-danger").addClass("btn-outline-success");
    $("#floorspace-down").removeClass("btn-outline-danger").addClass("btn-outline-success");
    $("#floorspace-up").removeClass("btn-outline-danger").addClass("btn-outline-success");
    var money = drawspace.grid.money;
    var widthCost = drawspace.grid.getExpansionCost(1, 0);
    var heightCost = drawspace.grid.getExpansionCost(0, 1);

    $("#floorspace-right").html("<i class='fas fa-arrow-right'></i> &pound;" +
        widthCost.toLocaleString("en-GB", {maximumFractionDigits: 0}));
    $("#floorspace-left").html("<i class='fas fa-arrow-left'></i> &pound;" +
        widthCost.toLocaleString("en-GB", {maximumFractionDigits: 0}));
    if (money < widthCost) {
        $("#floorspace-right").removeClass("btn-outline-success").addClass("btn-outline-danger");
        $("#floorspace-left").removeClass("btn-outline-success").addClass("btn-outline-danger");
    }
    
    $("#floorspace-down").html("<i class='fas fa-arrow-down'></i> &pound;" +
        heightCost.toLocaleString("en-GB", {maximumFractionDigits: 0}));
    $("#floorspace-up").html("<i class='fas fa-arrow-up'></i> &pound;" +
        heightCost.toLocaleString("en-GB", {maximumFractionDigits: 0}));
    if (money < heightCost) {
        $("#floorspace-down").removeClass("btn-outline-success").addClass("btn-outline-danger");
        $("#floorspace-up").removeClass("btn-outline-success").addClass("btn-outline-danger");
    }
}

function updateMoneyString(drawspace, eventLogger) {
    var out = "";

    var moneyPrefix = "&pound;"
    var money = drawspace.grid.money;
    var avgMoneyPrefix = "+ &pound;";
    var avgMoney = eventLogger.getAverageMoney();
    if (avgMoney < 0) {
        avgMoneyPrefix = "- &pound;";
        avgMoney *= -1;
    }
    money = money.toLocaleString("en-GB", {maximumFractionDigits: 0});
    avgMoney = avgMoney.toLocaleString("en-GB", {minimumFractionDigits: 2, maximumFractionDigits: 2});
    if (eventLogger.getAverageMoney() < 0) {
        out = moneyPrefix + money + " (<span style='color: red'>" + avgMoneyPrefix + avgMoney + "/s</span>)";
    } else {
        out = moneyPrefix + money + " (<span style='color: green'>" + avgMoneyPrefix + avgMoney + "/s</span>)";
    }

    $("#money-value").html(out);
}

function displayBlueprints(grid) {
    var blueprintsHtml = "";

    for (var i = 0; i < grid.unlockedRecipes.length; i++) {
        var recipeHtml = ItemFactory(grid.unlockedRecipes[i]).recipeHtml;
        blueprintsHtml += recipeHtml;
    }

    $("#blueprints-inner-container").html(blueprintsHtml);
}

function registerContract(contract) {
    var html = $("#contracts-progress-container").html();
    html += `<div id="contract-` + contract.id + `" class="row justify-content-center align-items-center mb-2">
        <div class="container m-2 p-2" style="background: #8b8b8b8b">
            <div id="contract-` + contract.id + `-title" class="col-12 mb-2 text-center">
                ` + contract.title + "... (0/" + contract.condition + ") - 0.00%" + `
            </div>
            <div class="col-12 mb-2 w-100">
                <div class="progress position-relative">
                    <div id="contract-` + contract.id + `-bar" class="progress-bar bg-info" role="progressbar" style="width: 0%"></div>
                </div>
            </div>
        <div class="row justify-content-center align-items-center">`;
    if (contract.progressRewardText != null) {
        html += `<div class="col-auto text-center">
            Reward: ` + contract.progressRewardText + `
        </div>`;
    }
    if (contract.time != null) {
        html += `<div id="contract-` + contract.id + `-time" class="col-auto text-center text-danger" style="background: #2b2b2b">
            Time left: ` + Math.floor(contract.time / 2) + `s
        </div>`;
    }
    html +=`</div>
        </div>
    </div>`;
    $("#contracts-progress-container").html(html);
}

function initialise() {
    var grid = new Grid();
    grid.place(TileFactory("Importer", 0, ItemFactory("Aluminium")), 0, 0);
    grid.place(TileFactory("Conveyor", 0), 0, 1);
    grid.place(TileFactory("Conveyor", 0), 0, 2);
    grid.place(TileFactory("Exporter", 0), 0, 3);

    var drawspace = new Drawspace(grid);
    var eventLogger = new EventLogger();

    registerContract(ContractFactory(eventLogger, grid, 0));

    setupInteractions(drawspace, eventLogger);

    $("#dark-mode").click();

    listValidTiles(drawspace.grid);
    displayBlueprints(drawspace.grid);

    cycle(performance.now(), drawspace, eventLogger);
}

function cycle(timestamp, drawspace, eventLogger = undefined) {
    if (!running) return;
    
    var timeWarp = 500; //500 for normal, 250 for 2x speed, etc.

    var lastSecond = Math.floor(drawspace.lastRender / timeWarp);
    var curSecond = Math.floor(timestamp / timeWarp);

    eventLogger.lastSecondFrames += 1 * (1000 / timeWarp);
    
    var t0 = performance.now();

    while (lastSecond != curSecond) {
        var ttt = performance.now();

        lastSecond++; //Process all missed ticks as quickly as possible.
        lastSecond = curSecond; //Skip all missed ticks.

        var m0 = drawspace.grid.money;
        eventLogger.addEventDatapoint(drawspace.grid.tick(lastSecond));
        eventLogger.addMoneyDatapoint((drawspace.grid.money - m0) * (1000 / timeWarp));
        eventLogger.addTickDatapoint(performance.now() - ttt);

        var ttd = performance.now();
        if (lastSecond == curSecond) {
            drawspace.drawGrid();
            eventLogger.addFpsDatapoint(eventLogger.lastSecondFrames);
            eventLogger.lastSecondFrames = 0;
            if (!showDetailedRenderStatistics) {
                $("#response-time").text("fps: " + eventLogger.getAverageFps().toFixed(0));
            }
        }
        updateMoneyString(drawspace, eventLogger);
        updateCostString(drawspace, $("#tile-value").text());
        eventLogger.addDrawDatapoint(performance.now() - ttd);
    }
    var t1 = performance.now() - t0;

    drawspace.render(timestamp % timeWarp / timeWarp);
    drawspace.lastRender = timestamp;
    eventLogger.addRenderDatapoint(performance.now() - timestamp - t1);

    if (showDetailedRenderStatistics) {
        $("#response-time").text("fps: " + 
            eventLogger.getAverageFps().toFixed(0) + " | r: " + 
            eventLogger.getAverageRender().toFixed(1) + "ms | d: " + 
            eventLogger.getAverageDraw().toFixed(1) + "ms | t: " + 
            eventLogger.getAverageTick().toFixed(1) + "ms");
    }

    requestAnimationFrame(function(timestamp) {
        cycle(timestamp, drawspace, eventLogger);
    });
}