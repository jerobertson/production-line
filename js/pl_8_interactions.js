var deltaX = 0
var deltaY = 0;

function setupInteractions(drawspace, eventLogger) {
    var interact = new Hammer.Manager(drawspace.canvas);
    interact.add(new Hammer.Tap());
    interact.add(new Hammer.Pan({direction: Hammer.DIRECTION_ALL, threshold: drawspace.tileSize / 2}));

    interact.on('tap', function(ev) {
        var x = Math.floor((ev.changedPointers[0].offsetX - drawspace.xOff) / drawspace.tileSize); 
        var y = Math.floor((ev.changedPointers[0].offsetY - drawspace.yOff) / drawspace.tileSize);
        var sameTile = false;
        
        if (drawspace.grid.selectedCell != undefined && 
            drawspace.grid.selectedCell.x == x && 
            drawspace.grid.selectedCell.y == y) {
            sameTile = true;
        }

        switch (drawspace.interactionMode) {
            case "Select":
                if (sameTile) {
                    drawspace.grid.selectedCell = undefined;
                    $("#selected-tile").text("Selected tile: None");
                    $("#tile-value").text("Tile value: ...");
                    $("#tile-options").hide();
                } else {
                    drawspace.grid.selectedCell = {"x": x, "y": y};
                    var name = drawspace.grid.grid[y][x].constructor.name.split("_")[0];
                    var level = parseInt(drawspace.grid.grid[y][x].constructor.name.split("_")[1]) + 1;
                    if (level == 6) level = "S";
                    $("#selected-tile").text("Selected tile: " + name + " Lvl. " + level);
                    $("#tile-value").html("Tile value: &pound;" + drawspace.grid.grid[y][x].purchaseCost.toLocaleString("en-GB", {maximumFractionDigits: 0}));
                    $("#tile-type").val(drawspace.grid.grid[y][x].constructor.name.split("_")[0]);
                    $("#tile-level").val(drawspace.grid.grid[y][x].constructor.name.split("_")[1]);
                    $("#tile-rotation").val(drawspace.grid.grid[y][x].rotation);
                    listValidRecipes(drawspace.grid.grid[y][x]);
                    listValidOffsets(drawspace.grid.grid[y][x]);
                    $("#tile-delay").val(drawspace.grid.grid[y][x].delay);
                    $("#tile-offset").val(drawspace.grid.grid[y][x].delayOffset);
                    $("#tile-options").show();
                }
                break;
            case "Place":
                if (sameTile) {
                    drawspace.grid.selectedCell = undefined;
                    $("#selected-tile").text("Selected tile: None");
                } else {
                    drawspace.grid.selectedCell = {"x": x, "y": y};
                    var type = $("#tile-type").val();
                    var recipe = $("#tile-recipe").val();
                    var rotation = parseInt($("#tile-rotation").val());
                    var offset = parseInt($("#tile-offset").val());
                    var level = $("#tile-level").val();
                    var newTile = TileFactory(type, level, ItemFactory(recipe), rotation, offset);
                    if (drawspace.grid.money + drawspace.grid.grid[y][x].purchaseCost * 0.8 >= newTile.purchaseCost &&
                        newTile.constructor.name != drawspace.grid.grid[y][x].constructor.name) {
                        drawspace.grid.money += Math.floor(drawspace.grid.grid[y][x].purchaseCost * 0.8);
                        drawspace.grid.money -= newTile.purchaseCost;
                        drawspace.grid.place(newTile, x, y);
                        listValidRecipes(newTile);
                        listValidOffsets(newTile);
                        updateMoneyString(drawspace, eventLogger);
                        updateCostString(drawspace, $("#tile-value").text());
                    } else if (newTile.constructor.name == drawspace.grid.grid[y][x].constructor.name) {
                        drawspace.grid.place(newTile, x, y);
                        listValidRecipes(newTile);
                        listValidOffsets(newTile);
                    } else {
                        drawspace.grid.selectedCell = undefined;
                    }
                }
                break;
            case "Move":
                if (sameTile) {
                    drawspace.grid.selectedCell = undefined;
                    $("#selected-tile").text("Selected tile: None");
                    $("#tile-value").text("Tile value: ...");
                } else {
                    if (drawspace.grid.selectedCell != undefined) {
                        xO = drawspace.grid.selectedCell.x;
                        yO = drawspace.grid.selectedCell.y;
                        entityO = drawspace.grid.grid[yO][xO];
                        entityN = drawspace.grid.grid[y][x];

                        drawspace.grid.grid[yO][xO] = entityN;
                        drawspace.grid.grid[y][x] = entityO;

                        drawspace.grid.selectedCell = undefined;
                        $("#selected-tile").text("Selected tile: None");
                        $("#tile-value").text("Tile value: ...");
                    } else {
                        drawspace.grid.selectedCell = {"x": x, "y": y};
                        var name = drawspace.grid.grid[y][x].constructor.name.split("_")[0];
                        var level = parseInt(drawspace.grid.grid[y][x].constructor.name.split("_")[1]) + 1;
                        if (level == 6) level = "S";
                        $("#selected-tile").text("Selected tile: " + name + " Lvl. " + level);
                        $("#tile-value").html("Tile value: &pound;" + drawspace.grid.grid[y][x].purchaseCost.toLocaleString("en-GB", {maximumFractionDigits: 0}));
                    }
                }
                break;
            case "Delete":
                drawspace.grid.selectedCell = {"x": x, "y": y};
                $("#tile-value").html("Refund: &pound;" + (drawspace.grid.grid[y][x].purchaseCost * 0.8).toLocaleString("en-GB", {maximumFractionDigits: 0}));
                drawspace.grid.money += Math.floor(drawspace.grid.grid[y][x].purchaseCost * 0.8);
                drawspace.grid.place(TileFactory("Empty", 0), x, y);
                listValidRecipes({});
                listValidOffsets({});
                updateMoneyString(drawspace, eventLogger);
                updateCostString(drawspace, $("#tile-value").text());
                break;
            default:
                throw "Invalid interaction mode!";
        }

        drawspace.drawGrid();
    });

    interact.on('panstart pan', function(ev) {
        switch (ev.type) {
            case "panstart":
                deltaX = 0;
                deltaY = 0;
                break;
            case "pan":
                var xDif = ev.deltaX - deltaX;
                var yDif = ev.deltaY - deltaY;

                var xMax = (drawspace.grid.size.width - drawspace.size.width) * drawspace.tileSize * -1;
                var yMax = (drawspace.grid.size.height - drawspace.size.height) * drawspace.tileSize * -1;

                drawspace.xOff = Math.max(xMax, Math.min(0, drawspace.xOff + xDif));
                drawspace.yOff = Math.max(yMax, Math.min(0, drawspace.yOff + yDif));

                deltaX = ev.deltaX;
                deltaY = ev.deltaY;
                break;
            default:
                break;
        }

        drawspace.drawGrid();
    });
    
    $(".btn-interact").click(function() {
        $(".btn-interact").removeClass("active");
        $(this).addClass("active");
        drawspace.updateInteractionMode($(this).text());
        $("#selected-tile").show();
        $("#tile-value").text("Tile value: ...");
        switch (drawspace.interactionMode) {
            case "Delete":
                $("#selected-tile").hide();
                $("#tile-value").text("Refund: ...");
            case "Select":
            case "Move":
                $("#tile-options").hide();
                $("#tile-type-selector").hide();
                $("#tile-level-selector").hide();
                break;
            case "Place":
                $("#selected-tile").hide();
                $("#tile-options").show();
                $("#tile-type-selector").show();
                $("#tile-level-selector").show();
                var newTile = TileFactory($("#tile-type").val(),
                    $("#tile-level").val(),
                    ItemFactory($("#tile-recipe").val()),
                    parseInt($("#tile-rotation").val()),
                    parseInt($("#tile-offset").val()));
                listValidRecipes(newTile);
                listValidOffsets(newTile);
                updateCostString(drawspace, 
                    "Tile cost: &pound;" + 
                    newTile.purchaseCost.toLocaleString("en-GB", {maximumFractionDigits: 0}));
                break;
            default:
                throw "Invalid interaction mode!";
        }
        $("#selected-tile").text("Selected tile: None");

        drawspace.drawGrid();
    });

    $("#zoom-in").click(function() {
        $("#zoom-in").removeClass("active");
        
        drawspace.zoom(false);

        interact.remove('pan');
        interact.add(new Hammer.Pan({direction: Hammer.DIRECTION_ALL, threshold: drawspace.tileSize / 2}));
    });

    $("#zoom-out").click(function() {
        $("#zoom-out").removeClass("active");

        drawspace.zoom(true);

        interact.remove('pan');
        interact.add(new Hammer.Pan({direction: Hammer.DIRECTION_ALL, threshold: drawspace.tileSize / 2}));
    });

    $("#response-time").click(function() {
        showDetailedRenderStatistics = !showDetailedRenderStatistics;
    })

    $("#tile-type").change(function() {
        if (drawspace.grid.selectedCell === undefined || drawspace.interactionMode == "Place") {
            drawspace.grid.selectedCell = undefined;
            var newTile = TileFactory($("#tile-type").val(), $("#tile-level").val());
            $("#tile-type option:selected").each(function() {
                updateCostString(drawspace, 
                    "Tile cost: &pound;" + 
                    newTile.purchaseCost.toLocaleString("en-GB", {maximumFractionDigits: 0}));
                listValidRecipes(newTile);
                listValidOffsets(newTile);
                $("#tile-delay").val(newTile.delay);
                $("#tile-offset").val(newTile.delayOffset);
            });
            return;
        }

        drawspace.drawGrid();
    });

    $("#tile-level").change(function() {
        if (drawspace.grid.selectedCell === undefined || drawspace.interactionMode == "Place") {
            drawspace.grid.selectedCell = undefined;
            var newTile = TileFactory($("#tile-type").val(), $("#tile-level").val());
            $("#tile-type option:selected").each(function() {
                updateCostString(drawspace, 
                    "Tile cost: &pound;" + 
                    newTile.purchaseCost.toLocaleString("en-GB", {maximumFractionDigits: 0}));
                listValidOffsets(newTile);
                $("#tile-delay").val(newTile.delay);
                $("#tile-offset").val(newTile.delayOffset);
            });
            return;
        }

        drawspace.drawGrid();
    });

    $("#tile-rotation").change(function() {
        if (drawspace.grid.selectedCell === undefined || drawspace.interactionMode == "Place") {
            drawspace.grid.selectedCell = undefined;
            $("#selected-tile").text("Selected tile: None");
            return;
        }
        $("#tile-rotation option:selected").each(function() {
            var x = drawspace.grid.selectedCell.x;
            var y = drawspace.grid.selectedCell.y;
            var rotation = parseInt($(this).val());
            if (!isNaN(rotation)) {
                drawspace.grid.grid[y][x].rotation = rotation;
            }
        });

        drawspace.drawGrid();
    });

    $("#tile-recipe").change(function() {
        if (drawspace.grid.selectedCell === undefined || drawspace.interactionMode == "Place") {
            drawspace.grid.selectedCell = undefined;
            $("#selected-tile").text("Selected tile: None");
            return;
        }
        $("#tile-recipe option:selected").each(function() {
            var x = drawspace.grid.selectedCell.x;
            var y = drawspace.grid.selectedCell.y;
            var recipe = $(this).val();
            drawspace.grid.grid[y][x].recipe = ItemFactory(recipe);
        });

        drawspace.drawGrid();
    });

    $("#tile-delay").change(function() {
        if (drawspace.grid.selectedCell === undefined || drawspace.interactionMode == "Place") {
            drawspace.grid.selectedCell = undefined;
            $("#selected-tile").text("Selected tile: None");
            return;
        }
        $("#tile-delay option:selected").each(function() {
            var x = drawspace.grid.selectedCell.x;
            var y = drawspace.grid.selectedCell.y;
            var delay = parseInt($(this).val());
            if (!isNaN(delay)) {
                drawspace.grid.grid[y][x].delay = delay;
            }
        });

        drawspace.drawGrid();
    });

    $("#tile-offset").change(function() {
        if (drawspace.grid.selectedCell === undefined || drawspace.interactionMode == "Place") {
            drawspace.grid.selectedCell = undefined;
            $("#selected-tile").text("Selected tile: None");
            return;
        }
        $("#tile-offset option:selected").each(function() {
            var x = drawspace.grid.selectedCell.x;
            var y = drawspace.grid.selectedCell.y;
            var offset = parseInt($(this).val());
            if (!isNaN(offset)) {
                drawspace.grid.grid[y][x].delayOffset = offset;
            }
        });

        drawspace.drawGrid();
    });
}

