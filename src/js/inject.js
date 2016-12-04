(function () {
  //window.postMessage({}, "");
  //window.addEventListener("message", function(event) {}, false);

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      var prop, doms, key, i;
      for(prop in request) {
        if(request.hasOwnProperty(prop)){
          doms = document.querySelectorAll(request[prop].selector);
          request[prop].length = doms.length;
          for(key in request[prop]){
            if(request[prop].hasOwnProperty(key) && key !== 'selector' && key !== 'length'){
              for(i = 0; i < request[prop].length; i++){
                request[prop][key].push(doms[i][key]);
              }
            }
          }
        }
      }
      sendResponse(request);
    }
  );

  chrome.runtime.sendMessage('content script ready', function (response) {});

})();