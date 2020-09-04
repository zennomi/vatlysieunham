$(document).ready(function () {
  // Filter
  $("#student-filter").on("keyup", function () {
    var value = $(this).val().toLowerCase();
    if (value.length > 0) {
      $("#student-table tbody tr").filter(function () {
        $(this).toggle($(this).children("td:first").text() == value || $(this).children("td:nth-child(2)").text().toLowerCase().indexOf(value) > -1)
      });
    } else {
      $("#student-table tbody tr").show();
    }
  });
  // Select when focus
  $("#student-filter").focus(function () {
    $(this).trigger('select');
  })
  $('th').css('cursor', 'pointer');
});
$('th').click(function(){
  var table = $(this).parents('table').eq(0)
  var rows = table.find('tr:gt(0)').toArray().sort(comparer($(this).index()))
  this.asc = !this.asc
  if (!this.asc){rows = rows.reverse()}
  for (var i = 0; i < rows.length; i++){table.append(rows[i])}
})
function comparer(index) {
  return function(a, b) {
      var valA = getCellValue(a, index), valB = getCellValue(b, index)
      return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : getName(valA).localeCompare(getName(valB));
  }
}
function getCellValue(row, index){ return $(row).children('td').eq(index).text() }

function getName(string) {
  let stringArray = string.split(' ');
  name = stringArray[stringArray.length-1];
  return name;
}