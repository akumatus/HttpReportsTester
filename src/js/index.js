/**
 * Created by wuyue07 on 16/11/28.
 */

Vue.config.devtools = true;

mocha.setup('bdd');

var expect = chai.expect;

var app = new Vue({
  el: '#app',

  template: '',

  data: {
    showResult: false,
    url: 'https://0.baidu.com/',
    reportUrl: 'http://dr.w.baidu.com/report*',
    map: [],
    dom: {},
    domReady: false,
    code: [],
    tabId: null,
    windowId: null,
    fileStatus: -99,
    decode: 1
  },

  created: function () {},

  methods: {
    chooseMapFile: function () {
      var event = new MouseEvent('click', {
        'view': window,
        'bubbles': true,
        'cancelable': true
      });
      var fileInput = document.getElementById('uploadMapFile');
      if (fileInput) {
        fileInput.dispatchEvent(event);
      }
    },

    saveMap: function (ev) {
      try{
        var _this = this;
        var file = ev.target.files[0];
        var reader = new FileReader();
        reader.onload = function(e) {
          var code = e.target.result;
          eval(code);
          _this.map = map;
          _this.generateInsertCode();
        };
        reader.readAsText(file);
        _this.fileStatus = 0;
      }
      catch (e){
        this.fileStatus = -1;
      }
    },

    generateInsertCode: function () {
      var i, j, k, len = this.map.length;
      this.dom = {};
      this.domReady = false;
      this.code = [];
      
      for(i = 0; i < len; i++){
        this.dom[this.map[i].event] = {
          selector: this.map[i].dom
        };

        for(j = 0; j < this.map[i].reports.length; j++){
          for(k in this.map[i].reports[j]){
            if(this.map[i].reports[j].hasOwnProperty(k)){
              if(typeof this.map[i].reports[j][k] === 'string'){
                var match = this.map[i].reports[j][k].match(/{{(\w+)}}/);
                if(match){
                  this.dom[this.map[i].event][match[1]] = []; //href, innerHTML and so on
                }
              }
            }
          }
        }

        switch (this.map[i].event){
          case 'init':
            this.code.push({
              name: this.map[i].event,
              reports: this.map[i].reports,
              order: this.map[i].order,
              code: ``
            });
            break;
          case 'scroll':
            this.code.push({
              name: this.map[i].event,
              reports: this.map[i].reports,
              order: this.map[i].order,
              code: `
              var scrollDoms = document.querySelectorAll('${this.map[i].dom}');
              for (var i = 0; i < scrollDoms.length; i++){
                scrollDoms[i].scrollTop = scrollDoms[i].offsetHeight;
              }`
            });
            break;
          case 'click':
            this.code.push({
              name: this.map[i].event,
              reports: this.map[i].reports,
              order: this.map[i].order,
              code: `
              var clickDoms = document.querySelectorAll('${this.map[i].dom}');
              var clickEvent;
              for (var i = 0; i < clickDoms.length; i++){
                clickEvent = new MouseEvent('click', {
                  'view': window,
                  'bubbles': true,
                  'cancelable': true
                });
                clickEvent.preventDefault();
                clickDoms[i].dispatchEvent(clickEvent);
              }`
            });
            break;
          case 'hover':
            this.code.push({
              name: this.map[i].event,
              reports: this.map[i].reports,
              order: this.map[i].order,
              code: `
              var hoverDoms = document.querySelectorAll('${this.map[i].dom}');
              var hoverEvent;
              for (var i = 0; i < hoverDoms.length; i++){
                hoverEvent = new MouseEvent('mouseover', {
                  'view': window,
                  'bubbles': true,
                  'cancelable': true
                });
                hoverEvent.preventDefault();
                hoverDoms[i].dispatchEvent(hoverEvent);
              }`
            });
            break;
          default:
            break;
        }
      }
    },

    openWebsite: function () {
      var _this = this;

      chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
          if(request === 'content script ready' && _this.tabId){
            chrome.tabs.sendMessage(_this.tabId, _this.dom, function (response) {
              _this.dom = response; //get dom length, href, innerHTML and so on to help assertion
              _this.domReady = true;
              var ev = new Event('ready', {
                'bubbles': true, 
                'cancelable': false
              });
              document.dispatchEvent(ev);
            });
          }
        }
      );

      chrome.windows.create({
        url: this.url,
        width: 50,
        height: 50
      }, function (newWindow){
        _this.windowId = newWindow.id;
        _this.tabId = newWindow.tabs[0].id;

        function promiseLoop(index) {
          var promise = _this.executeScript(_this.code[index]);
          promise.then(function(reports) {
            console.log(_this.code[index].name, reports);
            _this.mochaDescribe(reports, _this.code[index]);
            if(index + 1 < _this.code.length){
              promiseLoop(index + 1);
            }
            else {
              chrome.windows.remove(_this.windowId, function () {
                _this.windowId = null;
                _this.tabId = null;
              });

              if(_this.domReady){
                mocha.run(); //dom info ready
              }
              else {
                document.addEventListener('ready', function(ev){
                  _this.domReady = true;
                  mocha.run(); //dom info ready
                })
              }
            }
          });
        }

        promiseLoop(0);
      });
    },

    executeScript: function (code) {
      return new Promise((resolve, reject) => {
        this.webRequestListener(code, resolve, reject);
        chrome.tabs.executeScript(this.tabId, {code: code.code});
      });
    },

    webRequestListener: function (code, resolve, reject) {
      var _this = this;
      var reports = [];
      var id;
      var handle = function(details) {
        var reportRaw = details.url.split('?')[1].split('&');
        var report = {}, tempAry;
        var i, len = reportRaw.length;

        for(i = 0; i < len; i++){
          tempAry = reportRaw[i].split('=');
          if(tempAry[0] !== '_'){ //filter timestamp
            report[tempAry[0]] = _this.decode ? decodeURIComponent(tempAry[1]) : tempAry[1];
          }
        }
        reports.push(report);

        clearTimeout(id);
        id = setTimeout(function () {
          resolve(reports);
          chrome.webRequest.onBeforeRequest.removeListener(handle);
        }, 1000);

        return {cancel: true}; //block http report sending
      };

      chrome.webRequest.onBeforeRequest.addListener(handle, {urls: [_this.reportUrl]}, ['blocking']);

    },

    mochaDescribe: function (reports, code) {
      var _this = this;
      var len = code.reports.length * _this.dom[code.name].length;
      
      function findReportHandle (mapReport) {
        var key, codeArray = [];
        for(key in mapReport){
          if(mapReport.hasOwnProperty(key)){
            if(typeof mapReport[key].test === 'function'){
              codeArray.push(`${mapReport[key]}.test(reports['${key}'])`); //regex test
            }
            else if(typeof mapReport[key] === 'string'){
              codeArray.push(`reports['${key}'] === '${mapReport[key]}'`);
            }
            else {
              codeArray.push(`reports['${key}'] === ${mapReport[key]}`);
            }
          }
        }
        return function (reports) {
          return eval(codeArray.join('&&'));
        }
      }

      describe(code.name + '' + _this.dom[code.name].selector, function() {
        it('should sending ' + len + ' HTTP reports as expected', function() {
          expect(reports).to.have.length(len);
        });

        if(reports.length === len){
          it('should sending the same content as expected', function() {
            var i, j, findReport, key;
            var domLength = _this.dom[code.name].length;
            var reportsClone;

            if(domLength > 1){ //multiple dom condition
              for(i = 0; i < domLength; i ++){
                reportsClone = JSON.parse(JSON.stringify(code.reports));
                for(j = 0; j < reportsClone.length; j++){
                  for(key in reportsClone[j]){
                    if(reportsClone[j].hasOwnProperty(key)){
                      var match = reportsClone[j][key].match(/{{(\w+)}}/);
                      if(match){
                        reportsClone[j][key] = _this.dom[code.name][match[1]][i]; //replace {{href}} {{innerHTML}} and so on
                      }
                    }
                  }
                  findReport = findReportHandle(reportsClone[j]);
                  expect(reports.find(findReport)).to.not.equal(undefined);
                  
                  console.log(code.name);
                  console.log(JSON.stringify(reports.find(findReport)), '\n', JSON.stringify(reportsClone[j]));
                }
              }
            }
            else{
              if(code.order){ //same order as expected
                for(i = 0; i < len; i ++){
                  findReport = findReportHandle(code.reports[i]);
                  expect(findReport(reports[i])).to.equal(true);
                  
                  console.log(code.name);
                  console.log(JSON.stringify(reports[i]), '\n', JSON.stringify(code.reports[i]));
                }
              }
              else{ //do not need to have the same order
                for(i = 0; i < len; i ++){
                  findReport = findReportHandle(code.reports[i]);
                  expect(reports.find(findReport)).to.not.equal(undefined);
                  
                  console.log(code.name);
                  console.log(JSON.stringify(reports[i]), '\n', JSON.stringify(reports.find(findReport)));
                }
              }
            }
          });
        }
      });
    },
    
    startTesting: function () {
      this.openWebsite();
      this.showResult = true;
    }
  }
});