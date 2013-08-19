function main() {
	// Add tooltip to all anchors
	var $tooltip = $("#tooltip").hide();
	var tooltip_content = $tooltip.html()
	var tooltip_width = $tooltip.width();
	var tooltip_show = false;
	$("p a").mouseenter(function(ev) {
		var user = $(this).text().trim();
		$tooltip.html(tooltip_content.replace("%user", user).replace("%user", user));
		tooltip_show = true;
		window.setTimeout(function() {
			tooltip_show && $tooltip.fadeIn(200);
		}, 400);
	}).mouseleave(function(ev) {
		tooltip_show = false;
		$tooltip.fadeOut(300);
	}).mousemove(function(ev) {
		$tooltip.css({
					left:Math.min(ev.pageX+10,$(window).width()-tooltip_width-50),
					top:ev.pageY-$tooltip.height()-20});
	});
}

$( document ).ready( main );