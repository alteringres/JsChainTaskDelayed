let TaskThread = require("./index");

let runner = new TaskThread(0, true, true, function() {
    console.log("general task");
});
runner.executeSubTasks(function() {
    console.log("all tasks are executed")
});

let indexTask = 0;
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
    clearTimeout(timeoutClear);
}, 3000);

// runner.lockTask();