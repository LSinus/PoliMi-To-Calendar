const $ = require('jquery')

data = [];

lessons = [];

courseInfo = {};

const courses = $('div[style*="background-color:#f3f3ee; width: 100%; padding:2px;"]');
courses.each(function() {

    let course = $(this).text().split('-')[1]; // remove course ID
    course = course.split(/\r?\n/)[0];  // remove content after new line

    courseInfo['title'] = course

    courseInfoCopy = Object.assign({}, courseInfo)
    data.push(courseInfoCopy)
    
});

let counter = 0;

let toDay;
let fromDay;

const date = $('div[style*="padding: 2px;"]');
date.each(function() {
    let splittedDate = $(this).text().split(':');
    let from = splittedDate[1].split(/\r?\n/)[0];   // take first line of data after ':'
    let to = splittedDate[2].slice(1).split(/\r?\n/)[0]; // remove first space character, and remove content after new line

    from = from.slice(2)
    let fromA = from.split('/')
    fromA = fromA.reverse()
    from = ''
    for(i = 0; i < fromA.length; i++){
        if(i == fromA.length -1){
            initialDay = fromA[i]
        }
        from = from + '-' + fromA[i]
    }
    from = from.slice(1)
    let fromDate = Date.parse(from)
    fromDay = Math.floor(fromDate/86400/1000 + 4) % 7
    fromA = []
    fromA.push(from)
    fromA.push(fromDay)

    to = to.slice(2)
    let toA = to.split('/')
    toA = toA.reverse()
    to = ''
    for(i = 0; i < toA.length; i++){
        if(i == toA.length -1){
            finalDay = toA[i]
        }
        to = to + '-' + toA[i]
    }
    to = to.slice(1)
    let toDate = Date.parse(to)
    toDay = Math.floor(toDate/86400/1000 + 4) % 7
    toA = []
    toA.push(to)
    toA.push(toDay)

    data[counter]['from'] = fromA
    data[counter]['to'] = toA

    counter++;
});

counter = 0;

const timeTable = $('ul[style*="margin-top: 0px; margin-bottom: 0px; list-style-type: square; padding-top: 0px; margin-left: 45px; padding-left: 45px;"');
timeTable.each(function() { 
    let lesson = {}

    let textArray = $(this).text().split(' ');

    for(i=0; i<textArray.length; i++){
        
        var day = 0;

        if(textArray[i] == 'dalle'){
            let when = textArray[i-1];
            if(when.includes(')')){
                when = when.split(')')[1];        
            }
            switch (when){
                case 'Lunedì':
                    day = 1
                    lesson['when'] = 'MO'
                    break;
                case 'Martedì':
                    day = 2
                    lesson['when'] = 'TU'
                    break;
                case 'Mercoledì':
                    day = 3
                    lesson['when'] = 'WE'
                    break;
                case 'Giovedì':
                    day = 4
                    lesson['when'] = 'TH'
                    break;
                case 'Venerdì':
                    day = 5
                    lesson['when'] = 'FR'
                    break;
                case 'Sabato':
                    day = 6
                    lesson['when'] = 'SA'
                    break;
            }

            if(day < fromDay -1){
                startDay = parseInt(initialDay) + 7 - fromDay + day
            }
            else{
                startDay = parseInt(initialDay) - fromDay + day
            }

            if(day <= fromDay +1){
                endDay = parseInt(finalDay) - toDay + day
            }
            else{
                endDay = parseInt(finalDay) - 7 - toDay + day
            }

            lesson['startDay'] = startDay
            lesson['endDay'] = endDay

            if(i+1 < textArray.length){
                let from = textArray[i+1];
                lesson['from'] = from;
            }
        }
        else if(textArray[i] == 'alle'){
            if(i+1 < textArray.length){
                let to = textArray[i+1];
                to = to.slice(0, -1);
                lesson['to'] = to;
            }
        }
        else if(textArray[i] == 'aula'){
            if(i+1 < textArray.length){
                let where = textArray[i+1];
                lesson['where'] = where;
            }   
            let lessonCopy = Object.assign({}, lesson)
            lessons.push(lessonCopy);
        }
    }

    lessonsCopy = Object.assign([], lessons)
    data[counter]['lessons'] = lessonsCopy
    lessons = []
    counter++;
});


for (i = 0; i < data.length; i++){

    startDate = data[i]['from'][0]
    endDate = data[i]['to'][0]
    
    startDate_noDay = startDate.slice(0, -2)
    endDate_noDay = endDate.slice(0, -2)
    
    lessons = data[i]['lessons']
    for(j = 0; j < lessons.length; j++){
        lessons[j]['fromDate'] = startDate_noDay + lessons[j]['startDay']
        lessons[j]['toDate'] = endDate_noDay + lessons[j]['endDay']
        delete lessons[j]['startDay']
        delete lessons[j]['endDay']
    }

    delete data[i]['from']
    delete data[i]['to']
}


chrome.runtime.sendMessage({ type: "dict_lessons_data", data: data})





