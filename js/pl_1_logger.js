class TickEvent {
    constructor(money = 0, earnings = 0, operationCost = 0, exportedValue = 0, exportedItems = {}) {
        this.money = money;
        this.operationCost = operationCost;
        this.exportedValue = exportedValue;
        this.exportedItems = exportedItems;
    }
}

class EventLogger {
    constructor() {
        this.tickDatapoints = [];
        this.drawDatapoints = [];
        this.renderDatapoints = [];
        this.fpsDatapoints = [];
        this.moneyDatapoints = [];
        this.lastSecondFrames = 0;

        this.eventDatapoints = [];
        this.contracts = [];
        this.completedContracts = [];

        this.moneyMovingAverage = [20, 60, 120, 600, 2, 10];
    }

    registerContract(contract) {
        this.contracts.push(contract);
    }

    nextMoneyMovingAverage() {
        this.moneyMovingAverage.push(this.moneyMovingAverage.shift());
    }

    addTickDatapoint(datapoint) {
        if (this.tickDatapoints.length == 100) {
            this.tickDatapoints.shift();
        }
        this.tickDatapoints.push(datapoint);
    }

    addDrawDatapoint(datapoint) {
        if (this.drawDatapoints.length == 20) {
            this.drawDatapoints.shift();
        }
        this.drawDatapoints.push(datapoint);
    }

    addRenderDatapoint(datapoint) {
        if (this.renderDatapoints.length == 20) {
            this.renderDatapoints.shift();
        }
        this.renderDatapoints.push(datapoint);
    }

    addFpsDatapoint(datapoint) {
        if (this.fpsDatapoints.length == 10) {
            this.fpsDatapoints.shift();
        }
        this.fpsDatapoints.push(datapoint);
    }

    addMoneyDatapoint(datapoint) {
        if (this.moneyDatapoints.length == 600) {
            this.moneyDatapoints.shift();
        }
        this.moneyDatapoints.push(datapoint);
    }

    addEventDatapoint(datapoint) {
        if (this.eventDatapoints.length == 120) {
            this.eventDatapoints.shift();
        }
        this.eventDatapoints.push(datapoint);

        for (var i = 0; i < this.contracts.length; i++) {
            var complete = this.contracts[i].update(this.eventDatapoints);
            if (complete) this.completedContracts.push(this.contracts.splice(i, 1));
        }
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

    getLastFps() {
        return this.fpsDatapoints[this.fpsDatapoints.length - 1];
    }

    getLastMoney() {
        return this.moneyDatapoints[this.moneyDatapoints.length - 1];
    }

    getLastEvent() {
        return this.eventDatapoints[this.eventDatapoints.length - 1];
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

    getAverageFps() {
        var sum = 0;
        for (var i = 0; i < this.fpsDatapoints.length; i++) {
            sum += this.fpsDatapoints[i];
        }
        return sum / this.fpsDatapoints.length;
    }

    getAverageMoney() {
        var start = Math.max(0, this.moneyDatapoints.length - this.moneyMovingAverage[0]);
        var sum = 0;
        for (var i = start; i < this.moneyDatapoints.length; i++) {
            sum += this.moneyDatapoints[i];
        }
        return sum / Math.min(this.moneyMovingAverage[0], this.moneyDatapoints.length);
    }
}