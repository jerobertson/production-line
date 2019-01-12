class Contract {
    constructor(eventLogger, grid, id, title, condition, time = null, reward = null, onFailure = null, progressRewardText = null, completedRewardText = null) {
        this.eventLogger = eventLogger;
        this.grid = grid;

        this.id = id;
        this.title = title;
        this.condition = condition;
        this.time = time;
        this.reward = reward;
        this.onFailure = onFailure;
        this.progressRewardText = progressRewardText;
        this.completedRewardText = completedRewardText;

        this.progress = 0;
        this.timeLeft = this.time;

        this.eventLogger.registerContract(this);
    }    

    get isComplete() {
        return this.progress >= this.condition;
    }

    get progressPercent() {
        return Math.round((this.progress / this.condition) * 10000) / 100;
    }

    complete() {
        var completed = true;
        if (this.reward != null) {
            if (this.time != null && this.timeLeft > 0) {
                this.reward();
            } else if (this.time == null) {
                this.reward();
            } else {
                completed = false;
            }
        } else if (this.time != null && this.timeLeft == 0) {
            completed = false;
        }
        $("#contract-" + this.id).remove();

        var html = "";
        if (completed) html += $("#contracts-completed-container").html();
        else html += $("#contracts-failed-container").html();
        html += `<div id="contract-` + this.id + `" class="row justify-content-center align-items-center mb-2">`;
        if (completed) html += `<div class="container m-2 p-2" style="background: #004b008b">`;
        else html += `<div class="container m-2 p-2" style="background: #4b00008b">`;
        html += `<div class="col-12 mb-2 text-center">
            ` + this.title + "... (" + Math.min(this.progress, this.condition) + "/" + this.condition + ") - " + this.progressPercent.toLocaleString("en-GB", {maximumFractionDigits: 2, minimumFractionDigits: 2}) + "%" + `
        </div>
        <div class="col-12 mb-2 w-100">
            <div class="progress position-relative">`;
        if (completed) html += `<div class="progress-bar bg-success" role="progressbar" style="width: 100%"></div>`;
        else html += `<div class="progress-bar bg-danger" role="progressbar" style="width: ` + this.progressPercent + `%"></div>`;
        html += `</div>
            </div>
        <div class="row justify-content-center align-items-center">`;
        if (this.completedRewardText != null && completed) {
            html += `<div class="col-auto text-center">
                Reward: ` + this.completedRewardText + `
            </div>`;
        } else if (this.progressRewardText != null) {
            html += `<div class="col-auto text-center">
                Reward: ` + this.progressRewardText + `
            </div>`;
        }
        if (this.time != null) {
            if (completed) {
                html += `<div class="col-auto text-center text-success" style="background: #2b2b2b">
                    Allocated time: ` + Math.floor(this.time / 2) + `s
                </div>`;
                html += `<div class="col-auto text-center text-success" style="background: #2b2b2b">
                    Time taken: ` + Math.floor((this.time - this.timeLeft) / 2) + `s
                </div>`;
            } else {
                html += `<div class="col-auto text-center text-danger" style="background: #2b2b2b">
                    Allocated time: ` + Math.floor(this.time / 2) + `s
                </div>`;
            }
        }
        html +=`</div>
            </div>
        </div>`;

        if (completed) $("#contracts-completed-container").html(html);
        else $("#contracts-failed-container").html(html);

        if (!completed && this.onFailure != null) this.onFailure();

        if (completed) showAlert("Contract \"" + this.title + "\" complete!", "alert-success");
        else if (this.onFailure == null) showAlert("Contract \"" + title + "\" failed!", "alert-danger");
    }

    update() {
        throw "Can't update a generic Contract!";
    }

    updateProgressBar() {
        var timeTaken = this.time - this.timeLeft;
        var timePercent = Math.round(timeTaken / this.time * 10000) / 100;

        $("#contract-" + this.id + "-title").html(this.title + "... (" + this.progress + "/" + this.condition + ") - " + this.progressPercent.toLocaleString("en-GB", {maximumFractionDigits: 2, minimumFractionDigits: 2}) + "%");
        $("#contract-" + this.id + "-time").text("Time left: " + Math.floor(this.timeLeft / 2) + "s");

        if (this.time != null && timePercent > this.progressPercent) {
            $("#contract-" + this.id + "-bar-time-pre").css("width","0%");
            $("#contract-" + this.id + "-bar").css("width", this.progressPercent + "%");
            $("#contract-" + this.id + "-bar-time").css("width", timePercent - this.progressPercent + "%");
        } else if (this.time != null) {
            $("#contract-" + this.id + "-bar-time-pre").css("width", timePercent + "%");
            $("#contract-" + this.id + "-bar").css("width", this.progressPercent - timePercent + "%");
            $("#contract-" + this.id + "-bar-time").css("width","0%");
        } else {
            $("#contract-" + this.id + "-bar-time-pre").css("width","0%");
            $("#contract-" + this.id + "-bar").css("width", this.progressPercent + "%");
            $("#contract-" + this.id + "-bar-time").css("width","0%");
        }
    }
}

