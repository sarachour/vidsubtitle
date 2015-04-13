
// Generate an "inactive" version of the box.
function __sn_deactivate (edit_text) {
    if (edit_text) this.postedit = edit_text;

    var html = '<div class="preedit_box">'
    html += this.preedit;
    html += '</div><div class="postedit_box">'
    html += this.postedit;
    html += '</div>';
    $('#' + this.id).html(html);

    $('#' + this.id).removeClass('active_box');
    $('#' + this.id).addClass('inactive_box');

    this.active = false;
}

// Generate an "active" version of the box that can take edits.
function __sn_activate () {
    var html = '<div class="preedit_box">'
    html += this.preedit;
    html += '</div><div class="postedit_box">'
    html += '<textarea id="active_text">'
    html += this.postedit;
    html += '</textarea>';
    html += '</div>';
    $('#' + this.id).html(html);

    $('#' + this.id).removeClass('inactive_box');
    $('#' + this.id).addClass('active_box');

    $('#active_text').focus();

    this.active = true;
}

// SegmentNode contains info about itself in relation to other nodes, and
// has info about the edit.
function SegmentNode (id, segment, prev) {
    this.id = 'segment_id_' + id;
    this.start = segment.start;
    this.end = segment.end;
    this.preedit = segment.text;
    this.postedit = segment.text;
    this.prev = prev;
    this.next = null;
    if (prev) { prev.next = this; }

    this.active = true; // Programmer should deactivate all segment nodes
                        // before editing.

    // Methods.
    this.deactivate = __sn_deactivate;
    this.activate = __sn_activate;
}
