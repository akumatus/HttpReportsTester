/**
 * Created by wuyue07 on 16/11/28.
 */
var url = 'https://0.baidu.com/';
var reportUrl = 'http://dr.w.baidu.com/report*';
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
      "1350": "日历",
      "v": "2.0.2",
      "cmdid": "540",
      "serviceid": "10400",
      "softid": "",
      "tn": ""
    },
    {
      "1350": "星座",
      "v": "2.0.2",
      "cmdid": "540",
      "serviceid": "10400",
      "softid": "",
      "tn": ""
    },
    {
      "1350": "特权中心",
      "v": "2.0.2",
      "cmdid": "540",
      "serviceid": "10400",
      "softid": "",
      "tn": ""
    },
    {
      "551": "1",
      "552": "1",
      "553": "1",
      "554": "1",
      "555": "1",
      "558": "1",
      "561": "1",
      "v": "2.0.2",
      "cmdid": "540",
      "serviceid": "10400",
      "softid": "",
      "tn": ""
    },
    {
      "1001": "2",
      "1350": "天气",
      "1355": "上海",
      "v": "2.0.2",
      "cmdid": "540",
      "serviceid": "10400",
      "softid": "",
      "tn": ""
    },
    {
      "29": /.+/,
      "30": "1",
      "1001": "2",
      "v": "2.0.2",
      "cmdid": "540",
      "serviceid": "10400",
      "softid": "",
      "tn": ""
    },
    {
      "1001": "2",
      "1350": "百度网盘",
      "v": "2.0.2",
      "cmdid": "540",
      "serviceid": "10400",
      "softid": "",
      "tn": ""
    },
    {
      "1001": "2",
      "1350": "网易邮箱",
      "v": "2.0.2",
      "cmdid": "540",
      "serviceid": "10400",
      "softid": "",
      "tn": ""
    }
  ]
}, {
  event: 'scroll',
  dom: 'body',
  order: true,
  reports: [
    {
      "1001": "2",
      "1301": "1",
      "v": "2.0.2",
      "cmdid": "540",
      "serviceid": "10400",
      "softid": "",
      "tn": ""
    },
    {
      "1001": "2",
      "1302": "1",
      "v": "2.0.2",
      "cmdid": "540",
      "serviceid": "10400",
      "softid": "",
      "tn": ""
    },
    {
      "1001": "2",
      "1303": "1",
      "v": "2.0.2",
      "cmdid": "540",
      "serviceid": "10400",
      "softid": "",
      "tn": ""
    },
    {
      "1001": "2",
      "1304": "1",
      "v": "2.0.2",
      "cmdid": "540",
      "serviceid": "10400",
      "softid": "",
      "tn": ""
    },
    {
      "1001": "2",
      "1305": "1",
      "v": "2.0.2",
      "cmdid": "540",
      "serviceid": "10400",
      "softid": "",
      "tn": ""
    },
    {
      "1001": "2",
      "1306": "1",
      "v": "2.0.2",
      "cmdid": "540",
      "serviceid": "10400",
      "softid": "",
      "tn": ""
    },
    {
      "1001": "2",
      "1307": "1",
      "v": "2.0.2",
      "cmdid": "540",
      "serviceid": "10400",
      "softid": "",
      "tn": ""
    },
    {
      "1001": "2",
      "1308": "1",
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
    "62": "{{href}}",
    "63": "{{innerText}}",
    "64": "1",
    "1001": "2",
    "v": "2.0.2",
    "cmdid": "540",
    "serviceid": "10400",
    "softid": "",
    "tn": ""
  }]
},{
  event: 'hover',
  dom: '.weatherWrapper',
  order: true,
  reports: [{
    "1001": "2",
    "1353": "1",
    "1355": "上海",
    "v": "2.0.2",
    "cmdid": "540",
    "serviceid": "10400",
    "softid": "",
    "tn": ""
  }]
}
];