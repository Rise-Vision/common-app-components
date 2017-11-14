/* jshint expr: true */

(function() {

  "use strict";

  /* https://github.com/angular/protractor/blob/master/docs/getting-started.md */

  var chai = require("chai");
  var chaiAsPromised = require("chai-as-promised");

  chai.use(chaiAsPromised);
  var expect = chai.expect;

  describe("App Subscription Status Component", function() {
    beforeEach(function (){
      browser.get("/test/e2e/subscription-status/app-subscription-status-scenarios.html");
    });

    it("Should show the default subscription status", function () {
      expect(element(by.css("#app-subscription-status .subscribe strong")).isPresent()).
        to.equal.true;

      expect(element(by.css("#app-subscription-status .subscribe strong")).getText()).
        to.eventually.equal("subscription-status.get-subscription");
    });

    it("Should show a valid subscription status", function () {
      element(by.id("setValid")).click();

      expect(element(by.css("#app-subscription-status .subscribe strong")).getText()).
        to.eventually.equal("subscription-status.continue-to-app");
    });

    it("Should show an invalid subscription status", function () {
      element(by.id("setInvalid")).click();

      expect(element(by.css("#app-subscription-status .subscribe strong")).getText()).
        to.eventually.equal("subscription-status.get-subscription");
    });

    it("Should show an expired subscription status", function () {
      element(by.id("setExpired")).click();

      expect(element(by.css("#app-subscription-status .subscribe strong")).getText()).
        to.eventually.equal("subscription-status.get-subscription");
    });

  });

})();
