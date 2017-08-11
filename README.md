# JsChainTaskDelayed
Library which facilitate task which must run with a delay after previous tasks has finished, in a tree structure

#Usage
````javascript
let TaskThread = require("./index");

let runner = new TaskThread(0, true, true, function() {
    console.log("general task");
});
runner.executeSubTasks(function() {
    console.log("all tasks are executed")
});

let indexTask = 1;

console.log("---------- test main function ---------");
let intervalAddTask = setInterval(function() {
    indexTask++;
    let task = new TaskThread(1000, true, true, function() {
        console.log("Task number " +indexTask + " was executed");
    });
    runner.addSubTask(task);
    task.lockTask();
}, 1000);

let timeoutClear = setTimeout(function() {
    clearInterval(intervalAddTask);
    console.log("--------- test locking in sleep mode -----");
    indexTask++;
    let taskOne = new TaskThread(1000, true, true, function() {
        console.log("Task number " +indexTask + " was executed (a)");
    });
    runner.addSubTask(taskOne);


    indexTask++;
    let taskOneChild1 = new TaskThread(1000, true, true, function() {
        console.log("Task number " +indexTask + " was executed (b)");
    });
    taskOne.addSubTask(taskOneChild1);
    taskOneChild1.lockTask();

    indexTask++;
    let taskTwo = new TaskThread(1000, true, true, function() {
        console.log("Task number " +indexTask + " was executed (c)");
    });
    runner.addSubTask(taskTwo);

    taskOne.lockTask();
    taskTwo.lockTask();

    clearTimeout(timeoutClear);
}, 3000);

// runner.lockTask();

````

````bash
 TaskThread - 1 ] ::executeSubTasks empty subTasks, enter in sleep mode
---------- test main function ---------
[ TaskThread - 1 ] ::addSubTask adding task ` [ TaskThread - 2 ] `
[ TaskThread - 1 ] ::canResumeThread subTasks length: 0 isRunning: yes isPaused: yes
[ TaskThread - 1 ] ::addSubTask can resume: yes
[ TaskThread - 1 ] ::executeSubTasks executing task ` [ TaskThread - 2 ] `
[ TaskThread - 1 ] ::executeSubTasks time offset: 0
[ TaskThread - 2 ] ::canResumeThread subTasks length: 0 isRunning: yes isPaused: no
[ TaskThread - 2 ] ::lockTask Locked task, can resume: no
Task number 2 was executed
[ TaskThread - 2 ] ::executeSubTasks empty subTasks, finish task (thread blocked)
[ TaskThread - 1 ] ::executeSubTasks complete subTasks
[ TaskThread - 1 ] ::executeSubTasks empty subTasks, enter in sleep mode
[ TaskThread - 1 ] ::addSubTask adding task ` [ TaskThread - 3 ] `
[ TaskThread - 1 ] ::canResumeThread subTasks length: 0 isRunning: yes isPaused: yes
[ TaskThread - 1 ] ::addSubTask can resume: yes
[ TaskThread - 1 ] ::executeSubTasks executing task ` [ TaskThread - 3 ] `
[ TaskThread - 1 ] ::executeSubTasks time offset: 0
[ TaskThread - 3 ] ::canResumeThread subTasks length: 0 isRunning: yes isPaused: no
[ TaskThread - 3 ] ::lockTask Locked task, can resume: no
Task number 3 was executed
[ TaskThread - 3 ] ::executeSubTasks empty subTasks, finish task (thread blocked)
[ TaskThread - 1 ] ::executeSubTasks complete subTasks
[ TaskThread - 1 ] ::executeSubTasks empty subTasks, enter in sleep mode
--------- test locking in sleep mode -----
[ TaskThread - 1 ] ::addSubTask adding task ` [ TaskThread - 4 ] `
[ TaskThread - 1 ] ::canResumeThread subTasks length: 0 isRunning: yes isPaused: yes
[ TaskThread - 1 ] ::addSubTask can resume: yes
[ TaskThread - 1 ] ::executeSubTasks executing task ` [ TaskThread - 4 ] `
[ TaskThread - 1 ] ::executeSubTasks time offset: 6
[ TaskThread - 4 ] ::addSubTask adding task ` [ TaskThread - 5 ] `
[ TaskThread - 4 ] ::canResumeThread subTasks length: 0 isRunning: yes isPaused: no
[ TaskThread - 4 ] ::addSubTask can resume: no
[ TaskThread - 5 ] ::canResumeThread subTasks length: 0 isRunning: no isPaused: no
[ TaskThread - 5 ] ::lockTask Locked task, can resume: no
[ TaskThread - 1 ] ::addSubTask adding task ` [ TaskThread - 6 ] `
[ TaskThread - 1 ] ::canResumeThread subTasks length: 0 isRunning: yes isPaused: no
[ TaskThread - 1 ] ::addSubTask can resume: no
[ TaskThread - 4 ] ::canResumeThread subTasks length: 1 isRunning: yes isPaused: no
[ TaskThread - 4 ] ::lockTask Locked task, can resume: no
[ TaskThread - 6 ] ::canResumeThread subTasks length: 0 isRunning: no isPaused: no
[ TaskThread - 6 ] ::lockTask Locked task, can resume: no
Task number 6 was executed (a)
[ TaskThread - 4 ] ::executeSubTasks executing task ` [ TaskThread - 5 ] `
[ TaskThread - 4 ] ::executeSubTasks time offset: 0
Task number 6 was executed (b)
[ TaskThread - 5 ] ::executeSubTasks empty subTasks, finish task (thread blocked)
[ TaskThread - 4 ] ::executeSubTasks complete subTasks
[ TaskThread - 4 ] ::executeSubTasks empty subTasks, finish task (thread blocked)
[ TaskThread - 1 ] ::executeSubTasks complete subTasks
[ TaskThread - 1 ] ::executeSubTasks executing task ` [ TaskThread - 6 ] `
[ TaskThread - 1 ] ::executeSubTasks time offset: 998
Task number 6 was executed (c)
[ TaskThread - 6 ] ::executeSubTasks empty subTasks, finish task (thread blocked)
[ TaskThread - 1 ] ::executeSubTasks complete subTasks
[ TaskThread - 1 ] ::executeSubTasks empty subTasks, enter in sleep mode


````