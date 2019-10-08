var express = require('express');
var xkpasswd = require('xkpasswd');
var path = require('path');
var app = express();

var invalidpattern = /[^swdW]+/
var validpattern = /[swdW]+/

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'))
});

app.get('/api/', function (req, res) {
    var complexity = 4;
    var separators = "#.-=+_!$*:~?%^&;";
    var pattern;
    var transform;
    response = {
        complexity: req.query.complexity,
        separators: req.query.separators,
        pattern: req.query.pattern,
        transform: req.query.transform,
    };
    if (!!response.complexity) {
        if (isNaN(response.complexity)) {
            res.statusMessage = "complexity is not a number";
            res.status(400).end("complexity is not a number");
        }
        complexity = Number(response.complexity);
    }
    if (!!response.pattern) {
        if (invalidpattern.test(response.pattern)) {
            res.statusMessage = "pattern is not valid";
            res.status(400).end("pattern is not valid\n\nValid options:\nw - lowercase word\nW - uppercase word\ns - separator\nd - digit");
        }
        pattern = response.pattern;
    } else {
        switch (complexity) {
            case 1:
                pattern = "wsw";
                break;
            case 2:
                pattern = "wswsw";
                break;
            case 3:
                pattern = "wswswsdd";
                break;
            case 4:
                pattern = "wswswswsdd";
                break;
            case 5:
                pattern = "wswswswswsd";
                break;
            case 6:
                pattern = "ddswswswswswsdd";
                break;
            default:
                pattern = "wswswswswsd";
                break;
        }
    }
    if (!!response.transform) {
        if (response.transform != "alternate" && response.transform != "uppercase" && response.transform != "random") {
            res.statusMessage = "transform is not a valid option";
            res.status(400).end("transform is not valid\n\nValid options:\nalternate - every OTHER word CAPITALIZED\nuppercase - EVERY WORD CAPITALIZED\nrandom - EVERY WORD is pseudo RANDOMLY capitalized");
        }
        transform = response.transform;
    }
    if (!!response.separators) {
        separators = response.separators;
    }
    if (transform == "random") {
        var newpattern = "";
        for (var i = 0; i < pattern.length; i++) {
            if (pattern.charAt(i) == "w" || pattern.charAt(i) == "W") {
                var random_boolean = Math.random() >= 0.5;
                if (random_boolean) {
                    newpattern += "W"
                } else {
                    newpattern += "w"
                }
            } else {
                newpattern += pattern.charAt(i);
            }
        }
        pattern = newpattern;
        transform = "";
    }
    res.end(xkpasswd({ separators: separators, pattern: pattern, transform: transform }));
})

var server = app.listen(80, function () {
    var host = server.address().address
    var port = server.address().port

    console.log("XKAPI app listening at http://%s:%s", host, port)
})
