/**
 * Created by ikay on 19.05.16.
 */

var hallo = function() {
    function dirty() {
        console.log('##########################################');
        for(var i=1; i==100;i++) {
            console.log('##########################################');
        }
    }
    dirty();
    console.log('HALLO HALLO HALLO HALLO');
    dirty();
}

module.exports = hallo;
