# Tiny Request

Don't use jQuery if all you need is simple AJAX. Tiny Request is here to help. It provides very simple, Node.js-style requests in the browser.

## Usage

Include this script in your page:
    
    <script src="http://catdad.github.io/tiny.cdn/lib/request/0.4.1/request.min.js"></script>
    
Then make some requests:

	request('myurl', function(err, body, xhr){
		if (err){
			//request ended badly
		}
		else{
			//rejoice!
		}
	});

The request can also take a full options object:

	request({
		url: '/my/url', //default is '#'
		method: 'POST', //default is 'GET'
		async: false, //default is true
		body: { my: "stuff" } //default is null
	},
    function(err, body, xhr){...});

### Callback parameters:

`err`: Uh oh! Something went wrong. If this parameter is not `null`, then the request errored out. The error can be an HTTP error (like a 404), or a network error (like a request timeout). All errors will be an instance of `Error` with a short message telling you what went wrong. `Error.original` will contain the original object that suggested the error, so you can further inspect what happened. The `Error.original` object will not be consistent in in type -- most will be `Error`, some will be `XMLHttpRequestProgressEvent`, some will be `Event`, and some will differ depending on the browser -- this is why all errors are stadardized before returning.

`body`: For the most part, this will be the raw response content. In `.json` and `.jsonp`, this will be a parsed object. If there was an error, this value will be `undefined`.

`xhr`: This is the complete `XMLHttpRequest` object. If you don't know what that is, you probably won't need to use it.

### Special requests:

As I have hinted, you can make special requests for JSON and [JSONP](http://json-p.org/). They take the same parameters, but are called as such:

	//JSON
	request.json(options, callback);
	//JSONP
	request.jsonp(options, callback);

The callback parameters still use the same style, but are a little different. As mentioned above, `err` will the first parameter. The second, `body`, will be a parsed JSON object, so it'll be ready to use as soon as you get the callback. Since JSONP does not use `XMLHttpRequest`, it will not receive an `xhr` in the callback. It also does not support synchronous requests, so it will ignore whatever you pass in as the `async` option in the parameters.

If the remote JSONP server returns invalid JSON, this will cause a silent error in most browsers. This is a security limitation of these browsers, and all JSONP libraries will fail silently for now. Where allowed, these errors will be handled -- for example, when the remote server returns a cross-origin header -- however, this could be rare due to the nature of JSONP. If you would like Tiny Request to attempt to guess when these errors occur and execute an error callback, you need to enable unknown errors for each request, as such:

	request.jsonp({
		url: 'http://notmysite.com/get/some/json'
		unknownErrors: true
	}, function(err, body){
		//handle response
	});
	
_Note: this is only the case for JSONP requests. All other requests, including `.json` will handle invalid response errors._

### Bonus:

There is a basic JSON parser in this library:

	var obj = request.parseJSON(jsonString);

There are also cross-browser event binding functions:

    //create handler function
    function handler(){ };
    
    //add event -- use .addEventListener event names
    request.addEvent(document.body, 'click', handler);
    
    //remove event -- use .removeEventListener event names
    //needs original handler function object
    request.removeEvent(document.body, 'click', handler);

You are welcome.

## About Tiny tools

These are small bits of code that aid in accomplishing common tasks using common or familiar APIs. They are minimal in the amount of code, only providing the bare necessities, have no dependencies, and are reasonably cross-browser compatible. They can be used as quick drop-in solutions during prototyping or creating demos.

All CSS rules have a `t-` prefix, to decrease the posibility of affecting other styles on the page. The necessary CSS is included in the JavaScript files -- a style element is dynamically inserted into the page to style all Tiny components. This was a design choice made in order to decrease the amount of web requests required for a Tiny module, and also to decrease the amount of files necessary for you to include in your project.

## License

This project is licensed under the [MIT X11](http://opensource.org/licenses/MIT) License.

[![Analytics](https://ga-beacon.appspot.com/UA-17159207-7/tiny-request/readme)](https://github.com/igrigorik/ga-beacon)
