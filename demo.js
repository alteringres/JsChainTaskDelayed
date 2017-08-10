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