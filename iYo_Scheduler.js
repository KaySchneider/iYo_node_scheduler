'use strict';
/**
 * Created by ikay on 20.05.16.
 */
var processCommunication = require('./src/masterProcess/processCommunication.js');
var cronJobPlugin = require('./src/basePlugins/registerCronJobCallBack.js');
var cronJob = require('./src/classes/cronjob.js');

var processCommunication = new processCommunication(process,  {'cronJob':cronJob}); //inject the cluster to interprocess communication and bootstrap the framework
processCommunication.registerCMD(new cronJobPlugin(), "cronJob");
