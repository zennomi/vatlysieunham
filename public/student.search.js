$(function () {
    var socket = io();
    $('form').submit(function () {
        socket.emit('quick search', $('#n').val());
        return false;
    });
    socket.on('quick search', function (students) {
        if (students.length > 0) {
            $('div#list-students').html('');
            students.forEach((student) => {
                let liEle = document.createElement("div");
                liEle.innerText = student.classroom.name + '/' + student.name;
                liEle.setAttribute("id", "list-student");
                liEle.classList.add('dropdown-item');
                liEle.onclick = () => {
                    $('input#id').val(student.id);
                    $('div#list-student').hide();
                }
                $('div#list-students').append(liEle);
            })
        }
        else {
            $('div#list-students').html('<div class="alert alert-danger" role="alert">Không có kết quả :((</div>');
        }
//        window.scrollTo(0, document.body.scrollHeight);
    });
});