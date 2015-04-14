
// Sample segments.
var test_segments = [{start: 2, end: 17, text: "[fone ringing]"},
                     {start: 18, end: 20, text: "Yo not paying attension"},
                     {start: 20, end: 23, text: "I just want to anser the fone!"},
                     {start: 23, end: 31, text: "Emo, look.  I mean listen.  Yo hav to learn too listen."},
                     {start: 31, end: 38, text: "Thi sis not some game.  You i mean we could die out her.  Listen"},
                     {start: 40, end: 43, text: "Listen to the sounds of the machine."}
                    ];

var input_segments = test_segments;
var active_segment = null;

function click_edit_segment (seg) {
    return function (event) {
        if (seg.active) {
            // Already active -- do nothing.
            return;
        }
        if (active_segment != null) {
            active_segment.deactivate($('#active_text').val());
        }
        active_segment = seg;
        seg.activate();
    }
}

var video;
$("document").ready(function() {
    video = new YoutubeVideo("player1");
    console.log("created video");
    video.listen('load', function(evt){
      var vid = evt.obj;
      /*
      console.log("updating", evt);
      vid.load("https://www.youtube.com/watch?v=kE75vRV9tos");
      
      vid.listen('ready', function(e){
        e.obj.segment(55, 59);
        e.obj.play();
      },'autoplay');
      */
    }, "load-video");

    // Get the correct width for the floating segment.
    $('#floating_panel').width($('#left_pane').width());

    // Add each segment to the container region.
    var prev = null;
    for (var i = 0; i < input_segments.length; ++i) {
        var seg = new SegmentNode(i, input_segments[i], prev);

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

        prev = seg;
    }
});
