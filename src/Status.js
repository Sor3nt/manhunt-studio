export default class Status{
    /**
     * @type {jQuery}
     */
    static element;

    static setAt = +new Date();
    static duration = 0;
    static interval = 0;

    static loadingContainer = null;

    static hideWelcome(){
        jQuery('#welcome').animate({opacity: 0}, function () {
            jQuery('#welcome').hide()
        })
    }

    static showWelcome(){
        jQuery('#welcome').css('opacity', 0).show().animate({
            opacity: 1
        });
    }

    static hide(){
        if ( Status.loadingContainer === null)
            Status.loadingContainer = jQuery('#loading');

        Status.loadingContainer.animate({
            opacity: 0
        }, function () {
            Status.loadingContainer.css({
                opacity:1,
                display:"none"
            })
        });
    }
    static show(msg){
        if ( Status.loadingContainer === null)
            Status.loadingContainer = jQuery('#loading');

        Status.loadingContainer.show();
    }
    static set(msg){

        console.log(msg, "last duration", +new Date() - Status.setAt);
        Status.element.html(msg);
        Status.setAt = +new Date();

        window.clearInterval(Status.interval);
        Status.interval = window.setInterval(function () {
            Status.element.html(msg + ` (${Status.duration}s)`);
            Status.duration++;

        }, 1000)
    }

}