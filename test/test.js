/* global describe, it, expect, request */
/* jshint browser: true, devel: true, -W030 */

//some premade requests
var requests = {
    simple: '/json',
    headers: {
        url: '/headers',
        headers: { 'x-custom': 'Kiril\'s header' }
    },
    notFound: { url: '/404' },
    timeout: { url: '/timeout' },
    error: { url: '/error' },
    jsonReq: { url: '/json' },
    junk: { url: '/junk' },
    post: { url: '/post', method: 'POST' },
    create: { url: '/create' },
    delete: { url: '/delete' }
};

//var handleResponse = function(err, body, xhr){
//    (err) ? 
//        console.log('default err', err) : 
//        console.log('default', body);
//};
//var handleJSONResponse = function(err, body, xhr){
//    (err) ? 
//        console.log('json err', err) : 
//        console.log('json', body);
//};
//var handleJSONPResponse = function(err, body, xhr){
//    (err) ? 
//        console.log('jsonp err', err) : 
//        console.log('jsonp', body);
//};

//test requests
//	request(requests.headers, handleResponse);
//	request(requests.notFound, handleResponse);
//	request(requests.error, handleResponse);
//	request(requests.timeout, handleResponse);
//	request(requests.jsonReq, handleResponse);
//	
//	//test json requests -- body is parsed
//	request.json(requests.headers, handleJSONResponse);
//	request.json(requests.jsonReq, handleJSONResponse);
//	request.json(requests.error, handleJSONResponse);
//	request.json(requests.timeout, handleJSONResponse);

//	//test jsonp requests
//	request.jsonp({ url: 'http://localhost:8081/json' }, handleJSONPResponse);
//	request.jsonp({ url: 'http://localhost:8081/notFound' }, handleJSONPResponse);
//  request.jsonp({ url: 'http://localhost:8081/timeout' }, handleJSONPResponse);

/**************************
 *
 *  These tests require the nodetest.js file running in Node
 *  Open this index.html file from the Node server
 *  http://localhost:8080/index.html
 *
 **************************/

describe('regular request', function(){
    it('should make simple requests using a string URL', function(done){
        request(requests.simple, function(err, body, xhr){
            expect(err).not.toBeDefined();
            expect(body).toBeTruthy();

            done();
        });

    });
    it('should make simple requests using options object', function(done){
        request(requests.jsonReq, function(err, body, xhr){
            expect(err).not.toBeDefined();
            expect(body).toBeTruthy();

            done();
        });
    });

    it('can use custom headers', function(done){
        request(requests.headers, function(err, body, xhr){
            expect(err).not.toBeDefined();
            expect(typeof body).toEqual('string');

            var data = request.parseJSON(body);
            expect(data['x-custom']).toEqual('Kiril\'s header');

            done();
        });
    });

    it('catches server errors', function(done){
        request(requests.error, function(err, body, xhr){
            expect(err instanceof Error).toEqual(true);

            //error messages are always strings
            expect(err.message).toEqual('HTTP error 500');

            done();
        });
    });

    it('catches network timeouts', function(done){
        request(requests.timeout, function(err, body, xhr){
            //TODO make sure this is also an error
            expect(err).toBeTruthy();
            expect(body).toBeFalsy();
            expect(err.message).toEqual('unknown ajax error');

            done();
        });
    });
    
    describe('handle all 200-level responses', function(){
        it('(i.e. 201)', function(done) {
            request(requests.create, function(err, body, xhr) {
                expect(err).toBeFalsy();
                expect(body).toBeDefined();
                
                done();
            });
        });
        
        it('(i.e. 204)', function(done) {
            request(requests.delete, function(err, body, xhr) {
                expect(err).toBeFalsy();
                expect(body).toBeDefined();
                
                done();
            });
        });
    });
});

describe('data validation', function(){
    function testInvalidOptions (err, done) {
        expect(err).toBeDefined();
        expect(err instanceof Error).toEqual(true);
        expect(err.message).toMatch(/is not a valid request object/);

        done();
    }
    
    function testInvalidURL (err, done) {
        expect(err).toBeDefined();
        expect(err instanceof Error).toEqual(true);
        expect(err.message).toMatch(/is not a valid string url/);

        done();
    }
    
    it('should return an error for no options object or url', function(done){
        request(undefined, function(err, body, xhr){
            testInvalidOptions(err, done);
        });
    });
    it('should return an error for a number as the options parameter', function(done){
        request(undefined, function(err, body, xhr){
            testInvalidOptions(err, done);
        });
    });

    it('should return an error for no `url` in the options', function(done){
        request({}, function(err, body, xhr){
            testInvalidURL(err, done);
        });
    });
    it('should return an error for a number `url` in the options', function(done){
        request({}, function(err, body, xhr){
            testInvalidURL(err, done);
        });
    });
    it('should return an error for an Object `url` in the options', function(done){
        request({ url: {} }, function(err, body, xhr){
            testInvalidURL(err, done);
        });
    });
    it('should return an error for a function `url` in the options', function(done){
        request({ url: function(){} }, function(err, body, xhr){
            testInvalidURL(err, done);
        });
    });
});