class ExportContract extends Contract {
    constructor(eventLogger, grid, id, title, condition, item = null, time = null, reward = null, onFailure = null, progressRewardText = null, completedRewardText = null) {
        super(eventLogger, grid, id, title, condition, time, reward, onFailure, progressRewardText, completedRewardText);

        this.item = item;
    }

    update(eventDatapoints) {
        if (this.time != null) this.timeLeft--;
        if (this.time != null && this.timeLeft == 0) { this.complete(); return true; }

        var lastEvent = eventDatapoints[eventDatapoints.length - 1];
        if (this.item != null && lastEvent.exportedItems.hasOwnProperty(this.item)) {
            this.progress += lastEvent.exportedItems[this.item];
        } else if (this.item == null) {
            for (var key in lastEvent.exportedItems) {
                if (lastEvent.exportedItems.hasOwnProperty(key)) {
                    this.progress += lastEvent.exportedItems[key];
                }
            }
        }

        this.updateProgressBar();

        if (this.progress >= this.condition) {
            this.complete();
            return true;
        }

        return false;
    }
}

class EarnContract extends Contract {
    constructor(eventLogger, grid, id, title, condition, time = null, reward = null, onFailure = null, progressRewardText = null, completedRewardText = null) {
        super(eventLogger, grid, id, title, condition, time, reward, onFailure, progressRewardText, completedRewardText);
    }

    update(eventDatapoints) {
        if (this.time != null) this.timeLeft--;
        if (this.time != null && this.timeLeft == 0) { this.complete(); return true; }

        this.progress += eventDatapoints[eventDatapoints.length - 1].earnings;

        this.updateProgressBar();

        if (this.progress >= this.condition) {
            this.complete();
            return true;
        }

        return false;
    }
}

