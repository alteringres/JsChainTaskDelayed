/**
 * Class TaskScheduler
 * Program tasks to run after x milliseconds since previous task run
 */
class TaskScheduler {
    /**
     * Constructor
     */
    constructor() {
        this.stack = [];
        this.lastRunTime    = null;
        this.isRunning      = false;
        this.forceStop      = false;
        this.verbose        = false;
        this.sleepMode      = false;
    }

    /**
     * Push task in queue
     *
     * @param fcn
     * @param time
     * @param name
     */
    push(fcn, time, name) {
        name  = name || "undefined name";
        if ((!this.isRunning || this.forceStop) && this.verbose) {
            console.log("[taskScheduler] Pushed item in queue while thread is not running: ", name, time);
        } else if (this.verbose) {
            console.log("[taskScheduler] Pushed data in queue: ", name, time);
        }

        this.stack.push({
            "fcn"   : fcn,
            "time"  : time
        });

        /*
         * Sleep mode means queue is empty and we are in running mode
         */
        if (this.sleepMode) {
            if (this.verbose) {
                console.log("[taskScheduler] Thread run from sleep mode");
            }
            this.sleepMode = false;
            // set timeout to run in parallel function from queue
            let timeoutObject = setTimeout(() => {
                this.run();
                clearTimeout(timeoutObject);
            }, 1);
        }
    }

    /**
     * Return next element to execute
     *
     * @returns {*}
     */
    next() {
        let current = this.stack.shift();

        if (current == undefined) {
            return null;
        }

        return current;
    }

    /**
     * Method called on each iteration
     *
     * @returns {boolean}
     */
    run() {
        /*
         * Force thread stop
         */
        if (this.forceStop) {
            if (this.verbose) {
                console.log("[taskScheduler] Thread forced to stop", this.stack);
            }

            return false;
        }

        let timeoutObj, fcn,
            time, current, delayTime,
            runDate, runDateMillis, timeDiff;

        current = this.next();
        if (current === null) {
            /*
             * Empty queue, stop thread if is not in running mode any more
             */
            if (this.isRunning === false) {
                if (this.verbose) {
                    console.log("[taskScheduler] Thread stopped after queue is empty");
                }
                return false;
            }

            /*
             * Thread is running, queue is empty, enter in sleep mode
             */
            if (this.verbose) {
                console.log("[taskScheduler] Thread enter in sleep mode");
            }

            this.sleepMode = true;

            return false;
        }

        runDate         = new Date();
        runDateMillis   = runDate.getTime();
        fcn             = current['fcn'];
        time            = current['time'];

        if (this.lastRunTime != null) {
            timeDiff = runDateMillis - this.lastRunTime;
            if (timeDiff >= time ) {
                delayTime = 0;
            } else {
                delayTime = time - timeDiff;
            }
        } else {
            delayTime = 0;
        }

        if (this.verbose) {
            console.log("[taskScheduler] task delayed with " + delayTime, this.lastRunTime, time);
        }

        /*
         * Still use timeout to run in parallel, to allow changing stack while executing original function
         */
        timeoutObj = setTimeout(() => {
            fcn();
            let date = new Date();
            this.lastRunTime = date.getTime();

            clearTimeout(timeoutObj);
            this.run();

        }, delayTime);

        return true;
    }

    /**
     * Main method used for execution
     *
     * @returns {boolean}
     */
    startThread() {
        this.isRunning = true;
        this.forceStop = false;
        this.sleepMode = false;

        this.run();
    }

    /**
     * Returns true if thread is running
     *
     * @returns {boolean}
     */
    isRunningThread() {

        return this.isRunning;
    }

    /**
     * Stop thread after all queue items are consumed
     */
    stopThread() {

        this.isRunning = false;
        this.sleepMode = false;
    }

    /**
     * Force thread to stop
     */
    forceStopThread() {
        this.forceStop = true;
        this.sleepMode = false;
    }
}