/**
 * the simple plugin structure should enable us to add simple
 * plugins to register some commands into inter process communication
 * without to handle about the details inside the process communication class
 *
 * Im faking an abstract class with this construct. WIth the benefit that and
 * developer sees direct what hes missing in his child class
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
