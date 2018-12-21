var deltaX = 0
var deltaY = 0;

function setupInteractions(drawspace) {
    var interact = new Hammer(drawspace.canvas);
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
                    $("#selected-tile").text("Selected tile: (" + x + ":" + y + ") " + drawspace.grid.grid[y][x].constructor.name);
                    $("#tile-type").val(drawspace.grid.grid[y][x].constructor.name);
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
                    drawspace.grid.place(TileFactory(type, RecipeFactory(recipe), rotation, delay, offset), x, y);
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
                drawspace.grid.place(TileFactory("Empty"), x, y);
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
                xDif = ev.deltaX - deltaX;
                yDif = ev.deltaY - deltaY;

                xMax = (drawspace.grid.size.width - drawspace.size.width) * drawspace.tileSize * -1;
                yMax = (drawspace.grid.size.height - drawspace.size.height) * drawspace.tileSize * -1;

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

    $("#tile-type").change(function() {
        if (drawspace.grid.selectedCell === undefined || drawspace.interactionMode == "Place") {
            drawspace.grid.selectedCell = undefined;
            $("#selected-tile").text("Selected tile: None");
            return;
        }
        $("#tile-type option:selected").each(function() {
            var x = drawspace.grid.selectedCell.x;
            var y = drawspace.grid.selectedCell.y;
            var rotation = drawspace.grid.grid[y][x].rotation;
            switch ($(this).val()) {
                case "Importer":
                    drawspace.grid.place(new Importer(null), x, y);
                    break;
                case "Exporter":
                    drawspace.grid.place(new Exporter(), x, y);
                    break;
                case "Conveyor":
                    drawspace.grid.place(new Conveyor(), x, y);
                    break;
                case "Splitter":
                    drawspace.grid.place(new Splitter(), x, y);
                    break;
                case "Furnace":
                    drawspace.grid.place(new Furnace(), x, y);
                    break;
                default:
                    drawspace.grid.place(new Box(), x, y);
                    break;
            }
            drawspace.grid.grid[y][x].rotation = rotation;
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