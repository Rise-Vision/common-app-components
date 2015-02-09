Common-App-Components [![Circle CI](https://circleci.com/gh/Rise-Vision/common-app-components.svg?style=svg)](https://circleci.com/gh/Rise-Vision/common-app-components)
==============

## Introduction
Various UI Angular custom directives shared across Angular based apps developed by Rise Vision.

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
- [AngularJS](https://angularjs.org/) -> [jQuery](http://jquery.com/)
- [angular-bootstrap](http://angular-ui.github.io/bootstrap/)

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

Facilitator
----------
[Andrew Alanis](https://github.com/EnlightenedCode)
