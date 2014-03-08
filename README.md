# Tiny Request

Don't use jQuery if all you need is simple AJAX. Tiny Request is here to help. It provides very simple, Node.js-style requests in the browser.

_Note: This is a very early version of this library. Once it is a bit more complete, it will be up on my [CDN](http://catdad.github.io/tiny.cdn)._

## Usage

	request({
		url: 'myurl'
	}, function(err, body, xhr){
		if (err){
			//request ended badly
		}
		else{
			//rejoice!
		}
	});

The request object takes the following parameters:

	{
		url: '/my/url', //default is '#'
		method: 'POST', //default is 'GET'
		async: false, //default is true
		body: { my: "stuff" } //default is null
	}

### Callback parameters:

`err`: Uh oh! Something went wrong. If this parameter is not `null`, then the request errored out. The error can be an HTTP error (like a 404), or a network error (like a request timeout). The errors will not be consistent in in type -- most will be `Error`, some will be `XMLHttpRequestProgressEvent`, and some stil will be `Event` -- but if you get this parameter, you can just assume you are not getting your data.

`body`: For the most part, this will be the raw response content. In `.json` and `.jsonp`, this will be a parsed object. If there was an error, this value will be `undefined`.

`xhr`: This is the complete `XMLHttpRequest` object. If you don't know what that is, you probably won't need to use it.

### Special requests:

As I have hinted, you can make special requests for JSON and [JSONP](http://json-p.org/). They take the same parameters, but are called as such:

	//JSON
	request.json(options, callback);
	//JSONP
	request.jsonp(options, callback);

The callback parameters still use the same style, but are a little different. As mentioned above, `err` will the first parameter, but you'll see some inconsistency with JSON requests. The second, `body`, will be a parsed JSON object, so it'll be ready to use as soon as you get the callback. Since JSONP does not use `XMLHttpRequest`, it will not receive an `xhr` in the callback, though a regular JSON call will still get the `xhr` object.

### Bonus

You also get a bonus basic JSON parser with this library:

	var obj = request.parseJSON(jsonString);

You are welcome.

## About Tiny tools

These are small bits of code that aid in accomplishing common tasks using common or familiar APIs. They are minimal in the amount of code, only providing the bare necessities, have no dependencies, and are reasonably cross-browser compatible. They can be used as quick drop-in solutions during prototyping or creating demos.

All CSS rules have a `t-` prefix, to decrease the posibility of affecting other styles on the page. The necessary CSS is included in the JavaScript files -- a style element is dynamically inserted into the page to style all Tiny components. This was a design choice made in order to decrease the amount of web requests required for a Tiny module, and also to decrease the amount of files necessary for you to include in your project.

## License

This project is licensed under the [MIT X11](http://opensource.org/licenses/MIT) License.