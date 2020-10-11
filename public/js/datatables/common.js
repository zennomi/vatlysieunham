// Call the dataTables jQuery plugin
$(document).ready(function () {
    let options = {
        "language": {
          "url": "//cdn.datatables.net/plug-ins/1.10.21/i18n/Vietnamese.json"
        },
        "pagingType": "full",
        "lengthMenu": [[10, 20, 50, -1], [10, 20, 50, "Đầy đủ"]],
        responsive: {
          details: {
            type: 'column',
            target: -1
          }
        },
        columnDefs: [{
          className: 'control',
          orderable: false,
          targets: -1
        }],
        "order": [[ 1, "desc" ]]
      }
    $('table.database-table').DataTable(options);
  });
  