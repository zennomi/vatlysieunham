function filterTable() {
    let nowTime = new Date();
    let startTime = $('#start-time').val() || '2020-06';
    let endTime = $('#end-time').val() || nowTime.toISOString().slice(0,10);
    $("#table-sort tbody tr").filter(function () {
        $(this).toggle($(this).data('date') >= startTime && $(this).data('date') <= endTime);
      });
}

$('#start-time').on('change', filterTable);
$('#end-time').on('change', filterTable);
