# JsChainTaskDelayed

It is used to run tasks which must wait a certain time after the previous has finished.

Each of those processes can have children which must be executed one after the other, when a
a certain time passed after previous child run. 
Now, this structure is actually a tree, where each task can have subTasks.

When a task si running, we must tell when no child can be added in order to run the next task, 
otherwise it will wait for new children to be created in the feature. That's because when
async is used, we don't actually know when a task can be added or not, but we can know at some point
when a task can't get any subTask.

When a task executes all subTasks, if adding of children is allowed, it will enter in sleep mode.
This mean, it will wait for new children, so no other task is executed.
When a new child is added, will exit from sleep mode and tries to run it. 
If mode subTasks were added, then will execute them with two conditions:
- previous task has finished
- the specified time has passed since the previous task has finished.


# API

### TaskThread.verbose  
Controls the logging on default output stream.
Int value, default has -1 value, any value grater then -1 will enable logging
This version has loggin level 0, 1;
Can be changed, e.g:
````javascript
TaskThread.verbose = 3;
````

### executeSubTasks([completeFunction])
This function will force the execution of subTask.
Must be called only on root task, as for all the other subTaks it is called
automatically.
#### CompleteFunction 
Callback triggered when current task has finished

### TaskThread.createSubTask(parentTask, time, waitForSubTasks, canAddSubTask, fcn)
Will create a subTask for an already defined task
#### parentTask
Task which will get the subTask to be executed, instance of TaskThread
#### time
Time in millis  between execution of subTasks (subTasks of the same parent task)
#### waitForSubTasks
Boolean, true if the subTasks will have another subTask too
#### canAddSubTask
Boolean, true if the adding of subTasks is allowed
#### fcn
Main function which will be executed in this task

### lockTaskWhenFinished()
This method will make the task to finish after all it's subTasks are
finished. Without this, the current running task will enter in 
sleep mode after all subTasks are finished (considering that
canAddSubTask = true and waitForSubTasks = true), because it considers
that any subTask can be added at any moment.

If any of canAddSubTask or waitForSubTasks is not true, then, after
all subTasks are finished, will not enter in sleep mode, but it will finish too

### canCreateSubTasks()
Returns true if task can have subTasks.

### canResumeThread()
Returns true if current task is running and is in sleep mode.

### getName()
Returns the name of task

# Basic usage
````javascript
let TaskThread = require("./index");
TaskThread.verbose = 3;
let rootTask = TaskThread.createRootTask();
let childLevelOne = TaskThread.createSubTask(rootTask, [time], [false|true], [false|true], function() {
    //do your staff here
    //can add subtasks
    let childLevelTwo = TaskThread.createSubTask(childLevelOne, [time], [false|true], [false|true], function() {
        // do something
        // maybe add some more subTasks
        childLevelTwo.lockTaskWhenFinished();
    });
    // if we know for sure no other child can be added on childLevelOne, lock it, in order
    // to execute other child of rootTask
    // without this, other children of rootTask will never be executed
    childLevelOne.lockTaskWhenFinished();
});
````
### It is important to call lockTaskWhenFinished when no subTask can be added!
# Example 2

````javascript
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

````

Result:
````bash

