function go_next (i, j) {
    return function (event) {
        $('#i' + i).hide();
        $('#i' + j).show();
    }
}

function click_done () {
    alert("Done");
}

$("document").ready(function() {
    // Assign buttons.
    $('#btn-i1-next').click(go_next(1, 2));
    $('#btn-i2-next').click(go_next(2, 3));
    $('#btn-i3-next').click(go_next(3, 1));
    $('.btn-skip').click(click_done);

    $('#i2').hide();
    $('#i3').hide();
});

