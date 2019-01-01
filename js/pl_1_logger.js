class EventLogger {
    constructor(movingAverage) {
        this.movingAverage = movingAverage;
        this.tickDatapoints = [];
        this.drawDatapoints = [];
        this.renderDatapoints = [];
        this.moneyDatapoints = [];
    }

    addTickDatapoint(datapoint) {
        if (this.tickDatapoints.length == this.movingAverage) {
            this.tickDatapoints.shift();
        }
        this.tickDatapoints.push(datapoint);
    }

    addDrawDatapoint(datapoint) {
        if (this.drawDatapoints.length == this.movingAverage) {
            this.drawDatapoints.shift();
        }
        this.drawDatapoints.push(datapoint);
    }

    addRenderDatapoint(datapoint) {
        if (this.renderDatapoints.length == this.movingAverage) {
            this.renderDatapoints.shift();
        }
        this.renderDatapoints.push(datapoint);
    }

    addMoneyDatapoint(datapoint) {
        if (this.moneyDatapoints.length == this.movingAverage) {
            this.moneyDatapoints.shift();
        }
        this.moneyDatapoints.push(datapoint);
    }

    getLastTick() {
        return this.tickDatapoints[this.tickDatapoints.length - 1];
    }

    getLastDraw() {
        return this.drawDatapoints[this.drawDatapoints.length - 1];
    }

    getLastRender() {
        return this.renderDatapoints[this.renderDatapoints.length - 1];
    }

    getLastMoney() {
        return this.moneyDatapoints[this.moneyDatapoints.length - 1];
    }

    getAverageTick() {
        var sum = 0;
        for (var i = 0; i < this.tickDatapoints.length; i++) {
            sum += this.tickDatapoints[i];
        }
        return sum / this.tickDatapoints.length;
    }

    getAverageDraw() {
        var sum = 0;
        for (var i = 0; i < this.drawDatapoints.length; i++) {
            sum += this.drawDatapoints[i];
        }
        return sum / this.drawDatapoints.length;
    }

    getAverageRender() {
        var sum = 0;
        for (var i = 0; i < this.renderDatapoints.length; i++) {
            sum += this.renderDatapoints[i];
        }
        return sum / this.renderDatapoints.length;
    }

    getAverageMoney() {
        var sum = 0;
        for (var i = 0; i < this.moneyDatapoints.length; i++) {
            sum += this.moneyDatapoints[i];
        }
        return sum / this.moneyDatapoints.length;
    }
}