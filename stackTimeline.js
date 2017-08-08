/**
 * Task runner with a delay
 * @type {{stack: {}, runImmediate: boolean, keepAliveTime: number, index: number, push: push, next: next, execute: execute, run: run}}
 */
let stackTimeline = {
    /**
     * Stack with tasks
     */
    stack : [],

    /**
     * Keep alive checking for any task
     */
    keepAliveTime : 100,

    /**
     * Last time whan a task run
     */
    lastRunTime : null,

    /**
     * Push task in queue
     *
     * @param fcn
     * @param time
     */
    push : function(fcn, time) {

        this.stack.push({
            "fcn"   : fcn,
            "time"  : time
        });
        self.count++;
    },

    /**
     * Return next element to execute
     *
     * @returns {*}
     */
    next : function() {
        let current;
        current = this.stack.shift();

        if (current == undefined) {
            return null;
        }

        return current;
    },

    /**
     * Execute function
     *
     * @param fcn
     */
    execute : function (fcn) {
        fcn();
    },

    /**
     * Main method used for execution
     *
     * @returns {boolean}
     */
    run : function() {
        let self = this, timeoutObj, fcn,
            time, current, delayTime,
            runDate, runDateMillis, timeDiff;

        current = this.next();
        if (current === null) {
            timeoutObj = setTimeout(function() {
                self.run();
                clearTimeout(timeoutObj);
            }, this.keepAliveTime);

            return false;
        }
        runDate         = new Date();
        runDateMillis   = runDate.getTime();
        fcn             = current['fcn'];
        time            = current['time'];

        if (this.lastRunTime != null) {
            timeDiff = runDateMillis - this.lastRunTime;
            console.log("diff time", timeDiff, time,  this.lastRunTime);
            if (timeDiff >= time ) {
                delayTime = 0;
            } else {
                delayTime = time - timeDiff;
            }
        } else {
            delayTime = 0;
        }

        /*
         * Still use timeout to run in parallel, to allow changing stack while executing original function
         */
        timeoutObj = setTimeout(function () {
            self.execute(fcn);
            let date = new Date();
            self.lastRunTime = date.getTime();

            clearTimeout(timeoutObj);
            self.run();

        }, delayTime);

        return true;
    }
};
