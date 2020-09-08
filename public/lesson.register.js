$(document).ready(function () {
    $('#search-card').focusin(function() {
        $('#search-note').show();
    });
    $('#search-card').focusout(function() {
            $('#search-note').hide();
    });
    $('#id-card').focusin(function() {
        $('#matched-student').html('');
        $('#id-note').show();
    });
    $('#id-card').focusout(function() {
        setTimeout(() => {
            $('#id-note').hide();
        }, 100);
        let id = $('#id').val();
        if (id !== '') {
            fetch('/api/students/'+id)
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                if (data) {
                    $('#matched-student').removeClass('alert alert-danger');
                    $('#matched-student').html(`Học sinh <b>${data.name}</b> lớp ${data.classroom.name}.`);
                } else {
                    $('#matched-student').addClass('alert alert-danger');
                    $('#matched-student').html(`Không tìm thấy học sinh có ID ${id}.`);
                }
            })
        }
    });
    $('div#time-card').focusin(function() {
        $(this).closest('.card-body').children('#time-note').show();
    });
    $('div#time-card').focusout(function() {
        $(this).closest('.card-body').children('#time-note').hide();
    });
    $('div#topic-card').focusin(function() {
        $(this).closest('.card-body').children('#topic-note').show();
    });
    $('div#topic-card').focusout(function() {
        $(this).closest('.card-body').children('#topic-note').hide();
    });
    $('#comment-card').focusin(function() {
        $('#comment-note').show();
    });
    $('#comment-card').focusout(function() {
            $('#comment-note').hide();
    });
    $('input[type="checkbox"]').on('click', function() {
        if (this.checked == true) {
            $(this).closest('.card').find('.card-body').show();
            $(this).closest('.card').find('input[type="time"]').first().focus();
        } else {
            $(this).closest('.card').find('.card-body').hide();
            $(this).closest('.card').find('input').val('');
        }
    })
});
