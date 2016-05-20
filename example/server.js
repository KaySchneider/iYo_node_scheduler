'use strict';
var childProcess = require('child_process'),
    iYoClient = require('../src/consumeLib/iYoSchedule.js'),
    cluster = require('cluster');

if ((cluster.isMaster) && (process.argv.indexOf('--debug') < 0) && (process.env.NODE_ENV!=='test') && ( !process.env.singleProcess ) ) {
    //spawn the scheduled worker forks


    try {
        var workerProcess = null;
        var getFirstWorker=function() {
            try{
              for(var id in cluster.workers ) {
                  return cluster.workers[id];
              }
            } catch(e) {
                console.log(e, 'ERR');
                return {
                    send:function() { return null}
                };
            }
        };

        var forkScheduler=function() {
            /**
             * if an scheduled worker dies we need to rerun it
             * and the config must be read from the database
             */
            workerProcess = childProcess.fork('../iYo_Scheduler.js');
            workerProcess.on('exit', function(id) {
                console.log('worker died with id: ', id);
                process.nextTick(function() {
                    setTimeout(forkScheduler, 9000);
                })

            });
            workerProcess.on('message', function(data) {
                if(data) {
                    if(data.to) {
                        if(data.to == 'scheduler') {
                            return true;
                        }
                    }
                }
                getFirstWorker().send(data);
            });
        };
        forkScheduler();
    } catch(e) {
        console.log(e, 'THE PROCeSS IS DEAD');
    }

    var cpuCount = require('os').cpus().length/2;
    // Create a worker for each CPU
    //on dev machine, dont make an worker for each cpu !!!
    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }

    // Listen for dying workers
    cluster.on('exit', function (worker) {
        // Replace the dead worker, we're not sentimental
        console.log('Worker ' + worker.id + ' died :(');
        cluster.fork();
    });

    
} else {
    var workerId = 0;
    if (!cluster.isMaster)
    {
        workerId = cluster.worker.id;

    }
    console.log('start woker', iYoClient);
    /**
    * start here your server instances!
    * somewhere else deep inside any framework or so make:
    **/
    iYoClient.registerEvent('events', 'krusty', {seconds:8} ,function() {
        console.log('HEY HEY HEY IM CRUSTY')
    });

}
