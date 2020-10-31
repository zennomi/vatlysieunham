// Call the dataTables jQuery plugin
$(document).ready(function () {
    let options = {
        "language": {
          "url": "//cdn.datatables.net/plug-ins/1.10.21/i18n/Vietnamese.json"
        },
        "pagingType": "full",
        "lengthMenu": [[30, 50, -1], [30, 50, "Đầy đủ"]],
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
        dom: 'Bfrtip',
        buttons: [
            {
                extend: 'pageLength',
                className: 'btn btn-primary'
            },
            {
                extend: 'copyHtml5',
                className: 'btn btn-primary',
                text: '<i class="fas fa-copy"></i> Copy'
            },
            {
                extend: 'excelHtml5',
                className: 'btn btn-primary',
                text: '<i class="fas fa-file-excel"></i> File Excel'
            }
        ]
      }
    $('table.student-table')
        .DataTable(options)
        .button().container().appendTo( '.col-md-6:eq(0)' );;
  });
  