$(function () {
    //     var socket = io();
    //     $('input#n').keyup(() => {
    //         if ($('input#n').val().length > 3) {
    //             socket.emit('quick search', $('#n').val());
    //             return false;
    //         }
    //     })
    //     socket.on('quick search', function (students) {
    //         if (students.length > 0) {
    //             $('a#list-student').remove();
    //             $('.alert.alert-danger').hide();
    //             students.forEach((student) => {
    //                 let liEle = document.createElement("a");
    //                 liEle.innerText = student.classroom.name + '/' + student.name;
    //                 liEle.setAttribute("id", "list-student");
    //                 liEle.classList.add('list-group-item');
    //                 liEle.classList.add('list-group-item-action');
    //                 liEle.onclick = () => {
    //                     $('input#id').val(student.id);
    //                     $('a#list-student').hide();
    //                     liEle.style.display = 'block';
    //                 }
    //                 $('#list-students').append(liEle);
    //             })
    //         }
    //         else {
    //             $('.alert.alert-danger').show();
    //         }
    // //        window.scrollTo(0, document.body.scrollHeight);
    //     });
    $('input#n').keyup(() => {
        if ($('input#n').val().length > 3) {
            fetch('/api/students/search?name=' + $('input#n').val())
                .then(res => res.json())
                .then(students => {
                    if (students.length > 0) {
                        $('a#list-student').remove();
                        $('.alert.alert-danger').hide();
                        students.forEach((student) => {
                            let liEle = document.createElement("a");
                            liEle.innerText =  student.name + ' - ' + student.classroom.name + ' - ID: ' + student.id;
                            liEle.setAttribute("id", "list-student");
                            liEle.setAttribute("style", "cursor: pointer");
                            liEle.classList.add('list-group-item');
                            liEle.classList.add('list-group-item-action');
                            liEle.onclick = () => {
                                $('input#id').val(student.id);
                                $('a#list-student').hide();
                                liEle.style.display = 'block';
                            }
                            $('#list-students').append(liEle);
                        })
                    }
                    else {
                        $('.alert.alert-danger').show();
                    }
                })
        }
    })
});