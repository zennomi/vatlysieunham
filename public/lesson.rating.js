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
    $('input[name="rating"]').on('change', function () {
        console.log('Loo')
    })
});