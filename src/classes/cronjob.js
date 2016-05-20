'use strict';
/**
 * Created by ikay on 19.05.16.
 */
var moment = require('moment');
var registerJob = function() {
    this.init();
};
registerJob.prototype.init = function() {
    this._run();

};

registerJob.prototype._run = function() {
    //check with moment if this should be called
    var jobs = registerJob.jobs;
    var _this=this;
    this.working=true;
    jobs.map(function(item) {
        if(_this.checkJob(item) === true) {
            item.callback(); //do the job
            item.lastrun = moment().format('X');
        }
    });
    this.working=false;

    /**
     * added nextTick before calling timeout to reduce
     * blocking or wasting the cpu
     */
    this._checkWork();
};

/**
 * anti schluckauf methode :P
 * @private
 */
registerJob.prototype._checkWork = function() {
    var runner = this._run.bind(this);
    var runWork=this._checkWork.bind(this);
    var _this=this;
    process.nextTick(function() {
        if(_this.working==true) {
            console.log('BLOCKED IN PROGRESS');
            setTimeout(runWork,100);
        }  else {
            setTimeout(runner,500);
        }
    });
};

registerJob.prototype.getRunConfiguration = function (jobItem, lastRun) {
    var returnObject={
        diffOperator:'seconds',
        rerunAfter:60,
        diffFrom:moment(),
        checkFunction:function(runConfig) {
            var epochsinceLastRun = moment().diff(runConfig.diffFrom, runConfig.diffOperator);
            if(runConfig.rerunAfter <= epochsinceLastRun) {
                return true;
            }
            return false;
        }
    };

    if(jobItem.seconds) {
        returnObject.diffOperator='seconds';
        returnObject.rerunAfter=jobItem.seconds;
        returnObject.diffFrom = moment.unix(lastRun);//its now
    }

    if(jobItem.minutes) {
        returnObject.diffOperator='minutes';
        returnObject.rerunAfter=jobItem.minutes;
        returnObject.diffFrom = moment.unix(lastRun);
    }

    if(jobItem.hours) {
        returnObject.diffOperator='hours';
        returnObject.rerunAfter=jobItem.hours;
        returnObject.diffFrom = moment.unix(lastRun);
    }

    if(jobItem.time_hour && !jobItem.time_minute) {
        returnObject.diffOperator='seconds';
        returnObject.rerunAfter=0;
        returnObject.diffFrom = moment().hours(jobItem.time_hour);

    } else if(jobItem.time_hour && jobItem.time_minute) {
        //this items should only run on on the given time! not earlier and not later!
        if(lastRun) {
            //was last run today should checked
            var checkIfItsTime =moment.unix(lastRun).diff(moment(), 'day');
            if(checkIfItsTime==0) { //last run was today
                returnObject.rerunAfter=24
                returnObject.checkFunction=function()  {
                    return false;
                }

            }
        }
        if(returnObject.rerunAfter!=24) {
            returnObject.diffOperator='minutes';
            returnObject.rerunAfter=0;
            returnObject.diffFrom = moment().hours(jobItem.time_hour).minutes(jobItem.time_minute).seconds(0);
            returnObject.checkFunction=function(runConfig)  {
                //configItem.diffFrom //the hours today
                var epochsinceLastRun = moment().diff(runConfig.diffFrom, runConfig.diffOperator);
                if(epochsinceLastRun == runConfig.rerunAfter) {
                    return true;
                }
                return false;
            }
        }

    }
    return returnObject;
};

/**
 * check if the job should run now
 * @param job
 */
registerJob.prototype.checkJob=function(job) {
        /**
         * perform here an check
         */
        var lastRun = job.lastrun;
        var runConfig = this.getRunConfiguration(job.schedulerConfig, lastRun);
        return runConfig.checkFunction(runConfig);

};

/**
 * simple job register module
 * @param {string} moduleName
 * @param {string} jobName
 * @param {string} callback
 * @param {string} schedulerObject
 * example {seconds:1, minutes:1, hours:12, time_hour:23, time_minute:2}
 * //run the job every 12 hours or || every seconds or every minute ||  or run the job every day on time_hour 23....
 * note only one is taken from the list, the very first  ||
 * @returns {boolean} null
 */
registerJob.prototype.addJob=function(moduleName, jobName, callback, schedulerObject) {
    var uuid = moduleName+jobName;
    if(registerJob.uuids.indexOf(uuid)!=-1) {
        console.log('job id is not unique', uuid);
        return false;
    }
    registerJob.uuids.push(uuid);
    if(jobName=='dampf') {
        registerJob.jobs.push({uuid:uuid,callback:callback,schedulerConfig:schedulerObject, lastrun:null});
    } else
        registerJob.jobs.push({uuid:uuid,callback:callback,schedulerConfig:schedulerObject, lastrun:null});
    return true;
};

registerJob.uuids=[];
registerJob.jobs=[];
var jobcall = new registerJob();

/**
jobcall.addJob('HANS', 'dampf', function() {
    console.log('im the callback');
    var jobNeeds = require('./test.js');
    jobNeeds();
}, {
    time_hour:20,
    time_minute:35
});

jobcall.addJob('HANS', 'dampfmaschine', function() {
    console.log('EVEERY 10 SECONDS');

}, {
    seconds:10
});
**/

module.exports=jobcall;
