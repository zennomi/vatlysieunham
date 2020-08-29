$(document).ready(function () {
  var socket = io();
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
  $("#student-table tbody tr").on('click', function () {
    let updateInfo = {homeworkId: window.location.pathname.split('/')[3]};
    let id = $(this).children('td:first').text();
    updateInfo.studentId = parseInt(id);
    
    let placeholder = ($(this).children('td:nth-child(3)').text() == 'Chưa nhập') ? '' : $(this).children('td:nth-child(3)').text()
    let value = prompt(`Nhập BTVN (số nguyên) cho ${$(this).children('td:nth-child(2)').text()}`, placeholder);
    if (value != '' && value != null) {
      value = parseInt(value);
      while (Number.isNaN(value) || value > $('input#total').val()) {
        alert('Nhập số nguyên nhỏ hơn tổng số câu của BTVN nha!');
        value = parseInt(prompt("Nhập BTVN (số nguyên)", placeholder));
      }
      $("#student-table tbody tr")
        .filter(function () { return $(this).children('td:first').text() == id })
        .children('td:nth-child(3)')
        .text(value);
      updateInfo.finishCount = value;
    } else if (value == '') {
      $("#student-table tbody tr")
        .filter(function () { return $(this).children('td:first').text() == id })
        .children('td:nth-child(3)')
        .text('Chưa nhập');
      updateInfo.finishCount = '';
    }
    if (updateInfo.finishCount != undefined)
      socket.emit('update-homework', updateInfo);
  });
});