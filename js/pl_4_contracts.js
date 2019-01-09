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
    }

    update() {
        throw "Can't update a generic Contract!";
    }
}

class ExportContract extends Contract {
    constructor(eventLogger, grid, id, title, condition, item, time = null, reward = null, onFailure = null, progressRewardText = null, completedRewardText = null) {
        super(eventLogger, grid, id, title, condition, time, reward, onFailure, progressRewardText, completedRewardText);

        this.item = item;
    }

    update(eventDatapoints) {
        if (this.time != null) this.timeLeft--;
        if (this.time != null && this.timeLeft == 0) { this.complete(); return true; }

        var lastEvent = eventDatapoints[eventDatapoints.length - 1];
        if (lastEvent.exportedItems.hasOwnProperty(this.item)) {
            this.progress += lastEvent.exportedItems[this.item];
        }

        $("#contract-" + this.id + "-title").html(this.title + "... (" + this.progress + "/" + this.condition + ") - " + this.progressPercent.toLocaleString("en-GB", {maximumFractionDigits: 2, minimumFractionDigits: 2}) + "%");
        $("#contract-" + this.id + "-bar").css("width", this.progressPercent + "%");
        $("#contract-" + this.id + "-time").text("Time left: " + Math.floor(this.timeLeft / 2) + "s");

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
            var title = "Export 50 Iron";
            var condition = 5;
            var item = "Iron";
            var time = null;
            var reward = function() {
                this.grid.unlockTile("Assembler", 0);
                this.grid.unlockRecipe("Frame");
                listValidTiles(this.grid);
                displayBlueprints(this.grid);
                registerContract(ContractFactory(eventLogger, grid, 1));
                registerContract(ContractFactory(eventLogger, grid, 2));
                registerContract(ContractFactory(eventLogger, grid, 3));
            };
            var onFailure = null;
            var progressRewardText = "New tile type and recipe";
            var completedRewardText = "Assembler Lvl. 1; Frame";
            return new ExportContract(eventLogger, grid, id, title, condition, item, time, reward, onFailure, progressRewardText, completedRewardText);
        case 1:
            var title = "Export 250 Copper";
            var condition = 250;
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
            var title = "Export 300 Aluminium";
            var condition = 300;
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
                this.grid.unlockTile("Importer", 0, 4);
            };
            var onFailure = function() {
                $("#contract-" + this.id).remove();
                registerContract(ContractFactory(eventLogger, grid, this.id));
            };
            var progressRewardText = "Importer limit +1";
            var completedRewardText = "Importer limit +1";
            return new ExportContract(eventLogger, grid, id, title, condition, item, time, reward, onFailure, progressRewardText, completedRewardText);
        case 4:
            var title = "Export 2 Gears in 10 seconds <em>(Repeatable)</em>";
            var condition = 2;
            var item = "Gear";
            var time = 21;
            var reward = function() {
                this.grid.unlockRecipe("Engine");
                displayBlueprints(this.grid);
            };
            var onFailure = function() {
                $("#contract-" + this.id).remove();
                registerContract(ContractFactory(eventLogger, grid, this.id));
            };
            var progressRewardText = "New recipe";
            var completedRewardText = "Engine";
            return new ExportContract(eventLogger, grid, id, title, condition, item, time, reward, onFailure, progressRewardText, completedRewardText);
        case 5:
            var title = "Export 100 Silver Coils";
            var condition = 100;
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
            var title = "Export 100 Aluminium Plates";
            var condition = 100;
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
        default:
            throw "Invalid contract id" + id + "!";
    }
}