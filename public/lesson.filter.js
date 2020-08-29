$(document).ready(function(){
    $("#lesson-filter").on("keyup", function() {
      var value = $(this).val().toLowerCase();
      $("#lesson-table tbody tr").filter(function() {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
      });
    });
  });