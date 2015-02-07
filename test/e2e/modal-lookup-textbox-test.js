(function() {
  "use strict";

  var chai = require("chai");
  var chaiAsPromised = require("chai-as-promised");
  var expect = chai.expect;

  chai.use(chaiAsPromised);
  browser.driver.manage().window().setSize(1024, 768);

  describe("modal-lookup-textbox", function() {
    this.timeout(3000);// to allow for protactor to load the seperate page
    beforeEach(function () {
      browser.get("/test/e2e/modal-lookup-textbox.html");
    });

    it("Should load", function () {
      expect(element(by.id("testTagTextBox"))
        .isPresent()).to.eventually.be.true
    });
  });

})();