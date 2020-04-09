let file=0
let assignemnt=0

// Function to make the icon as a button
$('.fa-upload').on('click',function(){
    $('input#upload_id').click()
  })

// When any of the assignment option was selected it will return assignment=1
$('.check').on('change',function(){
  assignemnt=1
})

// When correct file was uploaded it will return file=1
$("input#upload_id").change(function () {
    var fileName=$('input#upload_id')[0].files[0].name

    var len=fileName.length;
    // Code to check file format

    if(fileName.slice(length-3)==='csv'){
      $('#upload_file_message').css('color','green')
      $('#upload_file_message')[0].innerHTML='File uploaded '+fileName
      file=1
    }
    else
    {
      $('#upload_file_message').css('color','red')
      $('#upload_file_message')[0].innerHTML='Please upload CSV file only'
      file=0
    }

});

// When both the file and drop down is selected then only the submit button is enabled
$('form').on('change load',function(){
  if(assignemnt+file===2){
    $('.submitfile').removeAttr('disabled')
  }
  else
  {
    $('.submitfile').attr('disabled','true')
  }
})
