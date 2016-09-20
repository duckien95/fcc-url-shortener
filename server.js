var express  = require("express");
var url = require("url");
var mongoClient = require("mongodb").MongoClient;
var app = express();

var mongoURL = "mongodb://ronalkean:123456@ds033056.mlab.com:33056/api-fcc";
function CheckValidURL(s) {    
      var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
      return regexp.test(s);    
}

app.use(express.static(__dirname));

app.get('/new/*', function(req, res){
    var link = req.url.substring(5);
    var urlPage = 'https://' + req.headers.host;
    mongoClient.connect(mongoURL, function(err, db){
        if(err) {
            console.log("connect fail");
        };
        // console.log("connect success");
        var shortCollect = db.collection("url-shortener");
        var result = {};
        var short_id  = Math.floor((Math.random() * 10000) + 1);
        if(CheckValidURL(link)){
            result = {
                original_url : link,
                short_id : short_id
            };
            // console.log("add result");
        }
        else{
            res.json({error: "Wrong url format, make sure you have a valid protocol and real site."})
            db.close();
            res.end('\n');
        }
        // console.log(result);
        
        shortCollect.insert(result, function(err){
            if(err) throw err;
            var data ={
                original_url : link,
                short_url : urlPage + '/' + result.short_id
            }
            res.json(data);
            db.close();
            res.end("\n");
        })
    });
});

app.get("/:id", function(req, res){
    var id = parseInt(req.params.id);
     mongoClient.connect(mongoURL, function(err, db){
        if(err) throw err;
        var shortCollect = db.collection("url-shortener");
        shortCollect.find({
            short_id : id
        },{
            _id : 0,
            original_url : 1,
            short_id : 1
        }).toArray(function(err, docs){
            if(err) {
                db.close();
                res.json({"error" : "Not found"});
                res.end();
            };
            console.log("response");
            // console.log(docs);
            db.close();
            if(docs.length > 0){
                res.redirect(docs[0].original_url);
                res.end('\n');
            }
        })
    });
})

app.listen(process.env.PORT,function(){
    console.log("port " + process.env.PORT);
});