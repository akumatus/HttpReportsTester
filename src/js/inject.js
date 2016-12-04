(function () {
  //window.postMessage({}, "");
  //window.addEventListener("message", function(event) {}, false);

  chrome.runtime.sendMessage('ready', function (response) {});

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      for(prop in request) {
        if(request.hasOwnProperty(prop)){
          request[prop].length = document.querySelectorAll(request[prop].selector).length;
        }
      }
      sendResponse(request);
    }
  );

})();