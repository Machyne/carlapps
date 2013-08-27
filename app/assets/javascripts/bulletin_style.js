function main() {

    var scrolling = false;

    // Initialize scroll-to-top button
    $("#scroll-to-top").click(function() {
       scrolling = true;
       $('html, body').animate({scrollTop: 0}, '50', function() {
           scrolling = false;
        });
        $("#scroll-to-top").hide();
        $("#scroll-to-top-active").show().delay(250).fadeOut(400);
    });

    $(window).scroll($.throttle(function() {
        if (!scrolling) {
            if ($(document).scrollTop() > 200) {
                $("#scroll-to-top").fadeIn(400);
            } else {
                $("#scroll-to-top").fadeOut(400);
            }
        }
    }, 500, true));

    // Initialize the date picker
    $("#datepicker").datepicker({
        inline: true,
        showOtherMonths: true, 
        dayNamesMin: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    });

}

$( document ).ready( main );