module.exports = {
	
	isNumeric : function (f) {
		return new Promise (function (resolve, reject) {
			result = f.match(/^[0-9]+$/) != null
			return resolve(result)
		})
	},
	
	isAlphaOrSpace : function (f) {
		return new Promise (function (resolve, reject) {
			result = f.match(/^[a-zA-z\s]*$/) != null
			return resolve(result)
		})
	},
	
	sleep: function (ms) {
		return new Promise(
			resolve=> setTimeout(resolve,ms)
		)
	},
	
};