function ContractFactory(eventLogger, grid, id) {
    switch (id) {
        case 10001:
            var title = "Test Contract 1: Export 10 Aluminium";
            var condition = 10;
            var item = "Aluminium";
            var time = null;
            var reward = null;
            var onFailure = null;
            var progressRewardText = "???";
            var completedRewardText = "None";
            return new ExportContract(eventLogger, grid, id, title, condition, item, time, reward, onFailure, progressRewardText, completedRewardText);
        case 10002:
            var title = "Test Contract 2: Export 50 Aluminium";
            var condition = 50;
            var item = "Aluminium";
            var time = 121;
            var reward = null;
            var onFailure = null;
            var progressRewardText = "???";
            var completedRewardText = "None";
            return new ExportContract(eventLogger, grid, id, title, condition, item, time, reward, onFailure, progressRewardText, completedRewardText);
        case 10003:
            var title = "Test Contract 3: Export 600 Aluminium";
            var condition = 600;
            var item = "Aluminium";
            var time = null;
            var reward = null;
            var onFailure = null;
            var progressRewardText = "???";
            var completedRewardText = "None";
            return new ExportContract(eventLogger, grid, id, title, condition, item, time, reward, onFailure, progressRewardText, completedRewardText);
        case 0:
            var title = "Export 10 Iron";
            var condition = 10;
            var item = "Iron";
            var time = null;
            var reward = function() {
                this.grid.unlockTile("Assembler", 0);
                this.grid.unlockRecipe("Frame");
                listValidTiles(this.grid);
                displayBlueprints(this.grid);
                registerContract(ContractFactory(eventLogger, grid, 2));
                registerContract(ContractFactory(eventLogger, grid, 1));
                registerContract(ContractFactory(eventLogger, grid, 7));
                registerContract(ContractFactory(eventLogger, grid, 3));
            };
            var onFailure = null;
            var progressRewardText = "New tile type and recipe";
            var completedRewardText = "Assembler Lvl. 1; Frame";
            return new ExportContract(eventLogger, grid, id, title, condition, item, time, reward, onFailure, progressRewardText, completedRewardText);
        case 1:
            var title = "Export 100 Copper";
            var condition = 100;
            var item = "Copper";
            var time = null;
            var reward = function() {
                this.grid.unlockTile("Drawer", 0);
                this.grid.unlockRecipe("Aluminium Coil");
                this.grid.unlockRecipe("Copper Coil");
                this.grid.unlockRecipe("Iron Coil");
                this.grid.unlockRecipe("Lead Coil");
                this.grid.unlockRecipe("Silver Coil");
                this.grid.unlockRecipe("Zinc Coil");
                listValidTiles(this.grid);
                displayBlueprints(this.grid);
                registerContract(ContractFactory(eventLogger, grid, 5));
            };
            var onFailure = null;
            var progressRewardText = "New tile type and recipes";
            var completedRewardText = "Drawer Lvl. 1; Coils";
            return new ExportContract(eventLogger, grid, id, title, condition, item, time, reward, onFailure, progressRewardText, completedRewardText);
        case 2:
            var title = "Export 150 Aluminium";
            var condition = 150;
            var item = "Aluminium";
            var time = null;
            var reward = function() {
                this.grid.unlockTile("Press", 0);
                this.grid.unlockRecipe("Aluminium Plate");
                this.grid.unlockRecipe("Copper Plate");
                this.grid.unlockRecipe("Iron Plate");
                this.grid.unlockRecipe("Lead Plate");
                this.grid.unlockRecipe("Silver Plate");
                this.grid.unlockRecipe("Zinc Plate");
                this.grid.unlockRecipe("Gear");
                listValidTiles(this.grid);
                displayBlueprints(this.grid);
                registerContract(ContractFactory(eventLogger, grid, 6));
                registerContract(ContractFactory(eventLogger, grid, 4));
            };
            var onFailure = null;
            var progressRewardText = "New tile type and recipes";
            var completedRewardText = "Press Lvl. 1; Plates; Gear";
            return new ExportContract(eventLogger, grid, id, title, condition, item, time, reward, onFailure, progressRewardText, completedRewardText);
        case 3:
            var title = "Export 15 Iron in 10 seconds <em>(Repeatable)</em>";
            var condition = 15;
            var item = "Iron";
            var time = 21;
            var reward = function() {
                this.grid.unlockTile("Importer", 0, 1);
            };
            var onFailure = function() {
                $("#contract-" + this.id).remove();
                registerContract(ContractFactory(eventLogger, grid, this.id));
            };
            var progressRewardText = "Importer limit +1";
            var completedRewardText = "Importer limit +1";
            return new ExportContract(eventLogger, grid, id, title, condition, item, time, reward, onFailure, progressRewardText, completedRewardText);
        case 4:
            var title = "Export 5 Gears in 10 seconds <em>(Repeatable)</em>";
            var condition = 5;
            var item = "Gear";
            var time = 21;
            var reward = function() {
                this.grid.unlockRecipe("Engine");
                displayBlueprints(this.grid);
                registerContract(ContractFactory(eventLogger, grid, 8));
            };
            var onFailure = function() {
                $("#contract-" + this.id).remove();
                registerContract(ContractFactory(eventLogger, grid, this.id));
            };
            var progressRewardText = "New recipe";
            var completedRewardText = "Engine";
            return new ExportContract(eventLogger, grid, id, title, condition, item, time, reward, onFailure, progressRewardText, completedRewardText);
        case 5:
            var title = "Export 50 Silver Coils";
            var condition = 50;
            var item = "Silver Coil";
            var time = null;
            var reward = function() {
                this.grid.unlockRecipe("Bracelet");
                displayBlueprints(this.grid);
            };
            var onFailure = null;
            var progressRewardText = "New recipe";
            var completedRewardText = "Bracelet";
            return new ExportContract(eventLogger, grid, id, title, condition, item, time, reward, onFailure, progressRewardText, completedRewardText);
        case 6:
            var title = "Export 50 Aluminium Plates";
            var condition = 50;
            var item = "Aluminium Plate";
            var time = null;
            var reward = function() {
                this.grid.unlockRecipe("Chassis");
                displayBlueprints(this.grid);
            };
            var onFailure = null;
            var progressRewardText = "New recipe";
            var completedRewardText = "Chassis";
            return new ExportContract(eventLogger, grid, id, title, condition, item, time, reward, onFailure, progressRewardText, completedRewardText);
        case 7:
            var title = "Export 50 Frames in 5 minutes <em>(One Time)</em>";
            var condition = 50;
            var item = "Frame";
            var time = 601;
            var reward = function() {
                this.grid.money += 20000;
            };
            var onFailure = null;
            var progressRewardText = "&pound;20,000";
            var completedRewardText = "&pound;20,000";
            return new ExportContract(eventLogger, grid, id, title, condition, item, time, reward, onFailure, progressRewardText, completedRewardText);
        case 8:
            var title = "Earn &pound;100,000";
            var condition = 100000;
            var time = null;
            var reward = function() {
                this.grid.unlockTile("Importer", 1);
                this.grid.unlockTile("Conveyor", 1);
                this.grid.unlockTile("Splitter", 0);
                this.grid.unlockTile("Exporter", 0, 2);
                this.grid.unlockRecipe("Coal");
                this.grid.unlockRecipe("Gold");
                this.grid.unlockRecipe("Silicon");
                this.grid.unlockRecipe("Tin");
                listValidTiles(this.grid);
                displayBlueprints(this.grid);
                registerContract(ContractFactory(eventLogger, grid, 10));
                registerContract(ContractFactory(eventLogger, grid, 11));
                registerContract(ContractFactory(eventLogger, grid, 12));
                registerContract(ContractFactory(eventLogger, grid, 9));
            };
            var onFailure = null;
            var progressRewardText = "New tile types and recipes; Exporter limit +2";
            var completedRewardText = "Importer Lvl. 2; Conveyor Lvl. 2; Splitter Lvl. 1; Lvl. 2 materials; Exporter limit +2";
            return new EarnContract(eventLogger, grid, id, title, condition, time, reward, onFailure, progressRewardText, completedRewardText);
        case 9:
            var title = "Export 50 items in 10 seconds <em>(Repeatable)</em>";
            var condition = 50;
            var item = null;
            var time = 21;
            var reward = function() {
                registerContract(ContractFactory(eventLogger, grid, 13));
                registerContract(ContractFactory(eventLogger, grid, 14));
                registerContract(ContractFactory(eventLogger, grid, 16));
            };
            var onFailure = function() {
                $("#contract-" + this.id).remove();
                registerContract(ContractFactory(eventLogger, grid, this.id));
            };
            var progressRewardText = "New contracts";
            var completedRewardText = "New contracts";
            return new ExportContract(eventLogger, grid, id, title, condition, item, time, reward, onFailure, progressRewardText, completedRewardText);
        case 10:
            var title = "Export 1,000 Items";
            var condition = 1000;
            var item = null;
            var time = null;
            var reward = function() {
                this.grid.unlockTile("Importer", 0, 2);
                listValidTiles(this.grid);
                registerContract(ContractFactory(eventLogger, grid, 17));
            };
            var onFailure = null;
            var progressRewardText = "Importer limit +2;";
            var completedRewardText = "Importer limit +2;";
            return new ExportContract(eventLogger, grid, id, title, condition, item, time, reward, onFailure, progressRewardText, completedRewardText);
        case 11:
            var title = "Export 500 Gold";
            var condition = 500;
            var item = "Gold";
            var time = null;
            var reward = function() {
                this.grid.unlockTile("Drawer", 1);
                this.grid.unlockRecipe("Gold Coil");
                this.grid.unlockRecipe("Tin Coil");
                listValidTiles(this.grid);
                displayBlueprints(this.grid);
            };
            var onFailure = null;
            var progressRewardText = "Tile upgrade and new recipes";
            var completedRewardText = "Drawer Lvl. 2; Lvl. 2 Coils";
            return new ExportContract(eventLogger, grid, id, title, condition, item, time, reward, onFailure, progressRewardText, completedRewardText);
        case 12:
            var title = "Export 600 Silicon";
            var condition = 600;
            var item = "Silicon";
            var time = null;
            var reward = function() {
                this.grid.unlockTile("Press", 1);
                this.grid.unlockRecipe("Gold Plate");
                this.grid.unlockRecipe("Tin Plate");
                this.grid.unlockRecipe("Wafer");
                listValidTiles(this.grid);
                displayBlueprints(this.grid);
            };
            var onFailure = null;
            var progressRewardText = "Tile upgrade and new recipes";
            var completedRewardText = "Press Lvl. 2; Lvl. 2 Plates";
            return new ExportContract(eventLogger, grid, id, title, condition, item, time, reward, onFailure, progressRewardText, completedRewardText);
        case 13:
            var title = "Export 500 Lead Coils";
            var condition = 500;
            var item = "Lead Coil";
            var time = null;
            var reward = function() {
                this.grid.unlockRecipe("Battery");
                this.grid.unlockRecipe("Car");
                displayBlueprints(this.grid);
            };
            var onFailure = null;
            var progressRewardText = "New recipes";
            var completedRewardText = "Battery; Car";
            return new ExportContract(eventLogger, grid, id, title, condition, item, time, reward, onFailure, progressRewardText, completedRewardText);
        case 14:
            var title = "Export 100 Iron Plates";
            var condition = 100;
            var item = "Iron Plate";
            var time = null;
            var reward = function() {
                this.grid.unlockRecipe("Container");
                displayBlueprints(this.grid);
                registerContract(ContractFactory(eventLogger, grid, 15));
            };
            var onFailure = null;
            var progressRewardText = "New recipe";
            var completedRewardText = "Container";
            return new ExportContract(eventLogger, grid, id, title, condition, item, time, reward, onFailure, progressRewardText, completedRewardText);
        case 15:
            var title = "Export 1313 Iron Coils";
            var condition = 1313;
            var item = "Iron Coil";
            var time = null;
            var reward = function() {
                this.grid.unlockRecipe("13 Nails");
                displayBlueprints(this.grid);
            };
            var onFailure = null;
            var progressRewardText = "New recipe";
            var completedRewardText = "Container";
            return new ExportContract(eventLogger, grid, id, title, condition, item, time, reward, onFailure, progressRewardText, completedRewardText);
        case 16:
            var title = "Export 500 Copper Coils";
            var condition = 500;
            var item = "Copper Coil";
            var time = null;
            var reward = function() {
                this.grid.unlockRecipe("Chip");
                this.grid.unlockRecipe("Microchip");
                this.grid.unlockRecipe("Heat Exchanger");
                this.grid.unlockRecipe("Foil");
                displayBlueprints(this.grid);
            };
            var onFailure = null;
            var progressRewardText = "New recipes";
            var completedRewardText = "Chip; Micropchip; Heat Exchanger; Foil";
            return new ExportContract(eventLogger, grid, id, title, condition, item, time, reward, onFailure, progressRewardText, completedRewardText);
        case 17:
            var title = "Export 5,000 Items";
            var condition = 5000;
            var item = null;
            var time = null;
            var reward = function() {
                this.grid.unlockTile("Importer", 0, 2);
                this.grid.unlockTile("Distributor", 0);
                listValidTiles(this.grid);
            };
            var onFailure = null;
            var progressRewardText = "New tile; Importer limit +2;";
            var completedRewardText = "Distributor; Importer limit +2;";
            return new ExportContract(eventLogger, grid, id, title, condition, item, time, reward, onFailure, progressRewardText, completedRewardText);
        default:
            throw "Invalid contract id" + id + "!";
    }
}