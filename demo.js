let TaskThread = require("./index");

TaskThread.verbose = 3;

/**
 * Main test class
 */
class Test {
    constructor() {
        // to be implemented
    }

    run() {
        /*
         * Create root task, think of this like main pid from which will start all forks
         */
        let rootTask = TaskThread.createRootTask();
        /*
         * Define a list of 3 elements to test how task process works
         */
        let rootElements = [ "L1 1", "L1 2", "L1 3"];

        for (let rootElementIndex in rootElements) {
            let rootElement = rootElements[rootElementIndex];

            let task = TaskThread.createSubTask(rootTask, 100, true, true, () => {
                console.log("Executed subtask " + rootElement);
                this.taskLevelTwo(task);
            });
        }

        rootTask.lockTaskWhenFinished();
    }

    taskLevelTwo(parentTask) {
        let rootElements = [ "L2 1", "L2 2"];

        for (let rootElementIndex in rootElements) {
            let rootElement = rootElements[rootElementIndex];

            let task = TaskThread.createSubTask(parentTask, 100, true, true, () => {
                console.log("Executed subtask " + rootElement);
                this.taskLevelThree(task);
            });
        }
        setTimeout(function() {
            console.log(">>>>>>>>>>>>>>   shutdown after all sub tasks are finished " + parentTask.getName());
            parentTask.lockTaskWhenFinished();
        }, 1000);
    }

    taskLevelThree(parentTask) {
        parentTask.lockTaskWhenFinished();
    }
}

let test = new Test();
test.run();