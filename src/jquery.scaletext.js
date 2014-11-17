;
(function(defaults, $, window, document, undefined) {

    "use strict";

    $.extend({
        // function to configure global default options
        // jQuery.scaleTextSetup(defaultOptions);
        scaleTextSetup: function(options) {
            return $.extend(defaults, options);
        }
    }).fn.extend({
        // jQuery(selector).scaleText(options);
        scaleText: function(options) {
            //Puts the defaults and the sent options together as one
            options = $.extend({}, defaults, options);

            /*This, annoyingly - is the only cross-browser method that also works with different zoom levels. Not ideal.*/
            var hasOverflow = function(element) {
                var el = $(element),
                    styleTag = el.attr("style");

                el.css("overflow", "auto");

                //This accounts for rounding errors when zooming. Hardly ideal still.
                var overflow = ((element.scrollWidth - element.clientWidth > 1) || (element.scrollHeight - element.clientHeight) > 1);
                el.attr("style", styleTag || ""); //put it back to how it was
                return overflow;
            }

            /* We round final numbers to 2DP as I think the long floats were causing minor issues in Chrome*/
            var roundNumber = function(i) {
                return Math.round(i * 100) / 100;
            }

            var startScaling = function(scaleText) {

                var finalFontSize, spacerElement, spacerHeight, heightDiff;
                var elementFontSize, element, parentElementFontSize, parentElement;

                //Before we manipulate at all, grab the style to put back afterwards
                scaleText.styleTag = scaleText.el.attr("style");

                scaleText.el.show(); //make sure it's visible

                //Measure it before we reset, for animation purposes
                scaleText.measuredOriginalFontSize = parseFloat(scaleText.el.css("font-size"));
                scaleText.measuredWidth = parseFloat(scaleText.el.width());
                scaleText.measuredHeight = parseFloat(scaleText.el.height());

                //reset the container and fix it's width and height and put it offscreen
                scaleText.el.removeClass(scaleText.settings.scaledClass).css({
                    "font-size": "100%",
                    "visiblity": "hidden",
                    "margin-left": "-99999px"
                }).width(scaleText.measuredWidth).height(scaleText.measuredHeight).find(".scaleTextSpacer").remove(); //return to normal before measuring

                //Get the measured font size of the container now we've reset it to 100%
                scaleText.measuredFontSize = parseFloat(scaleText.el.css("font-size"));

                //Find all child elements with fixed font sizes and make them responsive
                //That way we only have to adjust one font size to scale the whole lot
                if (scaleText.settings.makeRelative) {
                    scaleText.children.each(function() {
                        element = $(this);
                        parentElement = element.parent();

                        elementFontSize = parseFloat(element.css("font-size"));
                        parentElementFontSize = parseFloat(parentElement.css("font-size"));

                        //Does it differ from its parent?
                        if (elementFontSize !== parentElementFontSize) {
                            element.css("font-size", roundNumber((elementFontSize / parentElementFontSize) * 100) + "%");
                        }
                    });
                }

                //scale it to size!
                finalFontSize = scaleLoop(scaleText);

                //Calculate centering
                if (scaleText.settings.verticalMiddle) {
                    //Makes measuring easier, but does annoyingly cause a reflow in most scenarios
                    scaleText.el.css("height", "auto");
                    heightDiff = scaleText.measuredHeight - scaleText.el.height();
                    if (heightDiff) {
                        spacerHeight = Math.floor(heightDiff / 2) + "px";
                        spacerElement = $("<div class=\"scaleTextSpacer\"></div>").css("height", spacerHeight).prependTo(scaleText.el);
                    }
                }

                //put css back to how it was and then swap back with placeholder
                scaleText.el.attr("style", scaleText.styleTag || "").css("font-size", finalFontSize.percent + "%");
                if (scaleText.settings.animate) {
                    //animate the font size
                    //Don't animate if there is less than 1px difference as it looks odd
                    //Also measuring doesn't give us sub-pixel dimensions so there is a high chance there is no change
                    if (Math.abs(scaleText.measuredOriginalFontSize - finalFontSize.pixels) >= 0.5) {
                        scaleText.el.css("font-size", scaleText.measuredOriginalFontSize + "px").animate({
                            "font-size": finalFontSize.percent + "%"
                        }, scaleText.settings.animateOptions);

                        //Animate our spacer too
                        if (scaleText.settings.animateSpacer && spacerElement && spacerElement.length) {
                            spacerElement.css("height", "0px").animate({
                                height: spacerHeight
                            }, scaleText.settings.animateOptions);
                        }
                    }
                }

                //Set a class so we know it's scaled
                scaleText.el.addClass(scaleText.settings.scaledClass);

                //For debugging purposes
                if (options.debug) console.log("Took: " + (new Date().getTime() - scaleText.startTime) + "ms", "Loops: ", (scaleText.loopCount - scaleText.skipCount), "Skipped: ", scaleText.skipCount, "Original Font Size:", scaleText.measuredFontSize, "Final Font Size", finalFontSize);
            };

            var scaleLoop = function(scaleText) {
                //Go up in a large step, with the steps refining as we go
                var chunkSize = Math.floor(scaleText.measuredHeight), //start at the size of the element and work our way down
                    fontSize = 0,
                    childrenLength, child,
                    finalFontSize = {},
                    isOverflow,
                    tooBig = chunkSize * 2,
                    chunkLimit = (1.1 - (Math.min(100, scaleText.settings.accuracy) / 100));

                //Looplimit should never be needed - but it's a safety precaution
                while (chunkSize > chunkLimit && scaleText.loopCount < scaleText.loopLimit) {
                    scaleText.loopCount++;
                        
                    //If there's less than 2dp difference, then break early
                    if (roundNumber(fontSize) == roundNumber(fontSize + chunkSize)) break;
                    
                    //Increase the fontsize
                    fontSize += chunkSize;

                    //Sometimes it will try a font size it's done already, so we skip it to make it faster
                    if (fontSize < tooBig) {
                        scaleText.el.css("font-size", roundNumber((fontSize / scaleText.measuredFontSize) * 100) + "%");
                    } else {
                        scaleText.skipCount++;
                    }

                    //If we are skipping, then don't do this
                    if (fontSize < tooBig) {
                        isOverflow = hasOverflow(scaleText.element);

                        //Check child nodes, only if the main container also fits
                        if (!isOverflow) {
                            childrenLength = scaleText.children.length;
                            while (childrenLength--) {
                                child = scaleText.children[childrenLength];
                                if (child.hasChildNodes() && hasOverflow(child)) {
                                    isOverflow = true;
                                    break; // don't check the rest
                                }
                            }
                        }
                    }

                    if (fontSize >= tooBig || isOverflow) {
                        tooBig = fontSize;
                        fontSize -= chunkSize; //back a step
                        chunkSize = chunkSize / 2; //increase by less each time
                    }
                }


                //The last font size that fitted
                finalFontSize = {
                    "pixels": Math.max(0, roundNumber(fontSize)),
                    "percent": (Math.max(0, roundNumber((fontSize / scaleText.measuredFontSize) * 100)))
                };

                //Now set it to our final result
                scaleText.el.css("font-size", finalFontSize.percent + "%");

                return finalFontSize;
            };

            return $(this).each(function() {

                var scaleText = {
                    element: this,
                    el: $(this),
                    children: $(this).find('*'),
                    settings: options,
                    loopCount: 0,
                    skipCount: 0,
                    loopLimit: 100
                };

                if (options.debug) scaleText.startTime = new Date().getTime();

                //Do the dirty work
                startScaling(scaleText);
            });
        }
    });
})({
    debug: false,
    accuracy: 100,
    makeRelative: true,
    verticalMiddle: true,
    animate: false,
    animateSpacer: true,
    animateOptions: {},
    scaledClass: "scaledText"
}, jQuery, window, document);