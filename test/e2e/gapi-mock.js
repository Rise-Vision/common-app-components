"use strict";

/*global gapi,handleClientJSLoad: false */

window.gapi = {};
gapi.client = {
  load: function(path, version, cb) {
    cb();
  },
  storage: {
    tagdef: {
      list: function () {
        return {
          result : {
            nextPageToken : 1,
            items : [
              {
                name: "tag1",
                values: [
                  "value1"
                ],
                type: "LOOKUP"
              },
              {
                name: "tag2",
                values: [
                  "value2"
                ],
                type: "LOOKUP"
              },
              {
                name: "tag3",
                values: [
                  "value3"
                ],
                type: "FREEFORM"
              }
            ]
          }
        };
      }
    }
  },
  core: {
    country: {
      list: function() {
        return {
          result: {
            items: [
              {
               "code": "US",
               "name": "United States",
               "states": [
                {
                 "code": "RI",
                 "name": "Rhode Island"
                },
                {
                 "code": "VT",
                 "name": "Vermont"
                },
                {
                 "code": "HI",
                 "name": "Hawaii"
                },
                {
                 "code": "CA",
                 "name": "California"
                },
               ],
               "kind": "core#countryItem"
              },
              {
               "code": "EG",
               "name": "Egypt",
               "kind": "core#countryItem"
              },
              {
               "code": "GB",
               "name": "United Kingdom",
               "kind": "core#countryItem"
              },
              {
               "code": "FR",
               "name": "France",
               "kind": "core#countryItem"
              },
              {
               "code": "GR",
               "name": "Greece",
               "kind": "core#countryItem"
              },
              {
               "code": "RO",
               "name": "Romania",
               "kind": "core#countryItem"
              },
              {
               "code": "AT",
               "name": "Austria",
               "kind": "core#countryItem"
              },
              {
               "code": "PT",
               "name": "Portugal",
               "kind": "core#countryItem"
              },
              {
               "code": "BR",
               "name": "Brazil",
               "kind": "core#countryItem"
              },
              {
               "code": "CA",
               "name": "Canada",
               "states": [
                {
                 "code": "NV",
                 "name": "Nunavut"
                },
                {
                 "code": "QC",
                 "name": "Quebec"
                },
                {
                 "code": "ON",
                 "name": "Ontario"
                },
                {
                 "code": "AB",
                 "name": "Alberta"
                },
                {
                 "code": "BC",
                 "name": "British Columbia"
                }
               ],
               "kind": "core#countryItem"
              },
              {
               "code": "TR",
               "name": "Turkey",
               "kind": "core#countryItem"
              }
            ]
          }
        }
      }
    }
  },
  setApiKey: function() {
  }
};

handleClientJSLoad();
