
function validateMeetingForm(){
  return meetingDescriptionChanged();
}

function serializedArray(data){
  var arr = [];
  for (var k in data) {
    arr.push({name: k, value: data[k]});
  }
  return arr;
}

function updateMeeting(event, revertFunc){
  E = event;
  var data = {};
  data.csrfmiddlewaretoken = getCookie('csrftoken');
  data.id = event.data.id;
  data.description = event.data.description;
  data.date = event.start.format("DD-MM-YYYY");
  data.time = event.start.format("HH:mm");
  var d = moment.duration(E.end.diff(E.start));
  data.duration = Math.floor(d.asMinutes() / 60) + ":" + d.asMinutes() % 60;

  data.room = event.resourceId;
  console.log(data);

  arrData = serializedArray(data);
  postMeeting('api/editMeeting', arrData, function(){revertFunc()}, null);
}

function postMeeting(url, postData, onError, onSuccess){

  $.ajax({
    type: "POST",
    url: url,
    data: postData,
    error: function(e, data){
      updateCsrf();
      if(onError != null)
        onError(data);
    },
    success: function(data){
      updateCsrf();
      if(data.result == "Success"){
        console.log("Meeting posted with success", data);
        $("#myModal").modal('hide');
        if(onSuccess != null)
          onSuccess(data);
        fetchCalendar();
      }else{
        console.log("Meeting posted with error", data.message);
        $("#meeting-error").text(data.message);
        if(onError != null)
          onError(data);
      }
      
     }
  });
}

function actionToUrl(action){
  return 'api/' + action + 'User';
}

function postUser(action, postData, onError, onSuccess){
  postData.push({'name': 'csrfmiddlewaretoken', 'value': getCookie('csrftoken')})
  $.ajax({
    type: "POST",
    url: actionToUrl(action),
    data: postData,
    error: function(e, data){
      if(onError != null)
        onError(data);
    },
    success: function(data){
      if(data.result == "Success"){
        console.log("User posted with success", data);
        if(onSuccess != null)
          onSuccess(data);
      }else{
        console.log("User posted with error", data.message);
        if(onError != null)
          onError(data);
      }
      
     }
  });
}

function meetingDescriptionChanged(){
  var view = $("#meeting-form").find('textarea[name=description]');
  V = view;
  if(view.val() == ""){
    $(view.parent()).find('span').removeClass('hidden');
    return false;
  }else{
    $(view.parent()).find('span').addClass('hidden');
    return true;
  }

}

function getArrayElementByName(arr, name){
  for(var i=0; i<arr.length; i++)
    if(arr[i].name == name)
      return arr[i].value;
  return '';
}

function getCookie(name) {
  var cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var cookie = jQuery.trim(cookies[i]);
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

function updateCsrf(){
  var csrftoken = getCookie('csrftoken');
  
  var tokens = $('input[name=csrfmiddlewaretoken]');
  for(var i=0; i<tokens.length; i++)
    tokens.val(csrftoken);
}

function removeOptions(selectbox){
  for(var i = selectbox.options.length - 1; i >= 0; i--){
    selectbox.remove(i);
  }
}

function removeCalendarResources(c){
  arr = $('#calendar').fullCalendar('getResources');
  for(var i=0; i<arr.length; i++)
    $('#calendar').fullCalendar('removeResource', arr[i].id);
}

function addCalendarResources(arr){
  for(var i=0; i<arr.length; i++)
    $('#calendar').fullCalendar('addResource', arr[i]);
}

function fetchCalendar(){
  $.ajax({
    type: "GET",
    url: "api/calendar",
    error: function(e, data){
      console.log(e)
    },
    success: function(data){
      if(data.result == 'Success'){
        $('#calendar').fullCalendar('removeEvents');
        removeCalendarResources();
        addCalendarResources(data.rooms);
        R = data.rooms;

        for(var i=0; i<data.meetings.length; i++){
          $('#calendar').fullCalendar( 'renderEvent', data.meetings[i], true);
        }
      }
    }
  });
}

console.log("JS loaded");

function TabSystem(buttons, containers){
  mButtons = {}

  for(var i=0; i<buttons.length; i++){
    mButtons[buttons[i]] = containers[i];
    $(buttons[i]).click(function(e){
      var container = mButtons['#' + e.currentTarget.id];
      for(var i=0; i<containers.length; i++){
        if(containers[i] != container)
          $(containers[i]).addClass('hidden');
      }
      $(container).removeClass('hidden');
    })
  }

}