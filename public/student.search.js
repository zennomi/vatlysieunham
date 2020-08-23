$(function () {
    var socket = io();
/*     $('form#quick-search').submit(function () {
        socket.emit('quick search', $('#n').val());
        return false;
    }); */
    $('input#n').keyup(() => {
        if ($('input#n').val().length > 3) {
            socket.emit('quick search', $('#n').val());
            return false;
        }
    })
    socket.on('quick search', function (students) {
        if (students.length > 0) {
            $('a#list-student').remove();
            students.forEach((student) => {
                $('.alert.alert-danger').hide();
                let liEle = document.createElement("a");
                liEle.innerText = student.classroom.name + '/' + student.name;
                liEle.setAttribute("id", "list-student");
                liEle.classList.add('list-group-item');
                liEle.classList.add('list-group-item-action');
                liEle.onclick = () => {
                    $('input#id').val(student.id);
                    $('a#list-student').remove();
                }
                $('#list-students').append(liEle);
            })
        }
        else {
            $('.alert.alert-danger').show();
        }
//        window.scrollTo(0, document.body.scrollHeight);
    });
});