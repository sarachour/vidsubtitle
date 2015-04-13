
// Sample segments.
var test_segments = [{start: 2, end: 17, text: "[fone ringing]"},
                     {start: 18, end: 20, text: "Yo not paying attension"},
                     {start: 20, end: 23, text: "I just want to anser the fone!"},
                     {start: 23, end: 31, text: "Emo, look.  I mean listen.  Yo hav to learn too listen."},
                     {start: 31, end: 38, text: "Thi sis not some game.  You i mean we could die out her.  Listen"},
                     {start: 40, end: 43, text: "Listen to the sounds of the machine."}
                    ];

var edit_segments = test_segments;

// SegmentNode contains info about itself in relation to other nodes, and
// has info about the edit.
function SegmentNode (segment, prev) {
    this.start = segment.start;
    this.end = segment.end;
    this.preedit = segment.text;
    this.postedit = segment.text;
    this.prev = prev;
    this.next = null;
    if (prev) { prev.next = this; }
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

    // Add each segment to the container region.
    var prev = null;
    for (var i = 0; i < edit_segments.length; ++i) {
        var seg = new SegmentNode(edit_segments[i], prev);

        // Make the box for this segment.
        var segment_box = '<div '
            + 'class="segment_box" '
            + '>';
        segment_box += '<div class="preedit_box">'
        segment_box += seg.preedit;
        segment_box += '</div><div class="postedit_box">'
        segment_box += seg.postedit;
        segment_box += '</div></div>';

        $('#edit_content').append(segment_box);

        prev = seg;
    }
});
