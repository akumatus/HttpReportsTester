# Http Report Tester

Http Report Tester is a chrome extension used to testing http reports of your website. 

![Http Report Tester](https://github.com/akumatus/HttpReportsTester/blob/master/tester-icon.png)

As an automatical testing framwork, it can:

* Upload expectant reports configration file
* Automatically trigger scroll, click or hover events, collecting all of these http reports
* Compare collected reports and expectant reports

The user interface looks as below:

![Http Report Tester](https://github.com/akumatus/HttpReportsTester/blob/master/tester-ui.png)

There is a `map-example.js` file in this repository, supports regex and dom property.

```javascript
var map = [{
  event: 'init',
  dom: 'body',
  order: false,
  reports: [
    {
      "1": "1",
      "v": "2.0.2",
      "cmdid": "540",
      "serviceid": "10400",
      "softid": "",
      "tn": ""
    },
    {
      "29": /.+/,  //You can use regex
      "30": "1",
      "1001": "2",
      "v": "2.0.2",
      "cmdid": "540",
      "serviceid": "10400",
      "softid": "",
      "tn": ""
    }
  ]
},{
  event: 'click',
  order: false,
  dom: '.websitesUl-li-link',
  reports: [{
    "62": "{{href}}", //Dom property in this way
    "63": "{{innerText}}",
    "64": "1",
    "1001": "2",
    "v": "2.0.2",
    "cmdid": "540",
    "serviceid": "10400",
    "softid": "",
    "tn": ""
  }]
}
];
```
