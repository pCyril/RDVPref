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
    this.fill('form.form-horizontal', { CP: parameters.zipCode }, true);
}, function () {
    this.exit();
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
        if (msg.indexOf('CAPTCHA_RESULT') === 0) {
            var captcha = msg.replace('CAPTCHA_RESULT|', '');
            fillForm(captcha);
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
    }, function () {
        this.exit();
    });
    
    casper.then(function(){
        this.click(x('//*[@id="nextButtonId"]'));
    }, function () {
        this.exit();
    });
    
    casper.waitForSelector('.choice_captcha', function () {
        var base64 = this.captureBase64('jpeg', '.img_captcha img');
        this.wait(300, function() {
            var data = null;
            this.then(function() {
                data = this.evaluate(function(apiKey, base64) {
                    return __utils__.sendAJAX("https://avis-expert.net/resolve/captcha", 'POST', {key: apiKey, method: 'base64', body: "data:image/jpeg;base64," + base64}, false, { contentType : "application/x-www-form-urlencoded" });
                }, {apiKey: parameters.api_key, base64: base64});
            }).then(function() {
                this.evaluate(function(id) {
                    var result = null;
                    var intr = setInterval(function(id) {
                        var result = __utils__.sendAJAX("https://avis-expert.net/resolved/captcha/" + id, 'GET', null, false);

                        if (result != '') {
                            //IMPORTANT NE PAS SUPPRIMER CE LOG
                            console.log('CAPTCHA_RESULT|', result);
                            clearInterval(intr);
                        }
                    }, 1000, id);

                    return result;
                }, {id: data});
            })
        });
    }, function () {
        this.exit();
    });
}

function fillForm(captcha) {
    casper.fill('form#form2', { userCiv: parameters.civility, userLastName: parameters.lastname, userFirstName: parameters.firstname, userZip: parameters.userZip, userEmail: parameters.email, userPhone: parameters.phone, imgc: captcha}, true)
    casper.capture('form_filled.png');
}

casper.run(function(){});