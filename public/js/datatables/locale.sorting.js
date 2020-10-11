jQuery.extend(jQuery.fn.dataTableExt.oSort, {
    "vn-str-asc": function (a,b) {
        return a.localeCompare(b);
    },
    "vn-str-desc": function (a,b) {
        return b.localeCompare(a);
    }
})