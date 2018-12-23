class Drawspace {
    constructor(grid, tileSize) {        
        this.grid = grid;
        this.initialTileSize = Math.floor(tileSize / window.devicePixelRatio);
        this.tileSize = this.initialTileSize;

        this.size = {};

        this.xOff = 0;
        this.yOff = 0;

        this.canvas = document.getElementById("canvas");
        this.context = this.canvas.getContext('2d');

        this.baseCanvas = document.createElement("canvas");
        this.baseContext = this.baseCanvas.getContext("2d");

        this.northCanvas = document.createElement("canvas");
        this.northContext = this.northCanvas.getContext("2d");

        this.eastCanvas = document.createElement("canvas");
        this.eastContext = this.eastCanvas.getContext("2d");

        this.southCanvas = document.createElement("canvas");
        this.southContext = this.southCanvas.getContext("2d");

        this.westCanvas = document.createElement("canvas");
        this.westContext = this.westCanvas.getContext("2d");

        this.getDrawSpace();
        this.calculateCanvasSizes();

        this.lastRender = 0;

        this.interactionMode = "Select";
        this.updateInteractionMode(this.interactionMode);
    }

    getDrawSpace() {
        var height = ($(document).height() - 300);
        var width = $(document).width() - 20;

        var maxHeightTileCount = Math.floor(height / this.initialTileSize);
        var maxWidthTileCount = Math.floor(width / this.initialTileSize);

        this.size.height = maxHeightTileCount;
        this.size.width = maxWidthTileCount;
        this.ratio = this.size.width / this.size.height;

        this.canvas.height = this.size.height * this.initialTileSize;
        this.canvas.width = this.size.width * this.initialTileSize;
    }

    calculateCanvasSizes() {
        this.baseCanvas.height = (this.size.height + 2) * this.tileSize;
        this.baseCanvas.width = (this.size.width + 2) * this.tileSize;

        this.northCanvas.height = (this.size.height + 2) * this.tileSize;
        this.northCanvas.width = (this.size.width + 2) * this.tileSize;

        this.eastCanvas.height = (this.size.height + 2) * this.tileSize;
        this.eastCanvas.width = (this.size.width + 2) * this.tileSize;

        this.southCanvas.height = (this.size.height + 2) * this.tileSize;
        this.southCanvas.width = (this.size.width + 2) * this.tileSize;

        this.westCanvas.height = (this.size.height + 2) * this.tileSize;
        this.westCanvas.width = (this.size.width + 2) * this.tileSize;
    }

    zoom(out) {
        if (out) {
            this.initialTileSize = this.initialTileSize / (this.size.height + 2) * this.size.height;
            this.size.height += 2;
        } else {
            this.initialTileSize = this.initialTileSize / (this.size.height - 2) * this.size.height;
            this.size.height -= 2;
        }
        this.tileSize = Math.floor(this.initialTileSize);
        this.size.width = Math.floor(this.size.height * this.ratio);

        this.canvas.height = this.size.height * this.tileSize;
        this.canvas.width = this.size.width * this.tileSize;

        xMax = (this.grid.size.width - this.size.width) * this.tileSize * -1;
        yMax = (this.grid.size.height - this.size.height) * this.tileSize * -1;
        this.xOff = Math.max(xMax, Math.min(0, this.xOff));
        this.yOff = Math.max(yMax, Math.min(0, this.yOff));

        this.calculateCanvasSizes();
    }

    updateInteractionMode(mode) {
        switch (mode) {
            case "Place":
                this.interactionMode = "Place";
                this.interactionColour = "#4bff4b8b";
                break;
            case "Move":
                this.interactionMode = "Move";
                this.interactionColour = "#ffff4b8b";
                break;
            case "Delete":
                this.interactionMode = "Delete";
                this.interactionColour = "#ff4b4b8b";
                break;
            case "Select":
            default:
                this.interactionMode = "Select";
                this.interactionColour = "#4b4bff8b";
                break;
        }
        this.grid.selectedCell = undefined;
    }

    drawGrid() {
        this.drawBase();
        this.drawItems();
    }

    drawBase() {
        this.baseContext.clearRect(0, 0, this.baseCanvas.width, this.baseCanvas.height);

        var posX = 0;
        var posY = 0;

        var firstX = Math.floor((this.xOff * -1) / this.tileSize) - 1;
        var firstY = Math.floor((this.yOff * -1) / this.tileSize) - 1;

        for (var y = firstY; y < this.size.height + firstY + 2; y++) {
            for (var x = firstX; x < this.size.width + firstX + 2; x++) {
                if (this.grid.grid[y] === undefined || this.grid.grid[y][x] === undefined) {
                    posX += this.tileSize;
                    continue;
                }
                var entity = this.grid.grid[y][x];

                var imageName = entity.constructor.name + "_" + entity.rotation;
                if (!images.hasOwnProperty(imageName)) {
                    images[imageName] = new Image();
                    images[imageName].src = "img/tiles/" + imageName + ".png";
                }
                this.baseContext.drawImage(images[imageName], posX, posY, this.tileSize, this.tileSize);

                if (this.grid.selectedCell != undefined && this.grid.selectedCell.x == x && this.grid.selectedCell.y == y) {
                    var selectedWidth = this.tileSize / 10;
                    this.baseContext.lineWidth = this.tileSize / 10;
                    this.baseContext.strokeStyle = this.interactionColour;
                    this.baseContext.strokeRect(posX + selectedWidth / 2, posY + selectedWidth / 2, this.tileSize - selectedWidth, this.tileSize - selectedWidth);
                } else {
                    this.baseContext.lineWidth = 1;
                    this.baseContext.strokeStyle = "#000000";
                    this.baseContext.strokeRect(posX, posY, this.tileSize, this.tileSize);
                }
                this.baseContext.lineWidth = 1;
                this.baseContext.strokeStyle = "#000000";

                if (entity.getInventorySize() > entity.producedCount) {
                    var startX = posX + this.tileSize / 4;
                    var startY = posY + this.tileSize / 4;
                    var size = this.tileSize / 2;
                    this.baseContext.globalAlpha = 0.55;
                    this.baseContext.drawImage(entity.getInventorySprite(), startX, startY, size, size);
                    this.baseContext.globalAlpha = 1;
                }

                posX += this.tileSize;
            }
            posX = 0;
            posY += this.tileSize;
        }
    }

    drawItems() {
        this.northContext.clearRect(0, 0, this.northCanvas.width, this.northCanvas.height);
        this.eastContext.clearRect(0, 0, this.eastCanvas.width, this.eastCanvas.height);
        this.southContext.clearRect(0, 0, this.southCanvas.width, this.southCanvas.height);
        this.westContext.clearRect(0, 0, this.westCanvas.width, this.westCanvas.height);

        var posX = 0;
        var posY = 0;

        var firstX = Math.floor((this.xOff * -1) / this.tileSize) - 1;
        var firstY = Math.floor((this.yOff * -1) / this.tileSize) - 1;

        for (var y = firstY; y < this.size.height + firstY + 2; y++) {
            for (var x = firstX; x < this.size.width + firstX + 2; x++) {
                if (this.grid.grid[y] === undefined || this.grid.grid[y][x] === undefined) {
                    posX += this.tileSize;
                    continue;
                }
                if (this.grid.tickAnimations[y] !== undefined && this.grid.tickAnimations[y][x] !== undefined) {
                    var animation = this.grid.tickAnimations[y][x];
                    var startX = posX + this.tileSize / 4;
                    var startY = posY + this.tileSize / 4;
                    var size = this.tileSize / 2;

                    var imageName = animation.items[0].name;
                    if (!images.hasOwnProperty(imageName)) {
                        images[imageName] = new Image();
                        images[imageName].src = "img/items/" + imageName + ".png";
                    }

                    switch (animation.dir) {
                        case "n":
                            this.northContext.drawImage(images[imageName], startX, startY, size, size);
                            break;
                        case "e":
                            this.eastContext.drawImage(images[imageName], startX, startY, size, size);
                            break;
                        case "s":
                            this.southContext.drawImage(images[imageName], startX, startY, size, size);
                            break;
                        case "w":
                            this.westContext.drawImage(images[imageName], startX, startY, size, size);
                            break;
                        default:
                            break;
                    }
                }
                posX += this.tileSize;
            }
            posX = 0;
            posY += this.tileSize;
        }
    }

    render(progress) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.drawImage(this.baseCanvas, this.xOff % this.tileSize - this.tileSize, this.yOff % this.tileSize - this.tileSize);
        this.context.drawImage(this.northCanvas, this.xOff % this.tileSize - this.tileSize, this.yOff % this.tileSize - this.tileSize + (this.tileSize * progress));
        this.context.drawImage(this.eastCanvas, this.xOff % this.tileSize - this.tileSize + (this.tileSize * progress), this.yOff % this.tileSize - this.tileSize);
        this.context.drawImage(this.southCanvas, this.xOff % this.tileSize - this.tileSize, this.yOff % this.tileSize - this.tileSize - (this.tileSize * progress));
        this.context.drawImage(this.westCanvas, this.xOff % this.tileSize - this.tileSize - (this.tileSize * progress), this.yOff % this.tileSize - this.tileSize);
    }
}