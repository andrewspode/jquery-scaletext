/*
 *  jQuery ScaleText - v1.0.2
 *  Scale text inside a container to be as large as possible without spilling.
 *  https://github.com/unclespode/jquery-scaletext
 *
 *  Made by Andrew Spode Miller
 *  Under MIT License
 */
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
            var cssProperties = ["display", "overflow", "margin", "padding", "border", "height", "width", "position", "top", "bottom", "left", "right", "font-size", "float"],
                body = $("body");

            var startScaling = function(pluginThis) {

                //This isn"t going to work on inline elements.
                if (!(pluginThis.el.css("display") === "block" || pluginThis.el.css("display") === "inline-block")) {
                    return true;
                }

                pluginThis.wasVisible = pluginThis.el.is(":visible");
                pluginThis.styleTag = pluginThis.el.attr("style"); //put this back after

                //We need the element to be visible
                pluginThis.el.show();

                /*capture as much CSS as might be needed for placeholder*/
                /*I could just clone it, but it might have a lot of content*/
                pluginThis.visibleCss = pluginThis.el.css(cssProperties);

                //We want a measured font-size in pixels ideally
                //This used for calculating are repsonsive font sizes
                pluginThis.divideBy = 16; //default inheritied size

                //Get the font size of the container. If in pixels, use this instead
                if (pluginThis.visibleCss["font-size"].indexOf("px") > -1) {
                    pluginThis.divideBy = parseInt(pluginThis.visibleCss["font-size"]);
                }

                //Get current size of container
                pluginThis.measuredWidth = parseInt(pluginThis.el.width());
                pluginThis.measuredHeight = parseInt(pluginThis.el.height());

                //Now we create a placeholder using it's measured size (no contents after all)
                var placeHolder = $("<div></div>").css($.extend({}, pluginThis.visibleCss, {
                        "height": pluginThis.measuredHeight,
                        "width": pluginThis.measuredWidth
                    })),
                    containerArea = $("<div></div>").css({
                        "position": "absolute",
                        "top": "-100%",
                        "left": "-100%",
                        "height": "100%",
                        "width": "100%",
                        "overflow": "hidden"
                    }).appendTo(body); //Somewhere to hold our item while we work on it

                //Find all child elements with fixed font sizes and make them responsive
                //That way we only have to adjust one font size to scale the whole lot
                var tmpFontSize;
                pluginThis.el.find("*").each(function() {
                    tmpFontSize = $(this).css("font-size");
                    if (tmpFontSize.indexOf("px") > -1) {
                        if ((parseInt(tmpFontSize) / pluginThis.divideBy) !== 1) $(this).css("font-size", ((parseInt(tmpFontSize) / pluginThis.divideBy) * 100) + "%");
                    }
                });

                //Replace our item with a placeholder to stop it messing layout and then take off screen
                //Remove anything that affects the box model maths
                //Give it a fixed width and height
                pluginThis.el.replaceWith(placeHolder).css({
                    "width": pluginThis.measuredWidth + "px",
                    "height": pluginThis.measuredHeight + "px",
                    "padding": "0px",
                    "border": "none",
                    "overflow": "hidden"
                }).appendTo(containerArea);

                //Remove any previously used spacers
                pluginThis.el.find(".scaleTextSpacer").remove();

                //scale it to size!
                var finalFontSize = scaleLoop(pluginThis);

                //calculate any spacing needed to center it
                pluginThis.el.css("height", "auto"); //set the height to auto in order to measure it

                var heightDiff = pluginThis.measuredHeight - pluginThis.element.scrollHeight,
                    spacerHeight = Math.floor(heightDiff / 2) + "px",
                    spacer;

                if (pluginThis.settings.verticalMiddle && heightDiff > 1) {
                    spacer = $("<div class=\"scaleTextSpacer\"></div>");
                    spacer.css("height", spacerHeight);
                    if (spacerHeight) pluginThis.el.prepend(spacer);
                }

                //put things back to how they were
                if (!pluginThis.wasVisible) pluginThis.el.hide();

                //put css back to how it was and then swap back with placeholder
                placeHolder.replaceWith(pluginThis.el.attr("style", pluginThis.styleTag || "").css("font-size", finalFontSize + "px")).remove(); //get rid of placeholder
                containerArea.remove(); //don't need that either

                if (pluginThis.settings.animate) {
                    //animate the font size
                    pluginThis.el.css("font-size", pluginThis.visibleCss["font-size"]).animate({
                        "font-size": finalFontSize + "px"
                    }, pluginThis.settings.animateOptions);

                    //Animate our spacer too
                    if (spacer) {
                        spacer.css("height", "0px").animate({
                            height: spacerHeight
                        }, pluginThis.settings.animateOptions);
                    }
                }

                //For debugging purposes
                if (options.debug) console.log("Took: " + (new Date().getTime() - pluginThis.startTime) + "ms", "Loops: ", pluginThis.loopCount);
            };

            var scaleLoop = function(pluginThis) {
                //Go up in a large step, with the steps refining as we go
                var chunkSize = Math.ceil(pluginThis.measuredHeight), //start at the size of the element and work our way down
                    maxSize = chunkSize,
                    fontSize, finalFontSize,
                    chunkLimit = (1.1 - (Math.min(100, pluginThis.settings.accuracy) / 100));

                for (fontSize = 0; fontSize <= maxSize; fontSize += chunkSize) {
                    pluginThis.loopCount++;
                    pluginThis.el.css("font-size", fontSize + "px");

                    if (pluginThis.element.scrollHeight > pluginThis.measuredHeight || pluginThis.element.scrollWidth > pluginThis.measuredWidth) {
                        fontSize -= chunkSize; //back a step
                        chunkSize = chunkSize / 2; //increase by less
                    }

                    if (chunkSize < chunkLimit || fontSize === maxSize) {
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
                    element: this,
                    el: $(this),
                    settings: options,
                    loopCount: 0
                };

                if (options.debug) pluginThis.startTime = new Date().getTime();

                //Do the dirty work
                startScaling(pluginThis);
            });
        }
    });
})({
    debug: false,
    verticalMiddle: true,
    animate: false,
    accuracy: 100,
    animateOptions: {}
}, jQuery, window, document);