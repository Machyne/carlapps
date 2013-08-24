function main() {

	// Initialize the date picker
	$( "#datepicker" ).datepicker({
        inline: true,
        showOtherMonths: true, 
        dayNamesMin: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    });

}

$( document ).ready( main );