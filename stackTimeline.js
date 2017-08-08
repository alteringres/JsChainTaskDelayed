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
     * Flag to know if a task can be run without any delay
     */
    runImmediate : true,

    /**
     * Keep alive checking for any task
     */
    keepAliveTime : 100,

    count : 0,

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
        let self = this, executorFcn, timeoutObj, fcn, time, current;
        current = this.next();
        if (current === null) {
            timeoutObj = setTimeout(function() {
                self.run();
                clearTimeout(timeoutObj);
            }, this.keepAliveTime);

            return false;
        }

        fcn  = current['fcn'];
        time = current['time'];

        // don't wait if it must run immediate
        if (this.runImmediate) {
            time = 0;
        }

        /*
         * Still use timeout to run in parallel, to allow changing stack while executing original function
         */
        timeoutObj = setTimeout(function () {
            self.execute(fcn);
            clearTimeout(timeoutObj);
            self.count--;
            self.runImmediate = (self.count === 0);
            self.run();
        }, time);


        return true;
    }
};
