class Contract {
    constructor(id, title, condition, time = null, reward = null, progressRewardText = null, completedRewardText = null) {
        this.id = id;
        this.title = title;
        this.condition = condition;
        this.time = time;
        this.reward = reward;
        this.progressRewardText = progressRewardText;
        this.completedRewardText = completedRewardText;

        this.progress = 0;
        this.timeLeft = this.time;
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
        $("#contract-" + this.id).hide();

        var html = "";
        if (completed) html += $("#contracts-completed-container").html();
        else html += $("#contracts-failed-container").html();
        html += `<div class="row justify-content-center align-items-center mb-2">`;
        if (completed) html += `<div class="container m-2 p-2" style="background: #004b008b">`;
        else html += `<div class="container m-2 p-2" style="background: #4b00008b">`;
        html += `<div class="col-12 mb-2 text-center">
            ` + this.title + "... (" + Math.min(this.progress, this.condition) + "/" + this.condition + ") - " + this.progressPercent + "%" + `
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
    }

    update(eventDatapoints) {
        if (this.time != null) this.timeLeft--;
        if (this.time != null && this.timeLeft == 0) { this.complete(); return true; }

        return false;
    }
}

class ExportContract extends Contract {
    constructor(id, title, condition, item, time = null, reward = null, progressRewardText = null, completedRewardText = null) {
        super(id, title, condition, time, reward, progressRewardText, completedRewardText);

        this.item = item;
    }

    update(eventDatapoints) {
        if (this.time != null) this.timeLeft--;
        if (this.time != null && this.timeLeft == 0) { this.complete(); return true; }

        var lastEvent = eventDatapoints[eventDatapoints.length - 1];
        if (lastEvent.exportedItems.hasOwnProperty(this.item)) {
            this.progress += lastEvent.exportedItems[this.item];
        }

        $("#contract-" + this.id + "-title").text(this.title + "... (" + this.progress + "/" + this.condition + ") - " + this.progressPercent + "%");
        $("#contract-" + this.id + "-bar").css("width", this.progressPercent + "%");
        $("#contract-" + this.id + "-time").text("Time left: " + Math.floor(this.timeLeft / 2) + "s");

        if (this.progress >= this.condition) {
            this.complete();
            return true;
        }

        return false;
    }
}