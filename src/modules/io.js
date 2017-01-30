modulesList.push("io");

angular.module('io', [])
.config(['$sceDelegateProvider', function($sceDelegateProvider) {
	
	// We must whitelist the JSONP endpoint that we are using to show that we trust it
	$sceDelegateProvider.resourceUrlWhitelist([
		'self',
		'https://www.googleapis.com/**'
	]);
}]);

/**
 * Some External Service.
 *
 */
 
 
angular.module('io').service('youtube', ["$http", function($http) {
	
	//caching is permanent right now. but in theory can be adjusted to have expiration time
	let _resultCache = localStorage["resultCache"];
	_resultCache = _resultCache ? JSON.parse(_resultCache) : {};
	
	//I created this youtube api key for this task
	//youtube api requires this key in order to allow their api usage.
	const API_KEY = "AIzaSyD-_-dfkHmDQfe8M3ejfIitllksmUGRsOY";
	
	const SEARCH_URL = "https://www.googleapis.com/youtube/v3/search?part=id%2C+snippet";
	const MAX_RESULTS = 15;
	
	//retrives JSON from the specific query on youtube api
	this.getTestQuery = function(query, scope, target) {
		
		function formResult(data) {
			let result = [];
			for(let i in data.items) {
				result.push({
					videoID: data.items[i].id.videoId ? data.items[i].id.videoId : false,
					channel: data.items[i].snippet.channelTitle ? data.items[i].snippet.channelTitle : "missing",
					title: data.items[i].snippet.title ? data.items[i].snippet.title : "missing",
					desc: data.items[i].snippet.description ? data.items[i].snippet.description : "missing",
					show: true
				});
			}

			scope[target] = result;
		}
		
		//loading from cache if we can
		if(_resultCache[query]) {
			formResult(_resultCache[query]);
			
			return;
		}
		
		let request = `${ SEARCH_URL }&key=${ API_KEY }&maxResults=${ MAX_RESULTS }&q=${ encodeURI(query) }&callback=JSON_CALLBACK`;
		
		$http.jsonp(request).success(function(data){
			_resultCache[query] = data;
			localStorage["resultCache"] = JSON.stringify(_resultCache);
			
			formResult(data);
		});
		
	}
	
}]);