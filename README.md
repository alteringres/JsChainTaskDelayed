# JsChainTaskDelayed
Project which has the main purpose to facilitate the  execution of tasks on after the other delayed.

#Usage
````javascript
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
