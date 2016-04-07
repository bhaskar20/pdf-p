module.exports = function(){
	var parser = {};

	parser.parseData = function(data,cb){
		var obj = {
			date:null,
			name:null,
			emailId:null,
			address:{main:null,city:null,state:null,pin:null,country:null},
			contactNo:{mob:null,res:null},
			portfolio:[]
		}
		dataArr = data.split("\n");
		dataArr = dataArr.map(function(el){
			return el.strip();
		})
		console.log(dataArr);


		//todo validations on parsed obj
		cb(null,{data:obj});
	}

	return parser;
}