/**
 * Class TimeScheduler
 * Contains time functions
 */
class TimeScheduler {

    /**
     * Constructor
     */
    constructor() {
        //to be implemented
    }

    /**
     * Returns current time in milliseconds
     *
     * @returns {number}
     */
    static getCurrentTimeMillis() {
        let date = new Date();
        return date.getTime();
    }

    /**
     * Compute diff time based on a time in the past and an interval
     *
     * @param millisTime
     * @param refTime
     * @returns {number}
     */
    static computeDiffTimeByMillis(millisTime, refTime) {
        let result = 0;

        if (millisTime != null) {
            let currentTime = TimeScheduler.getCurrentTimeMillis();
            let diff = currentTime - millisTime;

            if (!(diff >= refTime )) {
                result = refTime - diff;
            }
        }

        return result;
    }
}

let TASK_THREAD_VERBOSE = 1;

/**
 * Task definition
 */
class TaskThread {

    /**
     * Constructor
     *
     * @param time
     * @param waitForSubTasks
     * @param canAddSubTask
     * @param fcn
     */
    constructor(time, waitForSubTasks, canAddSubTask, fcn) {
        this.time = time;
        this.subTasks = [];
        this.waitForSubTasks = waitForSubTasks;
        this.fcn = fcn;
        this.canAddSubTask = canAddSubTask;
        this.lastSubTaskRunTime = null;
        this.verbose = false;
        this.isRunning = false;
        this.isPaused = false;
        this.completeFunction = null;
    }

    /**
     * Add new subtask
     *
     * @param task
     */
    addSubTask(task) {
        if (!this.waitForSubTasks || !this.canAddSubTask) {
            throw new Error("[ TaskThread ] No subTask was expected, not allowed or not waiting for it");
        }

        if (!(task instanceof TaskThread)) {
            throw new Error("[ TaskThread ] Only instances of " + Task.className + " can be added as subTasks");
        }

        let canResumeThread = this.canResumeThread();

        this.subTasks.push(task);
        (TASK_THREAD_VERBOSE > 0)
            ? console.log("[ TaskThread ] New task added, can resume: " + ((canResumeThread) ? "yes" : "no"))
            : "";
        if (canResumeThread) {
            this.isPaused = false;
            this.executeSubTasks(this.completeFunction);
        }
    }

    canResumeThread() {
        (TASK_THREAD_VERBOSE > 0)
            ? console.log(
                "[ TaskThread ] subTasks length: "
                + this.subTasks.length
                + " isRunning: " + ((this.isRunning) ? "yes" : "no")
                + " isPaused: " + ((this.isPaused) ? "yes" : "no")
            )
            : "";
        return (this.subTasks.length === 0 && this.isRunning && this.isPaused);
    }

    /**
     * Execute subtasks
     *
     * Returns true or false if task is complete or not
     *
     * @param completeFunction
     */
    executeSubTasks(completeFunction) {
        /*
         * Hold a reference to complete function in order to can pause thread
         */
        if (this.completeFunction == null) {
            this.completeFunction = completeFunction;
        }

        let task = this.subTasks.shift() || null;
        if (task === null) {
            (TASK_THREAD_VERBOSE > 0) ? console.log("[ TaskThread ]  empty task queue") : "";
            /*
             * No task found, can add more sub tasks in the feature, must wait => enter in sleep mode
             * Else, run complete function;
             */
            if (this.canCreateSubTasks()) {
                this.isPaused = true;
                this.isRunning = true;
                return false;
            } else {
                this.isRunning = false;
                completeFunction();
                return true;
            }
        }

        task.isRunning = true;

        let timeOffset = TimeScheduler.computeDiffTimeByMillis(this.lastSubTaskRunTime, task.time);
        (TASK_THREAD_VERBOSE > 0) ? console.log("time offset: " + timeOffset) : "";

        // console.log("executing task", task);
        let timeoutObj = setTimeout(() => {
            // run original task
            task.fcn();
            // update last time a task run
            this.lastSubTaskRunTime = TimeScheduler.getCurrentTimeMillis();

            /*
             * Execute task
             */
            task.executeSubTasks(() => {
                (TASK_THREAD_VERBOSE > 0) ? console.log("[ TaskThread ] complete subTasks") : "";
                this.executeSubTasks(completeFunction);
            });

            clearTimeout(timeoutObj);
        }, timeOffset);
    }

    /**
     * Returns true if user can create subTasks
     * @returns {*}
     */
    canCreateSubTasks() {
        return this.canAddSubTask && this.waitForSubTasks;
    }
}

module.exports = TaskThread;