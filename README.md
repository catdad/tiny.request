# Tiny Request

Don't use jQuery if all you need is simple AJAX. Tiny Request is here to help. It provides very simple, Node.js-style requests in the browser.

_Note: This is a very early version of this library. Once it is a bit more complete, it will be up on my [CDN](http://catdad.github.io/tiny.cdn)._

## Usage

	request({
		url: 'myurl'
	}, function(err, response, xhr){
		if (err){
			//request ended badly
		}
		else{
			//rejoice!
		}
	});

_TODO: update this with more examples/explanation._

## About Tiny tools

These are small bits of code that aid in accomplishing common tasks using common or familiar APIs. They are minimal in the amount of code, only providing the bare necessities, have no dependencies, and are reasonably cross-browser compatible. They can be used as quick drop-in solutions during prototyping or creating demos.

All CSS rules have a `t-` prefix, to decrease the posibility of affecting other styles on the page. The necessary CSS is included in the JavaScript files -- a style element is dynamically inserted into the page to style all Tiny components. This was a design choice made in order to decrease the amount of web requests required for a Tiny module, and also to decrease the amount of files necessary for you to include in your project.

## License

This project is licensed under the [MIT X11](http://opensource.org/licenses/MIT) License.