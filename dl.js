const spawn = require('child_process').spawn;
const fs = require("fs");
const { dialog } = require('electron');
var rxjs = require('rxjs/');


const THREE_SECONDS = 1000 * 3;
const alertTimer = rxjs.Observable.timer(THREE_SECONDS);
var alertSubscription;

//setting jquery
window.$ = window.jQuery = require('jquery/dist/jquery.min.js');
//settings.json
var settings;

var ytd = "youtube-dl -o ";
var outputFormat = "/%(title)s.%(ext)s"
var down;

fs.readFile('settings.json', 'utf8', (err, data) => {
    if (err) throw err;
    settings = JSON.parse(data);
})
$(document).ready(function () {
    $.get("dashboard/dashboard.html", function (data) {
        $('.container-fluid').html(data);
    })

})
var dl = {
    execute: function (target) {
        var dlPath = settings.path + outputFormat;
        // down = spawn('youtube-dl',['-o','/Users/haowei/Desktop/img/%(title)s.%(ext)s','https://www.youtube.com/watch?v=do1iL02KRZE'])
        down = spawn('youtube-dl',['-o',dlPath,target.value]);
        down.stdout.on('data', (data) => {
            data = data.toString();
            if(data.indexOf('of') > -1) {
                data = data.split('of')[0];
                data = data.split(']')[1];
                data = data.split('%')[0];
                $('#singleProgress').css({width:data+'%'});
                $('#singleProgress').addClass('progress-bar-animated');
            }
            console.log(data);
        });

        down.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
        });

        down.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
            $('#singleProgress').removeClass('progress-bar-animated');
        });
    },
    goSettings: function () {
        $.get("settings/settings.html", function (data) {
            $('.container-fluid').html(data);
            $('#thePath').val(settings.path);
        })
    },
    goIndex: function () {
        $.get("dashboard/dashboard.html", function (data) {
            $('.container-fluid').html(data);
        })
    },
    getPath: function (e) {
        var files = e.target.files;
        var path = files[0].path;
        $('#thePath').val(path);
        // console.log(path);
        // var Folder = path.split("/");
    },
    openPath: function (e) {
        e.preventDefault();
        $('#files').click();
    },
    savePath: function () {
        
        settings.path = $('#thePath').val();
        var settingsJson = JSON.stringify(settings);
        fs.writeFile('settings.json', settingsJson, (err) => {
            if (err) throw err;
            console.log('saved');
            this.alert($('#savedPathAlert'), 'Saved!','alert-success');
        })
    },
    dlSingleFile: function (target) {
        if(target.value != '') {
            this.execute(target);
        }
    },
    alert(target, content, type) {
        target.addClass(type + ' alert');
        target.html('<strong>'+content+'</stron>');
        target.show();
        alertSubscription = alertTimer.subscribe(()=> {
            target.hide();
            alertSubscription.unsubscribe();
        })
        
    }

}