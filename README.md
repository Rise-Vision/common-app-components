Common-App-Components [![Circle CI](https://circleci.com/gh/Rise-Vision/common-app-components.svg?style=svg)](https://circleci.com/gh/Rise-Vision/common-app-components) [![Coverage Status](https://coveralls.io/repos/github/Rise-Vision/common-app-components/badge.svg?branch=master)](https://coveralls.io/github/Rise-Vision/common-app-components?branch=master)
==============

## Introduction
Various UI Angular custom diretives shared across Angular based apps developed by Rise Vision.

At this time Chrome is the only browser that this project and Rise Vision supports.

### Components
- Filter dropdown

## Built With
- *NPM*
- *AngularJS*
- *Gulp*
- *Bower*
- *Karma and Mocha for testing*

## Development

### Local Development Environment Setup and Installation
1. install __nodejs__ and __npm__ : go to http://nodejs.org/download/, then download and install the relavent package
2. install __bower__: `sudo npm install -g bower`
3. `npm install; bower install`

### Run Local
To preview one of the components in a browser, you can do so by using a Gulp task that is also internally used by the gulp test task (see Testing section below). Do the following:
```bash
gulp server
```

This now runs a local server at http://localhost:8099 which allows you to view the location of the E2E test HTML file of a component. Eg. http://localhost:8099/test/e2e/angular/color-picker-test-ng.html

### Dependencies
- [RV Common Style](https://github.com/Rise-Vision/common-style)
- [AngularJS](https://angularjs.org/) -> [jQuery](http://jquery.com/)
- [i18next](http://i18next.com/)
- [angular-bootstrap](http://angular-ui.github.io/bootstrap/)
- [angular-bootstrap-show-errors](https://github.com/paulyoder/angular-bootstrap-show-errors)

### Testing
To run unit and E2E testing, do
```bash
gulp test
```

## Submitting Issues
If you encounter problems or find defects we really want to hear about them. If you could take the time to add them as issues to this Repository it would be most appreciated. When reporting issues please use the following format where applicable:

**Reproduction Steps**

1. did this
2. then that
3. followed by this (screenshots / video captures always help)

**Expected Results**

What you expected to happen.

**Actual Results**

What actually happened. (screenshots / video captures always help)

### Languages

If you would like translate the user interface for this product to another language please complete the following:
- Download the english translation file from this repository.
- Download and install POEdit. This is software that you can use to write translations into another language.
- Open the translation file in the [POEdit](http://www.poedit.net/) program and set the language for which you are writing a translation.
- In the Source text window, you will see the English word or phrase to be translated. You can provide a translation for it in the Translation window.
- When the translation is complete, save it with a .po extension and email the file to support@risevision.com. Please be sure to indicate the Widget or app the translation file is for, as well as the language that it has been translated into, and we will integrate it after the translation has been verified.

Facilitator
----------
[Alex Deaconu](https://github.com/alex-deaconu)
