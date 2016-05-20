'use strict';
/**
 * Base class for plugins
 *
 * Created by ikay on 20.05.16.
 */

var processCommunicationPluginInterface=function() {

};

processCommunicationPluginInterface.prototype.init=function() {

};

/**
 * @param {string} cmd  (command string)
 * @param {object} optionalData (data the knowledge what must be inside this object is specified by each plugin itself
 *
 */
processCommunicationPluginInterface.prototype.checkCMD=function(cmd, optionalData) {
    throw new Error('checkMD must be defined, in your plugin the method isnt defined! Please define your command');
};

/**
 * @return {array} with strings for the global injector of instances..
 */
processCommunicationPluginInterface.prototype.getInjections=function() {
    throw new Error('getInjections must be defined, in your plugin the method isnt defined! Please define your command');
};

module.exports = processCommunicationPluginInterface;
