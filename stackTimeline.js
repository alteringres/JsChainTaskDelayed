let stackTimeline = {
    /**
     * Stack with tasks
     */
    stack : [],

    /**
     * Flag to know if a task can be run without any delay
     */
    runImmediate : true,

    /**
     * Keep alive checking for any task
     */
    keepAliveTime : 100,

    /**
     * Push task in queue
     *
     * @param fcn
     * @param time
     */
    push : function(fcn, time) {
    
        this.stack.push({
            "fcn"   : fcn,
            "time"  : time
        });
    },

    /**
     * Return next element to execute
     *
     * @returns {*}
     */
    next : function() {
        let current;
        current = this.stack.shift();

        if (current == undefined) {
            return null;
        }
        
        return current;
    },

    /**
     * Execute function
     *
     * @param fcn
     */
    execute : function (fcn) {
        fcn();
    },

    /**
     * Returns true if stack is empty
     * @returns {boolean}
     */
    isEmptyStack : function() {

        return this.stack.length;
    },

    /**
     * Main method used for execution
     *
     * @returns {boolean}
     */
    run : function() {
        let self = this, executorFcn, timeoutObj, fcn, time, current;
        current = this.next();
        if (current === null) {
            timeoutObj = setTimeout(function() {
                self.run();
                clearTimeout(timeoutObj);
            }, this.keepAliveTime);

            return false;
        }

        fcn  = current['fcn'];
        time = current['time'];

        /**
         * Function to execute immediate or delayed
         */
        executorFcn = function() {
            // execute original function
            self.execute(fcn);

            // if empty stack mark to execute directly next function
            self.runImmediate = self.isEmptyStack();

            // run again the process
            self.run();
        };

        if (this.runImmediate) {
            executorFcn();
        } else {
            timeoutObj = setTimeout(function () {
                executorFcn();
                clearTimeout(timeoutObj);

            }, time);
        }

        return true;
    }
};
