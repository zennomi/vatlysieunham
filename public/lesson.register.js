$(document).ready(function () {
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
    $('#time-card').focusin(function() {
        $('#time-note').show();
    });
    $('#time-card').focusout(function() {
            $('#time-note').hide();
    });
    $('#topic-card').focusin(function() {
        $('#topic-note').show();
    });
    $('#topic-card').focusout(function() {
            $('#topic-note').hide();
    });
    $('#comment-card').focusin(function() {
        $('#comment-note').show();
    });
    $('#comment-card').focusout(function() {
            $('#comment-note').hide();
    });
});