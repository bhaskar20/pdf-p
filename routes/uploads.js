var express = require('express');
var router = express.Router();
var multer = require('multer');
var pdftotext = require('pdftotextjs');
var path = require('path');
var fs = require('fs');
var karvyParser = require("../helperutils/karvyParser.js")();

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './uploads')
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname.slice(0, -4) + '-' + Date.now()+'.pdf')
	}
})
//place filerestrictions/check file type in upload
function fileFilter(req, file, cb){
    //improve this by checking mimetype also along with extension only
    if (path.extname(file.originalname) !== '.pdf') {
        return cb(new Error('Only pdfs are allowed'))
    }   
    cb(null, true)
}

var upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

router.post('/uploads',upload.single('userpdf'),function (req, res,next) {
	var pdf = new pdftotext(path.join(__dirname,'./../',req.file.path));
	var passString = "-upw "+req.body.password;
	pdf.add_options([passString,'-layout ']);
	pdf.getText(function(err, data, cmd) {
        if (err) {
        	err.message = "Something went wrong, please check the password and try again";
        	//console.error(err.message);
            next(err);
		}
		else {
			var fpath = path.join(__dirname,'./../textfiles',req.file.filename.slice(0, -4))+".txt";
			fs.writeFile(fpath,data,function(err){
                if (err) {
                	console.log(err.message);
                    next(err);
				}
				var parsedData = karvyParser.parseData(data,function(err,obj){
                    if (err) {
                        next(err);
						//console.error(err);
					}
					res.send(obj);
				})
			})
		}
	})
});




module.exports = router;