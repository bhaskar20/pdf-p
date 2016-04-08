var fs = require('fs');
var path = require('path');
var fileName = path.resolve(__dirname, "../textfiles", "asd.txt");
var moment = require('moment');
var S = require('string');

var obj = {
    date: null,
    name: null,
    emailId: null,
    address: { main: null, city: null, state: null, pin: null, country: null },
    contactNo: { mob: null, res: null },
    portfolio: [],
    portfolioTotal:null
}
fs.readFile(fileName,'utf8',function (err, data) {
    if (err) {
        console.log(err);
    }
    //TODO: improve errors logging

    //date parsing
    var dateReg = /As\son\s(\d{1,2}\-\w{3}-\d{4})\s/gi;
    var d = new moment(dateReg.exec(data)[1], "DD-MMM-YYYY");
    if (d.isValid) {
        obj["date"] = d;
    }
    else {
        console.log("error on parsing date in pdf" + d);
    }
    //  

    //email parsing
    var emailReg = /Email\sId:\s(\S+@\S+\.\S+)/g;
    var e = emailReg.exec(data)[1];
    if (typeof e != "undefined" || e != null) {
        obj["emailId"] = e;
    }
    else {
        console.log("error on parsing emailId in pdf");
    }

    //phone num parsing
    var phReg = /Phone\sRes\s:\s([\d]+)\s/g;
    var mobReg = /Mobile\s+:\s(\+?[\d]+)\s/g;
    var ph = phReg.exec(data)[1];
    var mob = mobReg.exec(data)[1];
    if (ph != null) {
        obj.contactNo.res = ph;
    }
    else {
        console.log("error on parsing phone res in pdf" + d);
    }
    if (mob != null) {
        obj.contactNo.mob = mob;
    }
    else {
        console.log("error on parsing mobile in pdf" + d);
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
    totalReg = /Total\s+([\d.,]+)$/gm;
    var totalMatch = totalReg.exec(data);
    indexofInr = data.lastIndexOf("(INR)");
    indexofTotal = totalMatch.index;
    //total
    var total = totalMatch[1];
    obj.portfolioTotal = total;
    //
    //portfoliostr
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
            registrar:null
        };
        var folioArr = portfolioArr[i].split("  ");
        //clean folioArr for spaces
        for (var l = folioArr.length; l>=0; l--) {
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
    //

    console.log(obj);

});