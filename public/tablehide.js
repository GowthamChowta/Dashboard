if($('td').length ===0){
    $('table').addClass('hidden')
    // $('h3.message')[0].innerHTML="Sorry we don't have any submissions for this assignment"
}
else
{
  $('table').removeClass('hidden')
  // $('h3.message')[0].innerHTML="Please find the submission for the assignment"
}
