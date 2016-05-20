'use strict';
/**
 * Simple library to consume iYo_Scheduler
 * Created by ikay on 20.05.16.
 */
var iYoSchedule =  {
    registerEvent:function(module, eventName, interval, callbackFunction) {
        process.on('message', function(transportObject) {
            if(transportObject.module) {
                if(transportObject.module==module) {
                    if(transportObject.cmd) {
                        switch(transportObject.cmd) {
                            case eventName:
                                process.nextTick(function() {
                                    callbackFunction(transportObject.data);
                                });
                                break;
                        }
                    }

                }
            }
        });
        var data ={
            to:'scheduler',
            module:module,
            name:eventName,
            interval:interval
        };
        process.send({cmd:'addJob', data:data });
    }
};

module.exports = iYoSchedule;