function listValidRecipes(entity) {
    $("#tile-recipe").empty();
    $("#tile-recipe").append($("<option></option>").attr("value", "").text("None"));
    $("#tile-recipe").val("");
    if (entity.validRecipes !== undefined) {
        $("#tile-recipe-selector").show();
        for (var i = 0; i < entity.validRecipes.length; i++) {
            var recipe = entity.validRecipes[i];
            $("#tile-recipe").append($("<option></option>").attr("value", recipe).text(recipe));
        }
        if (entity.recipe !== null) {
            $("#tile-recipe").val(entity.recipe.name);
        }
    } else {
        $("#tile-recipe-selector").hide();
    }
}

function listValidOffsets(entity) {
    $("#tile-offset").empty();
    $("#tile-offset").append($("<option></option>").attr("value", 0).text("0s"));
    $("#tile-offset").val(0);
    $("#tile-rotation-selector").hide();
    $("#tile-offset-selector").hide();
    if (entity.delay !== undefined && entity.delay != Number.MAX_SAFE_INTEGER && entity.delay != 1) {
        $("#tile-rotation-selector").show();
        $("#tile-offset-selector").show();
        for (var i = 1; i < entity.delay; i++) {
            $("#tile-offset").append($("<option></option>").attr("value", i).text((i / 2) + "s"));
        }
        $("#tile-offset").val(entity.delayOffset);
    } else if (entity.delay == 1) {
        $("#tile-rotation-selector").show();
    }
}