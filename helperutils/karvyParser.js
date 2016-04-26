var moment = require('moment');
var S = require('string');
module.exports = function () {
	var parser = {};

	parser.parseData = function (data, cb) {
		var obj = {
			date: null,
			name: null,
			emailId: null,
			address: { main: null, city: null, state: null, pin: null, country: null },
			contactNo: { mob: null, res: null },
			portfolio: [],
			portfolioTotal: null,
			error:[]
		}
 		//TODO: improve error logging
        //date parsing
        var dateReg = /As\son\s(\d{1,2}\-\w{3}-\d{4})\s/gi;
        try{
        	var dateStr = dateReg.exec(data)[1];
        }
        catch(ex){
        	console.log("ALERT!! There was a problem with Date parser"+ex.message)
        	obj.error.push("not able to find date "+ex.message);
        }
        var d = new moment(dateStr, "DD-MMM-YYYY");
        if (d.isValid) {
        	obj["date"] = d;
        }
        else {
        	console.log("error on parsing date in pdf" + d);
        	obj.error.push("Not able to parse the date")
        }
        //  
        
        //email parsing
        var emailReg = /Email\sId:\s(\S+@\S+\.\S+)/g;
        try{
        	var e = emailReg.exec(data)[1];
        }
        catch(ex){
        	console.log("not able to find email "+ex.message);
        	obj.error.push("not able to find email "+ex.message)
        }
        if (typeof e != "undefined" || e != null) {
        	obj["emailId"] = e;
        }
        else {
        	console.log("error on parsing emailId in pdf");
        	obj.error.push("not able to find email")
        }
        
        //phone num parsing
        var phReg = /Phone\sRes\s:\s([\d]+)\s/g;
        var mobReg = /Mobile\s+:\s(\+?[\d]+)\s/g;
        try{
        	var ph = phReg.exec(data)[1];
        	var mob = mobReg.exec(data)[1];
        }
        catch(ex){
        	obj.error.push("not able to parse the phone numbers");
        }
        if (ph != null) {
        	obj.contactNo.res = ph;
        }
        if (mob != null) {
        	obj.contactNo.mob = mob;
        }
        //
        var dataArr = S(data).lines();
        //name parsing
        var name = S(dataArr[5]).splitLeft("     ", 2)[0];
        var capName = S(name).strip().humanize().toString();
        obj.name = capName;
        //
        
        //address parsing
        var l1 = S(dataArr[7]).splitLeft("     ", 2)[0];
        var l2 = S(dataArr[8]).splitLeft("     ", 2)[0];
        var l3 = S(dataArr[9]).splitLeft("     ", 2)[0];
        obj.address.main = [l1, l2, l3];
        //city,state,pin,country
        var city = S(dataArr[10]).splitLeft("     ", 2)[0];
        var state = S(dataArr[11]).splitLeft("     ", 2)[0];
        var pin = S(dataArr[12]).splitLeft("     ", 2)[0];
        var country = S(dataArr[13]).splitLeft("     ", 2)[0];
        obj.address.city = city;
        obj.address.state = state;
        obj.address.pin = pin;
        obj.address.country = country;
        //
        
        //portfolio
        //total
        totalReg = /Total\s+([\d.,]+)$/gm;
        try{
        	var totalMatch = totalReg.exec(data);
        	var indexofTotal = totalMatch.index;
        	var total = totalMatch[1];
        	obj.portfolioTotal = total;
        }
        catch(ex){
        	obj.error.push("Not able to parse total "+ex.message);
        }
        var indexofInr = data.lastIndexOf("(INR)");
        //

        //portfoliostr
        try{
        	var portfoliostr = data.substr(indexofInr, indexofTotal - indexofInr);
        	var portfolioArr = S(portfoliostr).lines();
        	portfolioArr.shift();
        	portfolioArr.pop();
        	portfolioArr.pop();
        	for (var i = 0; i < portfolioArr.length; i++) {
        		var folio = {
        			folioNu: null,
        			schemeName: null,
        			closingUnitBalance: null,
        			navDate: null,
        			navValue: null,
        			marketValue: null,
        			registrar: null
        		};
        		var folioArr = portfolioArr[i].split("  ");
            //clean folioArr for spaces
            for (var l = folioArr.length; l >= 0; l--) {
            	if (folioArr[l] == "") {
            		folioArr.splice(l, 1);
            	}
            }
            folio.folioNu = folioArr[0];
            folio.schemeName = folioArr[1];
            folio.closingUnitBalance = folioArr[2];
            folio.navDate = folioArr[3];
            folio.navValue = folioArr[4];
            folio.marketValue = folioArr[5];
            folio.registrar = folioArr[6];
            obj.portfolio.push(folio);
        }
    }
    catch(ex){
    	obj.error.push("not able to parse portfolio "+ex.message);
    }
        //
        //todo validations on parsed obj
        cb(null, { data: obj });
    }
    
    return parser;
}