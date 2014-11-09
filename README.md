# jQuery ScaleText

### Scale text inside a container to be as large as possible without spilling.

* Works on any block/inline-block container
  * Ignores gracefully
* Changes no CSS other than font-size
  * Reset the scaling by changing the container font-size
* Doesn't require a fixed sized container
  * Measures container and uses that as its basis
* Creates and maintains relative font sizes within container
  * Pixels/Ems/Percentages etc. all supported
* Non-linear progression makes it fast, no matter what container size
  * Fast enough to use in animations
  * Reduce accuracy and make it even faster
* Uses placeholder and renders offscreen to minimise reflow
* No minimum/maximum font size. Make it FIT.
* Optional vertical middling
* Optional animation
* Chainable (duh!)

Working on projects such as [ThinkWall](http://thinkwall.com), I often need to fit text to a container, so it is the largest font size possible without spilling out, to aid legibility at a distance. Think of full-screen text adverts, or labels on a graph.

This is a fairly specific requirement, and is no replacement for good, responsive layout. 

There are a couple of other solutions out there but most are quick hacks that are slow or restrictive. However, my implementation is fast enough for general use without breaking things. 

When choosing your font sizes in a container - think about the relativity of the sizes more than the size itself, as ScaleText will maintain these proportions as it scales, no matter what unit you specify your fonts in.

I've tested in the latest IE/Chrome/FireFox/Android and that's it - sorry. The code is based on core jQuery principles, so it should be fairly compatible. Please let me know if it's not.

There are a couple of features missing that I've yet to port over from my codebase, but will do in due course. If you have any feature requests - drop me a line on [spode@justfdi.com](mailto:spode@justfdi.com) or [@spode][http://twitter.com/spode] on Twitter.

## Usage

1. Include jQuery:

	```html
	<script src="http://ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js"></script>
	```

2. Include plugin's code:

	```html
	<script src="dist/jquery.scaletext.min.js"></script>
	```

3. Call the plugin:

	```javascript
	$("#element").scaleText();
	```

## Options

* verticalMiddle : true

ScrollText will add padding element to the container in order to center the content, assuming it can't fit 100%

* animate : false

Animate the change in font-size.

* animateOptions : {}

Passthrough of animation options in case you want to change duration / easing etc.

* accuracy : 100

If you decrease this value, the less perfect the fit will be, but the less intensive the scaling is. This can be very handy on large elements where it doesn't matter so much. I believe 0 will give you a tolerance of -10%. Reducing accuracy will *never* leave you with the text overspilling.

* debug : false

Will output to the console how many iterations it required to scale and how long it took to do so. This is useful if you are tweaking your accuracy.


#### [Demo](https://github.com/unclespode/jquery-scaletext/tree/master/demo)

I'm not sure how to host a demo via GitHub, so I've put it on my [personal site](http://spode.me/jquery-scaletext/demo). It may not always be the latest version.

## Contributing

Check [CONTRIBUTING.md](https://github.com/unclespode/jquery-scaletext/blob/master/CONTRIBUTING.md) for more information.

## History

Check [Releases](https://github.com/unclespode/jquery-scaletext/releases) for detailed changelog.

## License

[MIT License](http://zenorocha.mit-license.org/) © Andrew @Spode Miller
