# JsChainTaskDelayed
Project which has the main purpose to facilitate the  execution of tasks on after the other delayed.

#Usage
````javascript

var TaskThread = require("js-task-runner-tree");

let runner = new TaskThread(1, true, true, function() { console.log('main function executed'); });
TASK_THREAD_VERBOSE = -1;

for (let i = 0; i < 2; i++) {
    // define task
    let task = new TaskThread(1000, true, true, function() {
        console.log(" level 2 task " + i);
    });

    runner.addSubTask(task);

    setTimeout(function() {

        console.log("Adding tasks later");

        for (let j = 0; j < 3; j++) {
            let taskLevelTwo = new TaskThread(1000, true, true, function() {
                console.log("parent " + i +  "  level 3 task " + j);
            });
            task.addSubTask(taskLevelTwo);
            taskLevelTwo.canAddSubTask = false;
        }
        task.canAddSubTask = false;


    }, 3000);
}

runner.executeSubTasks(function() {
    console.log('done executing');
});


````

````bash
$ node test.js 
 level 2 task 0
Adding tasks later
Adding tasks later
parent 0  level 3 task 0
parent 0  level 3 task 1
parent 0  level 3 task 2
 level 2 task 1
parent 1  level 3 task 0
parent 1  level 3 task 1
parent 1  level 3 task 2

````