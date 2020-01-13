var casper = require('casper').create({
   viewportSize: {width: 1280, height: 1000}
});
var $ = require('jquery');
var x = require('casper').selectXPath;
var title;
var elements;
casper.start('https://rdv-etrangers-94.interieur.gouv.fr/eAppointmentpref94/element/jsp/specific/pref94.jsp' ,function(){
      // attends le charge
      this.waitForSelector('form[action="javascript:coin()"]');
   });
casper.then(function() {
    // rempli le champ de l'adresse
    this.fill('form.form-horizontal', { CP: '94200' }, true);
 });
casper.then(function(){
   this.click(x('//*[@id="pane3"]/div[2]/div/div[3]/div[2]/div[1]/input'));
})
casper.then(function(){
   this.click(x('//*[@id="nextButtonId"]'));
})
casper.then(function(){
   this.waitForSelector("#calendarImgId");
})
casper.then(function(){
   this.click("#dayValueId");
})
casper.then(function(){
   this.waitForSelector("#ui-datepicker-div")
})
// casper.then(function(){
//    elements = this.getHTML('a')
//    })
casper.then(function(){
   if(this.exists('div.title')){
      title =  this.getHTML('div.title');
   }
   this.echo(title);
   this.echo(elements);
   this.capture('prefecture.png', {
      top: 100,
      left: 100,
      width: 1200,
      height: 800
  });
})
casper.run(function(){
     if(title != null){
       this.echo(title)
       this.echo()
       return console.log("j'ai tout affiche");
     }
     else{
        console.log("je n'ai rien trouve")
    }
});