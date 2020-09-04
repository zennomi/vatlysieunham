$(document).ready(function () {
  $("#lesson-filter").on("keyup", function () {
    var value = $(this).val().toLowerCase();
    $("#lesson-table tbody tr").filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });
  });
});
$('th').css('cursor', 'pointer');
$('th').click(function () {
  var table = $(this).parents('table').eq(0)
  var rows = table.find('tr:gt(0)').toArray().sort(comparer($(this).index()))
  this.asc = !this.asc
  if (!this.asc) { rows = rows.reverse() }
  for (var i = 0; i < rows.length; i++) { table.append(rows[i]) }
})
function comparer(index) {
  return function (a, b) {
    var valA = getCellValue(a, index), valB = getCellValue(b, index)
    return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : getName(valA).localeCompare(getName(valB));
  }
}
function getCellValue(row, index) { return $(row).children('td').eq(index).text() }

function getName(string) {
  let stringArray = string.split(' ');
  name = stringArray[stringArray.length - 1];
  console.log(string, name);
  return name;
}