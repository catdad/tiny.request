/* jshint node: true */

process.title = 'Tiny Request test server';

var http = require('http');
var fs = require('fs');

var serverPort = 8080;
var jsonpPort = 8081;
var timeout = 500;

var routes = {
	staticFile: function(req, res){
		fs.readFile('.'+req.url, function(err, file){
			if (err) {
				routes.notFound(req, res);
			} else {
				var type,
					ext = req.url.split('.').pop();

				switch(ext){
					case 'js':
						type = 'application/javascript';
						break;
					case 'html':
					case 'htm':
						type = 'text/html';
						break;
					case 'css':
						type = 'text/css';
						break;
					default:
						type = 'text/plain';
				}

				res.writeHead(200, {'Content-Type': type});
				res.end(file);
			}
		});
	},
	json: function(req, res){
		res.writeHead(200, {'Content-Type': 'application/json'});
		//this value is used by Jasmine test
        res.end(JSON.stringify( {a: 1, b: 2} ));
	},
    junkJSON: function(req, res){
        res.writeHead(200, {'Content-Type': 'application/json'});
		//this is supposed to be invalid JSON
        res.end('not valid JSON data');
    },
	headers: function(req, res){
		res.writeHead(200, {'Content-Type': 'application/json'});
		res.end(JSON.stringify(req.headers));
	},
    create: function(req, res) {
    	res.writeHead(201, {'Content-Type': 'application/json'});
		res.end(JSON.stringify({ resource: 'id' }));
	},
    delete: function(req, res) {
    	res.writeHead(204);
		res.end();
	},
	error: function(req, res){
		res.writeHead(500);
		res.end('Internal server error');
	},
	notFound: function(req, res){
		res.writeHead(404);
		res.end('Not found');
	},
    postData: function(req, res){
        var body = '',
            decode = function(arr){
                return arr.map(function(el){
                    return decodeURIComponent(el);
                });
            },
            parse = function(str){
                var query = {},
                    temp = str.split('&');
                for (var i = temp.length; i--;) {
                    var q = temp[i].split('=');
                    q = decode(q);
                    query[q.shift()] = q.join('=');
                }
                return query;
            };
        
        req.on('data', function(chunk) {
            body += chunk;
        });
        
        req.on('end', function(){
            console.log('POST body:', body);
            var data = parse(body),
                dataString = JSON.stringify(data);
            
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(dataString);
        });
    },
    html: function(req, res, code){
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(code);
    }
};

var server = http.createServer(function (req, res) {
    console.log(req.url);

    switch(req.url){
		case '/json':
			return routes.json(req, res);
		case '/headers':
			return routes.headers(req, res);
        case '/create':
            return routes.create(req, res);
        case '/delete':
            return routes.delete(req, res);
        case '/junk':
            return routes.junkJSON(req, res);
        case '/error':
			return routes.error(req, res);
		case '/404':
			return routes.notFound(req, res);
        case '/post':
            return routes.postData(req, res);
		case '/timeout':
			return; //do nothing
		case '/':
			return routes.html(req, res, 'Tiny Request test server:<br><br>' + 
                        'go to <a href="/index.html">/index.html</a> to begin tests<br><br>' + 
                        '/json -- returns a JSON object<br>' + 
                        '/headers -- returns a JSON with the headers of the request<br>' + 
                        '/error -- returns a 500 error<br>' + 
                        '/junk -- returns invalid JSON<br>' + 
                        '/404 -- returns a 404 error<br>' + 
                        '/timeout -- request times out after 1 second');
		default:
			routes.staticFile(req, res);
	}
}).listen(serverPort);

//kill requests after specific time (used for /timeout option)
server.setTimeout(timeout);

var jsonp = http.createServer(function(req, res){
	console.log(req.url);

	var query = (function parseQuery(url){
		var query = {};
		var temp = url.split('?').pop().split('&');
		for (var i = temp.length; i--;) {
	    	var q = temp[i].split('=');
	    	query[q.shift()] = q.join('=');
	  	}
	  return query;
	})(req.url);

	var callback = query.callback;
	var url = req.url.split('?').shift();
    
    switch(url){
        case '/json':
            //send some junk JSON
            res.writeHead(200, {'Content-Type': 'application/javascript'});
            res.end(callback + '(' + JSON.stringify({a:1,b:2,q:query}) + ')');
            break;
        case '/timeout':
            //ignore, let it time out
            break;
        case '/junk':
            res.writeHead(200, {'Content-Type': 'application/json'});
            //this is supposed to be invalid JSON
            res.end(callback + '(' + '{\"not valid JSON data\"' + ')');
            break;
        default:
            //send 404 error
            res.writeHead(404);
            res.end('jsonp - Not found');
    }
});

jsonp.setTimeout(timeout);
jsonp.listen(jsonpPort);

console.log('server listening on port ', serverPort);
console.log('jsonp listening on port ', jsonpPort);