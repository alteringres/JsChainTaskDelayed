# JsChainTaskDelayed
Project which has the main purpose to facilitate the  execution of tasks on after the other delayed.

#Usage
````javascript
stackTimeline.run();
// this will run immediate because no task is added in queue yet
stackTimeline.push(
    function() {
        console.log('task 1000');
    },
    1000
);
// this will run delayed because the stack contains task 1000 when this is added
stackTimeline.push(
    function() {
        console.log('task 500');
    },
    500
);
// this will run delayed because the stack is not empty
stackTimeline.push(
    function() {
        console.log('task 2000');
    },
    2000
);
// program to add element in stack after 4 seconds, will run immediate because the stack will be empty until then
setTimeout(function() {
    stackTimeline.push(
        function() {
            console.log('task 4000');
        },
        4000
    );
}, 4000);
````