$ node demo_stack.js 
[ TaskThread - 1 ] ::executeSubTasks empty subTasks, enter in sleep mode
[ TaskThread - 1 ] ::addSubTask adding task ` [ TaskThread - 2 ] `
[ TaskThread - 1 ] ::canResumeThread subTasks length: 0 isRunning: yes isPaused: yes
[ TaskThread - 1 ] ::addSubTask can resume: yes
[ TaskThread - 1 ] ::executeSubTasks executing task ` [ TaskThread - 2 ] `
[ TaskThread - 1 ] ::executeSubTasks time offset: 0
[ TaskThread - 1 ] ::addSubTask adding task ` [ TaskThread - 3 ] `
[ TaskThread - 1 ] ::canResumeThread subTasks length: 0 isRunning: yes isPaused: no
[ TaskThread - 1 ] ::addSubTask can resume: no
[ TaskThread - 1 ] ::addSubTask adding task ` [ TaskThread - 4 ] `
[ TaskThread - 1 ] ::canResumeThread subTasks length: 1 isRunning: yes isPaused: no
[ TaskThread - 1 ] ::addSubTask can resume: no
Executed subtask L1 1
[ TaskThread - 2 ] ::addSubTask adding task ` [ TaskThread - 5 ] `
[ TaskThread - 2 ] ::canResumeThread subTasks length: 0 isRunning: yes isPaused: no
[ TaskThread - 2 ] ::addSubTask can resume: no
[ TaskThread - 2 ] ::addSubTask adding task ` [ TaskThread - 6 ] `
[ TaskThread - 2 ] ::canResumeThread subTasks length: 1 isRunning: yes isPaused: no
[ TaskThread - 2 ] ::addSubTask can resume: no
[ TaskThread - 2 ] ::executeSubTasks executing task ` [ TaskThread - 5 ] `
[ TaskThread - 2 ] ::executeSubTasks time offset: 0
Executed subtask L2 1
[ TaskThread - 5 ] ::canResumeThread subTasks length: 0 isRunning: yes isPaused: no
[ TaskThread - 5 ] ::executeSubTasks empty subTasks, finish task (thread blocked)
[ TaskThread - 2 ] ::executeSubTasks complete subTasks
[ TaskThread - 2 ] ::executeSubTasks executing task ` [ TaskThread - 6 ] `
[ TaskThread - 2 ] ::executeSubTasks time offset: 100
Executed subtask L2 2
[ TaskThread - 6 ] ::canResumeThread subTasks length: 0 isRunning: yes isPaused: no
[ TaskThread - 6 ] ::executeSubTasks empty subTasks, finish task (thread blocked)
[ TaskThread - 2 ] ::executeSubTasks complete subTasks
[ TaskThread - 2 ] ::executeSubTasks empty subTasks, enter in sleep mode
>>>>>>>>>>>>>>   shutdown after all sub tasks are finished [ TaskThread - 2 ] 
[ TaskThread - 2 ] ::canResumeThread subTasks length: 0 isRunning: yes isPaused: yes
[ TaskThread - 1 ] ::executeSubTasks complete subTasks
[ TaskThread - 1 ] ::executeSubTasks executing task ` [ TaskThread - 3 ] `
[ TaskThread - 1 ] ::executeSubTasks time offset: 0
Executed subtask L1 2
[ TaskThread - 3 ] ::addSubTask adding task ` [ TaskThread - 7 ] `
[ TaskThread - 3 ] ::canResumeThread subTasks length: 0 isRunning: yes isPaused: no
[ TaskThread - 3 ] ::addSubTask can resume: no
[ TaskThread - 3 ] ::addSubTask adding task ` [ TaskThread - 8 ] `
[ TaskThread - 3 ] ::canResumeThread subTasks length: 1 isRunning: yes isPaused: no
[ TaskThread - 3 ] ::addSubTask can resume: no
[ TaskThread - 3 ] ::executeSubTasks executing task ` [ TaskThread - 7 ] `
[ TaskThread - 3 ] ::executeSubTasks time offset: 0
Executed subtask L2 1
[ TaskThread - 7 ] ::canResumeThread subTasks length: 0 isRunning: yes isPaused: no
[ TaskThread - 7 ] ::executeSubTasks empty subTasks, finish task (thread blocked)
[ TaskThread - 3 ] ::executeSubTasks complete subTasks
[ TaskThread - 3 ] ::executeSubTasks executing task ` [ TaskThread - 8 ] `
[ TaskThread - 3 ] ::executeSubTasks time offset: 100
Executed subtask L2 2
[ TaskThread - 8 ] ::canResumeThread subTasks length: 0 isRunning: yes isPaused: no
[ TaskThread - 8 ] ::executeSubTasks empty subTasks, finish task (thread blocked)
[ TaskThread - 3 ] ::executeSubTasks complete subTasks
[ TaskThread - 3 ] ::executeSubTasks empty subTasks, enter in sleep mode
>>>>>>>>>>>>>>   shutdown after all sub tasks are finished [ TaskThread - 3 ] 
[ TaskThread - 3 ] ::canResumeThread subTasks length: 0 isRunning: yes isPaused: yes
[ TaskThread - 1 ] ::executeSubTasks complete subTasks
[ TaskThread - 1 ] ::executeSubTasks executing task ` [ TaskThread - 4 ] `
[ TaskThread - 1 ] ::executeSubTasks time offset: 0
Executed subtask L1 3
[ TaskThread - 4 ] ::addSubTask adding task ` [ TaskThread - 9 ] `
[ TaskThread - 4 ] ::canResumeThread subTasks length: 0 isRunning: yes isPaused: no
[ TaskThread - 4 ] ::addSubTask can resume: no
[ TaskThread - 4 ] ::addSubTask adding task ` [ TaskThread - 10 ] `
[ TaskThread - 4 ] ::canResumeThread subTasks length: 1 isRunning: yes isPaused: no
[ TaskThread - 4 ] ::addSubTask can resume: no
[ TaskThread - 4 ] ::executeSubTasks executing task ` [ TaskThread - 9 ] `
[ TaskThread - 4 ] ::executeSubTasks time offset: 0
Executed subtask L2 1
[ TaskThread - 9 ] ::canResumeThread subTasks length: 0 isRunning: yes isPaused: no
[ TaskThread - 9 ] ::executeSubTasks empty subTasks, finish task (thread blocked)
[ TaskThread - 4 ] ::executeSubTasks complete subTasks
[ TaskThread - 4 ] ::executeSubTasks executing task ` [ TaskThread - 10 ] `
[ TaskThread - 4 ] ::executeSubTasks time offset: 100
Executed subtask L2 2
[ TaskThread - 10 ] ::canResumeThread subTasks length: 0 isRunning: yes isPaused: no
[ TaskThread - 10 ] ::executeSubTasks empty subTasks, finish task (thread blocked)
[ TaskThread - 4 ] ::executeSubTasks complete subTasks
[ TaskThread - 4 ] ::executeSubTasks empty subTasks, enter in sleep mode
>>>>>>>>>>>>>>   shutdown after all sub tasks are finished [ TaskThread - 4 ] 
[ TaskThread - 4 ] ::canResumeThread subTasks length: 0 isRunning: yes isPaused: yes
[ TaskThread - 1 ] ::executeSubTasks complete subTasks
[ TaskThread - 1 ] ::executeSubTasks empty subTasks, finish task (thread blocked)

````