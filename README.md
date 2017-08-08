# JsChainTaskDelayed
Project which has the main purpose to facilitate the  execution of tasks on after the other delayed.

#Usage
````javascript
stackTimeline.run();
// task delayed with 0
stackTimeline.push(
    function() {
        console.log('task 1000');
    },
    1000
);
// task delayed with 500
stackTimeline.push(
    function() {
        console.log('task 500');
    },
    500
);
// task delayed with 2000
stackTimeline.push(
    function() {
        console.log('task 200');
    },
    2000
);

// task delayed with 2592
setTimeout(function() {
    stackTimeline.push(
        function() {
            console.log('task 400');
        },
        4000
    );
}, 4000);
````
