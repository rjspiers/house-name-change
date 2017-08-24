// use function to export and reference .this to get the functions
// to export into the same namespace where they are imported
// require them with: 
// require('../lib/tools.js')();
module.exports = function () {
	
	this.isNumeric = function (f) {
		return new Promise (function (resolve, reject) {
			result = f.match(/^[0-9]+$/) != null
			return resolve(result)
		})
	}
	
	this.isAlphaOrSpace = function (f) {
		return new Promise (function (resolve, reject) {
			result = f.match(/^[a-zA-z\s]*$/) != null
			return resolve(result)
		})
	}
	
};