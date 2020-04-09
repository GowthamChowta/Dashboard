// JS function to put gold medal and silver medal images next to first and second rank
var tot=$('.rank').length;
for (var i=0;i<tot;i++){
    if($('.rank')[i].innerHTML==="1"){
      console.log('i value'+i);
      // $('.rank')[i].append('<img src="images/gold-medal.png" alt="gold medal"/>');
      $('<img />', {src:"images/gold-medal-small.png", alt:"gold medal"}).appendTo($('.rank')[i])
    }
    else if($('.rank')[i].innerHTML==="2"){
      $('<img />', {src:"images/silver.png", alt:"gold medal"}).appendTo($('.rank')[i])
    }
  else{
    break
  }
}

// Function to show the assignment name and set the value of the dropdown
if($('#getAssignmentValue').attr('value')!=='')
{
  var value=$('#getAssignmentValue').attr('value')
  $('.check')[0].value=value
  var assign=$('option')[value].innerHTML
  $('.message').append(assign)
}

// IF the drop down is selected then the button will be enabled
$('.check').one('change',function(){

  $('.submitLB').removeAttr('disabled')
})
