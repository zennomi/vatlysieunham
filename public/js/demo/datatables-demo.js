// Call the dataTables jQuery plugin
$(document).ready(function () {
  $('#database-table').DataTable({
    "language": {
      "url": "//cdn.datatables.net/plug-ins/1.10.21/i18n/Vietnamese.json"
    },
    "pagingType": "full",
    "lengthMenu": [[20, 30, 50], [20, 30, 50]],
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
    }]
  });
});
