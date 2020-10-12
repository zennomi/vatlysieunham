$(document).ready(function () {
    $('#rating').on('change', function () {
        let value = $(this).val();
        $('input[name="rating"]').val(value);
        $('input[name="rating"]').css('color', 'white');
        if (value >= 8) {
            $('input[name="rating"]').css('background', '#A2C96B');
        } else if (value >= 6) {
            $('input[name="rating"]').css('background', '#8DC7BD');
        } else if (value >= 4) {
            $('input[name="rating"]').css('background', '#EFB575');
        } else {
            $('input[name="rating"]').css('background', '#E58D7B');
        }
    })
    $('input[name="rating"]').on('keyup', function () {
        $('#rating').val($(this).val());
        let value = $(this).val();
        $(this).css('color', 'white');
        if (value >= 8) {
            $(this).css('background', '#A2C96B');
        } else if (value >= 6) {
            $(this).css('background', '#8DC7BD');
        } else if (value >= 4) {
            $(this).css('background', '#EFB575');
        } else {
            $(this).css('background', '#E58D7B');
        }
    })
});