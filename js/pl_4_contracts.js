class Contract {
    constructor(id, title, condition, reward = null) {
        this.id = id;
        this.title = title;
        this.condition = condition;
        this.reward = reward;

        this.progress = 0;
    }    

    get isComplete() {
        return this.progress >= this.condition;
    }

    get progressPercent() {
        return Math.floor((this.progress / this.condition) * 100);
    }

    complete() {
        if (this.reward != null) this.reward();
        $("#contract-" + this.id).hide();

        var html = $("#contracts-completed-container").html();
        html += `<div class="row justify-content-center align-items-center mb-2">
            <div class="container m-2 p-2" style="background: #004b008b">
                <div class="col-12 mb-2 text-center">
                    ` + this.title + "... (" + this.condition + "/" + this.condition + ")" + `
                </div>
                <div class="col-12 mb-2 w-100">
                    <div class="progress position-relative">
                        <div class="progress-bar bg-success" role="progressbar" style="width: 100%"></div>
                    </div>
                </div>
            </div>
        </div>`;
        $("#contracts-completed-container").html(html);
    }

    update(eventDatapoints) {
        return false;
    }
}

class ExportContract extends Contract {
    constructor(id, title, condition, reward, item) {
        super(id, title, condition, reward);

        this.item = item;
    }

    update(eventDatapoints) {
        var lastEvent = eventDatapoints[eventDatapoints.length - 1];
        if (lastEvent.exportedItems.hasOwnProperty(this.item)) {
            this.progress += lastEvent.exportedItems[this.item];
        }

        $("#contract-" + this.id + "-title").text(this.title + "... (" + this.progress + "/" + this.condition + ")");
        $("#contract-" + this.id + "-bar").css("width", this.progressPercent + "%");

        if (this.progress >= this.condition) {
            this.complete();
            return true;
        }

        return false;
    }
}