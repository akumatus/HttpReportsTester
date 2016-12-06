# HTTP Reports Tester

HTTP Reports Tester is a chrome extension used to test http reports of your website. 

![Http Reports Tester](https://github.com/akumatus/HttpReportsTester/blob/master/tester-icon.png)

As an automatical testing framework, it can:

* Upload expectant reports configration file
* Automatically trigger scroll, click or hover events, collecting all of these http reports
* Compare collected reports and expectant reports

The user interface as shown below:

![Http Report Tester](https://github.com/akumatus/HttpReportsTester/blob/master/tester-ui.png)

There is a `map-example.js` file in this repository which is used as reports configration file.

```javascript
var map = [{
  event: 'init',  // Website init reports
  dom: 'body',    // Dom selector 
  order: true,    // Reports need in proper order
  reports: [      // Expectant reports array
    {
      "1": "1",
      "v": "2.0.2",
      "cmdid": "540",
      "serviceid": "10400",
      "softid": "",
      "tn": ""
    },
    {
      "29": /.+/,       //You can use regex here
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
  event: 'click',       // Click event reports
  order: false,         // Reports out of order
  dom: '.websitesUl-li-link',
  reports: [{
    "62": "{{href}}",   // Config dom property in this way
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
