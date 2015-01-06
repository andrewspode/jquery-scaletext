/*
 *  jQuery ScaleText - v1.0.7
 *  Quickly scale text inside a container to be as large as possible without spilling.
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
            var hasOverflow = function(element, scaleText, paddingCheck) {
                var el = $(element),
                    tooWide = false,
                    tooHigh = false,
                    displayType = el.css("display");

                //Don't measure overflow of inline elements
                if (displayType === "inline" || displayType === "none" || !displayType) return false;

                //We don't do this if we are checking the primary container or paddingCheck is off
                //It's a lot slower this way, but does include padding into the overflow
                if (paddingCheck && element !== scaleText.element) {
                    //measure some things
                    var styleTag = el.attr("style"),
                        elHeight = el.height(),
                        elWidth = el.width();

                    //Set the width/height and check for overflow scroll bars
                    //We add 1 to account  for rounding issues. Otherwise some elements will always say they have overflow when they don't.
                    //We also take it off screen to reduce reflow, as we do for the main container
                    var cssChanges = {
                       //"overflow": "hidden",
                        /*"position" : "fixed",
                        "top" : "0px",
                        "left" : "-99999px",*/
                        "padding": "0px",
                        "border": "0px",
                        "visibility": "hidden"
                    };

                    if (scaleText.settings.fixedWidth) cssChanges.width = (elWidth + 1) + "px";
                    if (scaleText.settings.fixedHeight) cssChanges.height = (elHeight + 1) + "px";
                    el.css(cssChanges);
                }

                //The 2 is accounting for rounding errors.
                if (scaleText.settings.fixedWidth) tooWide = Math.abs(element.scrollWidth - element.clientWidth) > 2;
                if (scaleText.settings.fixedHeight) tooHigh = Math.abs(element.scrollHeight - element.clientHeight) > 2;

                //If necessary, put it back to how it was
                if (paddingCheck && element !== scaleText.element) el.attr("style", styleTag || "");

                return tooWide || tooHigh;
            };

            /* We round final numbers to 2DP as I think the long floats were causing minor issues in Chrome*/
            var roundNumber = function(i) {
                return Math.round(i * 100) / 100;
            };

            var startScaling = function(scaleText) {

                var finalFontSize, spacerElement, spacerHeight, heightDiff;
                var elementFontSize, element, parentElementFontSize, parentElement;

                //Before we manipulate at all, grab the style to put back afterwards
                scaleText.styleTag = scaleText.el.attr("style");

                scaleText.el.show(); //make sure it's visible
                scaleText.el.removeClass(scaleText.settings.scaledClass);

                //Measure it before we reset, for animation purposes
                //Notice that we round this. The specs say it should always be an integer - but chrome often gives us a dodgy number when zoomed
                scaleText.measuredOriginalFontSize = Math.round(parseFloat(scaleText.el.css("font-size")));
                scaleText.measuredWidth = scaleText.el.width();
                scaleText.measuredHeight = scaleText.el.height();

                //reset the container and fix it's width and height and put it offscreen
                //1 pixel extra to allow for rounding errors
                scaleText.el.css({
                    "font-size": "100%",
                    /*"position": "fixed",
                    "left": "-99999px",
                    "top": "0px",*/
                    "overflow": "hidden",
                    "padding": "0px",
                    "border": "0px",
                    "visiblity": "hidden"
                }).find(".scaleTextSpacer").remove(); //return to normal before measuring

                //Which dimensions are we checking by
                if (scaleText.settings.fixedHeight) scaleText.el.css("height", (scaleText.measuredHeight + 1) + "px");
                if (scaleText.settings.fixedWidth) scaleText.el.css("width", (scaleText.measuredWidth + 1) + "px");

                //Get the measured font size of the container now we've reset it to 100%
                scaleText.measuredFontSize = Math.round(parseFloat(scaleText.el.css("font-size")));

                //Find all child elements with fixed font sizes and make them responsive
                //That way we only have to adjust one font size to scale the whole lot
                if (scaleText.settings.makeRelative) {
                    scaleText.children.each(function() {
                        element = $(this);
                        parentElement = element.parent();

                        elementFontSize = Math.round(parseFloat(element.css("font-size")));
                        parentElementFontSize = Math.round(parseFloat(parentElement.css("font-size")));

                        //Does it differ from its parent?
                        if (elementFontSize && parentElementFontSize && elementFontSize !== parentElementFontSize) {
                            element.css("font-size", roundNumber((elementFontSize / parentElementFontSize) * 100) + "%");
                        }
                    });
                }

                //scale it to size!
                finalFontSize = scaleLoop(scaleText);

                //Calculate centering
                if (scaleText.settings.verticalMiddle) {
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
                if (options.debug) console.log("Took: " + (new Date().getTime() - scaleText.startTime) + "ms", "Loops: ", (scaleText.loopCount - scaleText.skipCount), "Skipped: ", scaleText.skipCount, "Child checks: ", scaleText.childCount, "Original Font Size:", scaleText.measuredFontSize, "Final Font Size", finalFontSize);
            };

            var scaleLoop = function(scaleText) {
                //Go up in a large step, with the steps refining as we go
                var chunkSize = Math.floor(scaleText.measuredHeight), //start at the size of the element and work our way down
                    fontSize = 0,
                    childrenLength, child, startChildrenCheck,
                    finalFontSize = {},
                    isOverflow,
                    tooBig = chunkSize * 2,
                    chunkLimit = (1.1 - (Math.min(100, scaleText.settings.accuracy) / 100));

                //Looplimit should never be needed - but it's a safety precaution against the browser freezing
                while (chunkSize > chunkLimit && scaleText.loopCount < scaleText.loopLimit && scaleText.childCount < scaleText.loopLimit) {
                    scaleText.loopCount++;
                    isOverflow = false;

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
                        //Does the main container fit?
                        if (scaleText.settings.overflowCheckContainer) {
                            isOverflow = hasOverflow(scaleText.element, scaleText);

                            //We've got close enough with the container, now put the chunkSize back and start on the children
                            if (!startChildrenCheck && chunkSize <= (chunkLimit * 2)) {
                                startChildrenCheck = 1;
                                chunkSize = fontSize;
                            }
                        }

                        //Check child nodes, only if the main container also fits
                        if (!scaleText.settings.overflowCheckContainer || (startChildrenCheck && !isOverflow)) {
                            childrenLength = scaleText.children.length;
                            while (childrenLength--) {
                                child = scaleText.children[childrenLength];
                                //If it doesn't contain anything, then we don't need to check it
                                if (child.hasChildNodes()) {
                                    scaleText.childCount++;
                                    if (hasOverflow(child, scaleText, scaleText.settings.paddingCheckChildren)) {
                                        isOverflow = true;
                                        break; // don't check the rest
                                    }
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

                //The last font size that fitted;
                //We reduce it slightly as we are measuring our boxes being up to 1px too big due to rounding
                fontSize -= 0.5; //safer, but won't always be big enough to fit perfectly :(
                if (fontSize <= 0) fontSize = 1; //never make it disappear completely.

                finalFontSize = {
                    "pixels": roundNumber(fontSize),
                    "percent": roundNumber((fontSize / scaleText.measuredFontSize) * 100)
                };

                //Now set it to our final result
                scaleText.el.css("font-size", finalFontSize.percent + "%");

                return finalFontSize;
            };

            return $(this).each(function() {

                var scaleText = {
                    element: this,
                    el: $(this),
                    children: $(this).find("*"),
                    settings: options,
                    loopCount: 0,
                    skipCount: 0,
                    childCount: 0,
                    loopLimit: 9999 /*stop browser freezing if there is an issue*/
                };

                if (options.debug) scaleText.startTime = new Date().getTime();

                //Do the dirty work
                //Has to be at least one of these settings
                if (options.fixedWidth || options.fixedHeight) startScaling(scaleText);
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
    paddingCheckChildren: true, /*Slows things down*/
    overflowCheckContainer: true, /*Sometimes we just want to uniformly increase children*/
    fixedWidth: true,
    fixedHeight: true,
    scaledClass: "scaledText"
}, jQuery, window, document);