describe('json request', function(){
    it('makes json requests using a string URL', function(done){
        request.json(requests.simple, function(err, body, xhr){
            expect(err).not.toBeDefined();
            expect(typeof body).toEqual('object');

            //hardcoded in the nodetest.js server
            expect(body.a).toEqual(1);

            done();
        });
    });

    it('makes json requests using an options object', function(done){
        request.json(requests.jsonReq, function(err, body, xhr){
            expect(err).not.toBeDefined();
            expect(typeof body).toEqual('object');

            //hardcoded in the nodetest.js server
            expect(body.a).toEqual(1);

            done();
        });
    });

    it('knows when your JSON is invalid', function(done){
        request.json(requests.junk, function(err, body, xhr){
            expect(err instanceof Error).toEqual(true);
            expect(body).toEqual(undefined);

            done();
        });
    });
    
    it('handles error responses', function(done){
        request.json(requests.error, function(err, body, xhr){
            console.trace();
            console.log('err', arguments);
            expect(err instanceof Error).toEqual(true);
            expect(err.message).toEqual('HTTP error 500');
            expect(body).toEqual(undefined);

            done();
        });
    });
});

describe('POST request', function(){
    it('makes post resuts', function(done){
        request(requests.post, function(err, body, xhr){
            expect(err).not.toBeDefined();
            expect(body).toBeDefined();
            done();
        });
    });
    it('uploads object data', function(done){
        var reqBody = { 'things and': 'stuff', a: 'b', one: 'one' };
        requests.post.body = reqBody;

        request(requests.post, function(err, body, xhr){
            var data = request.parseJSON(body);

            expect(data.a).toEqual(reqBody.a);
            expect(data.one).toEqual(reqBody.one);
            expect(data['things and']).toEqual(reqBody['things and']);

            delete requests.post.body;
            done();
        });
    });
    it('uploads string data using dataType "plain"', function(done){
        var reqBody = 'i am the data';
        requests.post.body = reqBody;
        requests.post.dataType = 'plain';

        request(requests.post, function(err, body, xhr){
            expect(body).toEqual(reqBody);

            delete requests.post.dataType;
            delete requests.post.body;
            done();
        });
    });
    it('uploads string data using dataType "text"', function(done){
        var reqBody = 'i am the data';
        requests.post.body = reqBody;
        requests.post.dataType = 'text';

        request(requests.post, function(err, body, xhr){
            expect(body).toEqual(reqBody);

            delete requests.post.dataType;
            delete requests.post.body;
            done();
        });
    });
    it('can handle JSON responses', function(done){
        var reqBody = { 'things and': 'stuff', a: 'b', one: 'one' };
        requests.post.body = reqBody;
        
        request.json(requests.post, function(err, body, xhr){
            expect(body.a).toEqual(reqBody.a);
            expect(body.one).toEqual(reqBody.one);
            expect(body['things and']).toEqual(reqBody['things and']);

            delete requests.post.body;
            done();
        });
    });
});

describe('jsonp request', function(){
    it('makes jsonp requests', function(done){
        request.jsonp({url:'http://localhost:8081/json'}, function(err, body){
            expect(err).not.toBeDefined();

            //hardcoded in the nodetest.js server
            expect(body.a).toEqual(1);

            done();
        });
    });

    it('knows when your JSONP is invalid... sometimes', function(done){
        var options = {
            url:'http://localhost:8081/junk',
            //needed for most browsers
            unknownErrors: true
        };
        request.jsonp(options, function(err, body, xhr){
            expect(err instanceof Error).toEqual(true);
            expect(err.message).toEqual('jsonp scripting error');
            expect(body).toEqual(undefined);

            done();
        });
    });
    
    it('handles error responses', function(done){
        var options = {
            url:'http://localhost:8081/error',
            //needed for most browsers
            unknownErrors: true
        };
        request.jsonp(options, function(err, body, xhr){
            expect(err instanceof Error).toEqual(true);
            expect(err.message).toEqual('unknown ajax error');
            expect(body).toEqual(undefined);

            done();
        });
    });
});