class EventLogger {
    constructor(movingAverage) {
        this.movingAverage = movingAverage;
        this.tickDatapoints = [];
        this.renderDatapoints = [];
    }

    addTickDatapoint(datapoint) {
        if (this.tickDatapoints.length == this.movingAverage) {
            this.tickDatapoints.shift();
        }
        this.tickDatapoints.push(datapoint);
    }

    addRenderDatapoint(datapoint) {
        if (this.renderDatapoints.length == this.movingAverage) {
            this.renderDatapoints.shift();
        }
        this.renderDatapoints.push(datapoint);
    }

    getLastTick() {
        return this.tickDatapoints[this.tickDatapoints.length - 1];
    }

    getLastRender() {
        return this.renderDatapoints[this.renderDatapoints.length - 1];
    }

    getAverageTick() {
        var sum = 0;
        for (var i = 0; i < this.tickDatapoints.length; i++) {
            sum += this.tickDatapoints[i];
        }
        return sum / this.tickDatapoints.length;
    }

    getAverageRender() {
        var sum = 0;
        for (var i = 0; i < this.renderDatapoints.length; i++) {
            sum += this.renderDatapoints[i];
        }
        return sum / this.renderDatapoints.length;
    }
}