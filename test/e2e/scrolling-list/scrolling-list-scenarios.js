(function() {
  "use strict";

  var expect = require('rv-common-e2e').expect;
  browser.driver.manage().window().setSize(1024, 768);

  describe("scrolling list", function() {
    beforeEach(function () {
      browser.get("/test/e2e/scrolling-list/scrolling-list-scenarios.html");
    });
    
    it("Should load rows", function() {
      expect(element.all(by.css(".table .list-row")).count())
        .to.eventually.equal(20);      
    });

    describe("large list: ", function() {
      beforeEach(function () {
        browser.sleep(500);
        
        element(by.id("scrollBottom")).click();
    
        browser.sleep(500);
      });
      
      it("Should load more rows on scroll", function() {
        expect(element.all(by.css(".table .list-row")).count())
          .to.eventually.equal(40);
      });
    });
    
    describe("small list: ", function() {
      beforeEach(function(done) {
        element(by.id("toggleReturnItems")).click();
        element(by.id("scrollBottom")).click();
        
        setTimeout(function() {
          done();
        }, 250);
      });

      it("Should not load more rows on scroll", function() {
        expect(element.all(by.css(".table .list-row")).count())
          .to.eventually.equal(20);            
      });
    });
    
    describe("clear list: ", function() {
      beforeEach(function(done) {
        element(by.id("toggleReturnItems")).click();
        element(by.id("clearList")).click();
        
        setTimeout(function() {
          done();
        }, 250);
      });

      it("Should not load more rows on scroll", function() {
        expect(element.all(by.css(".table .list-row")).count())
          .to.eventually.equal(0);        
      });
    });    
  });

})();
