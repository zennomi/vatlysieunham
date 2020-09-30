$(document).ready(function () {
    var socket = io();
    let id;
    let updateInfo = { testId: window.location.pathname.split('/')[3] };
    // Add student to table
    $('#form-add-student').on('submit', function (e) {
        e.preventDefault();
        let idArr = Array.from(document.querySelectorAll('#student-table tbody tr td:first-child'));
        idArr = idArr.map(td => parseInt(td.innerText));
        updateInfo.method = 'add';
        updateInfo.studentId = parseInt($(this).find('#id').val());
        
        if (idArr.indexOf(updateInfo.studentId) > -1) {
            alert(`Tồn tại học sinh có ID ${updateInfo.studentId} trong bảng.`);
            $(this).find('#id').trigger('focus');
            $(this).find('#id').trigger('select');
            return;
        };

        let note = $(this).find('#note-add').val();
        let mark = $(this).find('#mark-add').val();

        if (mark && mark > $('#total').val()) {
            alert(`Điểm lớn hơn thang điểm (${mark} > ${$('#total').val()})`);
            $(this).find('#mark-add').trigger('focus');
            $(this).find('#mark-add').trigger('select');
            return;
        }
        
        updateInfo.note = note;
        updateInfo.mark = mark ? Number(mark) : '';
        $(this).find('input').val('');
        fetch('/api/students/'+updateInfo.studentId)
            .then(res => res.json())
            .then(student => {
                if (!student) {
                    alert(`Hông thấy học sinh có ID ${updateInfo.studentId}.`);
                    return;
                }
                $('#student-table tbody').append(`<tr><td>${updateInfo.studentId}</td><td>${student.name}</td><td>${updateInfo.mark}</td><td>${updateInfo.note}</td></tr>`)
                updateModal();
            });
        socket.emit('update-test', updateInfo);
    });

    // Update
    updateModal();
    //  Click and submit
    $('#form-update').on('submit', function (e) {
        e.preventDefault();
        $('#update-modal').modal('hide');
        $("#student-table tbody tr")
            .filter(function () { return $(this).children('td:first').text() == id })
            .children('td:nth-child(3)')
            .text($('#mark').val());
        $("#student-table tbody tr")
            .filter(function () { return $(this).children('td:first').text() == id })
            .children('td:nth-child(4)')
            .text($('#note').val());
        updateInfo.mark = $('#mark').val();
        updateInfo.note = $('#note').val();
        updateInfo.method = 'update';
        socket.emit('update-test', updateInfo);
    });
    // Remove
    $('#remove').on('click', function () {
        if (confirm('Xóa HS này khỏi bảng điểm?')) {
            $("#student-table tbody tr")
                .filter(function () { return $(this).children('td:first').text() == id })
                .remove();
            updateInfo.studentId = id;
            updateInfo.method = 'remove';
            socket.emit('update-test', updateInfo);
        }
    });

    function updateModal() {
        $("#student-table tbody tr").on('click', function () {
            $('#update-modal').modal('show');
            id = $(this).children('td:first').text();
            updateInfo.studentId = parseInt(id);
    
            let currentPoint = $(this).children('td:nth-child(3)').text();
            let currentNote = $(this).children('td:nth-child(4)').text();
            $('h5.modal-title').text(`Nhập điểm`);
            $('.modal-body p').text(`Học sinh ID ${id} - Tên: ${$(this).children('td:nth-child(2)').text()}`);
            $('#mark').val(currentPoint);
            $('#note').val(currentNote);
            $('#update-modal').on('shown.bs.modal', function () {
                $('#mark').trigger('focus');
                $('#mark').trigger('select');
            });
            $('#mark').on('keyup', function () {
                if ($('#mark').val() == '') {
                    $('#validate').hide();
                    $('#submit-update').prop('disabled', false);
                    $('#mark').addClass('is-valid');
                    return;
                }
                if (parseInt($('#mark').val()) > $('#total').val()) {
                    $('#validate').show();
                    $('#validate').text('Vượt quá tổng số BTVN.');
                    $('#submit-update').prop('disabled', true);
                    $('#mark').removeClass('is-valid');
                } else {
                    $('#validate').hide();
                    $('#submit-update').prop('disabled', false);
                    $('#mark').addClass('is-valid')
                }
            });
        })
    }
});

