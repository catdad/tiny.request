(function () {
	var each = function(arr, func){
		Array.prorotype.forEach ? (function(){
			Array.prototype.forEach.call(arr, func);
		})() : (function(){
			for (var i = 0; i < arr.length; i++ ){
				func(arr[i], i, arr);
			}
		})();
	}

    window.request = function (obj, done) {
        obj = obj || {};
        obj.url = obj.url || '#';
        obj.method = obj.method || 'GET';
        obj.async = obj.async || true;
        obj.body = obj.body || null;

        var ajax = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");

        ajax.onreadystatechange = function () {
            if (ajax.readyState === 4 && ajax.status === 200)
                done(ajax.responseText);
        }

        ajax.open(obj.method, obj.url, obj.async);
		
		if (obj.headers)
			each(obj.headers, function(name, value){
				ajax.setRequestHeader(name, value);
			});
		
        ajax.send((obj.method === "POST") ? obj.body : null);
    }
})();