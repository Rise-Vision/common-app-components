(function() {
  "use strict";

  var chai = require("chai");
  var chaiAsPromised = require("chai-as-promised");
  var expect = chai.expect;
  

  chai.use(chaiAsPromised);
  browser.driver.manage().window().setSize(1024, 768);

  describe("country dropdown", function() {
    beforeEach(function () {
      browser.get("/test/e2e/countries/country-dropdown-scenarios.html");
    });

    it("Should load", function () {
      expect(element(by.id("country-dropdown")).isPresent()).to.eventually.be.true;
      expect(element(by.css(".selectpicker")).isPresent()).to.eventually.be.true;
    });
    
    it("Should initialize countries and select default", function() {
      expect(element.all(by.css(".selectpicker option")).count()).to.eventually.equal(12);
      expect(element(by.model('country')).$('option:checked').getText())
        .to.eventually.equal("Canada");
    });
  });

})();
