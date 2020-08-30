$(document).ready(function () {
  var socket = io();

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
  $("#student-filter").focus(function() {
    $(this).trigger('select');
  })

  // Update
  let id;
  let updateInfo = { homeworkId: window.location.pathname.split('/')[3] };
  $("#student-table tbody tr").on('click', function () {
    $('#update-modal').modal('show');
    id = $(this).children('td:first').text();
    updateInfo.studentId = parseInt(id);

    let placeholder = ($(this).children('td:nth-child(3)').text() == 'Chưa nhập') ? '' : $(this).children('td:nth-child(3)').text();
    $('h5.modal-title').text(`Nhập điểm`);
    $('.modal-body p').text(`Học sinh ID ${id} - Tên: ${$(this).children('td:nth-child(2)').text()}`);
    $('#finish_count').val(placeholder);
    $('#update-modal').on('shown.bs.modal', function () {
      $('#finish_count').trigger('focus');
      $('#finish_count').trigger('select');
    });
    $('#finish_count').on('keyup', function () {
      if ($('#finish_count').val() == '') {
        $('#validate').hide();
        $('#submit-update').prop('disabled', false);
        $('#finish_count').addClass('is-valid');
        return;
      }
      if (parseInt($('#finish_count').val()) > $('#total').val()) {
        $('#validate').show();
        $('#validate').text('Vượt quá tổng số BTVN.');
        $('#submit-update').prop('disabled', true);
        $('#finish_count').removeClass('is-valid');
      } else {
        $('#validate').hide();
        $('#submit-update').prop('disabled', false);
        $('#finish_count').addClass('is-valid')
      }
    });
    //  
  })
  $('#form-update').on('submit', function (e) {
    e.preventDefault();
    $('#update-modal').modal('hide');
    $("#student-table tbody tr")
      .filter(function () { return $(this).children('td:first').text() == id })
      .children('td:nth-child(3)')
      .text($('#finish_count').val());
      updateInfo.finishCount = $('#finish_count').val();
    socket.emit('update-homework', updateInfo);
  })
});