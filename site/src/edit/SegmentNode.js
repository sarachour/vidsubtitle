
// Perform a diff from s1 to s2.  Return an array representing the changes:
// insertions, removals, modifications.
function __sn_diff (s1, s2) {
    var l1 = s1.length + 1;
    var l2 = s2.length + 1;
    var a = [];
    var i, j;

    // Longest common subsequence.
    for (i = 0; i < l1; ++i) {
        a.push(new Array(l2));
    }
    for (i = 0; i < l1; ++i) a[i][0] = 0;
    for (i = 0; i < l2; ++i) a[0][i] = 0;
    for (i = 1; i < l1; ++i) {
        for (j = 1; j < l2; ++j) {
            if (s1.charAt(i - 1) == s2.charAt(j - 1)) {
                a[i][j] = a[i - 1][j - 1] + 1;
            } else {
                a[i][j] = Math.max(a[i][j - 1], a[i - 1][j]);
            }
        }
    }

    var diff = [];

    // Compute the diff.
    i = l1 - 1;
    j = l2 - 1;
    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && s1.charAt(i - 1) == s2.charAt(j - 1)) {
            diff.unshift(' ');
            --i;
            --j;
        } else if (j > 0 && (i == 0 || a[i][j - 1] >= a[i - 1][j])) {
            diff.unshift('+');
            --j;
        } else {
            diff.unshift('-');
            --i;
        }
    }

    // Simplify the diff.  Where +'s and -'s meet, use c to show a change
    // rather than an insertion or deletion.
    function fill (a, n, c) {
        if (n < 0) {
            for (var i = 0; i > n; --i) a.push('-');
        } else {
            for (var i = 0; i < n; ++i) a.push('+');
        }
    }

    var sdiff = [];
    var last = ' ';
    var count = 0;
    for (i = 0; i < diff.length; ++i) {
        if (diff[i] == ' ') {
            if (last != ' ') {
                fill(sdiff, count);
                count = 0;
            }
            sdiff.push(' ');
        } else {
            if (count >= 0 && diff[i] == '+') ++count;
            else if (count <= 0 && diff[i] == '-') --count;
            else {
                sdiff.push('c');
                if (count > 0) --count;
                else ++count;
            }
        }
        last = diff[i];
    }
    fill(sdiff, count);

    return sdiff;
}

// Take a diff array and apply formatting to the string to which it
// applies.  The direction parameter indicates whether insertions
// or removals should be shown.
function __sn_apply_diff (str, diff, direction) {
    var ret = [];
    var i, j;
    var last = ' ';

    i = 0;
    for (j = 0; j < diff.length; ++j) {
        if (diff[j] == ' ') {
            if (last == 'c' || last == direction) {
                ret.push('</span>');
            }
            ret.push(str.charAt(i));
            ++i;
        } else {
            if (last == ' ') {
                if (diff[j] == 'c') {
                    ret.push('<span class="modified">');
                    ret.push(str.charAt(i));
                    ++i;
                } else if (diff[j] == direction) {
                    if (direction == '+') {
                        ret.push('<span class="added">');
                    } else {
                        ret.push('<span class="removed">');
                    }
                    ret.push(str.charAt(i));
                    ++i;
                } // else ignore.
            } else {
                if (diff[j] == 'c' || diff[j] == direction) {
                    ret.push(str.charAt(i));
                    ++i;
                } else if (last == 'c' || last == direction) {
                    ret.push('</span>');
                } // else ignore.
            }
        }
        last = diff[j];
    }

    if (last == 'c' || last == direction) {
        ret.push('</span>');
    }

    // FIXME: Working here.
    return ret.join('');
}

function __sn_htmlify (str) {
    return str.replace("\n", "<br>");
}

// Generate an "inactive" version of the box.
function __sn_deactivate (edit_text) {
    if (edit_text) this.postedit = edit_text;

    var diff = __sn_diff(this.preedit, this.postedit);

    var html = '<div class="segment_counter">Segment ';
    html += this.index + ' of ' + this.total;
    html += '</div>';

    html += '<div class="preedit_box">'
    html += '<b>Original:</b><br>';
    html += __sn_htmlify(__sn_apply_diff(this.preedit, diff, '-'));
    html += '</div><div class="postedit_box">';
    html += '<b>Edit:</b><br>';
    html += __sn_htmlify(__sn_apply_diff(this.postedit, diff, '+'));
    html += '</div>';
    $('#' + this.id).html(html);

    $('#' + this.id).removeClass('active_box');
    $('#' + this.id).addClass('inactive_box');

    this.active = false;
}

// Generate an "active" version of the box that can take edits.
function __sn_activate () {
    var diff = __sn_diff(this.preedit, this.postedit);

    var html = '<div class="segment_counter">Segment ';
    html += this.index + ' of ' + this.total;
    html += '</div>';

    html += '<div class="preedit_box">'
    html += '<b>Original:</b><br>';
    html += __sn_htmlify(__sn_apply_diff(this.preedit, diff, '-'));
    html += '</div><div class="postedit_box">';
    html += '<b>Edit:</b><br>';
    html += '<textarea id="active_text">';
    html += this.postedit;
    html += '</textarea>';
    html += '</div>';
    $('#' + this.id).html(html);

    $('#' + this.id).removeClass('inactive_box');
    $('#' + this.id).addClass('active_box');
    $('#' + this.id)[0].scrollIntoView();

    $('#active_text').focus();

    this.active = true;
}

// SegmentNode contains info about itself in relation to other nodes, and
// has info about the edit.
function SegmentNode (id, segment, prev, total) {
    this.index = id + 1;
    this.total = total;
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
