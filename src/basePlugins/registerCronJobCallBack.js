'use strict';
/**
 * Created by ikay on 20.05.16.
 *
 */
var pComInterface = require('../masterProcess/processCommunicationPluginInterface.js');

var cronPCom=function() {
    this.cronJob=null;
    this.master=null;
};

cronPCom.prototype = new pComInterface();
cronPCom.prototype.getInjections=function() {
    return ['cronJob','master'];
};

cronPCom.prototype.setCronJob=function(cronJob) {
    this.cronJob=cronJob;
};
cronPCom.prototype.setMaster=function(cronJob) {
    this.master=cronJob;
};

cronPCom.prototype.callWorkerMethod=function(data) {
    try {
        this.master().send({module:data.module,cmd:data.name, data:'null'});
    } catch(e) {
        console.log(e);
        return;
    }
};

cronPCom.prototype.prepareCallArgs = function(data) {
    if(data.module && data.name  && data.interval) {
        var call = this.callWorkerMethod.bind(this);
        this.cronJob.addJob(data.module,
              data.name,
              function() {
                    call(data);
              },
              data.interval);
    } else {
        console.log(data);
        console.log('Wrong configuration object cant add your job');
    }

};

cronPCom.prototype.checkCMD=function(cmd, data) {
    switch(cmd) {
        case 'addJob':
            //split the config and check it
            this.prepareCallArgs(data); 
            break;

    }
};

cronPCom.prototype.runCommand=function() {

};

module.exports = cronPCom;
