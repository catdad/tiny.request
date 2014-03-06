# Tiny Request

Don't use jQuery if all you need is simple AJAX. Tiny Request is here to help. It provides very simple, Node.js-style requests in the browser.

_Note: This is a very early version of this library. Once it is a bit more complete, it will be up on my [CDN](catdad.github.io/tiny.cdn)._

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

## About Tiny tools

These are small bits of code that aid in accomplishing common tasks using common or familiar APIs. They are minimal in the amount of code, only providing the bare necessities, have no dependencies, and are reasonably cross-browser compatible. They can be used as quick drop-in solutions during prototyping or creating demos.

## License

This project is licensed under the [MIT X11](http://opensource.org/licenses/MIT) License.