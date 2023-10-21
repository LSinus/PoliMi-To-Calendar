require('dotenv').config();

const API_KEY = process.env.API_KEY;

currentCreationState = true 

timeTableData = []

calendarID = ""



chrome.runtime.onMessage.addListener(async function(message, sender, sendResponse) {
  if (message.type === "dict_lessons_data") {
      timeTableData = message.data;     
  }

  if (message.type === "token") {
    await calendarStuff(message.data)
      if(currentCreationState){
        chrome.runtime.sendMessage({ type: "calendar_response", data: "CALENDAR ADDED"})
      }
      else{
        chrome.runtime.sendMessage({ type: "calendar_response", data: "ERROR ADDING THE CALENDAR"})
      }
    
  }

})


function printData(){
  console.log(timeTableData)
}

async function calendarStuff(token){
  if (timeTableData.length > 0){
    await createCalendar(token)
    //getCalendarId(token)
    for(i = 0; i<timeTableData.length; i++){
      console.log("createEvent")
      createEvent(token, timeTableData[i])
    }
  }
}

async function createCalendar(token){
  let init = {
    method: 'POST',
    async: true,

    body: JSON.stringify({
      summary: "Orario Università"
    }),
    headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json'
    },
    
    };
    await fetch('https://www.googleapis.com/calendar/v3/calendars?maxMembers=20&key=' + API_KEY, init)
      .then(function(response) {
        if(!response.ok){
          throw new Error('HTTP error, state ' + response.status)
        }
        return response.json()
      })
      .then(function(data) {
        console.log(data)
        calendarID = data['id']
        console.log(calendarID)
        
      }).catch(function(error){
        console.log(error)
        currentCreationState = false
      })
}

async function createEvent(token, data){
  for(j=0; j<data['lessons'].length; j++){
  
    let from = data['lessons'][j]['fromDate'] + 'T' + data['lessons'][j]['from'] + ':00'
    let to = data['lessons'][j]['fromDate'] + 'T' + data['lessons'][j]['to'] + ':00'

    let toYear = data['lessons'][j]['toDate'].split('-')[0]
    let toMonth = data['lessons'][j]['toDate'].split('-')[1]
    let toDay = data['lessons'][j]['toDate'].split('-')[2]

    toDay = parseInt(toDay) + 1

    console.log('RRULE:FREQ=WEEKLY;BYDAY=' + data['lessons'][j]['when'] + ';UNTIL=' + toYear + toMonth + toDay,)
    let init = {
      method: 'POST',
      async: true,
  
      body: JSON.stringify({
        start: {
          
          dateTime: from,
          timeZone: "Europe/Rome"
        },
        end: {
          
          dateTime: to,
          timeZone: "Europe/Rome"
        },
        summary: data['title'],
        location: 'PoliMi',
        description: 'Lezione in aula ' + data['lessons'][j]['where'],
        recurrence:[
          'RRULE:FREQ=WEEKLY;BYDAY=' + data['lessons'][j]['when'] + ';UNTIL=' + toYear + toMonth + toDay,
          
        ]
      }),
      headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json'
      },
      
      };
      fetch('https://www.googleapis.com/calendar/v3/calendars/' + calendarID + '/events?maxMembers=20&key=' + API_KEY, init)
        .then(function(response) {
        if(!response.ok){
        throw new Error('HTTP error, state ' + response.status)
        }
           return response.json()
        })
        .then(function(data) {
        console.log(data)
        }).catch(function(error){
        console.log(error)
        currentCreationState = false
        })
  }
}





