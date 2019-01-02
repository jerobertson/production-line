var deltaX = 0
var deltaY = 0;

function setupInteractions(drawspace) {
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
                    $("#tile-options").hide();
                } else {
                    drawspace.grid.selectedCell = {"x": x, "y": y};
                    $("#selected-tile").text("Selected tile: (" + x + ":" + y + ") " + drawspace.grid.grid[y][x].constructor.name.split("_")[0]);
                    $("#tile-type").val(drawspace.grid.grid[y][x].constructor.name.split("_")[0]);
                    $("#tile-rotation").val(drawspace.grid.grid[y][x].rotation);
                    if (drawspace.grid.grid[y][x].recipe != null) {
                        $("#tile-recipe").val(drawspace.grid.grid[y][x].recipe.result);
                    } else {
                        $("#tile-recipe").val("");
                    }
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
                    var delay = $("#tile-delay").val();
                    var offset = $("#tile-offset").val();
                    var newTile = TileFactory(type, 0, RecipeFactory(recipe), rotation, delay, offset);
                    if (drawspace.grid.money + drawspace.grid.grid[y][x].purchaseCost * 0.8 >= newTile.purchaseCost &&
                        newTile.constructor.name != drawspace.grid.grid[y][x].constructor.name) {
                        drawspace.grid.money += Math.floor(drawspace.grid.grid[y][x].purchaseCost * 0.8);
                        drawspace.grid.money -= newTile.purchaseCost;
                        drawspace.grid.place(newTile, x, y);
                    } else if (newTile.constructor.name == drawspace.grid.grid[y][x].constructor.name) {
                        drawspace.grid.place(newTile, x, y);
                    }
                }
                break;
            case "Move":
                if (sameTile) {
                    drawspace.grid.selectedCell = undefined;
                    $("#selected-tile").text("Selected tile: None");
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
                    } else {
                        drawspace.grid.selectedCell = {"x": x, "y": y};
                        $("#selected-tile").text("Selected tile: (" + x + ":" + y + ") " + drawspace.grid.grid[y][x].constructor.name);
                    }
                }
                break;
            case "Delete":
                drawspace.grid.selectedCell = {"x": x, "y": y};
                $("#selected-tile").text("Selected tile: (" + x + ":" + y + ") Empty");
                drawspace.grid.money += Math.floor(drawspace.grid.grid[y][x].purchaseCost * 0.8);
                drawspace.grid.place(TileFactory("Empty", 0), x, y);
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
        switch (drawspace.interactionMode) {
            case "Select":
            case "Move":
            case "Delete":
                $("#tile-options").hide();
                break;
            case "Place":
                $("#tile-options").show();
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

    $("#tile-type").change(function() {
        if (drawspace.grid.selectedCell === undefined || drawspace.interactionMode == "Place") {
            drawspace.grid.selectedCell = undefined;
            $("#selected-tile").text("Selected tile: None");
            $("#tile-type option:selected").each(function() {
                $("#tile-delay").val(TileFactory($(this).val(), 0).delay);
                $("#tile-offset").val(0);
            });
            return;
        }
        $("#tile-type option:selected").each(function() {
            var x = drawspace.grid.selectedCell.x;
            var y = drawspace.grid.selectedCell.y;
            var rotation = drawspace.grid.grid[y][x].rotation;
            var newTile = TileFactory($(this).val(), 0, null, rotation);
            if (drawspace.grid.money + drawspace.grid.grid[y][x].purchaseCost * 0.8 >= newTile.purchaseCost &&
                newTile.constructor.name != drawspace.grid.grid[y][x].constructor.name) {
                drawspace.grid.money += Math.floor(drawspace.grid.grid[y][x].purchaseCost * 0.8);
                drawspace.grid.money -= newTile.purchaseCost;
                drawspace.grid.place(newTile, x, y);
            }
            $("#tile-recipe").val("");
            $("#tile-delay").val(drawspace.grid.grid[y][x].delay);
            $("#tile-offset").val(drawspace.grid.grid[y][x].offset);
        });

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
            drawspace.grid.grid[y][x].recipe = RecipeFactory(recipe);
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