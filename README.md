## House name change
A checking service for proposed house name changes

### Outline

- API to postgres provides name checking via json responses
- AngularJS used to present frontend results
- Configured to run through IIS using [iisnode](https://github.com/tjanczuk/iisnode)

### Routes
- Application host: https://www2.guildford.gov.uk
- URL path to API: [/node/house-name-check/api](https://www2.guildford.gov.uk/node/house-name-check/api)
- Friendly frontend: https://www2.guildford.gov.uk/node/house-name-check

### API
| Method | Endpoint | Params | Description |
| ------ | ------ | ------ | ------ |
| GET | [/postcode](#postcode) | postcode=string | returns json of Guildford Borough addresses within a postcode |
| GET | [/nameCheck](#namecheck) | <ul><li>uprn=string</li><li>newHouseName=string</li></ul> | returns json of name check results using uprn |
| GET | /postcodeUk | postcode=string | returns json of addresses within a postcode |
| GET | /postcodeStatic | - | returns json of addresses within a one postcode |
| GET | /testDbConn | - | returns json of simple sql query to check db is available to application api|
| GET | /uprn | uprn=integer | returns json of one uprn record |

### Response Properties
#### Postcode

[HTTP 200 Response example and descriptions](https://github.com/surreydigitalservices/locate-api#presentation)

**Returns http 422 if:**
- postcode not valid
- postcode empty
- postcode is not within Guildford GSSCode.


#### nameCheck

Example request: https://www2.guildford.gov.uk/node/house-name-check/api/nameCheck?newHouseName=beechanger&uprn=10007060106

**Example http 200 response:**
```json
{
  "status": "success",
  "message": "here is the data",
  "nameChecks": {
    "recordDetail": {
      "uprn": "10007060106",
      "usrn": 16002556,
      "isparent": "0",
      "ischild": "0",
      "postcode_sector": "GU5 9"
    },
    "summary": {
      "pass": false
    },
    "rule": {
      "profanityDetected": false,
      "identicalNameInUSRN": {
        "pass": false,
        "data": [
          "BEECHANGER"
        ]
      },
      "identicalNameInPostcodeSector": {
        "pass": false,
        "data": [
          "BEECHANGER"
        ]
      },
      "identicalSoundingNameInUSRN": {
        "pass": false,
        "data": [
          "BEECHANGER"
        ]
      },
      "identicalSoundingNameInPostcodeSector": {
        "pass": false,
        "data": [
          "BEECHANGER"
        ]
      },
      "isAlphaOrSpace": true,
      "max255Chars": true,
      "suffix": {
        "isLastWordReservedSuffix": false,
        "message": "single word only",
        "identicalNameDifferentSuffixInUSRN": {
          "pass": true,
          "data": []
        },
        "identicalNameDifferentSuffixInPostcodeSector": {
          "pass": true,
          "data": []
        },
        "identicalSoundingNameDifferentSuffixInUSRN": {
          "pass": true,
          "data": []
        },
        "identicalSoundingNameDifferentSuffixInPostcodeSector": {
          "pass": true,
          "data": []
        }
      }
    }
  }
}
```

| Property | Type | Description |
| ------ | ------ | ------ |
| status | string | response status |
| message | string | response message |
| nameChecks | json | name check results |
| summary.pass | boolean | true if all rules pass & profanityDetected=false |
| rule | json | each rule contains `pass` as boolean & `data` as array |
| profanityDetected | boolean | true if profanity detected |
| identicalNameInUSRN | json | identical names within the same USRN |
| identicalNameInPostcodeSector | json | identical names within the same postcode sector (GU1 1) |
| identicalSoundingNameInUSRN | json | identical sounding names within the same USRN |
| identicalSoundingNameInPostcodeSector | json | identical sounding names within the same postcode sector (GU1 1) |
| isAlphaOrSpace | boolean | true if newHouseName contains only alpha or whitespace chars |
| max255Chars | boolean | true if newHouseName length is < 256 chars |
| suffix | json | grouping for suffix rules |
| isLastWordReservedSuffix | boolean | true if last word in string is reserved name ending |
| identicalNameDifferentSuffixInUSRN | json | identical names (before last word) within the same USRN |
| identicalNameDifferentSuffixInPostcodeSector | json | identical names (before last word) within the same postcode sector (GU1 1) |
| identicalSoundingNameDifferentSuffixInUSRN | json | identical sounding names (before last word) within the same USRN |
| identicalSoundingNameDifferentSuffixInPostcodeSector | json | identical sounding names (before last word) within the same postcode sector (GU1 1) |
| recordDetail | json | data on the requested UPRN used by the API to conduct the name checking |

**Returns http 422 if:**
- `&newHouseName` > 255 chars
- `&uprn` is not in the LLPG

### Tests
Test suite built with [mocha](https://mochajs.org/) and [chai](http://chaijs.com/).

Tests run by directly accessing the application running on localhost. [iisnode provides a named pipe](https://github.com/tjanczuk/iisnode/issues/46) as the `process.env.PORT` so the app defined in server.js can't be exported with `module.exports = app.listen(process.env.PORT)`.

### http/https
Application is configured to run through http by default.

AngularJS $http uses http or https depending on if the application is served via http or https.

**To run with https either:**
- Access through a https proxy (make sure [node errors are allowed to pass through IIS](https://github.com/tjanczuk/iisnode/issues/295))
- Add a security cert to IIS and access it directly. Use the web-https.config file for an example of redirecting http to https.
