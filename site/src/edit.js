
// Sample segments.
var sample_json = '{"data":[{"start": 2, "end": 17, "text": "[fone ringing]"},{"start": 17, "end": 20, "text": "Yo not paying attension"},{"start": 20, "end": 23, "text": "I just want to anser the fone!"},{"start": 23, "end": 31, "text": "Emo, look.  I mean listen.  Yo hav to learn too listen."},{"start": 31, "end": 40, "text": "Thi sis not some game.  You i mean we could die out her.  Listen"},{"start": 40, "end": 44, "text": "Listen to the sounds of the machine."}],"url": "media/vid1.webm"}';

var changed_start_to_next = false;
var active_segment = null;
var first_seg = null;
var last_seg = null;
var seg_count = 0;
var video;
var tha_data;

function disable_button (btn, disabled_p) {
    if (disabled_p) {
        btn.addClass('inactive_btn');
    } else {
        btn.removeClass('inactive_btn');
    }
}

function load (input_obj) {
    tha_data = input_obj;

    // Reset the current state.
    first_seg = last_seg = active_segment = null;
    $('#edit_content').html('');
    $('#player1').attr('src', input_obj.url);

    // Create the new state.
    seg_count = input_obj.data.length;

    // Add each segment to the container region.
    var prev = null;
    for (var i = 0; i < seg_count; ++i) {
        var seg = new SegmentNode(i, input_obj.data[i], prev, seg_count);

        // Make the box for this segment.
        var segment_box = '<div '
            + 'id="segment_id_' + i + '" '
            + 'class="segment_box active_box" '
            + '>';
        segment_box += '</div>';

        $('#edit_content').append(segment_box);
        // Start all boxes as inactive.
        seg.deactivate(null);

        // Set a function on this box that associates it with its node.
        $('#segment_id_' + i).click(click_edit_segment(seg));
        if (first_seg == null) first_seg = seg;
        prev = seg;
    }
    last_seg = prev;
}

function save_data () {
    // Save existing work.
    if (active_segment) {
        active_segment.deactivate($('#active_text').val());
        disable_button($('#replay_button'), true);
        disable_button($('#prev_button'), true);
    }

    // Build an object with the data we want to save.
    var data = [];
    var node;
    for (node = first_seg; node != null; node = node.next) {
        data.push({ start: node.start,
                    end: node.end,
                    old: { speaker: node.preedit},
                    caption: { speaker: node.postedit }
                  });
    }

    var url = $('#player1').prop('src');
    var obj = { data: data,
                url: url };

    // Store the object in local cache.
    var user_cookie = new UserCookie();
    user_cookie.cache('edit', obj);
    return obj;
}

function preview_redirect () {
    var data = save_data();
    var nav = new Navigator();
    var purl = nav.portal('edit', 'preview', data);
    nav.redirect(purl);
}

function confirm_done () {
    $('#prompt').fadeIn();
}

function setup_segment (seg) {
    // Set the video segment to play.  When the segment completes, it will
    // come back around to the beginning of the segment.
    function looper (self) {
        video.segment(seg.start, seg.end, self);
    }
    video.segment(seg.start, seg.end, function () {
        looper(looper);
    });
}

function click_edit_segment (seg) {
    return function (event) {
        // Change the Start button to a Next button if it hasn't already
        // been changed.
        if (!changed_start_to_next) {
            changed_start_to_next = true;
            $('.hotkey.title').each(function (idx, obj) {
                if ('Start' == obj.innerHTML) {
                    obj.innerHTML = 'Next';
                }
            });
        }

        if (seg.active) {
            // Already active -- do nothing.
            return;
        }

        if (active_segment != null) {
            active_segment.deactivate($('#active_text').val());
        }
        active_segment = seg;
        seg.activate();

        // Enable/disable navigation buttons.
        disable_button($('#prev_button'), active_segment == first_seg);
        disable_button($('#next_button'), active_segment == last_seg);
        disable_button($('#replay_button'), false);

        setup_segment(seg);
        video.play();
    }
}

// Move activity to the next segment in the list, if there is one.
function go_next_segment () {
    var next_segment = active_segment == null ?
        first_seg : active_segment.next;

    if (next_segment != null) {
        $('#' + next_segment.id).click();
    } else {
        confirm_done();
    }
}

// Move activity to the previous segment in the list, if there is one.
function go_prev_segment () {
    if (active_segment != null && active_segment.prev != null) {
        $('#' + active_segment.prev.id).click()
    }
}

// Return to the beginning of the current segment and start playing it.
function replay_segment () {
    if (active_segment) {
        setup_segment(active_segment);
        video.play();
    }
}

$("document").ready(function() {
    var user_cookie = new UserCookie();
    var args = user_cookie.cache();

    console.log(args);
    if (isValue(args.data)) {
        data = args.data;
    } else {
        data = JSON.parse(sample_json);
    }

    load(data);
    video = new YoutubeVideo("player1");

    $(window).bind('beforeunload', function () {
        save_data();
    });

    // Get the correct width for the floating segment.
    $('#floating_panel').width($('#left_pane').width());

    // Register button clicks.
    $('#next_button').click(go_next_segment);
    $('#prev_button').click(go_prev_segment);
    $('#replay_button').click(replay_segment);
    $('#done_button').click(preview_redirect);

    disable_button($('#replay_button'), true);
    disable_button($('#prev_button'), true);

    $('.preview').click(preview_redirect);
    $('.cancel').click(function () { $('#prompt').fadeOut(); });
});
