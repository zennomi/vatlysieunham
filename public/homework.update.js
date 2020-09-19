$(document).ready(function () {
    var socket = io();
    // Click when enter
    $('#student-filter').on('search', function() {
        console.log('aahaha');
        $('#student-table tbody tr.matchedElement')[0].click();
    })
    // Update
    let id;
    let updateInfo = { homeworkId: window.location.pathname.split('/')[3] };
    $("#student-table tbody tr").on('click', function () {
        $('#update-modal').modal('show');
        id = $(this).children('td:first').text();
        updateInfo.studentId = parseInt(id);

        let currentPoint = $(this).children('td:nth-child(3)').text();
        let currentNote = $(this).children('td:nth-child(4)').text();
        $('h5.modal-title').text(`Nhập điểm`);
        $('.modal-body p').text(`Học sinh ID ${id} - Tên: ${$(this).children('td:nth-child(2)').text()}`);
        $('#finish_count').val(currentPoint);
        $('#note').val(currentNote);
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
        //  Click and submit
    })
    $('#form-update').on('submit', function (e) {
        e.preventDefault();
        $('#update-modal').modal('hide');
        $("#student-table tbody tr")
            .filter(function () { return $(this).children('td:first').text() == id })
            .children('td:nth-child(3)')
            .text($('#finish_count').val());
        $("#student-table tbody tr")
            .filter(function () { return $(this).children('td:first').text() == id })
            .children('td:nth-child(4)')
            .text($('#note').val());
        updateInfo.finishCount = $('#finish_count').val();
        updateInfo.note = $('#note').val();
        socket.emit('update-homework', updateInfo);
    })
});