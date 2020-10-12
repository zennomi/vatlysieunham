$(document).ready(function () {
    var socket = io();
    let id;
    let updateInfo = { recordId: $('#_id').val() };
    // Click when enter
    $('#student-filter').on('search', function() {
        $('#student-table tbody tr.matchedElement')[0].click();
        $(this).val('');
        $('html, body').animate({
            scrollTop: $("#update-modal").offset().top
        }, 2000);
    });
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
        let finish_count = $(this).find('#finish_count-add').val();

        if (finish_count && finish_count > Number($('#total').val())) {
            alert(`Điểm lớn hơn thang điểm (${finish_count} > ${$('#total').val()})`);
            $(this).find('#finish_count-add').trigger('focus');
            $(this).find('#finish_count-add').trigger('select');
            return;
        }
        
        updateInfo.note = note;
        updateInfo.finish_count = finish_count ? Number(finish_count) : '';
        $(this).find('input').val('');
        fetch('/api/students/'+updateInfo.studentId)
            .then(res => res.json())
            .then(student => {
                if (!student) {
                    alert(`Hông thấy học sinh có ID ${updateInfo.studentId}.`);
                    return;
                }
                $('#student-table tbody').append(`<tr><td>${updateInfo.studentId}</td><td>${student.name}</td><td>${updateInfo.finish_count}</td><td>${updateInfo.note}</td></tr>`)
                updateModal();
            });
        socket.emit('update-record', updateInfo);
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
            .text($('#finish_count').val());
        $("#student-table tbody tr")
            .filter(function () { return $(this).children('td:first').text() == id })
            .children('td:nth-child(4)')
            .text($('#note').val());
        updateInfo.finish_count = $('#finish_count').val();
        updateInfo.note = $('#note').val();
        updateInfo.method = 'update';
        socket.emit('update-record', updateInfo);
    });
    // Remove
    $('#remove').on('click', function () {
        if (confirm('Xóa HS này khỏi bảng điểm?')) {
            $("#student-table tbody tr")
                .filter(function () { return $(this).children('td:first').text() == id })
                .remove();
            updateInfo.studentId = id;
            updateInfo.method = 'remove';
            socket.emit('update-record', updateInfo);
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
        })
    }
});

