let indexTask = 0;

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

let TASK_THREAD_VERBOSE = -1;

/**
 * Task definition
 */
class TaskThread {

    /**
     * Constructor
     *
     * @param time                  Time between previous task
     * @param waitForSubTasks       Flag to know if this will wait for subTasks or not
     * @param canAddSubTask         Flag to know if any subTask can be added
     * @param fcn                   Main function to execute for this task
     * @param completeCallback      Callback triggered when task has finished
     */
    constructor(
        time,
        waitForSubTasks,
        canAddSubTask,
        fcn,
        completeCallback
    ) {
        indexTask++;

        this.time               = time;
        this.subTasks           = [];
        this.waitForSubTasks    = waitForSubTasks;
        this.fcn                = fcn;
        this.canAddSubTask      = canAddSubTask;
        this.lastSubTaskRunTime = null;
        this.isRunning          = false;
        this.isPaused           = false;
        this.completeFunction   = null;
        this.pid                = indexTask;
        this.completeFunction   = (typeof completeCallback == "function") ? completeCallback : null;
    }

    /**
     * Get verbosity
     *
     * @returns {number}
     */
    static get verbose() {

        return TASK_THREAD_VERBOSE;
    }

    //noinspection JSAnnotator
    /**
     * Set verbosity
     *
     * @param int verboseLevel
     */
    static set verbose(verboseLevel) {

        TASK_THREAD_VERBOSE = verboseLevel;
    }

    /**
     * Returns the task name
     * @returns {string}
     */
    getName() {
        return "[ TaskThread - " + this.pid + " ] ";
    }

    /**
     * Add new subtask
     *
     * @param task
     */
    addSubTask(task) {
        if (!this.waitForSubTasks || !this.canAddSubTask) {
            throw new Error(this.getName() + "::addSubTask No subTask was expected, not allowed or not waiting for it");
        }

        if (!(task instanceof TaskThread)) {
            throw new Error(this.getName() + "::addSubTask Only instances of " + Task.className + " can be added as subTasks");
        }

        task.parentTask = this;
        (TASK_THREAD_VERBOSE >= 0) ? console.log(this.getName() + "::addSubTask adding task ` " + task.getName() + "`") : "";

        let canResumeThread = this.canResumeThread();
        (TASK_THREAD_VERBOSE >= 0)
            ? console.log(this.getName() + "::addSubTask can resume: " + ((canResumeThread) ? "yes" : "no"))
            : "";

        this.subTasks.push(task);

        if (canResumeThread) {
            this.isPaused = false;
            this.executeSubTasks(this.completeFunction);
        }
    }

    canResumeThread() {
        (TASK_THREAD_VERBOSE >= 1)
            ? console.log(
                this.getName() + "::canResumeThread subTasks length: "
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
        completeFunction = completeFunction || function() {};
        if (this.completeFunction == null) {
            this.completeFunction = completeFunction;
        }

        let task = this.subTasks.shift() || null;
        if (task === null) {
            /*
             * No task found, can add more sub tasks in the feature, must wait => enter in sleep mode
             * Else, run complete function;
             */
            if (this.canCreateSubTasks()) {
                (TASK_THREAD_VERBOSE >= 0) ? console.log(this.getName() + "::executeSubTasks empty subTasks, enter in sleep mode") : "";
                this.isPaused = true;
                this.isRunning = true;
                return false;
            } else {
                (TASK_THREAD_VERBOSE >= 0)
                    ? console.log(this.getName() + "::executeSubTasks empty subTasks, finish task (thread blocked)")
                    : "";
                this.isRunning = false;
                completeFunction();
                return true;
            }
        }

        task.isRunning = true;
        (TASK_THREAD_VERBOSE >= 0) ? console.log(this.getName() + "::executeSubTasks executing task ` " + task.getName() + "`") : "";

        let timeOffset = TimeScheduler.computeDiffTimeByMillis(this.lastSubTaskRunTime, task.time);
        (TASK_THREAD_VERBOSE >= 0) ? console.log(this.getName() + "::executeSubTasks time offset: " + timeOffset) : "";

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
                (TASK_THREAD_VERBOSE >= 0) ? console.log(this.getName() + "::executeSubTasks complete subTasks") : "";
                this.executeSubTasks(completeFunction);
            });

            clearTimeout(timeoutObj);
        }, timeOffset);
    }

    /**
     * This will lock task as soon as all other subTasks are finished
     *
     * @returns {*}
     */
    lockTaskWhenFinished() {
        this.waitForSubTasks = false;
        let canResume = this.canResumeThread();

        /*
         * If can resume, it means thread is in sleep mode and no task is waiting to be added
         * So we are executing the complete function
         */
        if (canResume) {
            this.completeFunction();
        }
    }

    /**
     * Returns true if user can create subTasks
     * @returns {*}
     */
    canCreateSubTasks() {
        return this.canAddSubTask && this.waitForSubTasks;
    }

    /**
     * Creates new task and assigned it as subtask for a parent task already cread
     *
     * @param parentTask
     * @param time
     * @param waitForSubTasks
     * @param canAddSubTask
     * @param fcn
     * @returns {TaskThread}
     */
    static createSubTask(parentTask, time, waitForSubTasks, canAddSubTask, fcn) {
        if (!(parentTask instanceof TaskThread)) {
            throw new Error("The parent task must be instance of TaskThread");
        }
        let task = new TaskThread(time, waitForSubTasks, canAddSubTask, fcn);
        parentTask.addSubTask(task);

        return task;
    }

    /**
     * Create a root task
     * @returns {TaskThread}
     */
    static createRootTask() {
        let rootTask = new TaskThread(0, true, true, function() {});
        rootTask.executeSubTasks();

        return rootTask;
    }
}

module.exports = TaskThread;