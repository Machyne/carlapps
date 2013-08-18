function main() {

	// Find first two words of each paragraph
	$(".content p").each(function ()
	{
		var html = $(this).html();
		var first = html.split(" ", 2).join(" ");
		$(this).html('<span class="first">' + first + '</span>' + html.slice(first.length));
	});

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

	// Collapse/expand sections on clicking header
	$("h2").click(function() {
		var p = $(this).parent()
		if (p.data("collapsed")) {
			p.data("collapsed", false);
			p.children(".content").slideDown(300);
			p.removeClass("selected");
		} else {
			p.data("collapsed", true);
			p.children(".content").slideUp(300);
			p.addClass("selected");
		}
	});

}

$( document ).ready( main );