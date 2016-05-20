'use strict';
var processCommunicationPluginInterface = require('./processCommunicationPluginInterface.js');
/**
 * @copyright Kay Schneider <kayoliver82@gmail.com>
 * @license MIT
 *
 * This process works fine for all the data
 */

var processCommunication = function(cluster, globals) {
    this.cluster = cluster;
    this.init();
    this.plugins=[];
    this.globals=globals;
    this.uniqeNames=[];
    this.globals['master']=this.getFirstWorker.bind(this);
};

processCommunication.prototype.getFirstWorker = function() {
    return this.cluster; //HACK WTF! its now the process!

};

processCommunication.prototype._getFromGlobals=function(stringName) {
    for(var key in this.globals) {
        if(key==stringName) {
            return this.globals[key];
        }
    }
    return false;
};

processCommunication.prototype.testInject=function(plugin) {
    var globalsToInject=plugin.getInjections();
    var _this = this;
    globalsToInject.map(function(objectForInjection) {
        var globalVar = _this._getFromGlobals(objectForInjection);
        if(globalVar) {
            if(plugin['set'+ objectForInjection.charAt(0).toUpperCase() + objectForInjection.substr(1)] ) {
                plugin['set'+ objectForInjection.charAt(0).toUpperCase() + objectForInjection.substr(1)](globalVar);
            } else {
                throw Error('YOUR SET VAR function isnt present, processCommunication tried to call ' + 'set'+ objectForInjection.charAt(0).toUpperCase() + objectForInjection.substr(1) );
            }
        }
    });
};

/**
 * register a new command to the processCommunication
 * the plugin must inerhit the processCommunicationPluginInterface class!
 * If not it will break here!
 * Every plugin can be only registered once.
 * The plugin must be handled direct by the master process. it cant be added
 * via inter process communications
 */
processCommunication.prototype.registerCMD = function(plugin, pluginName) {
    if(plugin instanceof processCommunicationPluginInterface) {
        if(this.uniqeNames.indexOf(pluginName) !==-1) {
            throw  new Error("DIE DIE DIE, only register an plugin once, use mean.options.workerId to ensure only register your command inside one worker. This is running only inside the master process! :) try it or write kayoliver82@gmail.com");
            return;
        }
        this.testInject(plugin);
        this.uniqeNames.push(pluginName);
        this.plugins.push(plugin);
    } else  {
        throw new Error("DIE DIE DIE ");
    }
};

/**
 * bootstrap all the processes
 */
processCommunication.prototype.init = function()   {
    this.addListener();
};

processCommunication.prototype.checkCMD=function(commandObject) {
    console.log(arguments, 'RECEIVED DATA');
    switch(commandObject.cmd) {
        case 'registerCMD':
            this.registerCMD(commandObject.data.plugin, commandObject.data.pluginName);
            break;
    }
    this.plugins.map(function(plugin) {
        plugin.checkCMD(commandObject.cmd, commandObject.data);
    });
};

processCommunication.prototype.addListener = function () {
    var callback=this.checkCMD.bind(this);
    this.cluster.on('message', function(commandObject) {
        console.log('received message');
        callback(commandObject);
    });
};



module.exports = processCommunication;
