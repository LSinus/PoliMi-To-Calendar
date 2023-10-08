import './popup.css';

document.querySelector('#go-to-options').addEventListener('click', function() {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('options.html'));
  }
});

let output = document.getElementById("output")

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type === "calendar_response") {
      output.textContent = message.data
      
  }
})




const poliUrl = "https://www13.ceda.polimi.it/oralez/oralez/controller/MainDesktop.do"
var onTimeTable = false

var SCOPES = 'https://www.googleapis.com/auth/calendar';

chrome.tabs.query({active: true, currentWindow: true}).then( function(tabs) {
  let url = tabs[0].url
  let tabID = tabs[0].id
  
  if (url.includes(poliUrl)){
    output.textContent = "TIME PAGE DETECTED"

    document.querySelector('button').style.display = "block"
    document.querySelector('button').addEventListener('click', function() {
      chrome.identity.getAuthToken({interactive: true}, function(token) {
          output.textContent = "WAIT..."

          chrome.runtime.sendMessage({ type: "token", data: token})
          
        });
      });


  }

  else{
    document.querySelector('button').style.display = "none"
    output.textContent = "GO TO YOUR TIMETABLE PAGE TO USE THE EXTENSION"
  }

})
