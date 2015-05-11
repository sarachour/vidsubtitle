function go_next (i) {
    return function (event) {
        $('#i' + i).hide();
        $('#i' + (i + 1)).show();
    }
}

function click_done () {
    alert("Done");
}

$("document").ready(function() {
    // Assign buttons.
    $('#btn-i1-next').click(go_next(1));
    $('#btn-i2-next').click(go_next(2));
    $('.btn-skip').click(click_done);

    $('#i2').hide();
    $('#i3').hide();
});

