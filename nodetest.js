var http = require('http');
var fs = require('fs');

var port = 8080;

var routes = {
	staticFile: function(req, res){
		fs.readFile('.'+req.url, function(err, file){
			if (err){
				routes.notFound(req, res);
			}
			else{
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
				};

				res.writeHead(200, {'Content-Type': type});
				res.end(file);
			}
		});
	},
	json: function(req, res){
		res.writeHead(200, {'Content-Type': 'application/json'});
		res.end(JSON.stringify( {a: 1, b: 2} ));
	},
	headers: function(req, res){
		res.writeHead(200, {'Content-Type': 'application/json'});
		res.end(JSON.stringify(req.headers));
	},
	error: function(req, res){
		res.writeHead(500);
		res.end('Internal server error');
	},
	notFound: function(req, res){
		res.writeHead(404);
		res.end('Not found');
	}
}

var server = http.createServer(function (req, res) {
    console.log(req.url);

    switch(req.url){
		case '/json':
			routes.json(req, res);
			break;
		case '/headers':
			routes.headers(req, res);
			break;
		case '/error':
			routes.error(req, res);
			break;
		case '/404':
			routes.notFound(req, res);
			break;
		case '/timeout':
			break;
		case '/':
			var str = 'Tiny Request test server:\n\n'
					+ '/json -- returns a JSON object\n'
					+ '/headers -- returns a JSON with the headers of the request\n'
					+ '/error -- returns a 500 error\n'
					+ '/404 -- returns a 404 error\n'
					+ '/timeout -- request times out after 1 second';
			res.end(str);
			break;
		default:
			routes.staticFile(req, res);
	}
}).listen(port);

//kill requests after 2 second (used for /timeout option)
server.setTimeout(2000);

console.log('listening on port ', port);