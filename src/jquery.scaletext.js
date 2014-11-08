;
(function(defaults, $, window, document, undefined) {

    "use strict";

    $.extend({
    	// function to configure global default options
        // jQuery.scalTextSetup(defaultOptions);
        scaleTextSetup: function(options) {
            return $.extend(defaults, options);
        }
    }).fn.extend({
        // jQuery(selector).scaleText(options);
        scaleText: function(options) {
        	//Puts the defaults and the sent options together as one
            options = $.extend({}, defaults, options);

            var startScaling = function(pluginThis) {

                //This isn"t going to work on inline elements.
                if (!(pluginThis.el.css("display") === "block" || pluginThis.el.css("display") === "inline-block")) {
                    return true;
                }

                //Store it"s original status for returning it back later
                pluginThis.original = {};
                pluginThis.original.visible = pluginThis.el.is(":visible");
                pluginThis.original.margin = pluginThis.el.css("margin");
                pluginThis.original.padding = pluginThis.el.css("padding");
                pluginThis.original.border = pluginThis.el.css("border");
                pluginThis.original.height = pluginThis.el.css("height");
                pluginThis.original.width = pluginThis.el.css("width");
                pluginThis.original.fontSize = pluginThis.el.css("font-size");
                pluginThis.divideBy = 16; //default inheritied size
                
                //Get the font size of the container. If it"s in pixels, use this instead
                if (pluginThis.original.fontSize.indexOf("px") > -1) {
                	pluginThis.divideBy = parseInt(pluginThis.original.fontSize);
                }

                //Can"t measure properly if it"s not visible!
                if (!pluginThis.original.visible) pluginThis.el.show();

                //Get it"s current size
                pluginThis.original.measuredWidth = parseInt(pluginThis.el.width());
                pluginThis.original.measuredHeight = parseInt(pluginThis.el.height());

                //Fix it"s size for certain whilst we scale and put it off screen
                //We also reset padding because scrollHeight doesn"t take that into account
                //This could cause a page redraw, so might need revisiting
                //We use overflow hidden to stop margin collapse issues
                pluginThis.el.css({
                    "width": pluginThis.original.measuredWidth + "px",
                    "height": pluginThis.original.measuredHeight + "px",
                    "margin-left": "9999999px",
                    "padding": "0px",
                    "border": "none",
                    "overflow": "hidden"
                });

                //Find all child elements with fixed font sizes and make them responsive
                //That way we only have to adjust one font size to scale the whole lot
                pluginThis.el.find("*").each(function() {
                    pluginThis.tmp.fontSize = $(this).css("font-size");
                    if (pluginThis.tmp.fontSize.indexOf("px") > -1) {
                        $(this).css("font-size", ((parseInt(pluginThis.tmp.fontSize) / pluginThis.divideBy) * 100) + "%");
                    }
                });

                //scale it to size!
                var finalFontSize = scaleLoop(pluginThis);

                //put things back to how they were
                if (!pluginThis.original.visible) pluginThis.el.hide();
                pluginThis.el.css({
                    "margin": pluginThis.original.margin,
                    "width": pluginThis.original.width,
                    "height": pluginThis.original.height,
                    "padding": pluginThis.original.padding,
                    "border": pluginThis.original.border
                });

                if (pluginThis.settings.animate) {
                    pluginThis.el.css("font-size", pluginThis.original.fontSize);
                    pluginThis.el.animate({
                        "font-size": finalFontSize + "px"
                    }, pluginThis.settings.animateOptions);
                }

                //For debugging purposes
                if (options.debug) console.log("Took: " + (new Date().getTime() - pluginThis.startTime) + "ms", "Loops: ", pluginThis.loopCount);
            };

            var scaleLoop = function(pluginThis) {
                //Go up in a large step, with the steps refining as we go
                var chunkSize = Math.ceil(pluginThis.original.measuredHeight); //start at the size of the element and work our way down
                var maxSize = chunkSize;
                var fontSize, finalFontSize;         

                for (fontSize = 0; fontSize <= maxSize; fontSize += chunkSize) {
                	pluginThis.loopCount++;
                    pluginThis.el.css("font-size", fontSize + "px");

                    if (pluginThis.element.scrollHeight > pluginThis.original.measuredHeight || pluginThis.element.scrollWidth > pluginThis.original.measuredWidth) {
                        fontSize -= chunkSize; //back a step
                        chunkSize = chunkSize / 2; //increase by less
                    }

                    if (chunkSize < .1 || fontSize === maxSize) {
                        finalFontSize = fontSize;
                        break;
                    }
                }

                //Set our final value
                pluginThis.el.css("font-size", finalFontSize + "px");
                return finalFontSize;
            };

            return $(this).each(function() {

                var pluginThis = {
                    tmp: {}
                };

                pluginThis.element = this;
                pluginThis.el = $(this);
                if (options.debug) pluginThis.startTime = new Date().getTime();
                pluginThis.settings = options;
                pluginThis.loopCount = 0;

                startScaling(pluginThis);
            });
        }
    });
})({
	debug: false,
    scaleImages: false,
    animate: false,
    animateOptions: {}
}, jQuery, window, document);

//Window load makes sure the fonts are loaded too
$(window).load(function () {
	//automatically scale any with this class
	$(".scaleText").scaleText();	
});
