class Drawspace {
    constructor(grid, tileSize) {        
        this.grid = grid;
        this.tileSize = tileSize;

        this.canvas = document.getElementById("canvas");
        this.canvas.height = this.getDrawSpace() * (this.grid.size.height / this.grid.size.width);
        this.canvas.width = this.canvas.height * (this.grid.size.width / this.grid.size.height);
        this.context = this.canvas.getContext('2d');

        this.lastRender = 0;

        this.interactionMode = "Select";
        this.updateInteractionMode(this.interactionMode);
    }

    getDrawSpace() {
        var maxHeight = 2 * Math.ceil(($(document).height() - 
                        $("#controls").outerHeight(true) - 
                        ($(this.canvas).offset().top - $("#selection-options").outerHeight(true)) * 2) / 2) - 1;
        var maxWidth = 2 * Math.ceil(($(document).width() - 
                        ($(this.canvas).offset().top - $("#selection-options").outerHeight(true)) * 2) / 2) - 1;
        var maxTile = this.tileSize * Math.max(this.grid.size.width, this.grid.size.height);

        var min = Math.min(maxHeight, maxWidth, maxTile);
        this.tileSize = Math.floor(this.tileSize * (min / maxTile));
        
        return this.tileSize * Math.max(this.grid.size.width, this.grid.size.height);
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

    render(progress) {
        var posX = 0;
        var posY = 0;

        for (var y = 0; y < this.grid.size.height; y++) {
            for (var x = 0; x < this.grid.size.width; x++) {
                var entity = this.grid.grid[y][x];

                var imageName = entity.constructor.name + "_" + entity.rotation;
                if (!images.hasOwnProperty(imageName)) {
                    images[imageName] = new Image();
                    images[imageName].src = "img/" + imageName + ".png";
                }
                this.context.drawImage(images[imageName], posX, posY, this.tileSize, this.tileSize);

                if (this.grid.selectedCell != undefined && this.grid.selectedCell.x == x && this.grid.selectedCell.y == y) {
                    var selectedWidth = this.tileSize / 10;
                    this.context.lineWidth = this.tileSize / 10;
                    this.context.strokeStyle = this.interactionColour;
                    this.context.strokeRect(posX + selectedWidth / 2, posY + selectedWidth / 2, this.tileSize - selectedWidth, this.tileSize - selectedWidth);
                } else {
                    this.context.lineWidth = 1;
                    this.context.strokeStyle = "#000000";
                    this.context.strokeRect(posX, posY, this.tileSize, this.tileSize);
                }
                this.context.lineWidth = 1;
                this.context.strokeStyle = "#000000";

                if (entity.inventory.length > entity.producedCount) {
                    this.context.fillStyle = entity.inventory[entity.inventory.length - 1].colour + "8b";
                    var startX = posX + this.tileSize / 3;
                    var startY = posY + this.tileSize / 3;
                    var size = this.tileSize / 3;
                    this.context.fillRect(startX, startY, size, size);
                    this.context.strokeRect(startX, startY, size, size);
                }

                posX += this.tileSize;
            }
            posX = 0;
            posY += this.tileSize;
        }

        var posX = 0;
        var posY = 0;

        for (var y = 0; y < this.grid.size.height; y++) {
            for (var x = 0; x < this.grid.size.width; x++) {
                if (this.grid.tickAnimations[y] !== undefined && this.grid.tickAnimations[y][x] !== undefined) {
                    var animation = this.grid.tickAnimations[y][x];
                    this.context.fillStyle = animation.items[0].colour;
                    var startX = posX + this.tileSize / 3;
                    var startY = posY + this.tileSize / 3;
                    var size = this.tileSize / 3;

                    var animation = this.grid.tickAnimations[y][x];
                    switch (animation.dir) {
                        case "n":
                            var curX = startX;
                            var curY = startY + (this.tileSize * progress);
                            break;
                        case "e":
                            var curX = startX + (this.tileSize * progress);
                            var curY = startY;
                            break;
                        case "s":
                            var curX = startX;
                            var curY = startY - (this.tileSize * progress);
                            break;
                        case "w":
                            var curX = startX - (this.tileSize * progress);
                            var curY = startY;
                            break;
                        default:
                            break;
                    }
                    this.context.fillRect(curX, curY, size, size);
                    this.context.strokeRect(curX, curY, size, size);
                }

                posX += this.tileSize;
            }
            posX = 0;
            posY += this.tileSize;
        }
    }
}