# JsChainTaskDelayed
Project which has the main purpose to facilitate the  execution of tasks on after the other delayed.

#Usage
````javascript
let taskScheduler = new TaskScheduler();
taskScheduler.verbose = true;
taskScheduler.startThread();

// task delayed with 0
taskScheduler.push(
    function() {
        console.log('task 1');
    },
    1000,
    "test 1000"
);
// task delayed with 500
taskScheduler.push(
    function() {
        console.log('task 2');
    },
    500,
    "test 5000"
);
// task delayed with 2000
taskScheduler.push(
    function() {
        console.log('task 3');
    },
    2000,
    "test 2000"
);

// task delayed with 2592
setTimeout(function() {
    taskScheduler.push(
        function() {
            console.log('task 4');
        },
        4000,
        "test 4000"
    );
}, 4000);
setTimeout(function() {
taskScheduler.isRunning  = false;
}, 6000);
// task delayed with 500
taskScheduler.push(
    function() {
        console.log('task 5');
    },
    500,
    "test 5000 fater is running false"
);

taskScheduler.push(
    function() {
        console.log('task 500');
    },
    5000,
    "test 5000 test stoped thread"
);
````
