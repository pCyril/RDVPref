const parameters = require('./parameters');

var casper = require('casper').create({
   viewportSize: {width: 1280, height: 1000}
});

var fs = require('fs');
var x = require('casper').selectXPath;

casper.userAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36');

casper.start('https://rdv-etrangers-94.interieur.gouv.fr/eAppointmentpref94/element/jsp/specific/pref94.jsp' ,function(){
      // attends le charge
    this.waitForSelector('form[action="javascript:coin()"]');
});


casper.waitForSelector('form.form-horizontal', function() {
    this.fill('form.form-horizontal', { CP: '94200' }, true);
});

casper.then(function(){
    this.click(x('//*[@id="pane3"]/div[2]/div/div[1]/div[3]/div[1]/input'));
})

casper.then(function(){
    repeatScript();
})

function repeatScript(){
    casper.click(x('//*[@id="nextButtonId"]'));
    casper.waitForAlert(function(response) {
        this.echo(response.data);
        this.waitForSelector('#nextButtonId', function() {
            this.wait(500, function() {
                repeatScript();
            })
        })
    },function(){
        nextStep();
    },  1000);
}

function nextStep(){

    casper.on('remote.message', function(msg) {
        console.log('msg', msg);
        if (msg.indexOf('Request ID') === 0) {

        } else if (msg.indexOf('Result') === 0) {

        }
    });

    casper.then(function(){
        casper.evaluate(function() {
            openJqueryCal(true);
        });
    })
    
    casper.waitForSelector('a.ui-state-default', function(){
        this.wait(1000, function() {
            console.log('capture calendar');
            this.capture('prefecture.png', {
                top: 100,
                left: 100,
                width: 1200,
                height: 800
            });
        });
    }, function () {
        console.log('timeout');
        this.exit();
    });
    
    casper.then(function() {
        this.click('a.ui-state-default');
        this.wait(1000, function() {
            console.log('capture clicked');
            this.capture('clicked.png', {
                top: 100,
                left: 100,
                width: 1200,
                height: 800
            });
        });
    });
    
    casper.then(function(){
        this.evaluate(function() {
            document.querySelector('select#hourValueSelect').selectedIndex = 1; //it is obvious
            disableButtons();
            onHourChanged();
        });
    });
    
    casper.waitForSelector('.availabilityColumnX', function () {
        this.click('input[type="radio"]');
        console.log('capture select');
        this.capture('select.png');
    });
    
    casper.then(function(){
        this.click(x('//*[@id="nextButtonId"]'));
    })
    
    casper.waitForSelector('.choice_captcha', function () {
        console.log('capture form');
        this.capture('form.png');
        console.log('capture captcha');
        this.captureSelector('captcha.png', '.img_captcha img');
        this.wait(300, function() {
            this.evaluate(function(apiKey, base64) {
                function getXMLHttpRequest() {
                    var xhr = null;

                    if (window.XMLHttpRequest || window.ActiveXObject) {
                        if (window.ActiveXObject) {
                            try {
                                xhr = new ActiveXObject("Msxml2.XMLHTTP");
                            } catch(e) {
                                xhr = new ActiveXObject("Microsoft.XMLHTTP");
                            }
                        } else {
                            xhr = new XMLHttpRequest();
                        }
                    } else {
                        return null;
                    }

                    return xhr;
                }

                var xhr = getXMLHttpRequest();
                xhr.open("POST", "https://2captcha.com/in.php", true);

                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        console.log('Request ID' + xhr.response);
                    }
                }

                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                xhr.send("key=" + apiKey + "&body=" + base64);
            }, parameters.api_key, base64_encode('captcha.png'))
        })
    });
}

function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}

casper.run(function(){});