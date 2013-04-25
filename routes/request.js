var async = require('async');

exports.getRequestTypeById = function(req, res){
	var id = req.params.id;

	db.models.ScrapeType.find(id).success(function(type){
		res.send(type);
	});
};	

exports.getSiteById = function(req, res){
	var id = req.params.id;
	
	db.models.Site.find(id).success(function(site){
		res.send(site);
	});
};

exports.getRequests = function(req, res){
    var includeQuery = [
        {model: db.models.RequestInfo, as:'RequestInfo'},
        {model: db.models.RequestAttribute, as: 'RequestAttributes'}
    ];
    // Fetch requests
    // Fetch associated attribute types
    db.models.Request.findAll({include:includeQuery}).success(function(requests){
        res.send(requests);
    });

};

exports.getRequests_old = function(req, res){
	var ret = [], infoIds = [];



	async.waterfall([
    	fetchRequests,
    	//fetchRequestInfo,
    	fetchAssociatedAttributeType
  	], 
  	function(err, requests){
  		var ret = [];
  		// Stitch together stuff
  		requests.forEach(function(request){
  			var requestJson = request.toJSON();
  			requestJson['request_info'] = [];

  			// Fetch request info
  			request.requestInfo.forEach(function(info){
  				var infoJson = info.toJSON();
  				infoJson['request_attributes'] = [];

  				// Fetch site

  				// Fetch attributes
  				info.requestAttributes.forEach(function(attribute){
  					var attributeJson = attribute.toJSON();

  					infoJson['request_attributes'].push(attributeJson);

  				});

  				requestJson['request_info'].push(infoJson);
  			});

  			ret.push(requestJson);
  		});

  		//console.log(result);
  		res.send(ret);
  	});
};

function fetchRequests(callback){
	db.models.Request.findAll({include:['RequestInfo']}).success(function(requests){
		callback(null, requests);
	});
};


function fetchRequestInfo(requests, callback){
	var ids = [], queue;

	//Create the queue	
	queue = async.queue(function(request, done){
		console.log("Started queue for id: " + request.id);
		request.getRequestInfo({include:['Site']}).success(function(info){
			console.log("Success queue for id: " + request.id);
			done();
		});
	},10);
	
	queue.drain = function(){
		callback(null, requests);
	};

	queue.push(requests);
};


function fetchAssociatedAttributeType(requests, callback){
	queue = async.queue(function(requestInfo, done){
		console.log("Started queue for id: " + requestInfo.id);
		requestInfo.getRequestAttributes().success(function(attributes){
			console.log("Success queue for id: " + requestInfo.id);
			requestInfo.requestAttributes = attributes;
			done();
		});
	},2);
	
	queue.drain = function(){
		callback(null, requests);
	};
	requests.forEach(function(request){
		queue.push(request.requestInfo);
	});
};

// Fetch requests with requestInfo
// Fetch associated attributes and scrape_type to each requestInfo