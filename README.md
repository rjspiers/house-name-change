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

[Response example and descriptions](https://github.com/surreydigitalservices/locate-api#presentation)

#### nameCheck

Example request: https://www2.guildford.gov.uk/node/house-name-check/api/nameCheck?newHouseName=beechanger&uprn=10007060106

Example response: 
```json
{
  "status": "success",
  "message": "here is the data",
  "nameChecks": {
    "profanityDetected": false,
    "identicalNameInUSRN": [
      "BEECHANGER"
    ],
    "identicalNameInPostcodeSector": [
      "BEECHANGER"
    ],
    "similarNameInUSRN": [
      "BEECHANGER"
    ],
    "similarNameInPostcodeSector": [
      "BEECHANGER"
    ],
    "recordDetail": {
      "uprn": "10007060106",
      "usrn": 16002556,
      "isparent": "0",
      "ischild": "0",
      "postcode_sector": "GU5 9"
    }
  }
}
```

| Property | Type | Description | 
| ------ | ------ | ------ | 
| status | string | response status |
| message | string | response message |
| nameChecks | json | name check results |
| profanityDetected | boolean | true if profanity detected |
| identicalNameInUSRN | array | identical names within the same USRN |
| identicalNameInPostcodeSector | array | identical names within the same postcode sector (GU1 1) |
| similarNameInUSRN | array | identical sounding names within the same USRN |
| similarNameInPostcodeSector | array | identical sounding names within the same postcode sector (GU1 1) |
| recordDetail | json | data on the requested UPRN used by the API to conduct the name checking |
