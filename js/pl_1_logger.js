class PerformanceLogger {
    constructor(movingAverage) {
        this.movingAverage = movingAverage;
        this.datapoints = [];
    }

    addDatapoint(datapoint) {
        if (this.datapoints.length == this.movingAverage) {
            this.datapoints.shift();
        }
        this.datapoints.push(datapoint);
    }

    getLast() {
        return this.datapoints[this.datapoints.length - 1];
    }

    getAverage() {
        var sum = 0;
        for (var i = 0; i < this.datapoints.length; i++) {
            sum += this.datapoints[i];
        }
        return sum / this.datapoints.length;
    }
}