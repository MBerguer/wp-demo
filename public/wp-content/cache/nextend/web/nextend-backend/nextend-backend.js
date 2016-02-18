/*
 json2.js
 2012-10-08

 Public Domain.

 NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

 See http://www.JSON.org/js.html


 This code should be minified before deployment.
 See http://javascript.crockford.com/jsmin.html

 USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
 NOT CONTROL.


 This file creates a global JSON object containing two methods: stringify
 and parse.

 JSON.stringify(value, replacer, space)
 value       any JavaScript value, usually an object or array.

 replacer    an optional parameter that determines how object
 values are stringified for objects. It can be a
 function or an array of strings.

 space       an optional parameter that specifies the indentation
 of nested structures. If it is omitted, the text will
 be packed without extra whitespace. If it is a number,
 it will specify the number of spaces to indent at each
 level. If it is a string (such as '\t' or '&nbsp;'),
 it contains the characters used to indent at each level.

 This method produces a JSON text from a JavaScript value.

 When an object value is found, if the object contains a toJSON
 method, its toJSON method will be called and the result will be
 stringified. A toJSON method does not serialize: it returns the
 value represented by the name/value pair that should be serialized,
 or undefined if nothing should be serialized. The toJSON method
 will be passed the key associated with the value, and this will be
 bound to the value

 For example, this would serialize Dates as ISO strings.

 Date.prototype.toJSON = function (key) {
 function f(n) {
 // Format integers to have at least two digits.
 return n < 10 ? '0' + n : n;
 }

 return this.getUTCFullYear()   + '-' +
 f(this.getUTCMonth() + 1) + '-' +
 f(this.getUTCDate())      + 'T' +
 f(this.getUTCHours())     + ':' +
 f(this.getUTCMinutes())   + ':' +
 f(this.getUTCSeconds())   + 'Z';
 };

 You can provide an optional replacer method. It will be passed the
 key and value of each member, with this bound to the containing
 object. The value that is returned from your method will be
 serialized. If your method returns undefined, then the member will
 be excluded from the serialization.

 If the replacer parameter is an array of strings, then it will be
 used to select the members to be serialized. It filters the results
 such that only members with keys listed in the replacer array are
 stringified.

 Values that do not have JSON representations, such as undefined or
 functions, will not be serialized. Such values in objects will be
 dropped; in arrays they will be replaced with null. You can use
 a replacer function to replace those with JSON values.
 JSON.stringify(undefined) returns undefined.

 The optional space parameter produces a stringification of the
 value that is filled with line breaks and indentation to make it
 easier to read.

 If the space parameter is a non-empty string, then that string will
 be used for indentation. If the space parameter is a number, then
 the indentation will be that many spaces.

 Example:

 text = JSON.stringify(['e', {pluribus: 'unum'}]);
 // text is '["e",{"pluribus":"unum"}]'


 text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
 // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

 text = JSON.stringify([new Date()], function (key, value) {
 return this[key] instanceof Date ?
 'Date(' + this[key] + ')' : value;
 });
 // text is '["Date(---current time---)"]'


 JSON.parse(text, reviver)
 This method parses a JSON text to produce an object or array.
 It can throw a SyntaxError exception.

 The optional reviver parameter is a function that can filter and
 transform the results. It receives each of the keys and values,
 and its return value is used instead of the original value.
 If it returns what it received, then the structure is not modified.
 If it returns undefined then the member is deleted.

 Example:

 // Parse the text. Values that look like ISO date strings will
 // be converted to Date objects.

 myData = JSON.parse(text, function (key, value) {
 var a;
 if (typeof value === 'string') {
 a =
 /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
 if (a) {
 return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
 +a[5], +a[6]));
 }
 }
 return value;
 });

 myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
 var d;
 if (typeof value === 'string' &&
 value.slice(0, 5) === 'Date(' &&
 value.slice(-1) === ')') {
 d = new Date(value.slice(5, -1));
 if (d) {
 return d;
 }
 }
 return value;
 });


 This is a reference implementation. You are free to copy, modify, or
 redistribute.
 */

/*jslint evil: true, regexp: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
 call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
 getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
 lastIndex, length, parse, prototype, push, replace, slice, stringify,
 test, toJSON, toString, valueOf
 */


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (typeof JSON !== 'object') {
    JSON = {};
}

(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear() + '-' +
                f(this.getUTCMonth() + 1) + '-' +
                f(this.getUTCDate()) + 'T' +
                f(this.getUTCHours()) + ':' +
                f(this.getUTCMinutes()) + ':' +
                f(this.getUTCSeconds()) + 'Z'
                : null;
        };

        String.prototype.toJSON =
            Number.prototype.toJSON =
                Boolean.prototype.toJSON = function (key) {
                    return this.valueOf();
                };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"': '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
            typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
            case 'string':
                return quote(value);

            case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

                return isFinite(value) ? String(value) : 'null';

            case 'boolean':
            case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

                return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

            case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

                if (!value) {
                    return 'null';
                }

// Make an array to hold the partial results of stringifying this object value.

                gap += indent;
                partial = [];

// Is the value an array?

                if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                    v = partial.length === 0
                        ? '[]'
                        : gap
                        ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                        : '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }

// If the replacer is an array, use it to select the members to be stringified.

                if (rep && typeof rep === 'object') {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        if (typeof rep[i] === 'string') {
                            k = rep[i];
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                } else {

// Otherwise, iterate through all of the keys in the object.

                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

                v = partial.length === 0
                    ? '{}'
                    : gap
                    ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                    : '{' + partial.join(',') + '}';
                gap = mind;
                return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                    .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                    .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());

n2.extend(window.nextend, {
    fontManager: null,
    styleManager: null,
    notificationCenter: null,
    animationManager: null,
    browse: null,
    askToSave: true,
    cancel: function (url) {
        nextend.askToSave = false;
        window.location.href = url;
        return false;
    },
    isWordpress: false,
    isJoomla: false,
    isMagento: false,
    isHTML: false
});

window.n2_ = function (text) {
    if (typeof nextend.localization[text] !== 'undefined') {
        return nextend.localization[text];
    }
    return text;
};

window.n2_printf = function (text) {
    var args = arguments;
    var index = 1;
    return text.replace(/%s/g, function () {
        return args[index++];
    });
};

/**
 * Help us to track when the user loaded the page
 */
window.nextendtime = n2.now();

/*
 * Moves an element with the page scroll to be in a special position
 */
(function ($) {

    nextend.rtl = {
        isRtl: false,
        marginLeft: 'marginLeft',
        marginRight: 'marginRight',
        left: 'left',
        right: 'right'
    };

    var isRtl = false,
        initRtl = function () {
            if ($('html').attr('dir') == 'rtl') {
                isRtl = true;
                nextend.rtl = {
                    isRtl: true,
                    marginLeft: 'marginRight',
                    marginRight: 'marginLeft',
                    left: 'right',
                    right: 'left'
                };
            }
        };

    nextend.isRTL = function () {
        return isRtl;
    };

    nextend.ready(initRtl);

    var elems = [],
        sidename = {
            left: 'left',
            right: 'right'
        };

    function rtl() {
        sidename = {
            left: 'right',
            right: 'left'
        };
    }

    function ltr() {
        sidename = {
            left: 'left',
            right: 'right'
        };
    }

    function getOffset($el, side) {
        var offset = 0;
        if (side == sidename.right) {
            offset = ($(window).width() - ($el.offset().left + $el.outerWidth()));
        } else {
            offset = $el.offset().left;
        }
        if (offset < 0)
            return 0;
        return offset;
    }

    $('html').on('changedir', function (e, dir) {
        for (var i = 0; i < elems.length; i++) {
            elems[i][0].css(sidename[elems[i][2]], 'auto');
        }
        if (dir === 'rtl') {
            rtl();
        } else {
            ltr();
        }
        $(document).trigger('scroll');
    });

    var scrollAdjustment = 0;

    nextend.ready(function () {
        var topBarHeight = $('#wpadminbar, .navbar-fixed-top').height();
        if (topBarHeight) {
            scrollAdjustment += topBarHeight;
        }
        $(document).trigger('scroll');
    });

    $(document).on('scroll', function () {
        var scrolltop = $(document).scrollTop() + scrollAdjustment;
        for (var i = 0; i < elems.length; i++) {
            if (elems[i][1] > scrolltop) {
                elems[i][0].removeClass('n2-static');
            } else {
                elems[i][0].addClass('n2-static');
                elems[i][0].css(sidename[elems[i][2]], elems[i][3]);
            }
        }
    });

    $(window).on('resize', function () {
        for (var i = 0; i < elems.length; i++) {
            elems[i][1] = elems[i][0].parent().offset().top;
            elems[i][3] = getOffset(elems[i][0].parent(), elems[i][2]);
        }
        $(document).trigger('scroll');
    });

    $.fn.staticonscroll = function (side) {
        this.each(function () {
            var $el = $(this);
            elems.push([$el, $el.parent().offset().top, side, getOffset($el.parent(), side)]);
        });
        $(document).trigger('scroll');
    };
})(n2);

(function ($) {

    var NextendAjaxHelper = {
            query: {}
        },
        loader = null;

    NextendAjaxHelper.addAjaxLoader = function () {
        loader = $('<div class="n2-loader-overlay"><div class="n2-loader"></div></div>')
            .appendTo('body');
    };

    NextendAjaxHelper.addAjaxArray = function (parts) {
        for (var k in parts) {
            NextendAjaxHelper.query[k] = parts[k];
        }
    };

    NextendAjaxHelper.makeAjaxQuery = function (queryArray, isAjax) {
        if (isAjax) {
            queryArray['mode'] = 'ajax';
            queryArray['nextendajax'] = '1';
        }
        for (var k in NextendAjaxHelper.query) {
            queryArray[k] = NextendAjaxHelper.query[k];
        }
        return N2QueryString.stringify(queryArray);
    };

    NextendAjaxHelper.makeAjaxUrl = function (url, queries) {
        var urlParts = url.split("?");
        if (urlParts.length < 2) {
            urlParts[1] = '';
        }
        var parsed = N2QueryString.parse(urlParts[1]);
        if (typeof queries != 'undefined') {
            for (var k in queries) {
                parsed[k] = queries[k];
            }
        }
        return urlParts[0] + '?' + NextendAjaxHelper.makeAjaxQuery(parsed, true);
    };

    NextendAjaxHelper.makeFallbackUrl = function (url, queries) {
        var urlParts = url.split("?");
        if (urlParts.length < 2) {
            urlParts[1] = '';
        }
        var parsed = N2QueryString.parse(urlParts[1]);
        if (typeof queries != 'undefined') {
            for (var k in queries) {
                parsed[k] = queries[k];
            }
        }
        return urlParts[0] + '?' + NextendAjaxHelper.makeAjaxQuery(parsed, false);
    };

    NextendAjaxHelper.ajax = function (ajax) {
        NextendAjaxHelper.startLoading();
        return $.ajax(ajax).always(function (response, status) {
            NextendAjaxHelper.stopLoading();
            try {

                if (status != 'success') {
                    response = JSON.parse(response.responseText);
                }
                if (typeof response.redirect != 'undefined') {
                    NextendAjaxHelper.startLoading();
                    window.location.href = response.redirect;
                    return;
                }

                NextendAjaxHelper.notification(response);
            } catch (e) {
            }
        });
    };

    NextendAjaxHelper.notification = function (response) {

        if (typeof response.notification !== 'undefined' && response.notification) {
            for (var k in response.notification) {
                for (var i = 0; i < response.notification[k].length; i++) {
                    nextend.notificationCenter[k](response.notification[k][i][0], response.notification[k][i][1]);
                }
            }
        }
    };

    NextendAjaxHelper.getJSON = function (ajax) {
        NextendAjaxHelper.startLoading();
        return $.getJSON(ajax).always(function () {
            NextendAjaxHelper.stopLoading();
        });
    };

    NextendAjaxHelper.startLoading = function () {
        loader.addClass('n2-active');
    };

    NextendAjaxHelper.stopLoading = function () {
        loader.removeClass('n2-active');
    };

    window.NextendAjaxHelper = NextendAjaxHelper;
    nextend.ready(function () {
        NextendAjaxHelper.addAjaxLoader();
    });
})(n2);

(function ($, scope) {

    function NextendHeadingPane(headings, contents, identifier) {
        this.headings = headings;
        this.contents = contents;
        this.identifier = identifier;

        this._active = headings.index(headings.filter('.n2-active'));

        for (var i = 0; i < headings.length; i++) {
            headings.eq(i).on('click', $.proxy(this.switchToPane, this, i));
        }

        if (identifier) {
            var saved = $.jStorage.get(this.identifier + "-pane", -1);
            if (saved != -1) {
                this.switchToPane(saved);
                return;
            }
        }
        this.hideAndShow();
    };


    NextendHeadingPane.prototype.switchToPane = function (i, e) {
        if (e) {
            e.preventDefault();
        }
        this.headings.eq(this._active).removeClass('n2-active');
        this.headings.eq(i).addClass('n2-active');
        this._active = i;

        this.hideAndShow();
        this.store(this._active);
    };

    NextendHeadingPane.prototype.hideAndShow = function () {
        this.contents[this._active].css('display', 'block').trigger('activate');
        for (var i = 0; i < this.contents.length; i++) {
            if (i != this._active) {
                this.contents[i].css('display', 'none');
            }
        }
    };

    NextendHeadingPane.prototype.store = function (i) {
        if (this.identifier) {
            $.jStorage.set(this.identifier + "-pane", i);
        }
    };
    scope.NextendHeadingPane = NextendHeadingPane;


    function NextendHeadingScrollToPane(headings, contents, identifier) {
        this.headings = headings;
        this.contents = contents;
        this.identifier = identifier;

        for (var i = 0; i < headings.length; i++) {
            headings.eq(i).on('click', $.proxy(this.scrollToPane, this, i));
        }
    }

    NextendHeadingScrollToPane.prototype.scrollToPane = function (i, e) {
        if (e) {
            e.preventDefault();
        }
        $('html, body').animate({
            scrollTop: this.contents[i].offset().top - $('.n2-main-top-bar').height() - $('#wpadminbar, .navbar-fixed-top').height() - 10
        }, 1000);
    };

    scope.NextendHeadingScrollToPane = NextendHeadingScrollToPane;

})(n2, window);

(function ($, scope) {
    var FiLo = [],
        doc = $(document),
        isListening = false;
    scope.NextendEsc = {
        _listen: function () {
            if (!isListening) {
                doc.on('keydown.n2-esc', function (e) {
                    if ((e.keyCode == 27 || e.keyCode == 8)) {
                        if (!$(e.target).is("input, textarea")) {
                            e.preventDefault();
                            var ret = FiLo[FiLo.length - 1]();
                            if (ret) {
                                scope.NextendEsc.pop();
                            }
                        } else if (e.keyCode == 27) {
                            e.preventDefault();
                            $(e.target).blur();
                        }
                    }
                });
                isListening = true;
            }
        },
        _stopListen: function () {
            doc.off('keydown.n2-esc');
            isListening = false;
        },
        add: function (callback) {
            FiLo.push(callback);
            scope.NextendEsc._listen();
        },
        pop: function () {
            FiLo.pop();
            if (FiLo.length === 0) {
                scope.NextendEsc._stopListen();
            }
        }
    };
})(n2, window);


(function ($, scope) {
    $.fn.n2opener = function () {
        return this.each(function () {
            var opener = $(this).on("click", function (e) {
                opener.toggleClass("n2-active");
            });

            opener.parent().on("mouseleave", function () {
                opener.removeClass("n2-active");
            })
            opener.find(".n2-button-menu").on("click", function (e) {
                e.stopPropagation();
                opener.removeClass("n2-active");
            });
        });
    };
})(n2, window);

if (typeof jQuery !== 'undefined') {
    jQuery(document).on('wp-collapse-menu', function () {
        n2(window).trigger('resize');
    });
}
/**
 * Convert 8 char hexadecimal color into RGBA color
 * @param 8 characters of hexadecimal color value. Last two character stands for alpha 0-255
 * @returns RGBA representation string
 */

window.N2Color = {
    hex2rgba: function (str) {
        var num = parseInt(str, 16); // Convert to a number
        return [num >> 24 & 255, num >> 16 & 255, num >> 8 & 255, (num & 255) / 255];
    },
    hex2rgbaCSS: function (str) {
        return 'RGBA(' + N2Color.hex2rgba(str).join(',') + ')';
    },
    hexdec: function (hex_string) {
        hex_string = (hex_string + '').replace(/[^a-f0-9]/gi, '');
        return parseInt(hex_string, 16);
    },

    hex2alpha: function (str) {
        var num = parseInt(str, 16); // Convert to a number
        return ((num & 255) / 255).toFixed(3);
    },
    colorizeSVG: function (str, color) {
        var parts = str.split('base64,');
        if (parts.length == 1) {
            return str;
        }
        parts[1] = Base64.encode(Base64.decode(parts[1]).replace('fill="#FFF"', 'fill="#' + color.substr(0, 6) + '"').replace('opacity="1"', 'opacity="' + N2Color.hex2alpha(color) + '"'));
        return parts.join('base64,');
    }
};
/*!
 query-string
 Parse and stringify URL query strings
 https://github.com/sindresorhus/query-string
 by Sindre Sorhus
 MIT License
 */
(function () {
    'use strict';
    var module, define;
    var N2QueryString = {};

    N2QueryString.parse = function (str) {
        if (typeof str !== 'string') {
            return {};
        }

        str = str.trim().replace(/^(\?|#)/, '');

        if (!str) {
            return {};
        }

        return str.trim().split('&').reduce(function (ret, param) {
            var parts = param.replace(/\+/g, ' ').split('=');
            var key = parts[0];
            var val = parts[1];

            key = decodeURIComponent(key);
            // missing `=` should be `null`:
            // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
            val = val === undefined ? null : decodeURIComponent(val);

            if (!ret.hasOwnProperty(key)) {
                ret[key] = val;
            } else if (Array.isArray(ret[key])) {
                ret[key].push(val);
            } else {
                ret[key] = [ret[key], val];
            }

            return ret;
        }, {});
    };

    N2QueryString.stringify = function (obj) {
        return obj ? Object.keys(obj).map(function (key) {
            var val = obj[key];

            if (Array.isArray(val)) {
                return val.map(function (val2) {
                    return encodeURIComponent(key) + '=' + encodeURIComponent(val2);
                }).join('&');
            }

            return encodeURIComponent(key) + '=' + encodeURIComponent(val);
        }).join('&') : '';
    };

    window.N2QueryString = N2QueryString;
})();

;
!function (g) {
    var $0 = [], // result
        $1 = [], // tail
        $2 = [], // blocks
        $3 = [], // s1
        $4 = ("0123456789abcdef").split(""), // hex
        $5 = [], // s2
        $6 = [], // state
        $7 = false, // is state created
        $8 = 0, // len_cache
        $9 = 0, // len
        BUF = [];

    // use Int32Array if defined
    if (g.Int32Array) {
        $1 = new Int32Array(16);
        $2 = new Int32Array(16);
        $3 = new Int32Array(4);
        $5 = new Int32Array(4);
        $6 = new Int32Array(4);
        BUF = new Int32Array(4);
    } else {
        var i;
        for (i = 0; i < 16; i++) $1[i] = $2[i] = 0;
        for (i = 0; i < 4; i++) $3[i] = $5[i] = $6[i] = BUF[i] = 0;
    }

    // fill s1
    $3[0] = 128;
    $3[1] = 32768;
    $3[2] = 8388608;
    $3[3] = -2147483648;

    // fill s2
    $5[0] = 0;
    $5[1] = 8;
    $5[2] = 16;
    $5[3] = 24;

    function encode(s) {
        var utf = enc = "",
            start = end = 0;

        for (var i = 0, j = s.length; i < j; i++) {
            var c = s.charCodeAt(i);

            if (c < 128) {
                end++;
                continue;
            } else if (c > 127 && c < 2048)
                enc = String.fromCharCode((c >> 6) | 192, (c & 63) | 128);
            else
                enc = String.fromCharCode((c >> 12) | 224, ((c >> 6) & 63) | 128, (c & 63) | 128);

            if (end > start)
                utf += s.slice(start, end);

            utf += enc;
            start = end = i + 1;
        }

        if (end > start)
            utf += s.slice(start, j);

        return utf;
    }

    function md5_update(s) {
        var i, I;

        s += "";
        $7 = false;
        $8 = $9 = s.length;

        if ($9 > 63) {
            getBlocks(s.substring(0, 64));
            md5cycle($2);
            $7 = true;

            for (i = 128; i <= $9; i += 64) {
                getBlocks(s.substring(i - 64, i));
                md5cycleAdd($2);
            }

            s = s.substring(i - 64);
            $9 = s.length;
        }

        $1[0] = 0;
        $1[1] = 0;
        $1[2] = 0;
        $1[3] = 0;
        $1[4] = 0;
        $1[5] = 0;
        $1[6] = 0;
        $1[7] = 0;
        $1[8] = 0;
        $1[9] = 0;
        $1[10] = 0;
        $1[11] = 0;
        $1[12] = 0;
        $1[13] = 0;
        $1[14] = 0;
        $1[15] = 0;

        for (i = 0; i < $9; i++) {
            I = i % 4;
            if (I === 0)
                $1[i >> 2] = s.charCodeAt(i);
            else
                $1[i >> 2] |= s.charCodeAt(i) << $5[I];
        }
        $1[i >> 2] |= $3[i % 4];

        if (i > 55) {
            if ($7) md5cycleAdd($1);
            else {
                md5cycle($1);
                $7 = true;
            }

            return md5cycleAdd([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, $8 << 3, 0]);
        }

        $1[14] = $8 << 3;

        if ($7) md5cycleAdd($1);
        else md5cycle($1);
    }

    function getBlocks(s) {
        for (var i = 16; i--;) {
            var I = i << 2;
            $2[i] = s.charCodeAt(I) + (s.charCodeAt(I + 1) << 8) + (s.charCodeAt(I + 2) << 16) + (s.charCodeAt(I + 3) << 24);
        }
    }

    function md5(data, ascii, arrayOutput) {
        md5_update(ascii ? data : encode(data));

        var tmp = $6[0];
        $0[1] = $4[tmp & 15];
        $0[0] = $4[(tmp >>= 4) & 15];
        $0[3] = $4[(tmp >>= 4) & 15];
        $0[2] = $4[(tmp >>= 4) & 15];
        $0[5] = $4[(tmp >>= 4) & 15];
        $0[4] = $4[(tmp >>= 4) & 15];
        $0[7] = $4[(tmp >>= 4) & 15];
        $0[6] = $4[(tmp >>= 4) & 15];

        tmp = $6[1];
        $0[9] = $4[tmp & 15];
        $0[8] = $4[(tmp >>= 4) & 15];
        $0[11] = $4[(tmp >>= 4) & 15];
        $0[10] = $4[(tmp >>= 4) & 15];
        $0[13] = $4[(tmp >>= 4) & 15];
        $0[12] = $4[(tmp >>= 4) & 15];
        $0[15] = $4[(tmp >>= 4) & 15];
        $0[14] = $4[(tmp >>= 4) & 15];

        tmp = $6[2];
        $0[17] = $4[tmp & 15];
        $0[16] = $4[(tmp >>= 4) & 15];
        $0[19] = $4[(tmp >>= 4) & 15];
        $0[18] = $4[(tmp >>= 4) & 15];
        $0[21] = $4[(tmp >>= 4) & 15];
        $0[20] = $4[(tmp >>= 4) & 15];
        $0[23] = $4[(tmp >>= 4) & 15];
        $0[22] = $4[(tmp >>= 4) & 15];

        tmp = $6[3];
        $0[25] = $4[tmp & 15];
        $0[24] = $4[(tmp >>= 4) & 15];
        $0[27] = $4[(tmp >>= 4) & 15];
        $0[26] = $4[(tmp >>= 4) & 15];
        $0[29] = $4[(tmp >>= 4) & 15];
        $0[28] = $4[(tmp >>= 4) & 15];
        $0[31] = $4[(tmp >>= 4) & 15];
        $0[30] = $4[(tmp >>= 4) & 15];

        return arrayOutput ? $0 : $0.join("");
    }

    function R(q, a, b, x, s1, s2, t) {
        a += q + x + t;
        return ((a << s1 | a >>> s2) + b) << 0;
    }

    function md5cycle(k) {
        md5_rounds(0, 0, 0, 0, k);

        $6[0] = (BUF[0] + 1732584193) << 0;
        $6[1] = (BUF[1] - 271733879) << 0;
        $6[2] = (BUF[2] - 1732584194) << 0;
        $6[3] = (BUF[3] + 271733878) << 0;
    }

    function md5cycleAdd(k) {
        md5_rounds($6[0], $6[1], $6[2], $6[3], k);

        $6[0] = (BUF[0] + $6[0]) << 0;
        $6[1] = (BUF[1] + $6[1]) << 0;
        $6[2] = (BUF[2] + $6[2]) << 0;
        $6[3] = (BUF[3] + $6[3]) << 0;
    }

    function md5_rounds(a, b, c, d, k) {
        var bc, da;

        if ($7) {
            a = R(((c ^ d) & b) ^ d, a, b, k[0], 7, 25, -680876936);
            d = R(((b ^ c) & a) ^ c, d, a, k[1], 12, 20, -389564586);
            c = R(((a ^ b) & d) ^ b, c, d, k[2], 17, 15, 606105819);
            b = R(((d ^ a) & c) ^ a, b, c, k[3], 22, 10, -1044525330);
        } else {
            a = k[0] - 680876937;
            a = ((a << 7 | a >>> 25) - 271733879) << 0;
            d = k[1] - 117830708 + ((2004318071 & a) ^ -1732584194);
            d = ((d << 12 | d >>> 20) + a) << 0;
            c = k[2] - 1126478375 + (((a ^ -271733879) & d) ^ -271733879);
            c = ((c << 17 | c >>> 15) + d) << 0;
            b = k[3] - 1316259209 + (((d ^ a) & c) ^ a);
            b = ((b << 22 | b >>> 10) + c) << 0;
        }

        a = R(((c ^ d) & b) ^ d, a, b, k[4], 7, 25, -176418897);
        d = R(((b ^ c) & a) ^ c, d, a, k[5], 12, 20, 1200080426);
        c = R(((a ^ b) & d) ^ b, c, d, k[6], 17, 15, -1473231341);
        b = R(((d ^ a) & c) ^ a, b, c, k[7], 22, 10, -45705983);
        a = R(((c ^ d) & b) ^ d, a, b, k[8], 7, 25, 1770035416);
        d = R(((b ^ c) & a) ^ c, d, a, k[9], 12, 20, -1958414417);
        c = R(((a ^ b) & d) ^ b, c, d, k[10], 17, 15, -42063);
        b = R(((d ^ a) & c) ^ a, b, c, k[11], 22, 10, -1990404162);
        a = R(((c ^ d) & b) ^ d, a, b, k[12], 7, 25, 1804603682);
        d = R(((b ^ c) & a) ^ c, d, a, k[13], 12, 20, -40341101);
        c = R(((a ^ b) & d) ^ b, c, d, k[14], 17, 15, -1502002290);
        b = R(((d ^ a) & c) ^ a, b, c, k[15], 22, 10, 1236535329);

        a = R(((b ^ c) & d) ^ c, a, b, k[1], 5, 27, -165796510);
        d = R(((a ^ b) & c) ^ b, d, a, k[6], 9, 23, -1069501632);
        c = R(((d ^ a) & b) ^ a, c, d, k[11], 14, 18, 643717713);
        b = R(((c ^ d) & a) ^ d, b, c, k[0], 20, 12, -373897302);
        a = R(((b ^ c) & d) ^ c, a, b, k[5], 5, 27, -701558691);
        d = R(((a ^ b) & c) ^ b, d, a, k[10], 9, 23, 38016083);
        c = R(((d ^ a) & b) ^ a, c, d, k[15], 14, 18, -660478335);
        b = R(((c ^ d) & a) ^ d, b, c, k[4], 20, 12, -405537848);
        a = R(((b ^ c) & d) ^ c, a, b, k[9], 5, 27, 568446438);
        d = R(((a ^ b) & c) ^ b, d, a, k[14], 9, 23, -1019803690);
        c = R(((d ^ a) & b) ^ a, c, d, k[3], 14, 18, -187363961);
        b = R(((c ^ d) & a) ^ d, b, c, k[8], 20, 12, 1163531501);
        a = R(((b ^ c) & d) ^ c, a, b, k[13], 5, 27, -1444681467);
        d = R(((a ^ b) & c) ^ b, d, a, k[2], 9, 23, -51403784);
        c = R(((d ^ a) & b) ^ a, c, d, k[7], 14, 18, 1735328473);
        b = R(((c ^ d) & a) ^ d, b, c, k[12], 20, 12, -1926607734);

        bc = b ^ c;
        a = R(bc ^ d, a, b, k[5], 4, 28, -378558);
        d = R(bc ^ a, d, a, k[8], 11, 21, -2022574463);
        da = d ^ a;
        c = R(da ^ b, c, d, k[11], 16, 16, 1839030562);
        b = R(da ^ c, b, c, k[14], 23, 9, -35309556);
        bc = b ^ c;
        a = R(bc ^ d, a, b, k[1], 4, 28, -1530992060);
        d = R(bc ^ a, d, a, k[4], 11, 21, 1272893353);
        da = d ^ a;
        c = R(da ^ b, c, d, k[7], 16, 16, -155497632);
        b = R(da ^ c, b, c, k[10], 23, 9, -1094730640);
        bc = b ^ c;
        a = R(bc ^ d, a, b, k[13], 4, 28, 681279174);
        d = R(bc ^ a, d, a, k[0], 11, 21, -358537222);
        da = d ^ a;
        c = R(da ^ b, c, d, k[3], 16, 16, -722521979);
        b = R(da ^ c, b, c, k[6], 23, 9, 76029189);
        bc = b ^ c;
        a = R(bc ^ d, a, b, k[9], 4, 28, -640364487);
        d = R(bc ^ a, d, a, k[12], 11, 21, -421815835);
        da = d ^ a;
        c = R(da ^ b, c, d, k[15], 16, 16, 530742520);
        b = R(da ^ c, b, c, k[2], 23, 9, -995338651);

        a = R(c ^ (b | ~d), a, b, k[0], 6, 26, -198630844);
        d = R(b ^ (a | ~c), d, a, k[7], 10, 22, 1126891415);
        c = R(a ^ (d | ~b), c, d, k[14], 15, 17, -1416354905);
        b = R(d ^ (c | ~a), b, c, k[5], 21, 11, -57434055);
        a = R(c ^ (b | ~d), a, b, k[12], 6, 26, 1700485571);
        d = R(b ^ (a | ~c), d, a, k[3], 10, 22, -1894986606);
        c = R(a ^ (d | ~b), c, d, k[10], 15, 17, -1051523);
        b = R(d ^ (c | ~a), b, c, k[1], 21, 11, -2054922799);
        a = R(c ^ (b | ~d), a, b, k[8], 6, 26, 1873313359);
        d = R(b ^ (a | ~c), d, a, k[15], 10, 22, -30611744);
        c = R(a ^ (d | ~b), c, d, k[6], 15, 17, -1560198380);
        b = R(d ^ (c | ~a), b, c, k[13], 21, 11, 1309151649);
        a = R(c ^ (b | ~d), a, b, k[4], 6, 26, -145523070);
        d = R(b ^ (a | ~c), d, a, k[11], 10, 22, -1120210379);
        c = R(a ^ (d | ~b), c, d, k[2], 15, 17, 718787259);
        b = R(d ^ (c | ~a), b, c, k[9], 21, 11, -343485551);

        BUF[0] = a;
        BUF[1] = b;
        BUF[2] = c;
        BUF[3] = d;
    }

    g.md5 = g.md5 || md5;
}(window);

(function ($, scope) {

    function NextendCSS() {
        this.style = '';
    };

    NextendCSS.prototype.add = function (css) {
        var head = document.head || document.getElementsByTagName('head')[0],
            style = document.createElement('style');

        head.appendChild(style);

        style.type = 'text/css';
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
    };

    NextendCSS.prototype.deleteRule = function (selectorText) {
        var selectorText1 = selectorText.toLowerCase();
        var selectorText2 = selectorText1.replace('.', '\\.');
        for (var j = document.styleSheets.length - 1; j >= 0; j--) {
            var rules = this._getRulesArray(j);
            for (var i = 0; rules && i < rules.length; i++) {
                if (rules[i].selectorText) {
                    var lo = rules[i].selectorText.toLowerCase();
                    if ((lo == selectorText1) || (lo == selectorText2)) {
                        if (document.styleSheets[j].cssRules) {
                            document.styleSheets[j].deleteRule(i);
                        } else {
                            document.styleSheets[j].removeRule(i);
                        }
                    }
                }
            }
        }
        return (null);
    };

    NextendCSS.prototype._getRulesArray = function (i) {
        var crossrule = null;
        try {
            if (document.styleSheets[i].cssRules)
                crossrule = document.styleSheets[i].cssRules;
            else if (document.styleSheets[i].rules)
                crossrule = document.styleSheets[i].rules;
        } catch (e) {
        }
        return (crossrule);
    };

    window.nextend.css = new NextendCSS();

})(n2, window);

(function ($, scope, undefined) {

    function NextendImageHelper(parameters, openLightbox, openMultipleLightbox, openFoldersLightbox) {
        NextendImageHelper.prototype.openLightbox = openLightbox;
        NextendImageHelper.prototype.openMultipleLightbox = openMultipleLightbox;
        NextendImageHelper.prototype.openFoldersLightbox = openFoldersLightbox;
        nextend.imageHelper = this;
        this.parameters = $.extend({
            siteKeywords: [],
            imageUrls: [],
            wordpressUrl: '',
            placeholderImage: '',
            placeholderRepeatedImage: '',
            protocolRelative: 1
        }, parameters);
    }

    NextendImageHelper.prototype.protocolRelative = function (image) {
        if (this.parameters.protocolRelative) {
            return image.replace(/^http(s)?:\/\//, '//');
        }
        return image;
    }


    NextendImageHelper.prototype.make = function (image) {
        return this.dynamic(image);
    };

    NextendImageHelper.prototype.dynamic = function (image) {
        var imageUrls = this.parameters.imageUrls,
            keywords = this.parameters.siteKeywords,
            _image = this.protocolRelative(image);
        for (var i = 0; i < keywords.length; i++) {
            if (_image.indexOf(imageUrls[i]) === 0) {
                image = keywords[i] + _image.slice(imageUrls[i].length);
            }
        }
        return image;
    };

    NextendImageHelper.prototype.fixed = function (image) {
        var imageUrls = this.parameters.imageUrls,
            keywords = this.parameters.siteKeywords;
        for (var i = 0; i < keywords.length; i++) {
            if (image.indexOf(keywords[i]) === 0) {
                image = imageUrls[i] + image.slice(keywords[i].length);
            }
        }
        return image;
    };

    NextendImageHelper.prototype.openLightbox = function (callback) {

    };

    NextendImageHelper.prototype.openMultipleLightbox = function (callback) {
    };

    NextendImageHelper.prototype.openFoldersLightbox = function (callback) {
    };

    NextendImageHelper.prototype.getPlaceholder = function () {
        return this.fixed(this.parameters.placeholderImage);
    };

    NextendImageHelper.prototype.getRepeatedPlaceholder = function () {
        return this.fixed(this.parameters.placeholderRepeatedImage);
    };

    scope.NextendImageHelper = NextendImageHelper;

})(n2, window);
;
(function ($, scope) {

    var counter = 0;

    function NextendModal(panes, show, args) {
        this.inited = false;
        this.currentPane = null;
        this.customClass = '';
        this.$ = $(this);
        this.counter = counter++;

        this.panes = panes;

        if (show) {
            this.show(null, args);
        }

    }

    NextendModal.prototype.setCustomClass = function (customClass) {
        this.customClass = customClass;
    };

    NextendModal.prototype.lateInit = function () {
        if (!this.inited) {

            for (var k in this.panes) {
                this.panes[k] = $.extend({
                    customClass: '',
                    fit: false,
                    fitX: true,
                    overflow: 'hidden',
                    size: false,
                    back: false,
                    close: true,
                    controlsClass: '',
                    controls: [],
                    fn: {}
                }, this.panes[k]);
            }

            var stopClick = false;
            this.modal = $('<div class="n2-modal ' + this.customClass + '"/>').css('opacity', 0)
                .on('click', $.proxy(function (e) {
                    if (stopClick == false) {
                        if (!this.close.hasClass('n2-hidden') && $(e.target).closest('.n2-notification-center-modal').length == 0) {
                            this.hide(e);
                        }
                    }
                    stopClick = false;
                }, this));
            this.window = $('<div class="n2-modal-window n2-border-radius"/>')
                .on('click', function (e) {
                    stopClick = true;
                }).appendTo(this.modal);
            this.notificationStack = new NextendNotificationCenterStackModal(this.modal);

            var titleContainer = $('<div class="n2-modal-title n2-content-box-title-bg"/>')
                .appendTo(this.window);

            this.title = $('<div class="n2-h2 n2-ucf"/>').appendTo(titleContainer);
            this.back = $('<i class="n2-i n2-i-a-back"/>')
                .on('click', $.proxy(this.goBackButton, this))
                .appendTo(titleContainer);
            this.close = $('<i class="n2-i n2-i-a-deletes"/>')
                .on('click', $.proxy(this.hide, this))
                .appendTo(titleContainer);

            this.content = $('<div class="n2-modal-content"/>').appendTo(this.window);
            this.controls = $('<div class="n2-table n2-table-fixed n2-table-auto"/>');

            $('<div class="n2-modal-controls"/>')
                .append(this.controls)
                .appendTo(this.window);

            this.inited = true;
        }
    };

    NextendModal.prototype.show = function (paneId, args) {
        this.lateInit();
        this.notificationStack.enableStack();
        if (typeof paneId === 'undefined' || !paneId) {
            paneId = 'zero';
        }

        NextendEsc.add($.proxy(function () {
            if (!this.close.hasClass('n2-hidden')) {
                this.hide('esc');
                return true;
            }
            return false;
        }, this));

        this.loadPane(paneId, false, true, args);

        NextendTween.fromTo(this.modal, 0.3, {
            opacity: 0
        }, {
            opacity: 1,
            ease: 'easeOutCubic'
        }).play();
    };

    NextendModal.prototype.hide = function (e) {
        this.apply('hide');
        $(window).off('.n2-modal-' + this.counter);
        this.notificationStack.popStack();
        if (arguments.length > 0 && e != 'esc') {
            NextendEsc.pop();
        }
        NextendTween.to(this.modal, 0.3, {
            opacity: 0,
            onComplete: $.proxy(function () {
                this.apply('destroy');
                this.currentPane = null;
                this.modal.detach();
            }, this),
            ease: 'easeOutCubic'
        }).play();
        $(document).off('keyup.n2-esc-modal');
    };

    NextendModal.prototype.destroy = function () {
        this.modal.remove();
    };

    NextendModal.prototype.loadPane = function (id, backward, isShow, args) {
        var end = $.proxy(function () {
            var pane = this.panes[id];
            this.currentPane = pane;

            if (pane.title !== false) {
                this.title.html(pane.title);
            }

            if (pane.back === false) {
                this.back.addClass('n2-hidden');
            } else {
                this.back.removeClass('n2-hidden');
            }

            if (pane.close === false) {
                this.close.addClass('n2-hidden');
            } else {
                this.close.removeClass('n2-hidden');
            }

            this.content.find('> *').detach();
            this.content.append(pane.content);


            var hasControls = false;
            var tr = $('<div class="n2-tr" />');
            var i = 0;
            for (; i < pane.controls.length; i++) {
                $('<div class="n2-td"/>')
                    .addClass('n2-modal-controls-' + i)
                    .html(pane.controls[i])
                    .appendTo(tr);
                hasControls = true;
            }

            tr.addClass('n2-modal-controls-' + i);
            this.controls.html(tr);
            this.controls.attr('class', 'n2-table n2-table-fixed n2-table-auto ' + pane.controlsClass);


            if (typeof isShow == 'undefined' || !isShow) {
                NextendTween.fromTo(this.window, 0.3, {
                    x: backward ? -2000 : 2000
                }, {
                    x: 0,
                    ease: 'easeOutCubic'
                }).play();
            }

            this.modal.appendTo('#n2-admin');

            if (pane.fit) {
                var $w = $(window),
                    margin = 40,
                    resize = $.proxy(function () {
                        var w = $w.width() - 2 * margin,
                            h = $w.height() - 2 * margin;

                        if (!pane.fitX) {
                            w = pane.size[0];
                        }
                        this.window.css({
                            width: w,
                            height: h,
                            marginLeft: w / -2,
                            marginTop: h / -2
                        });

                        this.content.css({
                            height: h - 80 - (hasControls ? this.controls.parent().outerHeight(true) : 0),
                            overflow: pane.overflow
                        });
                    }, this);
                resize();
                $w.on('resize.n2-modal-' + this.counter, resize);
            } else if (pane.size !== false) {
                this.window.css({
                    width: pane.size[0],
                    height: pane.size[1],
                    marginLeft: pane.size[0] / -2,
                    marginTop: pane.size[1] / -2
                });

                this.content.css({
                    height: pane.size[1] - 80 - (hasControls ? this.controls.parent().outerHeight(true) : 0),
                    overflow: pane.overflow
                });

            }

            this.apply('show', args);

        }, this);

        if (this.currentPane !== null) {
            this.apply('destroy');
            NextendTween.to(this.window, 0.3, {
                x: backward ? 2000 : -2000,
                onComplete: end,
                ease: 'easeOutCubic'
            }).play();
        } else {
            end();
        }

    };

    NextendModal.prototype.trigger = function (event, args) {
        this.$.trigger(event, args);
    };

    NextendModal.prototype.on = function (event, fn) {
        this.$.on(event, fn);
    };

    NextendModal.prototype.one = function (event, fn) {
        this.$.one(event, fn);
    };

    NextendModal.prototype.off = function (event, fn) {
        this.$.off(event, fn);
    };

    NextendModal.prototype.goBackButton = function () {
        var args = null;
        if (typeof this.goBackArgs !== null) {
            args = this.goBackArgs;
            this.goBackArgs = null;
        }
        this.goBack(args);
    };

    NextendModal.prototype.goBack = function (args) {
        if (this.apply('goBack', args)) {
            this.loadPane(this.currentPane.back, true, false, args);
        }
    };

    NextendModal.prototype.apply = function (event, args) {
        if (typeof this.currentPane.fn[event] !== 'undefined') {
            return this.currentPane.fn[event].apply(this, args);
        }
        return true;
    };

    NextendModal.prototype.createInput = function (label, id) {
        var style = '';
        if (arguments.length == 3) {
            style = arguments[2];
        }
        return $('<div class="n2-form-element-mixed"><div class="n2-mixed-group"><div class="n2-mixed-label"><label for="' + id + '">' + label + '</label></div><div class="n2-mixed-element"><div class="n2-form-element-text n2-border-radius"><input type="text" id="' + id + '" value="" class="n2-h5" autocomplete="off" style="' + style + '"></div></div></div></div>');
    };

    NextendModal.prototype.createInputUnit = function (label, id, unit) {
        var style = '';
        if (arguments.length == 4) {
            style = arguments[3];
        }
        return $('<div class="n2-form-element-mixed"><div class="n2-mixed-group"><div class="n2-mixed-label"><label for="' + id + '">' + label + '</label></div><div class="n2-mixed-element"><div class="n2-form-element-text n2-border-radius"><input type="text" id="' + id + '" value="" class="n2-h5" autocomplete="off" style="' + style + '"><div class="n2-text-unit n2-h5 n2-uc">' + unit + '</div></div></div></div></div>');
    };

    NextendModal.prototype.createInputSub = function (label, id, sub) {
        var style = '';
        if (arguments.length == 4) {
            style = arguments[3];
        }
        return $('<div class="n2-form-element-mixed"><div class="n2-mixed-group"><div class="n2-mixed-label"><label for="' + id + '">' + label + '</label></div><div class="n2-mixed-element"><div class="n2-form-element-text n2-border-radius"><div class="n2-text-sub-label n2-h5 n2-uc">' + sub + '</div><input type="text" id="' + id + '" value="" class="n2-h5" autocomplete="off" style="' + style + '"></div></div></div></div>');
    };

    NextendModal.prototype.createTextarea = function (label, id) {
        var style = '';
        if (arguments.length == 3) {
            style = arguments[2];
        }
        return $('<div class="n2-form-element-mixed"><div class="n2-mixed-group"><div class="n2-mixed-label"><label for="' + id + '">' + label + '</label></div><div class="n2-mixed-element"><div class="n2-form-element-textarea n2-border-radius"><textarea id="' + id + '" class="n2-h5" autocomplete="off" style="resize:none;' + style + '"></textarea></div></div></div></div>');
    };

    NextendModal.prototype.createHeading = function (title) {
        return $('<h3 class="n2-h3">' + title + '</h3>');
    };
    NextendModal.prototype.createSubHeading = function (title) {
        return $('<h3 class="n2-h4">' + title + '</h3>');
    };

    NextendModal.prototype.createCenteredHeading = function (title) {
        return $('<h3 class="n2-h3 n2-center">' + title + '</h3>');
    };
    NextendModal.prototype.createCenteredSubHeading = function (title) {
        return $('<h3 class="n2-h4 n2-center">' + title + '</h3>');
    };

    NextendModal.prototype.createResult = function () {
        return $('<div class="n2-result"></div>');
    };

    NextendModal.prototype.createTable = function (data, style) {
        var table = $('<table class="n2-table-fancy"/>');
        for (var j = 0; j < data.length; j++) {
            var tr = $('<tr />').appendTo(table);
            for (var i = 0; i < data[j].length; i++) {
                tr.append($('<td style="' + style[i] + '"/>').append(data[j][i]));
            }
        }
        return table;
    };

    NextendModal.prototype.createTableWrap = function () {
        return $('<div class="n2-table-fancy-wrap" style="overflow:auto;height:196px;" />');
    };

    NextendModal.prototype.createImageRadio = function (options) {

        var wrapper = $('<div class="n2-modal-radio" />'),
            input = $('<input type="hidden" value="' + options[0].key + '"/>').appendTo(wrapper);

        for (var i = 0; i < options.length; i++) {
            wrapper.append('<div class="n2-modal-radio-option" data-key="' + options[i].key + '" style="background-image: url(\'' + nextend.imageHelper.fixed(options[i].image) + '\')"><div class="n2-h4">' + options[i].name + '</div></div>')
        }

        var options = wrapper.find('.n2-modal-radio-option');
        options.eq(0).addClass('n2-active');

        options.on('click', function (e) {
            options.removeClass('n2-active');
            var option = $(e.currentTarget);
            option.addClass('n2-active');
            input.val(option.data('key'));
        });

        return wrapper;
    };

    scope.NextendModal = NextendModal;


    scope.NextendModalSetting = {
        show: function (title, url) {
            new NextendModal({
                zero: {
                    size: [
                        1300,
                        700
                    ],
                    title: title,
                    content: '<iframe src="' + url + '" width="1300" height="640" frameborder="0" style="margin:0 -20px -20px -20px;"></iframe>'
                }
            }, true);
        }
    };
    scope.NextendModalDocumentation = function (title, url) {
        new NextendModal({
            zero: {
                size: [
                    760,
                    700
                ],
                title: title,
                content: '<iframe src="' + url + '" width="760" height="640" frameborder="0" style="margin:0 -20px -20px -20px;"></iframe>'
            }
        }, true);
    };

    function NextendSimpleModal(html) {
        this.$ = $(this);
        this.modal = $('<div class="n2-modal n2-modal-simple"/>').css({
            opacity: 0,
            display: 'none'
        }).on('click', $.proxy(this.hide, this))
            .appendTo('#n2-admin');

        $('<i class="n2-i n2-i-a-deletes"/>')
            .appendTo(this.modal);

        this.window = $('<div class="n2-modal-window n2-border-radius"/>')
            .on('click', function (e) {
                e.stopPropagation();
            })
            .appendTo(this.modal);
        this.notificationStack = new NextendNotificationCenterStackModal(this.modal);
        this.content = $(html).appendTo(this.window);
    };

    NextendSimpleModal.prototype.resize = function () {
        this.window.width(this.modal.width() - 100);
        this.window.height(this.modal.height() - 100);
    };

    NextendSimpleModal.prototype.show = function () {
        this.modal.css('display', 'block');
        this.resize();
        $(window).on('resize.n2-simple-modal', $.proxy(this.resize, this));
        this.notificationStack.enableStack();

        NextendEsc.add($.proxy(function () {
            this.hide('esc');
            return true;
        }, this));

        NextendTween.fromTo(this.modal, 0.3, {
            opacity: 0
        }, {
            opacity: 1,
            ease: 'easeOutCubic'
        }).play();
    };

    NextendSimpleModal.prototype.hide = function (e) {
        this.notificationStack.popStack();
        if (arguments.length > 0 && e != 'esc') {
            NextendEsc.pop();
        }
        NextendTween.to(this.modal, 0.3, {
            opacity: 0,
            ease: 'easeOutCubic',
            onComplete: $.proxy(function () {
                this.modal.css('display', 'none');
            }, this)
        }).play();
        $(document).off('keyup.n2-esc-modal');
        $(window).off('.n2-simple-modal');
        this.modal.trigger('ModalHide');
    };

    scope.NextendSimpleModal = NextendSimpleModal;

    function NextendDeleteModal(identifier, instanceName, callback) {
        if ($.jStorage.get('n2-delete-' + identifier, false)) {
            callback();
            return true;
        }
        new NextendModal({
            zero: {
                size: [
                    500,
                    190
                ],
                title: n2_('Delete'),
                back: false,
                close: true,
                content: '',
                controls: ['<a href="#" class="n2-button n2-button-big n2-button-grey n2-uc n2-h4">' + n2_('Cancel') + '</a>', '<div class="n2-button n2-button-with-menu n2-button-big n2-button-red"><a href="#" class="n2-button-inner n2-uc n2-h4">' + n2_('Delete') + '</a><div class="n2-button-menu-open"><i class="n2-i n2-i-buttonarrow"></i><div class="n2-button-menu"><div class="n2-button-menu-inner n2-border-radius"><a href="#" class="n2-h4">' + n2_('Delete and never show again') + '</a></div></div></div></div>'],
                fn: {
                    show: function () {
                        this.createCenteredSubHeading(n2_('Are you sure you want to delete?')).appendTo(this.content);
                        this.controls.find('.n2-button-grey')
                            .on('click', $.proxy(function (e) {
                                e.preventDefault();
                                this.hide(e);
                            }, this));
                        this.controls.find('.n2-button-red a')
                            .on('click', $.proxy(function (e) {
                                e.preventDefault();
                                callback();
                                this.hide(e);
                            }, this));

                        this.controls.find('.n2-button-red .n2-button-menu-inner a')
                            .on('click', $.proxy(function (e) {
                                e.preventDefault();
                                $.jStorage.set('n2-delete-' + identifier, true);
                            }, this));

                        this.controls.find(".n2-button-menu-open").n2opener();

                    },
                    destroy: function () {
                        this.destroy();
                    }
                }
            }
        }, true);
        return false;
    };

    scope.NextendDeleteModal = NextendDeleteModal;

    function NextendDeleteModalLink(element, identifier, instanceName) {

        NextendDeleteModal(identifier, instanceName, function () {
            window.location.href = $(element).attr('href');
        });
        return false;
    };
    scope.NextendDeleteModalLink = NextendDeleteModalLink;

})
(n2, window);
;
(function ($, scope) {

    function NextendNotificationCenter() {
        this.stack = [];
        this.tween = null;

        nextend.ready($.proxy(function () {
            var mainTopBar = $('#n2-admin').find('.n2-main-top-bar');
            if (mainTopBar.length > 0) {
                var stack = new NextendNotificationCenterStack($('#n2-admin').find('.n2-main-top-bar'));
                stack.enableStack();
            } else {
                var stack = new NextendNotificationCenterStackModal($('#n2-admin'));
                stack.enableStack();
            }
        }, this));
    };


    NextendNotificationCenter.prototype.add = function (stack) {
        this.stack.push(stack);
    };

    NextendNotificationCenter.prototype.popStack = function () {
        this.stack.pop();
    };

    /**
     * @returns {NextendNotificationCenterStack}
     */
    NextendNotificationCenter.prototype.getCurrentStack = function () {
        return this.stack[this.stack.length - 1];
    };

    NextendNotificationCenter.prototype.success = function (message, parameters) {
        this.getCurrentStack().success(message, parameters);
    };

    NextendNotificationCenter.prototype.error = function (message, parameters) {
        this.getCurrentStack().error(message, parameters);
    };

    NextendNotificationCenter.prototype.notice = function (message, parameters) {
        this.getCurrentStack().notice(message, parameters);
    };

    window.nextend.notificationCenter = new NextendNotificationCenter();


    function NextendNotificationCenterStack(bar) {
        this.messages = [];
        this.isShow = false;
        this.importantOnly = 0;

        this.importantOnlyNode = $('<div class="n2-notification-important n2-h5 ' + (this.importantOnly ? 'n2-active' : '') + '"><span>' + n2_('Show only errors') + '</span><div class="n2-checkbox n2-light"><i class="n2-i n2-i-tick"></i></div></div>')
            .on('click', $.proxy(this.changeImportant, this));
        $.jStorage.listenKeyChange('ss-important-only', $.proxy(this.importantOnlyChanged, this));
        this.importantOnlyChanged();

        this._init(bar);
        this.emptyMessage = $('<div class="n2-notification-empty n2-h4">' + n2_('There are no messages to display.') + '</div>');
    }

    NextendNotificationCenterStack.prototype._init = function (bar) {

        this.showButton = bar.find('.n2-notification-button')
            .on('click', $.proxy(this.hideOrShow, this));

        var settings = $('<div class="n2-notification-settings"></div>')
            .append($('<div class="n2-button n2-button-blue n2-button-small n2-h5 n2-uc n2-notification-clear">' + n2_('Got it!') + '</div>').on('click', $.proxy(this.clear, this)))
            .append(this.importantOnlyNode);


        this.container = this.messageContainer = $('<div class="n2-notification-center n2-border-radius-br n2-border-radius-bl"></div>')
            .append(settings)
            .appendTo(bar);
    };

    NextendNotificationCenterStack.prototype.enableStack = function () {
        nextend.notificationCenter.add(this);
    };

    NextendNotificationCenterStack.prototype.popStack = function () {
        nextend.notificationCenter.popStack();
    };

    NextendNotificationCenterStack.prototype.hideOrShow = function (e) {
        e.preventDefault();
        if (this.isShow) {
            this.hide()
        } else {
            this.show();
        }
    };

    NextendNotificationCenterStack.prototype.show = function () {
        if (!this.isShow) {
            this.isShow = true;

            if (this.messages.length == 0) {
                this.showEmptyMessage();
            }

            if (this.showButton) {
                this.showButton.addClass('n2-active');
            }
            this.container.addClass('n2-active');

            this.container.css('display', 'block');

            this._animateShow();
        }
    };

    NextendNotificationCenterStack.prototype.hide = function () {
        if (this.isShow) {
            if (this.showButton) {
                this.showButton.removeClass('n2-active');
            }
            this.container.removeClass('n2-active');

            this._animateHide();

            this.container.css('display', 'none');

            this.isShow = false;
        }
    };

    NextendNotificationCenterStack.prototype._animateShow = function () {
        if (this.tween) {
            this.tween.pause();
        }
        this.tween = NextendTween.fromTo(this.container, 0.4, {
            opacity: 0
        }, {
            opacity: 1
        }).play();
    };

    NextendNotificationCenterStack.prototype._animateHide = function () {
        if (this.tween) {
            this.tween.pause();
        }
    };

    NextendNotificationCenterStack.prototype.success = function (message, parameters) {
        this._message('success', n2_('success'), message, parameters);
    };

    NextendNotificationCenterStack.prototype.error = function (message, parameters) {
        this._message('error', n2_('error'), message, parameters);
    };

    NextendNotificationCenterStack.prototype.notice = function (message, parameters) {
        this._message('notice', n2_('notice'), message, parameters);
    };

    NextendNotificationCenterStack.prototype._message = function (type, label, message, parameters) {

        this.hideEmptyMessage();

        parameters = $.extend({
            timeout: false,
            remove: false
        }, parameters);

        var messageNode = $('<div></div>');

        if (parameters.timeout) {
            setTimeout($.proxy(function () {
                this.hideMessage(messageNode, parameters.remove);
            }, this), parameters.timeout * 1000);
        }

        messageNode
            .addClass('n2-table n2-table-fixed n2-h3 n2-border-radius n2-notification-message n2-notification-message-' + type)
            .append($('<div class="n2-tr"></div>')
                .append('<div class="n2-td n2-first"><i class="n2-i n2-i-n-' + type + '"/></div>')
                .append('<div class="n2-td n2-message"><h4 class="n2-h4 n2-uc">' + label + '</h4><p class="n2-h4">' + message + '</p></div>'))
            .prependTo(this.messageContainer);

        this.messages.push(messageNode);
        if (this.messages.length > 3) {
            this.messages.shift().remove();
        }

        if (!this.importantOnly || type == 'error' || type == 'notice') {
            this.show();
        }
        return messageNode;
    };

    NextendNotificationCenterStack.prototype.hideMessage = function (message, remove) {
        if (remove) {
            this.deleteMessage(message);
        } else {
            this.hide();
        }
    };

    NextendNotificationCenterStack.prototype.deleteMessage = function (message) {
        var index = $.inArray(message, this.messages);
        if (index > -1) {
            this.messages.splice(index, 1);
            message.remove();
        }
        if (this.messages.length == 0) {
            this.hide();
        }
    };
    NextendNotificationCenterStack.prototype.clear = function () {
        for (var i = this.messages.length - 1; i >= 0; i--) {
            this.messages.pop().remove();
        }

        this.showEmptyMessage();

        this.hide();
    };
    NextendNotificationCenterStack.prototype.changeImportant = function () {
        if (this.importantOnly) {
            $.jStorage.set('ss-important-only', 0);
        } else {
            $.jStorage.set('ss-important-only', 1);
        }
    };

    NextendNotificationCenterStack.prototype.importantOnlyChanged = function () {
        this.importantOnly = parseInt($.jStorage.get('ss-important-only', 0));
        if (this.importantOnly) {
            this.importantOnlyNode.addClass('n2-active');
        } else {
            this.importantOnlyNode.removeClass('n2-active');
        }
    };

    NextendNotificationCenterStack.prototype.showEmptyMessage = function () {
        this.emptyMessage.prependTo(this.container);
    };

    NextendNotificationCenterStack.prototype.hideEmptyMessage = function () {
        this.emptyMessage.detach();
    };

    scope.NextendNotificationCenterStack = NextendNotificationCenterStack;


    function NextendNotificationCenterStackModal() {
        NextendNotificationCenterStack.prototype.constructor.apply(this, arguments);
    }

    NextendNotificationCenterStackModal.prototype = Object.create(NextendNotificationCenterStack.prototype);
    NextendNotificationCenterStackModal.prototype.constructor = NextendNotificationCenterStackModal;


    NextendNotificationCenterStackModal.prototype._init = function (bar) {
        var settings = $('<div class="n2-notification-settings"></div>')
            .append($('<div class="n2-button n2-button-blue n2-button-small n2-h5 n2-uc n2-notification-clear">Got it!</div>').on('click', $.proxy(this.clear, this)))
            .append(this.importantOnlyNode);

        this.messageContainer = $('<div class="n2-notification-center n2-border-radius"></div>')
            .append(settings);
        this.container = $('<div class="n2-notification-center-modal"></div>')
            .append(this.messageContainer)
            .appendTo(bar);
    };

    NextendNotificationCenterStackModal.prototype.show = function () {
        if (document.activeElement) {
            document.activeElement.blur();
        }
        NextendEsc.add($.proxy(function () {
            this.clear();
            return false;
        }, this));

        NextendNotificationCenterStack.prototype.show.apply(this, arguments);
    };

    NextendNotificationCenterStackModal.prototype.hide = function () {
        NextendEsc.pop();

        NextendNotificationCenterStack.prototype.hide.apply(this, arguments);
    };

    NextendNotificationCenterStackModal.prototype._animateShow = function () {

    };

    NextendNotificationCenterStackModal.prototype._animateHide = function () {

    };

    scope.NextendNotificationCenterStackModal = NextendNotificationCenterStackModal;

})(n2, window);
// Spectrum Colorpicker v1.0.9
// https://github.com/bgrins/spectrum
// Author: Brian Grinstead
// License: MIT

(function (window, $, undefined) {
    var tinycolor = null;
    var defaultOpts = {

            // Events
            beforeShow: noop,
            move: noop,
            change: noop,
            show: noop,
            hide: noop,

            // Options
            color: false,
            flat: false,
            showInput: false,
            showButtons: true,
            clickoutFiresChange: false,
            showInitial: false,
            showPalette: false,
            showPaletteOnly: false,
            showSelectionPalette: true,
            localStorageKey: false,
            maxSelectionSize: 7,
            cancelText: "cancel",
            chooseText: "choose",
            preferredFormat: false,
            className: "",
            showAlpha: false,
            theme: "n2-sp-light",
            palette: ['fff', '000'],
            selectionPalette: [],
            disabled: false
        },
        spectrums = [],
        IE = !!/msie/i.exec(window.navigator.userAgent),
        rgbaSupport = (function () {
            function contains(str, substr) {
                return !!~('' + str).indexOf(substr);
            }

            var elem = document.createElement('div');
            var style = elem.style;
            style.cssText = 'background-color:rgba(0,0,0,.5)';
            return contains(style.backgroundColor, 'rgba') || contains(style.backgroundColor, 'hsla');
        })(),
        replaceInput = [
            "<div class='n2-sp-replacer'>",
            "<div class='n2-sp-preview'><div class='n2-sp-preview-inner'></div></div>",
            "<div class='n2-sp-dd'>&#9650;</div>",
            "</div>"
        ].join(''),
        markup = (function () {

            // IE does not support gradients with multiple stops, so we need to simulate
            //  that for the rainbow slider with 8 divs that each have a single gradient
            var gradientFix = "";
            if (IE) {
                for (var i = 1; i <= 6; i++) {
                    gradientFix += "<div class='n2-sp-" + i + "'></div>";
                }
            }

            return [
                "<div class='n2-sp-container'>",
                "<div class='n2-sp-palette-container'>",
                "<div class='n2-sp-palette n2-sp-thumb n2-sp-cf'></div>",
                "</div>",
                "<div class='n2-sp-picker-container'>",
                "<div class='n2-sp-top n2-sp-cf'>",
                "<div class='n2-sp-fill'></div>",
                "<div class='n2-sp-top-inner'>",
                "<div class='n2-sp-color'>",
                "<div class='n2-sp-sat'>",
                "<div class='n2-sp-val'>",
                "<div class='n2-sp-dragger'></div>",
                "</div>",
                "</div>",
                "</div>",
                "<div class='n2-sp-hue'>",
                "<div class='n2-sp-slider'></div>",
                gradientFix,
                "</div>",
                "</div>",
                "<div class='n2-sp-alpha'><div class='n2-sp-alpha-inner'><div class='n2-sp-alpha-handle'></div></div></div>",
                "</div>",
                "<div class='n2-sp-input-container n2-sp-cf'>",
                "<input class='n2-sp-input' type='text' spellcheck='false'  />",
                "</div>",
                "<div class='n2-sp-initial n2-sp-thumb n2-sp-cf'></div>",
                "<div class='n2-sp-button-container n2-sp-cf'>",
                "<a class='n2-sp-cancel' href='#'></a>",
                "<button class='n2-sp-choose'></button>",
                "</div>",
                "</div>",
                "</div>"
            ].join("");
        })();

    function paletteTemplate(p, color, className) {
        var html = [];
        for (var i = 0; i < p.length; i++) {
            var tiny = tinycolor(p[i]);
            var c = tiny.toHsl().l < 0.5 ? "n2-sp-thumb-el n2-sp-thumb-dark" : "n2-sp-thumb-el n2-sp-thumb-light";
            c += (tinycolor.equals(color, p[i])) ? " n2-sp-thumb-active" : "";

            var swatchStyle = rgbaSupport ? ("background-color:" + tiny.toRgbString()) : "filter:" + tiny.toFilter();
            html.push('<span title="' + tiny.toRgbString() + '" data-color="' + tiny.toRgbString() + '" class="' + c + '"><span class="n2-sp-thumb-inner" style="' + swatchStyle + ';" /></span>');
        }
        return "<div class='n2-sp-cf " + className + "'>" + html.join('') + "</div>";
    }

    function hideAll() {
        for (var i = 0; i < spectrums.length; i++) {
            if (spectrums[i]) {
                spectrums[i].hide();
            }
        }
    }

    function instanceOptions(o, callbackContext) {
        var opts = $.extend({}, defaultOpts, o);
        opts.callbacks = {
            'move': bind(opts.move, callbackContext),
            'change': bind(opts.change, callbackContext),
            'show': bind(opts.show, callbackContext),
            'hide': bind(opts.hide, callbackContext),
            'beforeShow': bind(opts.beforeShow, callbackContext)
        };

        return opts;
    }

    function spectrum(element, o) {

        var opts = instanceOptions(o, element),
            flat = opts.flat,
            showSelectionPalette = opts.showSelectionPalette,
            localStorageKey = opts.localStorageKey,
            theme = opts.theme,
            callbacks = opts.callbacks,
            resize = throttle(reflow, 10),
            visible = false,
            dragWidth = 0,
            dragHeight = 0,
            dragHelperHeight = 0,
            slideHeight = 0,
            slideWidth = 0,
            alphaWidth = 0,
            alphaSlideHelperWidth = 0,
            slideHelperHeight = 0,
            currentHue = 0,
            currentSaturation = 0,
            currentValue = 0,
            currentAlpha = 1,
            palette = opts.palette.slice(0),
            paletteArray = $.isArray(palette[0]) ? palette : [palette],
            selectionPalette = opts.selectionPalette.slice(0),
            draggingClass = "n2-sp-dragging";


        var doc = element.ownerDocument,
            body = doc.body,
            boundElement = $(element),
            disabled = false,
            container = $(markup, doc).addClass(theme),
            dragger = container.find(".n2-sp-color"),
            dragHelper = container.find(".n2-sp-dragger"),
            slider = container.find(".n2-sp-hue"),
            slideHelper = container.find(".n2-sp-slider"),
            alphaSliderInner = container.find(".n2-sp-alpha-inner"),
            alphaSlider = container.find(".n2-sp-alpha"),
            alphaSlideHelper = container.find(".n2-sp-alpha-handle"),
            textInput = container.find(".n2-sp-input"),
            paletteContainer = container.find(".n2-sp-palette"),
            initialColorContainer = container.find(".n2-sp-initial"),
            cancelButton = container.find(".n2-sp-cancel"),
            chooseButton = container.find(".n2-sp-choose"),
            isInput = boundElement.is("input"),
            shouldReplace = isInput && !flat,
            replacer = null,
            offsetElement = null,
            previewElement = null,
            initialColor = opts.color || (isInput && boundElement.val()),
            colorOnShow = false,
            preferredFormat = opts.preferredFormat,
            currentPreferredFormat = preferredFormat,
            clickoutFiresChange = !opts.showButtons || opts.clickoutFiresChange;


        function applyOptions(noReflow) {

            container.toggleClass("n2-sp-flat", flat);
            container.toggleClass("n2-sp-input-disabled", !opts.showInput);
            container.toggleClass("n2-sp-alpha-enabled", opts.showAlpha);
            container.toggleClass("n2-sp-buttons-disabled", !opts.showButtons || flat);
            container.toggleClass("n2-sp-palette-disabled", !opts.showPalette);
            container.toggleClass("n2-sp-palette-only", opts.showPaletteOnly);
            container.toggleClass("n2-sp-initial-disabled", !opts.showInitial);
            container.addClass(opts.className);

            if (typeof noReflow === 'undefined') {
                reflow();
            }
        }

        function initialize() {

            if (IE) {
                container.find("*:not(input)").attr("unselectable", "on");
            }

            var customReplace = boundElement.parent().find('.n2-sp-replacer');
            if (customReplace.length) {
                replacer = customReplace;
            } else {
                replacer = (shouldReplace) ? $(replaceInput).addClass(theme) : $([]);

                if (shouldReplace) {
                    //boundElement.hide().after(replacer);
                    boundElement.parent().after(replacer);
                }
            }
            offsetElement = (shouldReplace) ? replacer : boundElement;
            previewElement = replacer.find(".n2-sp-preview-inner");

            applyOptions(true);

            if (flat) {
                boundElement.parent().after(container).hide();
            }
            else {
                $(body).append(container.hide());
            }

            if (localStorageKey && window.localStorage) {

                try {
                    selectionPalette = window.localStorage[localStorageKey].split(";");
                }
                catch (e) {
                }
            }

            offsetElement.bind("click.spectrum touchstart.spectrum", function (e) {
                if (!disabled) {
                    toggle();
                }

                e.stopPropagation();

                if (!$(e.target).is("input")) {
                    e.preventDefault();
                }
            });

            if (boundElement.is(":disabled") || (opts.disabled === true)) {
                disable();
            }

            // Prevent clicks from bubbling up to document.  This would cause it to be hidden.
            container.click(stopPropagation);

            // Handle user typed input
            textInput.change(setFromTextInput);
            textInput.bind("paste", function () {
                setTimeout(setFromTextInput, 1);
            });
            textInput.keydown(function (e) {
                if (e.keyCode == 13) {
                    setFromTextInput();
                }
            });

            cancelButton.text(opts.cancelText);
            cancelButton.bind("click.spectrum", function (e) {
                e.stopPropagation();
                e.preventDefault();
                hide("cancel");
            });

            chooseButton.text(opts.chooseText);
            chooseButton.bind("click.spectrum", function (e) {
                e.stopPropagation();
                e.preventDefault();

                if (isValid()) {
                    updateOriginalInput(true);
                    hide();
                }
            });

            draggable(alphaSlider, function (dragX, dragY, e) {
                currentAlpha = (dragX / alphaWidth);
                if (e.shiftKey) {
                    currentAlpha = Math.round(currentAlpha * 10) / 10;
                }

                move();
            });

            draggable(slider, function (dragX, dragY) {
                currentHue = parseFloat(dragY / slideHeight);
                move();
            }, dragStart, dragStop);

            draggable(dragger, function (dragX, dragY) {
                currentSaturation = parseFloat(dragX / dragWidth);
                currentValue = parseFloat((dragHeight - dragY) / dragHeight);
                move();
            }, dragStart, dragStop);

            if (!!initialColor) {
                set(initialColor);

                // In case color was black - update the preview UI and set the format
                // since the set function will not run (default color is black).
                updateUI();
                currentPreferredFormat = preferredFormat || tinycolor(initialColor).format;

                addColorToSelectionPalette(initialColor);
            }
            else {
                updateUI();
            }

            if (flat) {
                show();
            }

            function palletElementClick(e) {
                if (e.data && e.data.ignore) {
                    set($(this).data("color"));
                    move();
                }
                else {
                    set($(this).data("color"));
                    updateOriginalInput(true);
                    move();
                    hide();
                }

                return false;
            }

            var paletteEvent = IE ? "mousedown.spectrum" : "click.spectrum touchstart.spectrum";
            paletteContainer.delegate(".n2-sp-thumb-el", paletteEvent, palletElementClick);
            initialColorContainer.delegate(".n2-sp-thumb-el:nth-child(1)", paletteEvent, {ignore: true}, palletElementClick);
        }

        function addColorToSelectionPalette(color) {
            if (showSelectionPalette) {
                var colorRgb = tinycolor(color).toRgbString();
                if ($.inArray(colorRgb, selectionPalette) === -1) {
                    selectionPalette.push(colorRgb);
                }

                if (localStorageKey && window.localStorage) {
                    try {
                        window.localStorage[localStorageKey] = selectionPalette.join(";");
                    }
                    catch (e) {
                    }
                }
            }
        }

        function getUniqueSelectionPalette() {
            var unique = [];
            var p = selectionPalette;
            var paletteLookup = {};
            var rgb;

            if (opts.showPalette) {

                for (var i = 0; i < paletteArray.length; i++) {
                    for (var j = 0; j < paletteArray[i].length; j++) {
                        rgb = tinycolor(paletteArray[i][j]).toRgbString();
                        paletteLookup[rgb] = true;
                    }
                }

                for (i = 0; i < p.length; i++) {
                    rgb = tinycolor(p[i]).toRgbString();

                    if (!paletteLookup.hasOwnProperty(rgb)) {
                        unique.push(p[i]);
                        paletteLookup[rgb] = true;
                    }
                }
            }

            return unique.reverse().slice(0, opts.maxSelectionSize);
        }

        function drawPalette() {

            var currentColor = get();

            var html = $.map(paletteArray, function (palette, i) {
                return paletteTemplate(palette, currentColor, "n2-sp-palette-row n2-sp-palette-row-" + i);
            });

            if (selectionPalette) {
                html.push(paletteTemplate(getUniqueSelectionPalette(), currentColor, "n2-sp-palette-row n2-sp-palette-row-selection"));
            }

            paletteContainer.html(html.join(""));
        }

        function drawInitial() {
            if (opts.showInitial) {
                var initial = colorOnShow;
                var current = get();
                initialColorContainer.html(paletteTemplate([initial, current], current, "n2-sp-palette-row-initial"));
            }
        }

        function dragStart() {
            if (dragHeight === 0 || dragWidth === 0 || slideHeight === 0) {
                reflow();
            }
            container.addClass(draggingClass);
        }

        function dragStop() {
            container.removeClass(draggingClass);
        }

        function setFromTextInput() {
            var tiny = tinycolor(textInput.val());
            if (tiny.ok) {
                set(tiny);
            }
            else {
                textInput.addClass("n2-sp-validation-error");
            }
        }

        function toggle() {
            if (visible) {
                hide();
            }
            else {
                show();
            }
        }

        function show() {
            if (visible) {
                reflow();
                return;
            }
            if (callbacks.beforeShow(get()) === false) return;

            hideAll();
            visible = true;

            $(doc).bind("click.spectrum", hide);
            $(window).bind("resize.spectrum", resize);
            replacer.addClass("n2-sp-active");
            container.show();

            if (opts.showPalette) {
                drawPalette();
            }
            reflow();
            updateUI();

            colorOnShow = get();

            drawInitial();
            callbacks.show(colorOnShow);
        }

        function hide(e) {

            // Return on right click
            if (e && e.type == "click" && e.button == 2) {
                return;
            }

            // Return if hiding is unnecessary
            if (!visible || flat) {
                return;
            }
            visible = false;

            $(doc).unbind("click.spectrum", hide);
            $(window).unbind("resize.spectrum", resize);

            replacer.removeClass("n2-sp-active");
            container.hide();

            var colorHasChanged = !tinycolor.equals(get(), colorOnShow);

            if (colorHasChanged) {
                if (clickoutFiresChange && e !== "cancel") {
                    updateOriginalInput(true);
                }
                else {
                    revert();
                }
            }

            callbacks.hide(get());
        }

        function revert() {
            set(colorOnShow, true);
        }

        function set(color, ignoreFormatChange) {
            if (tinycolor.equals(color, get())) {
                return;
            }

            var newColor = tinycolor(color);
            var newHsv = newColor.toHsv();

            currentHue = newHsv.h;
            currentSaturation = newHsv.s;
            currentValue = newHsv.v;
            currentAlpha = newHsv.a;

            updateUI();

            if (!ignoreFormatChange) {
                currentPreferredFormat = preferredFormat || newColor.format;
            }
        }

        function get() {
            return tinycolor.fromRatio({
                h: currentHue,
                s: currentSaturation,
                v: currentValue,
                a: Math.round(currentAlpha * 100) / 100
            });
        }

        function isValid() {
            return !textInput.hasClass("n2-sp-validation-error");
        }

        function move() {
            updateUI();

            callbacks.move(get());
        }

        function updateUI() {

            textInput.removeClass("n2-sp-validation-error");

            updateHelperLocations();

            // Update dragger background color (gradients take care of saturation and value).
            var flatColor = tinycolor({h: currentHue, s: "1.0", v: "1.0"});
            dragger.css("background-color", '#' + flatColor.toHexString());

            // Get a format that alpha will be included in (hex and names ignore alpha)
            var format = currentPreferredFormat;
            if (currentAlpha < 1) {
                if (format === "hex" || format === "name") {
                    format = "rgb";
                }
            }

            var realColor = get(),
                realHex = realColor.toHexString(),
                realRgb = realColor.toRgbString();


            // Update the replaced elements background color (with actual selected color)
            if (rgbaSupport || realColor.alpha === 1) {
                previewElement.css("background-color", realRgb);
            }
            else {
                previewElement.css("background-color", "transparent");
                previewElement.css("filter", realColor.toFilter());
            }

            if (opts.showAlpha) {
                var rgb = realColor.toRgb();
                rgb.a = 0;
                var realAlpha = tinycolor(rgb).toRgbString();
                var gradient = "linear-gradient(left, " + realAlpha + ", " + realHex + ")";

                if (IE) {
                    alphaSliderInner.css("filter", tinycolor(realAlpha).toFilter({gradientType: 1}, realHex));
                }
                else {
                    alphaSliderInner.css("background", "-webkit-" + gradient);
                    alphaSliderInner.css("background", "-moz-" + gradient);
                    alphaSliderInner.css("background", "-ms-" + gradient);
                    alphaSliderInner.css("background", gradient);
                }
            }


            // Update the text entry input as it changes happen
            if (opts.showInput) {
                if (currentAlpha < 1) {
                    if (format === "hex" || format === "name") {
                        format = "rgb";
                    }
                }
                textInput.val(realColor.toString(format));
            }

            if (opts.showPalette) {
                drawPalette();
            }

            drawInitial();
        }

        function updateHelperLocations() {
            var s = currentSaturation;
            var v = currentValue;

            // Where to show the little circle in that displays your current selected color
            var dragX = s * dragWidth;
            var dragY = dragHeight - (v * dragHeight);
            dragX = Math.max(
                -dragHelperHeight,
                Math.min(dragWidth - dragHelperHeight, dragX - dragHelperHeight)
            );
            dragY = Math.max(
                -dragHelperHeight,
                Math.min(dragHeight - dragHelperHeight, dragY - dragHelperHeight)
            );
            dragHelper.css({
                "top": dragY,
                "left": dragX
            });

            var alphaX = currentAlpha * alphaWidth;
            alphaSlideHelper.css({
                "left": alphaX - (alphaSlideHelperWidth / 2)
            });

            // Where to show the bar that displays your current selected hue
            var slideY = (currentHue) * slideHeight;
            slideHelper.css({
                "top": slideY - slideHelperHeight
            });
        }

        function updateOriginalInput(fireCallback) {
            var color = get();

            if (isInput) {
                boundElement.val(color.toString(currentPreferredFormat)).change();
            }

            //var hasChanged = !tinycolor.equals(color, colorOnShow);
            var hasChanged = 1;

            colorOnShow = color;

            // Update the selection palette with the current color
            addColorToSelectionPalette(color);
            if (fireCallback && hasChanged) {
                callbacks.change(color);
            }
        }

        function reflow() {
            dragWidth = dragger.width();
            dragHeight = dragger.height();
            dragHelperHeight = dragHelper.height();
            slideWidth = slider.width();
            slideHeight = slider.height();
            slideHelperHeight = slideHelper.height();
            alphaWidth = alphaSlider.width();
            alphaSlideHelperWidth = alphaSlideHelper.width();

            if (!flat) {
                container.offset(getOffset(container, offsetElement.parent()));
            }

            updateHelperLocations();
        }

        function destroy() {
            boundElement.show();
            offsetElement.unbind("click.spectrum touchstart.spectrum");
            container.remove();
            replacer.remove();
            spectrums[spect.id] = null;
        }

        function option(optionName, optionValue) {
            if (optionName === undefined) {
                return $.extend({}, opts);
            }
            if (optionValue === undefined) {
                return opts[optionName];
            }

            opts[optionName] = optionValue;
            applyOptions();
        }

        function enable() {
            disabled = false;
            boundElement.attr("disabled", false);
            offsetElement.removeClass("n2-sp-disabled");
        }

        function disable() {
            hide();
            disabled = true;
            boundElement.attr("disabled", true);
            offsetElement.addClass("n2-sp-disabled");
        }

        initialize();

        var spect = {
            show: show,
            hide: hide,
            toggle: toggle,
            reflow: reflow,
            option: option,
            enable: enable,
            disable: disable,
            set: function (c) {
                set(c);
                updateOriginalInput();
            },
            get: get,
            destroy: destroy,
            container: container
        };

        spect.id = spectrums.push(spect) - 1;

        return spect;
    }

    /**
     * checkOffset - get the offset below/above and left/right element depending on screen position
     * Thanks https://github.com/jquery/jquery-ui/blob/master/ui/jquery.ui.datepicker.js
     */
    function getOffset(picker, input) {
        var extraY = 0;
        var dpWidth = picker.outerWidth();
        var dpHeight = picker.outerHeight();
        var inputHeight = input.outerHeight();
        var doc = picker[0].ownerDocument;
        var docElem = doc.documentElement;
        var viewWidth = docElem.clientWidth + $(doc).scrollLeft();
        var viewHeight = docElem.clientHeight + $(doc).scrollTop();
        var offset = input.offset();
        offset.top += inputHeight + 3;

        offset.left -=
            Math.min(offset.left, (offset.left + dpWidth > viewWidth && viewWidth > dpWidth) ?
                Math.abs(offset.left + dpWidth - viewWidth) : 0);

        offset.top -=
            Math.min(offset.top, ((offset.top + dpHeight > viewHeight && viewHeight > dpHeight) ?
                Math.abs(dpHeight + inputHeight + 6 - extraY) : extraY));

        return offset;
    }

    /**
     * noop - do nothing
     */
    function noop() {

    }

    /**
     * stopPropagation - makes the code only doing this a little easier to read in line
     */
    function stopPropagation(e) {
        e.stopPropagation();
    }

    /**
     * Create a function bound to a given object
     * Thanks to underscore.js
     */
    function bind(func, obj) {
        var slice = Array.prototype.slice;
        var args = slice.call(arguments, 2);
        return function () {
            return func.apply(obj, args.concat(slice.call(arguments)));
        };
    }

    /**
     * Lightweight drag helper.  Handles containment within the element, so that
     * when dragging, the x is within [0,element.width] and y is within [0,element.height]
     */
    function draggable(element, onmove, onstart, onstop) {
        onmove = onmove || function () {
        };
        onstart = onstart || function () {
        };
        onstop = onstop || function () {
        };
        var doc = element.ownerDocument || document;
        var dragging = false;
        var offset = {};
        var maxHeight = 0;
        var maxWidth = 0;
        var hasTouch = ('ontouchstart' in window);

        var duringDragEvents = {};
        duringDragEvents["selectstart"] = prevent;
        duringDragEvents["dragstart"] = prevent;
        duringDragEvents[(hasTouch ? "touchmove" : "mousemove")] = move;
        duringDragEvents[(hasTouch ? "touchend" : "mouseup")] = stop;

        function prevent(e) {
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            if (e.preventDefault) {
                e.preventDefault();
            }
            e.returnValue = false;
        }

        function move(e) {
            if (dragging) {
                // Mouseup happened outside of window
                if (IE && document.documentMode < 9 && !e.button) {
                    return stop();
                }

                var touches = e.originalEvent.touches;
                var pageX = touches ? touches[0].pageX : e.pageX;
                var pageY = touches ? touches[0].pageY : e.pageY;

                var dragX = Math.max(0, Math.min(pageX - offset.left, maxWidth));
                var dragY = Math.max(0, Math.min(pageY - offset.top, maxHeight));

                if (hasTouch) {
                    // Stop scrolling in iOS
                    prevent(e);
                }

                onmove.apply(element, [dragX, dragY, e]);
            }
        }

        function start(e) {
            var rightclick = (e.which) ? (e.which == 3) : (e.button == 2);
            var touches = e.originalEvent.touches;

            if (!rightclick && !dragging) {
                if (onstart.apply(element, arguments) !== false) {
                    dragging = true;
                    maxHeight = $(element).height();
                    maxWidth = $(element).width();
                    offset = $(element).offset();

                    $(doc).bind(duringDragEvents);
                    $(doc.body).addClass("n2-sp-dragging");

                    if (!hasTouch) {
                        move(e);
                    }

                    prevent(e);
                }
            }
        }

        function stop() {
            if (dragging) {
                $(doc).unbind(duringDragEvents);
                $(doc.body).removeClass("n2-sp-dragging");
                onstop.apply(element, arguments);
            }
            dragging = false;
        }

        $(element).bind(hasTouch ? "touchstart" : "mousedown", start);
    }

    function throttle(func, wait, debounce) {
        var timeout;
        return function () {
            var context = this, args = arguments;
            var throttler = function () {
                timeout = null;
                func.apply(context, args);
            };
            if (debounce) clearTimeout(timeout);
            if (debounce || !timeout) timeout = setTimeout(throttler, wait);
        };
    }


    /**
     * Define a jQuery plugin
     */
    var dataID = "spectrum.id";
    $.fn.n2spectrum = function (opts, extra) {

        if (typeof opts == "string") {

            var returnValue = this;
            var args = Array.prototype.slice.call(arguments, 1);

            this.each(function () {
                var spect = spectrums[$(this).data(dataID)];
                if (spect) {

                    var method = spect[opts];
                    if (!method) {
                        throw new Error("Spectrum: no such method: '" + opts + "'");
                    }

                    if (opts == "get") {
                        returnValue = spect.get();
                    }
                    else if (opts == "container") {
                        returnValue = spect.container;
                    }
                    else if (opts == "option") {
                        returnValue = spect.option.apply(spect, args);
                    }
                    else if (opts == "destroy") {
                        spect.destroy();
                        $(this).removeData(dataID);
                    }
                    else {
                        method.apply(spect, args);
                    }
                }
            });

            return returnValue;
        }

        // Initializing a new instance of spectrum
        return this.n2spectrum("destroy").each(function () {
            var spect = spectrum(this, opts);
            $(this).data(dataID, spect.id);
        });
    };

    $.fn.n2spectrum.load = true;
    $.fn.n2spectrum.loadOpts = {};
    $.fn.n2spectrum.draggable = draggable;
    $.fn.n2spectrum.defaults = defaultOpts;

    $.n2spectrum = {};
    $.n2spectrum.localization = {};
    $.n2spectrum.palettes = {};

    $.fn.n2spectrum.processNativeColorInputs = function () {
        var colorInput = $("<input type='color' value='!' />")[0];
        var supportsColor = colorInput.type === "color" && colorInput.value != "!";

        if (!supportsColor) {
            $("input[type=color]").n2spectrum({
                preferredFormat: "hex6"
            });
        }
    };

    // TinyColor.js - <https://github.com/bgrins/TinyColor> - 2011 Brian Grinstead - v0.5

    (function (window) {

        var trimLeft = /^[\s,#]+/,
            trimRight = /\s+$/,
            tinyCounter = 0,
            math = Math,
            mathRound = math.round,
            mathMin = math.min,
            mathMax = math.max,
            mathRandom = math.random,
            parseFloat = window.parseFloat;

        tinycolor = function(color, opts) {

            // If input is already a tinycolor, return itself
            if (typeof color == "object" && color.hasOwnProperty("_tc_id")) {
                return color;
            }

            var rgb = inputToRGB(color);
            var r = rgb.r, g = rgb.g, b = rgb.b, a = parseFloat(rgb.a), format = rgb.format;

            return {
                ok: rgb.ok,
                format: format,
                _tc_id: tinyCounter++,
                alpha: a,
                toHsv: function () {
                    var hsv = rgbToHsv(r, g, b);
                    return {h: hsv.h, s: hsv.s, v: hsv.v, a: a};
                },
                toHsvString: function () {
                    var hsv = rgbToHsv(r, g, b);
                    var h = mathRound(hsv.h * 360), s = mathRound(hsv.s * 100), v = mathRound(hsv.v * 100);
                    return (a == 1) ?
                    "hsv(" + h + ", " + s + "%, " + v + "%)" :
                    "hsva(" + h + ", " + s + "%, " + v + "%, " + a + ")";
                },
                toHsl: function () {
                    var hsl = rgbToHsl(r, g, b);
                    return {h: hsl.h, s: hsl.s, l: hsl.l, a: a};
                },
                toHslString: function () {
                    var hsl = rgbToHsl(r, g, b);
                    var h = mathRound(hsl.h * 360), s = mathRound(hsl.s * 100), l = mathRound(hsl.l * 100);
                    return (a == 1) ?
                    "hsl(" + h + ", " + s + "%, " + l + "%)" :
                    "hsla(" + h + ", " + s + "%, " + l + "%, " + a + ")";
                },
                toHex: function () {
                    return rgbToHex(r, g, b);
                },
                toHexString: function (force6Char) {
                    return rgbToHex(r, g, b, force6Char);
                },
                toHexString8: function () {
                    return rgbToHex(r, g, b, true) + pad2(mathRound(a * 255).toString(16));
                },
                toRgb: function () {
                    return {r: mathRound(r), g: mathRound(g), b: mathRound(b), a: a};
                },
                toRgbString: function () {
                    return (a == 1) ?
                    "rgb(" + mathRound(r) + ", " + mathRound(g) + ", " + mathRound(b) + ")" :
                    "rgba(" + mathRound(r) + ", " + mathRound(g) + ", " + mathRound(b) + ", " + a + ")";
                },
                toName: function () {
                    return hexNames[rgbToHex(r, g, b)] || false;
                },
                toFilter: function (opts, secondColor) {

                    var hex = rgbToHex(r, g, b, true);
                    var secondHex = hex;
                    var alphaHex = Math.round(parseFloat(a) * 255).toString(16);
                    var secondAlphaHex = alphaHex;
                    var gradientType = opts && opts.gradientType ? "GradientType = 1, " : "";

                    if (secondColor) {
                        var s = tinycolor(secondColor);
                        secondHex = s.toHex();
                        secondAlphaHex = Math.round(parseFloat(s.alpha) * 255).toString(16);
                    }

                    return "progid:DXImageTransform.Microsoft.gradient(" + gradientType + "startColorstr=#" + pad2(alphaHex) + hex + ",endColorstr=#" + pad2(secondAlphaHex) + secondHex + ")";
                },
                toString: function (format) {
                    format = format || this.format;
                    var formattedString = false;
                    if (format === "rgb") {
                        formattedString = this.toRgbString();
                    }
                    if (format === "hex") {
                        formattedString = this.toHexString();
                    }
                    if (format === "hex6") {
                        formattedString = this.toHexString(true);
                    }
                    if (format === "hex8") {
                        formattedString = this.toHexString8();
                    }
                    if (format === "name") {
                        formattedString = this.toName();
                    }
                    if (format === "hsl") {
                        formattedString = this.toHslString();
                    }
                    if (format === "hsv") {
                        formattedString = this.toHsvString();
                    }

                    return formattedString || this.toHexString(true);
                }
            };
        }

        // If input is an object, force 1 into "1.0" to handle ratios properly
        // String input requires "1.0" as input, so 1 will be treated as 1
        tinycolor.fromRatio = function (color) {

            if (typeof color == "object") {
                for (var i in color) {
                    if (color[i] === 1) {
                        color[i] = "1.0";
                    }
                }
            }

            return tinycolor(color);

        };

        // Given a string or object, convert that input to RGB
        // Possible string inputs:
        //
        //     "red"
        //     "#f00" or "f00"
        //     "#ff0000" or "ff0000"
        //     "rgb 255 0 0" or "rgb (255, 0, 0)"
        //     "rgb 1.0 0 0" or "rgb (1, 0, 0)"
        //     "rgba (255, 0, 0, 1)" or "rgba 255, 0, 0, 1"
        //     "rgba (1.0, 0, 0, 1)" or "rgba 1.0, 0, 0, 1"
        //     "hsl(0, 100%, 50%)" or "hsl 0 100% 50%"
        //     "hsla(0, 100%, 50%, 1)" or "hsla 0 100% 50%, 1"
        //     "hsv(0, 100%, 100%)" or "hsv 0 100% 100%"
        //
        function inputToRGB(color) {

            var rgb = {r: 0, g: 0, b: 0};
            var a = 1;
            var ok = false;
            var format = false;

            if (typeof color == "string") {
                color = stringInputToObject(color);
            }

            if (typeof color == "object") {
                if (color.hasOwnProperty("r") && color.hasOwnProperty("g") && color.hasOwnProperty("b")) {
                    rgb = rgbToRgb(color.r, color.g, color.b);
                    ok = true;
                    format = "rgb";
                }
                else if (color.hasOwnProperty("h") && color.hasOwnProperty("s") && color.hasOwnProperty("v")) {
                    rgb = hsvToRgb(color.h, color.s, color.v);
                    ok = true;
                    format = "hsv";
                }
                else if (color.hasOwnProperty("h") && color.hasOwnProperty("s") && color.hasOwnProperty("l")) {
                    rgb = hslToRgb(color.h, color.s, color.l);
                    ok = true;
                    format = "hsl";
                }

                if (color.hasOwnProperty("a")) {
                    a = color.a;
                }
            }

            rgb.r = mathMin(255, mathMax(rgb.r, 0));
            rgb.g = mathMin(255, mathMax(rgb.g, 0));
            rgb.b = mathMin(255, mathMax(rgb.b, 0));


            // Don't let the range of [0,255] come back in [0,1].
            // Potentially lose a little bit of precision here, but will fix issues where
            // .5 gets interpreted as half of the total, instead of half of 1.
            // If it was supposed to be 128, this was already taken care of in the conversion function
            if (rgb.r < 1) {
                rgb.r = mathRound(rgb.r);
            }
            if (rgb.g < 1) {
                rgb.g = mathRound(rgb.g);
            }
            if (rgb.b < 1) {
                rgb.b = mathRound(rgb.b);
            }

            return {
                ok: ok,
                format: (color && color.format) || format,
                r: rgb.r,
                g: rgb.g,
                b: rgb.b,
                a: a
            };
        }


        // Conversion Functions
        // --------------------

        // `rgbToHsl`, `rgbToHsv`, `hslToRgb`, `hsvToRgb` modified from:
        // <http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript>

        // `rgbToRgb`
        // Handle bounds / percentage checking to conform to CSS color spec
        // <http://www.w3.org/TR/css3-color/>
        // *Assumes:* r, g, b in [0, 255] or [0, 1]
        // *Returns:* { r, g, b } in [0, 255]
        function rgbToRgb(r, g, b) {
            return {
                r: bound01(r, 255) * 255,
                g: bound01(g, 255) * 255,
                b: bound01(b, 255) * 255
            };
        }

        // `rgbToHsl`
        // Converts an RGB color value to HSL.
        // *Assumes:* r, g, and b are contained in [0, 255] or [0, 1]
        // *Returns:* { h, s, l } in [0,1]
        function rgbToHsl(r, g, b) {

            r = bound01(r, 255);
            g = bound01(g, 255);
            b = bound01(b, 255);

            var max = mathMax(r, g, b), min = mathMin(r, g, b);
            var h, s, l = (max + min) / 2;

            if (max == min) {
                h = s = 0; // achromatic
            }
            else {
                var d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r:
                        h = (g - b) / d + (g < b ? 6 : 0);
                        break;
                    case g:
                        h = (b - r) / d + 2;
                        break;
                    case b:
                        h = (r - g) / d + 4;
                        break;
                }

                h /= 6;
            }

            return {h: h, s: s, l: l};
        }

        // `hslToRgb`
        // Converts an HSL color value to RGB.
        // *Assumes:* h is contained in [0, 1] or [0, 360] and s and l are contained [0, 1] or [0, 100]
        // *Returns:* { r, g, b } in the set [0, 255]
        function hslToRgb(h, s, l) {
            var r, g, b;

            h = bound01(h, 360);
            s = bound01(s, 100);
            l = bound01(l, 100);

            function hue2rgb(p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            }

            if (s === 0) {
                r = g = b = l; // achromatic
            }
            else {
                var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                var p = 2 * l - q;
                r = hue2rgb(p, q, h + 1 / 3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1 / 3);
            }

            return {r: r * 255, g: g * 255, b: b * 255};
        }

        // `rgbToHsv`
        // Converts an RGB color value to HSV
        // *Assumes:* r, g, and b are contained in the set [0, 255] or [0, 1]
        // *Returns:* { h, s, v } in [0,1]
        function rgbToHsv(r, g, b) {

            r = bound01(r, 255);
            g = bound01(g, 255);
            b = bound01(b, 255);

            var max = mathMax(r, g, b), min = mathMin(r, g, b);
            var h, s, v = max;

            var d = max - min;
            s = max === 0 ? 0 : d / max;

            if (max == min) {
                h = 0; // achromatic
            }
            else {
                switch (max) {
                    case r:
                        h = (g - b) / d + (g < b ? 6 : 0);
                        break;
                    case g:
                        h = (b - r) / d + 2;
                        break;
                    case b:
                        h = (r - g) / d + 4;
                        break;
                }
                h /= 6;
            }
            return {h: h, s: s, v: v};
        }

        // `hsvToRgb`
        // Converts an HSV color value to RGB.
        // *Assumes:* h is contained in [0, 1] or [0, 360] and s and v are contained in [0, 1] or [0, 100]
        // *Returns:* { r, g, b } in the set [0, 255]
        function hsvToRgb(h, s, v) {
            h = bound01(h, 360) * 6;
            s = bound01(s, 100);
            v = bound01(v, 100);

            var i = math.floor(h),
                f = h - i,
                p = v * (1 - s),
                q = v * (1 - f * s),
                t = v * (1 - (1 - f) * s),
                mod = i % 6,
                r = [v, q, p, p, t, v][mod],
                g = [t, v, v, q, p, p][mod],
                b = [p, p, t, v, v, q][mod];

            return {r: r * 255, g: g * 255, b: b * 255};
        }

        // `rgbToHex`
        // Converts an RGB color to hex
        // Assumes r, g, and b are contained in the set [0, 255]
        // Returns a 3 or 6 character hex
        function rgbToHex(r, g, b, force6Char) {

            var hex = [
                pad2(mathRound(r).toString(16)),
                pad2(mathRound(g).toString(16)),
                pad2(mathRound(b).toString(16))
            ];

            // Return a 3 character hex if possible
            if (!force6Char && hex[0].charAt(0) == hex[0].charAt(1) && hex[1].charAt(0) == hex[1].charAt(1) && hex[2].charAt(0) == hex[2].charAt(1)) {
                return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0);
            }

            return hex.join("");
        }

        // `equals`
        // Can be called with any tinycolor input
        tinycolor.equals = function (color1, color2) {
            if (!color1 || !color2) {
                return false;
            }
            return tinycolor(color1).toRgbString() == tinycolor(color2).toRgbString();
        };
        tinycolor.random = function () {
            return tinycolor.fromRatio({
                r: mathRandom(),
                g: mathRandom(),
                b: mathRandom()
            });
        };


        // Modification Functions
        // ----------------------
        // Thanks to less.js for some of the basics here
        // <https://github.com/cloudhead/less.js/blob/master/lib/less/functions.js>


        tinycolor.desaturate = function (color, amount) {
            var hsl = tinycolor(color).toHsl();
            hsl.s -= ((amount || 10) / 100);
            hsl.s = clamp01(hsl.s);
            return tinycolor(hsl);
        };
        tinycolor.saturate = function (color, amount) {
            var hsl = tinycolor(color).toHsl();
            hsl.s += ((amount || 10) / 100);
            hsl.s = clamp01(hsl.s);
            return tinycolor(hsl);
        };
        tinycolor.greyscale = function (color) {
            return tinycolor.desaturate(color, 100);
        };
        tinycolor.lighten = function (color, amount) {
            var hsl = tinycolor(color).toHsl();
            hsl.l += ((amount || 10) / 100);
            hsl.l = clamp01(hsl.l);
            return tinycolor(hsl);
        };
        tinycolor.darken = function (color, amount) {
            var hsl = tinycolor(color).toHsl();
            hsl.l -= ((amount || 10) / 100);
            hsl.l = clamp01(hsl.l);
            return tinycolor(hsl);
        };
        tinycolor.complement = function (color) {
            var hsl = tinycolor(color).toHsl();
            hsl.h = (hsl.h + 0.5) % 1;
            return tinycolor(hsl);
        };


        // Combination Functions
        // ---------------------
        // Thanks to jQuery xColor for some of the ideas behind these
        // <https://github.com/infusion/jQuery-xcolor/blob/master/jquery.xcolor.js>

        tinycolor.triad = function (color) {
            var hsl = tinycolor(color).toHsl();
            var h = hsl.h * 360;
            return [
                tinycolor(color),
                tinycolor({h: (h + 120) % 360, s: hsl.s, l: hsl.l}),
                tinycolor({h: (h + 240) % 360, s: hsl.s, l: hsl.l})
            ];
        };
        tinycolor.tetrad = function (color) {
            var hsl = tinycolor(color).toHsl();
            var h = hsl.h * 360;
            return [
                tinycolor(color),
                tinycolor({h: (h + 90) % 360, s: hsl.s, l: hsl.l}),
                tinycolor({h: (h + 180) % 360, s: hsl.s, l: hsl.l}),
                tinycolor({h: (h + 270) % 360, s: hsl.s, l: hsl.l})
            ];
        };
        tinycolor.splitcomplement = function (color) {
            var hsl = tinycolor(color).toHsl();
            var h = hsl.h * 360;
            return [
                tinycolor(color),
                tinycolor({h: (h + 72) % 360, s: hsl.s, l: hsl.l}),
                tinycolor({h: (h + 216) % 360, s: hsl.s, l: hsl.l})
            ];
        };
        tinycolor.analogous = function (color, results, slices) {
            results = results || 6;
            slices = slices || 30;

            var hsl = tinycolor(color).toHsl();
            var part = 360 / slices;
            var ret = [tinycolor(color)];

            hsl.h *= 360;

            for (hsl.h = ((hsl.h - (part * results >> 1)) + 720) % 360; --results;) {
                hsl.h = (hsl.h + part) % 360;
                ret.push(tinycolor(hsl));
            }
            return ret;
        };
        tinycolor.monochromatic = function (color, results) {
            results = results || 6;
            var hsv = tinycolor(color).toHsv();
            var h = hsv.h, s = hsv.s, v = hsv.v;
            var ret = [];
            var modification = 1 / results;

            while (results--) {
                ret.push(tinycolor({h: h, s: s, v: v}));
                v = (v + modification) % 1;
            }

            return ret;
        };
        tinycolor.readable = function (color1, color2) {
            var a = tinycolor(color1).toRgb(), b = tinycolor(color2).toRgb();
            return (
                (b.r - a.r) * (b.r - a.r) +
                (b.g - a.g) * (b.g - a.g) +
                (b.b - a.b) * (b.b - a.b)
                ) > 0x28A4;
        };

        // Big List of Colors
        // ---------
        // <http://www.w3.org/TR/css3-color/#svg-color>
        var names = tinycolor.names = {
            aliceblue: "f0f8ff",
            antiquewhite: "faebd7",
            aqua: "0ff",
            aquamarine: "7fffd4",
            azure: "f0ffff",
            beige: "f5f5dc",
            bisque: "ffe4c4",
            black: "000",
            blanchedalmond: "ffebcd",
            blue: "00f",
            blueviolet: "8a2be2",
            brown: "a52a2a",
            burlywood: "deb887",
            burntsienna: "ea7e5d",
            cadetblue: "5f9ea0",
            chartreuse: "7fff00",
            chocolate: "d2691e",
            coral: "ff7f50",
            cornflowerblue: "6495ed",
            cornsilk: "fff8dc",
            crimson: "dc143c",
            cyan: "0ff",
            darkblue: "00008b",
            darkcyan: "008b8b",
            darkgoldenrod: "b8860b",
            darkgray: "a9a9a9",
            darkgreen: "006400",
            darkgrey: "a9a9a9",
            darkkhaki: "bdb76b",
            darkmagenta: "8b008b",
            darkolivegreen: "556b2f",
            darkorange: "ff8c00",
            darkorchid: "9932cc",
            darkred: "8b0000",
            darksalmon: "e9967a",
            darkseagreen: "8fbc8f",
            darkslateblue: "483d8b",
            darkslategray: "2f4f4f",
            darkslategrey: "2f4f4f",
            darkturquoise: "00ced1",
            darkviolet: "9400d3",
            deeppink: "ff1493",
            deepskyblue: "00bfff",
            dimgray: "696969",
            dimgrey: "696969",
            dodgerblue: "1e90ff",
            firebrick: "b22222",
            floralwhite: "fffaf0",
            forestgreen: "228b22",
            fuchsia: "f0f",
            gainsboro: "dcdcdc",
            ghostwhite: "f8f8ff",
            gold: "ffd700",
            goldenrod: "daa520",
            gray: "808080",
            green: "008000",
            greenyellow: "adff2f",
            grey: "808080",
            honeydew: "f0fff0",
            hotpink: "ff69b4",
            indianred: "cd5c5c",
            indigo: "4b0082",
            ivory: "fffff0",
            khaki: "f0e68c",
            lavender: "e6e6fa",
            lavenderblush: "fff0f5",
            lawngreen: "7cfc00",
            lemonchiffon: "fffacd",
            lightblue: "add8e6",
            lightcoral: "f08080",
            lightcyan: "e0ffff",
            lightgoldenrodyellow: "fafad2",
            lightgray: "d3d3d3",
            lightgreen: "90ee90",
            lightgrey: "d3d3d3",
            lightpink: "ffb6c1",
            lightsalmon: "ffa07a",
            lightseagreen: "20b2aa",
            lightskyblue: "87cefa",
            lightslategray: "789",
            lightslategrey: "789",
            lightsteelblue: "b0c4de",
            lightyellow: "ffffe0",
            lime: "0f0",
            limegreen: "32cd32",
            linen: "faf0e6",
            magenta: "f0f",
            maroon: "800000",
            mediumaquamarine: "66cdaa",
            mediumblue: "0000cd",
            mediumorchid: "ba55d3",
            mediumpurple: "9370db",
            mediumseagreen: "3cb371",
            mediumslateblue: "7b68ee",
            mediumspringgreen: "00fa9a",
            mediumturquoise: "48d1cc",
            mediumvioletred: "c71585",
            midnightblue: "191970",
            mintcream: "f5fffa",
            mistyrose: "ffe4e1",
            moccasin: "ffe4b5",
            navajowhite: "ffdead",
            navy: "000080",
            oldlace: "fdf5e6",
            olive: "808000",
            olivedrab: "6b8e23",
            orange: "ffa500",
            orangered: "ff4500",
            orchid: "da70d6",
            palegoldenrod: "eee8aa",
            palegreen: "98fb98",
            paleturquoise: "afeeee",
            palevioletred: "db7093",
            papayawhip: "ffefd5",
            peachpuff: "ffdab9",
            peru: "cd853f",
            pink: "ffc0cb",
            plum: "dda0dd",
            powderblue: "b0e0e6",
            purple: "800080",
            red: "f00",
            rosybrown: "bc8f8f",
            royalblue: "4169e1",
            saddlebrown: "8b4513",
            salmon: "fa8072",
            sandybrown: "f4a460",
            seagreen: "2e8b57",
            seashell: "fff5ee",
            sienna: "a0522d",
            silver: "c0c0c0",
            skyblue: "87ceeb",
            slateblue: "6a5acd",
            slategray: "708090",
            slategrey: "708090",
            snow: "fffafa",
            springgreen: "00ff7f",
            steelblue: "4682b4",
            tan: "d2b48c",
            teal: "008080",
            thistle: "d8bfd8",
            tomato: "ff6347",
            turquoise: "40e0d0",
            violet: "ee82ee",
            wheat: "f5deb3",
            white: "fff",
            whitesmoke: "f5f5f5",
            yellow: "ff0",
            yellowgreen: "9acd32"
        };

        // Make it easy to access colors via `hexNames[hex]`
        var hexNames = tinycolor.hexNames = flip(names);


        // Utilities
        // ---------

        // `{ 'name1': 'val1' }` becomes `{ 'val1': 'name1' }`
        function flip(o) {
            var flipped = {};
            for (var i in o) {
                if (o.hasOwnProperty(i)) {
                    flipped[o[i]] = i;
                }
            }
            return flipped;
        }

        // Take input from [0, n] and return it as [0, 1]
        function bound01(n, max) {
            if (isOnePointZero(n)) {
                n = "100%";
            }

            var processPercent = isPercentage(n);
            n = mathMin(max, mathMax(0, parseFloat(n)));

            // Automatically convert percentage into number
            if (processPercent) {
                n = n * (max / 100);
            }

            // Handle floating point rounding errors
            if (math.abs(n - max) < 0.000001) {
                return 1;
            }
            else if (n >= 1) {
                return (n % max) / parseFloat(max);
            }
            return n;
        }

        // Force a number between 0 and 1
        function clamp01(val) {
            return mathMin(1, mathMax(0, val));
        }

        // Parse an integer into hex
        function parseHex(val) {
            return parseInt(val, 16);
        }

        // Need to handle 1.0 as 100%, since once it is a number, there is no difference between it and 1
        // <http://stackoverflow.com/questions/7422072/javascript-how-to-detect-number-as-a-decimal-including-1-0>
        function isOnePointZero(n) {
            return typeof n == "string" && n.indexOf('.') != -1 && parseFloat(n) === 1;
        }

        // Check to see if string passed in is a percentage
        function isPercentage(n) {
            return typeof n === "string" && n.indexOf('%') != -1;
        }

        // Force a hex value to have 2 characters
        function pad2(c) {
            return c.length == 1 ? '0' + c : '' + c;
        }

        var matchers = (function () {

            // <http://www.w3.org/TR/css3-values/#integers>
            var CSS_INTEGER = "[-\\+]?\\d+%?";

            // <http://www.w3.org/TR/css3-values/#number-value>
            var CSS_NUMBER = "[-\\+]?\\d*\\.\\d+%?";

            // Allow positive/negative integer/number.  Don't capture the either/or, just the entire outcome.
            var CSS_UNIT = "(?:" + CSS_NUMBER + ")|(?:" + CSS_INTEGER + ")";

            // Actual matching.
            // Parentheses and commas are optional, but not required.
            // Whitespace can take the place of commas or opening paren
            var PERMISSIVE_MATCH3 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";
            var PERMISSIVE_MATCH4 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";

            return {
                rgb: new RegExp("rgb" + PERMISSIVE_MATCH3),
                rgba: new RegExp("rgba" + PERMISSIVE_MATCH4),
                hsl: new RegExp("hsl" + PERMISSIVE_MATCH3),
                hsla: new RegExp("hsla" + PERMISSIVE_MATCH4),
                hsv: new RegExp("hsv" + PERMISSIVE_MATCH3),
                hex3: /^([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
                hex6: /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
                hex8: /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
            };
        })();

        // `stringInputToObject`
        // Permissive string parsing.  Take in a number of formats, and output an object
        // based on detected format.  Returns `{ r, g, b }` or `{ h, s, l }` or `{ h, s, v}`
        function stringInputToObject(color) {

            color = color.replace(trimLeft, '').replace(trimRight, '').toLowerCase();
            var named = false;
            if (names[color]) {
                color = names[color];
                named = true;
            }
            else if (color == 'transparent') {
                return {r: 0, g: 0, b: 0, a: 0};
            }

            // Try to match string input using regular expressions.
            // Keep most of the number bounding out of this function - don't worry about [0,1] or [0,100] or [0,360]
            // Just return an object and let the conversion functions handle that.
            // This way the result will be the same whether the tinycolor is initialized with string or object.
            var match;
            if ((match = matchers.rgb.exec(color))) {
                return {r: match[1], g: match[2], b: match[3]};
            }
            if ((match = matchers.rgba.exec(color))) {
                return {r: match[1], g: match[2], b: match[3], a: match[4]};
            }
            if ((match = matchers.hsl.exec(color))) {
                return {h: match[1], s: match[2], l: match[3]};
            }
            if ((match = matchers.hsla.exec(color))) {
                return {h: match[1], s: match[2], l: match[3], a: match[4]};
            }
            if ((match = matchers.hsv.exec(color))) {
                return {h: match[1], s: match[2], v: match[3]};
            }
            if ((match = matchers.hex6.exec(color))) {
                return {
                    r: parseHex(match[1]),
                    g: parseHex(match[2]),
                    b: parseHex(match[3]),
                    format: named ? "name" : "hex"
                };
            }
            if ((match = matchers.hex8.exec(color))) {
                return {
                    r: parseHex(match[1]),
                    g: parseHex(match[2]),
                    b: parseHex(match[3]),
                    a: parseHex(match[4]) / 255,
                    format: named ? "name" : "hex"
                };
            }
            if ((match = matchers.hex3.exec(color))) {
                return {
                    r: parseHex(match[1] + '' + match[1]),
                    g: parseHex(match[2] + '' + match[2]),
                    b: parseHex(match[3] + '' + match[3]),
                    format: named ? "name" : "hex"
                };
            }

            return false;
        }

        // Everything is ready, expose to window
        //tinycolor;

    })(this);

    $(function () {
        if ($.fn.n2spectrum.load) {
            $.fn.n2spectrum.processNativeColorInputs();
        }
    });

})(window, n2);

(function ($, scope) {

    function NextendExpertMode(app, allowed) {
        this.app = 'system';
        this.key = 'IsExpert';
        this.isExpert = 0;

        this.style = $('<div style="display: none;"></div>').appendTo('body');

        if (!allowed) {
            this.switches = $();
            this.disable(false);
        } else {

            this.switches = $('.n2-expert-switch')
                .on('click', $.proxy(this.switchExpert, this, true));

            this.load();
            if (!this.isExpert) {
                this.disable(false);
            }

            $.jStorage.listenKeyChange(this.app + this.key, $.proxy(this.load, this));
        }
    };

    NextendExpertMode.prototype.load = function () {
        var isExpert = parseInt($.jStorage.get(this.app + this.key, 0));
        if (isExpert != this.isExpert) {
            this.switchExpert(false, false);
        }
    };

    NextendExpertMode.prototype.set = function (value, needSet) {
        this.isExpert = value;
        if (needSet) {
            $.jStorage.set(this.app + this.key, value);
        }
    };

    NextendExpertMode.prototype.switchExpert = function (needSet, e) {
        if (e) {
            e.preventDefault();
        }
        if (!this.isExpert) {
            this.enable(needSet);
        } else {
            this.disable(needSet);
        }
    };

    NextendExpertMode.prototype.measureElement = function () {
        var el = null,
            scrollTop = $(window).scrollTop(),
            cutoff = scrollTop + 62,
            cutoffBottom = scrollTop + $(window).height() - 100;
        $('.n2-content-area > .n2-heading-bar,.n2-content-area > .n2-form-tab ,#n2-admin .n2-content-area form > .n2-form > .n2-form-tab').each(function () {
            var $el = $(this);
            if ($el.offset().top > cutoff) {
                if (!$el.hasClass('n2-heading-bar')) {
                    el = $el;
                }
                return false;
            } else if ($el.offset().top + $el.height() > cutoffBottom) {
                if (!$el.hasClass('n2-heading-bar')) {
                    el = $el;
                }
                return false;
            }
        });
        this.measuredElement = el;
    };

    NextendExpertMode.prototype.scrollToMeasured = function () {

        if (this.measuredElement !== null) {
            while (this.measuredElement.length && !this.measuredElement.is(':VISIBLE')) {
                this.measuredElement = this.measuredElement.prev();
            }
            if (this.measuredElement.length != 0) {
                $('html,body').scrollTop(this.measuredElement.offset().top - 102);
            }
        }
    };

    NextendExpertMode.prototype.enable = function (needSet) {
        this.measureElement();
        this.changeStyle('');
        this.set(1, needSet);
        this.switches.addClass('n2-active');
        $('html').addClass('n2-in-expert');

        if (needSet) {
            this.scrollToMeasured();
        }
    };

    NextendExpertMode.prototype.disable = function (needSet) {
        this.measureElement();
        this.changeStyle('.n2-expert{display: none !important;}');
        this.set(0, needSet);
        this.switches.removeClass('n2-active');
        $('html').removeClass('n2-in-expert');

        if (needSet) {
            this.scrollToMeasured();
        }
    };

    NextendExpertMode.prototype.changeStyle = function (style) {
        this.style.html('<style type="text/css">' + style + '</style>');
    };

    scope.NextendExpertMode = NextendExpertMode

})(n2, window);
;
(function ($, scope) {
    var _registered = false;

    function registerBeforeUnload() {
        if (!_registered) {
            $(window).on('beforeunload', function (e) {
                if (nextend.askToSave) {
                    var data = {
                        changed: false
                    };
                    $(window).triggerHandler('n2-before-unload', data);

                    if (data.changed) {
                        var confirmationMessage = n2_('The changes you made will be lost if you navigate away from this page.');

                        (e || window.event).returnValue = confirmationMessage;
                        return confirmationMessage;
                    }
                }
            });
            _registered = true;
        }
    }

    function NextendForm(id, url, values) {
        this.form = $('#' + id)
            .on('saved', $.proxy(this.onSaved, this))
            .data('form', this);

        this.onSaved();

        this.url = url;

        this.values = values;

        // Special fix for Joomla 1.6, 1.7 & 2.5. Speedy save!
        if (typeof document.formvalidator !== "undefined") {
            document.formvalidator.isValid = function () {
                return true;
            };
        }

        $(window).on('n2-before-unload', $.proxy(this.onBeforeUnload, this));
        registerBeforeUnload();

        $('input, textarea').on('keyup', function (e) {
            if (e.which == 27) {
                e.target.blur();
                e.stopPropagation();
            }
        });
    };

    NextendForm.prototype.onBeforeUnload = function (e, data) {
        if (!data.changed && this.isChanged()) {
            data.changed = true;
        }
    };

    NextendForm.prototype.isChanged = function () {
        this.form.triggerHandler('checkChanged');
        if (this.serialized != this.form.serialize()) {
            return true;
        }
        return false;
    };


    NextendForm.prototype.onSaved = function () {
        this.serialized = this.form.serialize();
    };

    NextendForm.submit = function (query) {
        nextend.askToSave = false;
        setTimeout(function () {
            n2(query).submit();
        }, 300);
        return false;
    };

    scope.NextendForm = NextendForm;


})(n2, window);
;
(function ($, scope) {

    function NextendElement() {
        this.element.data('field', this);
    };

    NextendElement.prototype.triggerOutsideChange = function () {
        this.element.triggerHandler('outsideChange', this);
        this.element.triggerHandler('nextendChange', this);
    };

    NextendElement.prototype.triggerInsideChange = function () {
        this.element.triggerHandler('insideChange', this);
        this.element.triggerHandler('nextendChange', this);
    };

    scope.NextendElement = NextendElement;

})(n2, window);

(function ($, scope) {

    function NextendElementText(id) {
        this.element = $('#' + id).on({
            focus: $.proxy(this.focus, this),
            blur: $.proxy(this.blur, this),
            change: $.proxy(this.change, this)
        });

        this.tagName = this.element.prop('tagName');

        this.parent = this.element.parent();

        NextendElement.prototype.constructor.apply(this, arguments);
    };


    NextendElementText.prototype = Object.create(NextendElement.prototype);
    NextendElementText.prototype.constructor = NextendElementText;


    NextendElementText.prototype.focus = function () {
        this.parent.addClass('focus');

        if (this.tagName != 'TEXTAREA') {
            this.element.on('keypress.n2-text', $.proxy(function (e) {
                if (e.which == 13) {
                    this.element.off('keypress.n2-text');
                    this.element.trigger('blur');
                }
            }, this));
        }
    };

    NextendElementText.prototype.blur = function () {
        this.parent.removeClass('focus');
    };

    NextendElementText.prototype.change = function () {

        this.triggerOutsideChange();
    };

    NextendElementText.prototype.insideChange = function (value) {
        this.element.val(value);

        this.triggerInsideChange();
    };

    scope.NextendElementText = NextendElementText;

})(n2, window);
(function ($, scope) {

    function NextendElementAutocomplete(id, tags) {
        this.tags = tags;
        this.element = $('#' + id).data('autocomplete', this);
        this.element.on("keydown", function (event) {
            if (event.keyCode === $.ui.keyCode.TAB && $(this).nextendAutocomplete("instance").menu.active) {
                event.preventDefault();
            }
        }).nextendAutocomplete({
            minLength: 0,
            position: {
                my: "left top-2",
                of: this.element.parent(),
                collision: 'flip'
            },
            source: $.proxy(function (request, response) {
                var terms = request.term.split(/,/),
                    filtered = [];

                $.each(this.tags, function (key, value) {
                    if (-1 === terms.indexOf(value)) {
                        filtered.push(value);
                    }
                });
                response(filtered);
            }, this),
            focus: function () {
                // prevent value inserted on focus
                return false;
            },
            select: function (event, ui) {
                var terms = this.value.split(/,/);
                terms.pop();
                terms.push(ui.item.value);
                terms.push("");
                this.value = terms.join(",");
                $(this).trigger('change').nextendAutocomplete("search");
                return false;
            }
        }).click(function () {
            $(this).nextendAutocomplete("search");
        });

        this.element.siblings('.n2-form-element-clear')
            .on('click', $.proxy(this.clear, this));
    };

    NextendElementAutocomplete.prototype.clear = function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.element.val('').trigger('change');
    };

    NextendElementAutocomplete.prototype.setTags = function (tags) {
        this.tags = tags;
    };

    scope.NextendElementAutocomplete = NextendElementAutocomplete;

    function NextendElementAutocompleteSimple(id, values) {
        this.element = $('#' + id).data('autocomplete', this);
        this.element.nextendAutocomplete({
            appendTo: this.element.parent(),
            minLength: 0,
            position: {
                my: "left top-2",
                of: this.element.parent(),
                collision: 'flip'
            },
            source: function (request, response) {
                response(values);
            },
            select: function (event, ui) {
                $(this).val(ui.item.value).trigger('change');
                return false;
            }
        }).click(function () {
            $(this).nextendAutocomplete("search", "");
        });
    };

    scope.NextendElementAutocompleteSimple = NextendElementAutocompleteSimple;

})(n2, window);
;
(function ($, scope) {

    function NextendElementCheckbox(id, values) {
        this.separator = '||';

        this.element = $('#' + id);

        this.values = values;

        this.checkboxes = this.element.parent().find('.n2-checkbox-option');

        this.states = this.element.val().split(this.separator);

        for (var i = 0; i < this.checkboxes.length; i++) {
            if (typeof this.states[i] === 'undefined' || this.states[i] != this.values[i]) {
                this.states[i] = '';
            }

            this.checkboxes.eq(i).on('click', $.proxy(this.switchCheckbox, this, i));
        }

        NextendElement.prototype.constructor.apply(this, arguments);
    };


    NextendElementCheckbox.prototype = Object.create(NextendElement.prototype);
    NextendElementCheckbox.prototype.constructor = NextendElementCheckbox;


    NextendElementCheckbox.prototype.switchCheckbox = function (i) {
        if (this.states[i] == this.values[i]) {
            this.states[i] = '';
            this.setSelected(i, 0);
        } else {
            this.states[i] = this.values[i];
            this.setSelected(i, 1);
        }
        this.element.val(this.states.join(this.separator));

        this.triggerOutsideChange();
    };

    NextendElementCheckbox.prototype.insideChange = function (values) {

        var states = values.split(this.separator);

        for (var i = 0; i < this.checkboxes.length; i++) {
            if (typeof states[i] === 'undefined' || states[i] != this.values[i]) {
                this.states[i] = '';
                this.setSelected(i, 0);
            } else {
                this.states[i] = this.values[i];
                this.setSelected(i, 1);
            }

        }

        this.element.val(this.states.join(this.separator));

        this.triggerInsideChange();
    };

    NextendElementCheckbox.prototype.setSelected = function (i, state) {
        if (state) {
            this.checkboxes.eq(i)
                .addClass('n2-active');
        } else {
            this.checkboxes.eq(i)
                .removeClass('n2-active');
        }
    };


    scope.NextendElementCheckbox = NextendElementCheckbox;

})(n2, window);
;
(function ($, scope) {
    function NextendElementColor(id, alpha) {

        this.element = $('#' + id);

        if (alpha == 1) {
            this.alpha = true;
        } else {
            this.alpha = false;
        }

        this.element.n2spectrum({
            showAlpha: this.alpha,
            preferredFormat: (this.alpha == 1 ? "hex8" : "hex6"),
            showInput: false,
            showButtons: false,
            move: $.proxy(this, 'onMove'),
            showSelectionPalette: true,
            showPalette: true,
            maxSelectionSize: 6,
            localStorageKey: 'color',
            palette: [
                ['000000', '55aa39', '357cbd', 'bb4a28', '8757b2', '000000CC'],
                ['81898d', '5cba3c', '4594e1', 'd85935', '9e74c2', '00000080'],
                ['ced3d5', '27ae60', '01add3', 'e79d19', 'e264af', 'FFFFFFCC'],
                ['ffffff', '2ecc71', '00c1c4', 'ecc31f', 'ec87c0', 'FFFFFF80']
            ]
        })
            .on('change', $.proxy(this, 'onChange'));

        this.text = this.element.data('field');

        NextendElement.prototype.constructor.apply(this, arguments);
    };

    NextendElementColor.prototype = Object.create(NextendElement.prototype);
    NextendElementColor.prototype.constructor = NextendElementColor;

    NextendElementColor.prototype.onMove = function () {
        this.text.element.val(this.getCurrent());
        this.text.change();
    };

    NextendElementColor.prototype.onChange = function () {
        var current = this.getCurrent(),
            value = this.element.val();
        if (current != value) {
            this.element.n2spectrum("set", value);

            this.triggerInsideChange();
        }
    };

    NextendElementColor.prototype.insideChange = function (value) {
        this.element.val(value);

        this.onChange();
    };

    NextendElementColor.prototype.getCurrent = function () {
        if (this.alpha) {
            return this.element.n2spectrum("get").toHexString8();
        }
        return this.element.n2spectrum("get").toHexString(true);
    };

    scope.NextendElementColor = NextendElementColor;

})(n2, window);
;
(function ($, scope) {

    function NextendElementEnabled(id, selector) {
        this.element = $('#' + id).on('nextendChange', $.proxy(this.onChange, this));
        this.hide = this.element.closest('tr').nextAll().add(selector);
        this.onChange();
    }

    NextendElementEnabled.prototype.onChange = function () {
        var value = parseInt(this.element.val());

        if (value) {
            this.hide.css('display', '');
        } else {
            this.hide.css('display', 'none');
        }

    };

    scope.NextendElementEnabled = NextendElementEnabled;

})(n2, window);

(function ($, scope, undefined) {

    function NextendElementFolders(id, parameters) {
        this.element = $('#' + id);

        this.field = this.element.data('field');

        this.parameters = parameters;

        this.editButton = $('#' + id + '_edit')
            .on('click', $.proxy(this.edit, this));

        this.button = $('#' + id + '_button').on('click', $.proxy(this.open, this));

        this.element.siblings('.n2-form-element-clear')
            .on('click', $.proxy(this.clear, this));

        NextendElement.prototype.constructor.apply(this, arguments);
    };

    NextendElementFolders.prototype = Object.create(NextendElement.prototype);
    NextendElementFolders.prototype.constructor = NextendElementFolders;

    NextendElementFolders.prototype.clear = function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.val('');
    };

    NextendElementFolders.prototype.val = function (value) {
        this.element.val(value);
        this.triggerOutsideChange();
    };

    NextendElementFolders.prototype.open = function (e) {
        e.preventDefault();
        nextend.imageHelper.openFoldersLightbox($.proxy(this.val, this));
    };

    scope.NextendElementFolders = NextendElementFolders;
})(n2, window);
;
(function ($, scope) {

    function NextendElementFont(id, parameters) {
        this.element = $('#' + id);

        this.parameters = parameters;

        this.defaultSetId = parameters.set;

        this.element.parent()
            .on('click', $.proxy(this.show, this));

        this.element.siblings('.n2-form-element-clear')
            .on('click', $.proxy(this.clear, this));

        this.name = this.element.siblings('input');

        nextend.fontManager.$.on('visualDelete', $.proxy(this.fontDeleted, this));

        this.updateName(this.element.val());

        NextendElement.prototype.constructor.apply(this, arguments);
    };


    NextendElementFont.prototype = Object.create(NextendElement.prototype);
    NextendElementFont.prototype.constructor = NextendElementFont;


    NextendElementFont.prototype.show = function (e) {
        e.preventDefault();
        if (this.parameters.style != '') {
            nextend.fontManager.setConnectedStyle(this.parameters.style);
        }
        if (this.parameters.style2 != '') {
            nextend.fontManager.setConnectedStyle2(this.parameters.style2);
        }
        if (this.defaultSetId) {
            nextend.fontManager.changeSetById(this.defaultSetId);
        }
        nextend.fontManager.show(this.element.val(), $.proxy(this.save, this), {
            previewMode: this.parameters.previewmode,
            previewHTML: this.parameters.preview
        });
    };

    NextendElementFont.prototype.clear = function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.val('');
    };

    NextendElementFont.prototype.save = function (e, value) {

        nextend.fontManager.addVisualUsage(this.parameters.previewmode, value, window.nextend.pre);

        this.val(value);
    };

    NextendElementFont.prototype.val = function (value) {
        this.element.val(value);
        this.updateName(value);
        this.triggerOutsideChange();
    };

    NextendElementFont.prototype.insideChange = function (value) {
        this.element.val(value);

        this.updateName(value);

        this.triggerInsideChange();
    };

    NextendElementFont.prototype.updateName = function (value) {
        $.when(nextend.fontManager.getVisual(value))
            .done($.proxy(function (font) {
                this.name.val(font.name);
            }, this));
    };
    NextendElementFont.prototype.fontDeleted = function (e, id) {
        if (id == this.element.val()) {
            this.insideChange('');
        }
    };

    NextendElementFont.prototype.renderFont = function () {
        var font = this.element.val();
        nextend.fontManager.addVisualUsage(this.parameters.previewmode, font, '');
        return nextend.fontManager.getClass(font, this.parameters.previewmode);
    };

    scope.NextendElementFont = NextendElementFont;

})(n2, window);
;
(function ($, scope) {
    var modal = null,
        callback = function () {
        },
        _icons = [123, 34, 83, 104, 97, 112, 101, 115, 34, 58, 91, 34, 60, 115, 118, 103, 32, 120, 109, 108, 110, 115, 61, 92, 34, 104, 116, 116, 112, 58, 92, 47, 286, 119, 289, 46, 119, 51, 46, 111, 114, 103, 286, 50, 48, 300, 286, 269, 297, 34, 32, 118, 105, 101, 119, 66, 111, 120, 278, 34, 48, 32, 316, 49, 300, 32, 319, 48, 279, 32, 32, 119, 105, 100, 116, 104, 314, 51, 50, 324, 104, 101, 105, 103, 281, 332, 334, 34, 62, 60, 114, 101, 99, 116, 326, 328, 330, 314, 322, 335, 337, 339, 116, 353, 301, 34, 286, 344, 302, 270, 62, 34, 44, 267, 303, 272, 274, 276, 314, 281, 283, 285, 287, 47, 289, 119, 291, 293, 295, 297, 47, 299, 301, 47, 303, 324, 307, 309, 311, 313, 279, 316, 318, 320, 354, 305, 350, 329, 331, 279, 333, 355, 338, 340, 405, 342, 344, 99, 105, 114, 99, 108, 101, 32, 99, 395, 34, 53, 323, 305, 99, 121, 314, 423, 324, 114, 314, 52, 54, 279, 362, 60, 364, 103, 366, 368, 268, 270, 371, 275, 277, 279, 375, 284, 286, 288, 290, 292, 294, 296, 298, 300, 323, 389, 270, 391, 308, 310, 312, 314, 397, 321, 399, 360, 325, 327, 403, 341, 407, 357, 473, 343, 60, 112, 97, 330, 32, 100, 314, 77, 32, 423, 317, 32, 76, 488, 322, 489, 467, 398, 424, 436, 438, 440, 369, 443, 273, 445, 374, 282, 449, 378, 380, 382, 454, 385, 387, 458, 390, 305, 392, 463, 421, 466, 492, 400, 470, 351, 404, 34, 406, 305, 336, 408, 358, 410, 279, 344, 479, 481, 483, 279, 485, 487, 492, 490, 466, 490, 492, 496, 47, 363, 459, 439, 367, 500, 271, 502, 373, 447, 505, 377, 451, 381, 453, 384, 456, 388, 514, 306, 462, 394, 465, 491, 468, 424, 522, 472, 531, 527, 356, 409, 525, 411, 478, 480, 104, 482, 484, 486, 495, 493, 542, 494, 317, 435, 546, 437, 548, 499, 442, 552, 372, 446, 280, 556, 450, 379, 452, 383, 455, 386, 457, 438, 461, 393, 464, 396, 569, 495, 324, 402, 352, 574, 32, 528, 475, 574, 533, 581, 583, 537, 488, 487, 543, 320, 316, 630, 615, 361, 592, 498, 550, 596, 444, 554, 600, 376, 602, 508, 560, 606, 512, 609, 515, 566, 612, 315, 614, 494, 616, 471, 618, 578, 474, 577, 526, 624, 535, 584, 492, 629, 488, 632, 614, 591, 547, 303, 595, 370, 553, 599, 448, 557, 603, 559, 605, 511, 608, 548, 610, 517, 568, 586, 521, 617, 524, 526, 620, 576, 530, 659, 477, 534, 582, 536, 34, 485, 588, 544, 587, 655, 635, 672, 365, 638, 675, 598, 504, 643, 507, 604, 510, 562, 513, 460, 650, 611, 518, 654, 690, 657, 692, 342, 694, 529, 476, 663, 700, 665, 631, 493, 520, 320, 541, 590, 708, 593, 673, 711, 501, 713, 555, 715, 558, 509, 561, 607, 563, 721, 565, 723, 688, 589, 726, 523, 476, 730, 622, 697, 733, 626, 702, 654, 633, 589, 740, 545, 709, 549, 441, 712, 503, 748, 506, 750, 646, 683, 754, 304, 756, 687, 613, 689, 469, 691, 762, 621, 661, 579, 699, 767, 485, 738, 669, 586, 770, 773, 743, 710, 93, 368, 87, 101, 98, 32, 65, 112, 112, 108, 105, 99, 480, 105, 111, 110, 32, 73, 99, 820, 263, 265, 551, 791, 619, 793, 696, 693, 516, 567, 788, 32, 299, 52, 56, 837, 48, 839, 324, 676, 714, 780, 680, 751, 647, 684, 514, 766, 701, 77, 49, 56, 50, 55, 32, 51, 49, 52, 113, 316, 51, 53, 45, 52, 51, 32, 55, 56, 108, 45, 54, 333, 32, 876, 50, 118, 55, 54, 56, 104, 333, 48, 113, 50, 54, 488, 52, 53, 321, 57, 116, 49, 57, 32, 892, 45, 897, 899, 867, 892, 894, 104, 45, 56, 57, 54, 113, 45, 889, 317, 868, 867, 897, 116, 901, 57, 916, 894, 922, 900, 897, 885, 299, 118, 45, 882, 873, 875, 333, 933, 50, 912, 869, 868, 51, 939, 930, 840, 48, 913, 870, 856, 45, 51, 54, 46, 53, 116, 51, 56, 901, 55, 951, 899, 940, 52, 104, 862, 48, 56, 888, 870, 316, 869, 899, 953, 840, 49, 957, 893, 856, 860, 950, 53, 122, 671, 804, 775, 828, 727, 792, 695, 762, 834, 652, 466, 838, 840, 992, 844, 747, 642, 847, 645, 682, 719, 649, 853, 484, 973, 57, 50, 860, 53, 880, 49, 49, 299, 864, 585, 948, 52, 32, 909, 919, 56, 890, 54, 48, 951, 901, 48, 293, 893, 934, 910, 958, 319, 1025, 1031, 917, 1024, 1036, 1028, 948, 50, 908, 54, 875, 1037, 1016, 908, 898, 51, 52, 1047, 1018, 1043, 1023, 1032, 1027, 1025, 877, 1035, 1026, 951, 113, 319, 893, 318, 1006, 860, 57, 929, 53, 51, 55, 874, 931, 837, 1071, 881, 48, 57, 1014, 423, 1016, 1018, 895, 1042, 878, 1045, 319, 1028, 860, 1041, 1035, 467, 1034, 978, 1060, 1038, 1057, 1041, 1021, 1044, 1057, 1050, 909, 860, 1103, 898, 1100, 1054, 975, 1056, 867, 1058, 1095, 1033, 53, 1062, 48, 1064, 894, 1007, 51, 1068, 45, 910, 55, 864, 948, 49, 923, 53, 978, 116, 52, 921, 866, 951, 108, 56, 934, 50, 1131, 1062, 1041, 1017, 50, 955, 1017, 52, 466, 883, 837, 56, 116, 1146, 878, 56, 980, 742, 637, 776, 443, 985, 830, 987, 619, 989, 724, 316, 992, 841, 843, 305, 845, 779, 679, 999, 718, 753, 720, 304, 1003, 537, 49, 1049, 1017, 910, 887, 944, 856, 917, 861, 1057, 49, 1132, 1128, 1114, 1192, 1112, 1194, 1032, 1198, 901, 1198, 860, 1200, 975, 1204, 861, 978, 1205, 1210, 1184, 49, 958, 1209, 1025, 1213, 1201, 1214, 1199, 978, 122, 109, 53, 1012, 1018, 333, 1080, 1041, 954, 32, 57, 48, 919, 1233, 860, 965, 45, 53, 1017, 944, 1233, 948, 932, 1049, 940, 1049, 936, 956, 898, 1012, 1050, 1122, 1251, 50, 1050, 862, 967, 913, 55, 1039, 53, 53, 951, 919, 50, 1141, 901, 1081, 49, 1081, 1267, 867, 1263, 1025, 858, 1089, 1275, 867, 1277, 1032, 1272, 1141, 837, 1268, 1271, 1169, 1261, 1025, 1279, 837, 1289, 893, 1291, 1273, 321, 539, 487, 1296, 1295, 1293, 1014, 1267, 1189, 1256, 1067, 57, 108, 1246, 1105, 51, 113, 1071, 860, 859, 1314, 1233, 1158, 497, 594, 745, 271, 1163, 697, 763, 794, 686, 835, 653, 1169, 842, 993, 1332, 995, 778, 997, 1176, 717, 752, 648, 685, 698, 625, 854, 1005, 1007, 1194, 333, 929, 931, 912, 877, 949, 875, 898, 54, 1043, 889, 1333, 1043, 52, 914, 51, 954, 1239, 1129, 938, 1139, 878, 55, 1020, 1210, 839, 1217, 48, 50, 958, 1256, 951, 907, 1249, 839, 915, 319, 1377, 1280, 52, 1265, 1042, 1025, 1374, 867, 1139, 875, 1126, 1269, 955, 1184, 1144, 889, 948, 1365, 1071, 948, 944, 54, 921, 1357, 881, 883, 1014, 1184, 1232, 1378, 1386, 1154, 1386, 1414, 53, 962, 52, 55, 936, 1413, 1169, 1386, 1124, 1265, 57, 1276, 1386, 1223, 1189, 1118, 49, 929, 1379, 53, 874, 1217, 1247, 901, 1427, 1264, 867, 921, 921, 974, 901, 1050, 1386, 907, 862, 1423, 912, 1425, 913, 1418, 1430, 952, 1428, 893, 1267, 1061, 318, 1151, 1454, 1152, 1017, 897, 946, 1009, 899, 48, 1129, 861, 859, 890, 1029, 1463, 1460, 1133, 890, 1071, 958, 52, 1388, 1029, 1220, 585, 1378, 974, 959, 1232, 104, 936, 299, 891, 940, 895, 423, 1276, 1493, 1487, 1193, 1486, 1043, 1485, 1480, 913, 1460, 888, 964, 901, 54, 893, 1149, 49, 1128, 859, 1240, 939, 494, 1217, 1271, 1265, 433, 1441, 1220, 1223, 1012, 955, 1076, 319, 56, 965, 316, 1357, 868, 859, 1011, 51, 919, 1542, 899, 55, 1453, 1422, 1249, 1357, 1384, 1184, 1540, 919, 1422, 901, 1184, 929, 1535, 1537, 875, 890, 1556, 1542, 896, 1553, 1422, 1421, 1455, 1551, 318, 1413, 1422, 1133, 1541, 1184, 1319, 636, 1321, 1161, 1323, 761, 1164, 731, 1166, 651, 1168, 1171, 1333, 1172, 640, 677, 601, 716, 681, 1178, 1341, 852, 580, 664, 1183, 1376, 1470, 55, 1006, 912, 914, 944, 1487, 901, 932, 54, 1256, 1044, 1249, 319, 908, 1260, 1276, 54, 919, 1279, 875, 1445, 875, 955, 57, 1449, 1070, 1217, 50, 1519, 50, 1039, 1184, 1561, 1304, 321, 858, 1016, 52, 953, 1225, 1443, 863, 1613, 491, 889, 1378, 1220, 896, 1498, 53, 840, 57, 1445, 1156, 958, 882, 1156, 1313, 1508, 890, 882, 1626, 116, 1656, 1025, 883, 1032, 299, 1239, 972, 1649, 1280, 1220, 888, 1306, 865, 1225, 1639, 1642, 1012, 1316, 1487, 1303, 1632, 1458, 898, 892, 48, 874, 1613, 870, 1023, 887, 1611, 321, 1147, 1470, 1157, 981, 1160, 984, 1583, 1325, 831, 988, 1587, 758, 1170, 994, 1173, 996, 678, 644, 1339, 850, 784, 532, 1600, 734, 1183, 56, 1131, 871, 55, 1116, 1426, 913, 1563, 1245, 876, 1008, 1017, 1021, 585, 887, 1129, 1541, 841, 488, 1688, 1115, 1008, 1389, 51, 1037, 321, 1488, 1456, 898, 1609, 1305, 874, 1487, 921, 1634, 1361, 1134, 1075, 911, 1458, 1639, 868, 318, 1041, 1632, 915, 1202, 862, 1389, 1115, 948, 1445, 1127, 890, 1768, 1692, 1100, 423, 944, 949, 1253, 1240, 1607, 1280, 55, 913, 904, 943, 948, 1521, 1361, 54, 108, 423, 1041, 1261, 1285, 904, 1263, 1062, 921, 52, 1367, 1805, 49, 1133, 1690, 49, 108, 1296, 892, 1294, 1376, 871, 1312, 1726, 898, 1726, 433, 1578, 774, 674, 1162, 1706, 693, 1708, 1586, 757, 836, 1712, 1334, 1714, 1336, 1716, 1595, 849, 783, 1180, 1721, 796, 1345, 333, 1251, 1399, 1309, 48, 1358, 1628, 868, 1267, 875, 1041, 856, 1135, 857, 1611, 1048, 1859, 1362, 1007, 1647, 1748, 1778, 1852, 1800, 1362, 1476, 872, 920, 1048, 55, 1541, 57, 57, 1223, 1009, 1789, 866, 1126, 1730, 914, 839, 874, 949, 870, 866, 1736, 1479, 300, 1062, 871, 321, 1742, 316, 1081, 1806, 1015, 902, 1754, 1443, 1756, 1134, 945, 1760, 898, 1759, 1607, 1347, 1144, 1767, 913, 1129, 1783, 1220, 1450, 1773, 1045, 1136, 1729, 875, 837, 913, 1780, 1043, 1782, 948, 54, 1785, 863, 1790, 1260, 1934, 1383, 1783, 1794, 868, 1796, 1798, 930, 870, 1273, 916, 1116, 897, 868, 1807, 1949, 1810, 899, 1812, 1814, 1263, 585, 1007, 1261, 113, 1820, 486, 1563, 54, 1824, 982, 1826, 1582, 573, 1707, 1165, 1325, 1167, 1711, 1332, 1589, 1335, 641, 1838, 781, 1000, 1179, 1002, 1722, 797, 973, 1155, 1271, 1364, 1412, 1672, 1800, 1857, 1773, 57, 1017, 1407, 1380, 908, 55, 1933, 1012, 1916, 920, 1050, 1997, 1461, 1261, 1860, 1465, 1239, 1889, 1375, 1028, 896, 1257, 1078, 837, 1114, 964, 1486, 1500, 1493, 1613, 908, 1129, 1725, 1290, 1089, 1011, 1918, 1013, 1753, 899, 1007, 1632, 1265, 2000, 1486, 972, 964, 899, 972, 1364, 1650, 1201, 1039, 2036, 1110, 1147, 840, 2038, 1791, 2034, 1915, 1061, 54, 1916, 321, 1011, 1378, 1234, 2027, 1294, 1089, 1647, 56, 1367, 870, 1628, 1378, 1212, 2020, 975, 1470, 2017, 2029, 1111, 1223, 1040, 944, 909, 1312, 318, 53, 921, 1011, 1418, 858, 1651, 1260, 1490, 2087, 1503, 1918, 2093, 917, 1012, 2094, 1032, 2098, 1788, 1490, 2089, 1525, 2088, 55, 2092, 2101, 2059, 2106, 1530, 1703, 1580, 1705, 1969, 1829, 1971, 833, 1710, 1833, 1975, 1713, 1592, 846, 1338, 1596, 1340, 851, 721, 1182, 702, 1487, 972, 1423, 56, 1559, 1146, 1127, 1401, 1948, 892, 1555, 917, 57, 1453, 2138, 1731, 915, 905, 918, 920, 903, 118, 1532, 1303, 890, 902, 2142, 2150, 2145, 2155, 1608, 903, 920, 896, 1805, 979, 109, 1783, 56, 52, 2137, 1637, 1043, 2141, 1461, 925, 2145, 1443, 1238, 1608, 922, 2151, 2158, 53, 2154, 2138, 1169, 2157, 1690, 952, 2160, 962, 2138, 2163, 2178, 2166, 916, 1433, 1244, 2172, 2180, 2139, 2175, 2167, 2143, 920, 2146, 2181, 890, 1609, 975, 1084, 2185, 2187, 1537, 2018, 894, 903, 1133, 2213, 2194, 965, 2196, 2144, 2198, 892, 1531, 1603, 871, 883, 1069, 1012, 2204, 920, 916, 2207, 926, 930, 1411, 2148, 2212, 894, 1544, 2191, 118, 1225, 936, 2189, 2219, 2159, 2222, 1351, 2225, 2165, 2176, 2079, 1385, 1257, 1271, 880, 2203, 944, 2140, 2206, 916, 2208, 2203, 2242, 2183, 2214, 2246, 2155, 2250, 2185, 2221, 906, 2162, 2211, 2164, 918, 2257, 109, 963, 972, 2261, 2173, 2235, 2176, 2238, 2179, 2155, 2270, 2160, 2245, 2153, 2274, 2218, 2276, 2193, 2279, 891, 2226, 2283, 2201, 2240, 2136, 1366, 2249, 1731, 2236, 2142, 2267, 2239, 1351, 2294, 2213, 2296, 892, 2247, 2234, 2275, 2191, 2277, 926, 2254, 2280, 2197, 2283, 954, 1017, 2331, 2288, 2264, 2205, 2237, 2314, 2292, 2147, 2182, 2295, 2152, 2320, 2298, 914, 2300, 2222, 2302, 968, 2304, 2167, 2200, 2333, 2263, 2311, 2290, 2338, 2209, 1607, 2211, 2271, 2319, 2186, 2345, 2190, 2220, 2301, 2195, 2328, 2351, 2199, 2169, 2201, 2334, 2356, 2266, 2178, 2359, 2317, 2244, 2343, 2364, 2188, 2299, 2324, 2368, 2224, 2370, 2256, 2352, 2284, 1146, 1515, 48, 2154, 1185, 1014, 1539, 1422, 2059, 1543, 1557, 870, 1568, 2394, 1697, 1571, 2403, 1554, 1540, 2403, 1559, 2397, 1406, 1563, 1789, 1565, 1542, 1540, 962, 1696, 113, 1571, 2401, 1546, 1575, 2401, 1965, 1704, 639, 1324, 2117, 1585, 1972, 2120, 1330, 1589, 1976, 1836, 1978, 1594, 1980, 1597, 2129, 1181, 1984, 1345, 1605, 1356, 1995, 1014, 1149, 913, 840, 883, 1073, 1306, 1423, 1257, 949, 321, 949, 1607, 993, 955, 1151, 1146, 919, 883, 2454, 874, 1184, 2175, 1354, 949, 1230, 1613, 2464, 2454, 2480, 883, 1154, 2466, 873, 2473, 1203, 911, 2393, 1155, 2470, 2468, 2467, 873, 50, 1995, 837, 1656, 878, 1131, 1624, 1126, 2489, 2455, 955, 2492, 2465, 108, 2473, 2462, 2488, 2465, 1152, 1156, 2429, 2114, 2431, 1828, 729, 1830, 2435, 1832, 2437, 1834, 1591, 1174, 1337, 1717, 2127, 1719, 1842, 1343, 1601, 702, 1194, 976, 862, 423, 2452, 2264, 2504, 2472, 2461, 2473, 2464, 1152, 1626, 1152, 2469, 2505, 932, 2495, 1451, 1995, 1511, 1145, 2451, 2454, 2546, 2493, 2549, 2471, 2487, 2487, 2479, 2503, 1666, 2393, 2456, 2552, 2555, 2571, 2552, 2565, 2550, 2567, 2484, 2508, 1354, 2544, 2503, 1156, 2454, 116, 2493, 1813, 2496, 2552, 2497, 2553, 863, 2581, 2491, 1153, 2585, 2509, 2580, 2512, 2490, 1153, 2558, 2456, 2555, 2589, 2604, 2573, 1155, 2607, 2504, 2515, 744, 1581, 829, 1970, 2434, 2119, 2522, 991, 2122, 1835, 2124, 1175, 2528, 1840, 1001, 1342, 2131, 855, 1632, 890, 1006, 2136, 1931, 1412, 1500, 1415, 1389, 1464, 893, 1460, 1381, 1256, 118, 1267, 863, 318, 2635, 1463, 1416, 1458, 958, 2640, 875, 2001, 1259, 2638, 1462, 1235, 1431, 951, 1437, 1256, 2641, 2654, 915, 2656, 1482, 1462, 2650, 2186, 2653, 1127, 1413, 1460, 2669, 1417, 1034, 1380, 2644, 2661, 2645, 1203, 1419, 2675, 2666, 1380, 2633, 1425, 1285, 2651, 1429, 2636, 2186, 2644, 1496, 1256, 1062, 967, 2689, 2639, 2691, 2648, 951, 1531, 1155, 1228, 1189, 1725, 1203, 1918, 1216, 1461, 2711, 2709, 1193, 1212, 1771, 1208, 1206, 2462, 1490, 2711, 1211, 1219, 1215, 1206, 2714, 1207, 2710, 1206, 1879, 1226, 1139, 2249, 486, 1247, 1493, 1233, 1389, 2738, 1029, 974, 912, 1240, 915, 1243, 954, 1887, 938, 1248, 1456, 1605, 1682, 948, 1877, 2753, 1258, 2665, 1293, 1239, 1445, 1266, 1286, 1270, 1283, 1274, 1625, 1281, 1294, 2767, 1293, 1297, 2264, 1284, 1945, 1287, 1292, 1262, 1657, 2768, 486, 2779, 1284, 2776, 2776, 1300, 2779, 1302, 1426, 1305, 2332, 1877, 1309, 969, 1246, 1313, 1316, 2797, 1232, 48, 2610, 710, 2612, 2432, 2519, 2118, 729, 1973, 2121, 1383, 2123, 2526, 1979, 848, 782, 2625, 1599, 1844, 1004, 2629, 1232, 1146, 118, 2633, 2646, 1462, 2699, 2762, 2690, 1420, 1239, 882, 1456, 2655, 1427, 2667, 2674, 2638, 929, 2824, 2682, 2837, 1416, 2685, 1420, 53, 2832, 2688, 2638, 1419, 1667, 2692, 2704, 840, 2706, 1611, 1191, 2729, 1195, 2713, 1218, 1221, 2724, 2857, 2725, 2716, 2721, 2719, 2722, 2861, 2723, 2864, 2728, 2715, 2703, 1224, 2732, 2706, 2735, 1793, 2651, 1037, 1235, 1749, 1509, 2743, 1241, 1124, 2170, 2748, 1247, 1362, 2751, 1255, 1253, 2755, 1252, 1450, 2655, 2759, 1279, 2762, 917, 2764, 2773, 2766, 1503, 1278, 2770, 2029, 2765, 1801, 1269, 1288, 2778, 1492, 2908, 1415, 975, 1298, 1426, 2769, 2916, 1465, 1285, 2790, 1307, 2793, 1889, 869, 2796, 1315, 2932, 1318, 2113, 2611, 2115, 658, 2433, 764, 2616, 787, 2523, 2619, 2525, 1715, 2442, 2814, 1981, 1598, 2130, 2447, 1004, 1605, 1347, 1603, 1412, 2500, 2057, 2497, 2600, 1194, 1145, 900, 1256, 975, 1931, 1511, 2455, 1633, 57, 2466, 1633, 925, 2967, 2962, 913, 900, 2057, 2968, 2672, 857, 1018, 1921, 869, 1417, 1095, 858, 887, 2749, 1007, 1668, 1280, 952, 1139, 958, 2538, 877, 1362, 837, 1488, 1232, 1488, 1555, 1460, 1018, 1751, 1124, 2051, 1257, 1225, 1032, 2067, 1622, 1089, 1267, 2217, 319, 1148, 1749, 897, 56, 1265, 319, 3005, 1348, 1032, 876, 1055, 3025, 2971, 1486, 3020, 3031, 904, 3020, 3028, 1036, 3025, 1078, 1217, 3037, 1474, 1217, 3034, 2672, 1688, 1630, 1280, 2468, 1269, 2095, 2067, 937, 1230, 1144, 2674, 2171, 1265, 1438, 1124, 1751, 861, 1523, 2171, 1239, 1234, 2498, 1141, 1062, 433, 467, 1909, 1675, 1292, 2062, 2884, 869, 2079, 1931, 944, 931, 2823, 1149, 1229, 1244, 2799, 2883, 1237, 2888, 1244, 3091, 1233, 2839, 3084, 944, 1473, 1365, 1233, 1667, 2170, 2799, 1237, 3103, 2934, 1159, 2516, 370, 2804, 660, 832, 2807, 2436, 2618, 2810, 2620, 2812, 2947, 1177, 2128, 1720, 2532, 1723, 702, 2331, 1297, 2232, 897, 2734, 862, 1124, 1075, 1266, 2069, 1453, 1606, 1450, 2665, 1500, 1235, 945, 1559, 1606, 1189, 1186, 945, 1154, 1500, 962, 1606, 862, 1743, 2069, 1667, 1075, 1223, 2331, 2180, 118, 886, 1412, 1050, 1909, 2402, 1634, 1495, 920, 1616, 2887, 1634, 1124, 3140, 1634, 929, 3160, 3144, 1232, 3146, 3170, 2161, 3150, 1241, 1075, 1232, 3154, 1634, 3156, 3065, 1141, 54, 2247, 2832, 318, 3162, 3132, 945, 3166, 3128, 1456, 3169, 3139, 1124, 3141, 2831, 911, 3176, 1758, 1543, 3179, 3149, 1424, 3182, 3165, 895, 3163, 3187, 1253, 2171, 118, 1187, 3161, 3131, 1634, 3133, 3197, 3136, 3151, 2264, 3201, 3207, 929, 3220, 3206, 3178, 3148, 3198, 3227, 3183, 3214, 3155, 109, 3157, 2248, 2154, 1549, 3221, 3163, 3224, 2292, 3226, 3200, 3171, 3202, 3173, 1450, 1455, 3233, 3223, 3209, 3236, 3212, 3153, 3215, 2935, 2802, 2937, 728, 3110, 1709, 2617, 1743, 2944, 56, 1977, 1593, 749, 2948, 2444, 3121, 2627, 1532, 398, 2696, 1434, 1043, 1728, 1611, 1809, 3287, 930, 917, 2067, 871, 867, 1728, 1699, 1740, 975, 3292, 856, 3297, 3296, 3290, 3293, 3287, 2731, 1856, 1078, 2643, 1267, 1990, 908, 3195, 1498, 1184, 2472, 1725, 1152, 1752, 486, 2895, 1232, 1476, 1816, 467, 1541, 1231, 319, 1639, 467, 837, 1461, 3163, 1607, 2797, 1124, 1251, 964, 1235, 1017, 2107, 1456, 1007, 2335, 1124, 2542, 1398, 964, 937, 1145, 1500, 1476, 1398, 2157, 1354, 2495, 1699, 3285, 2546, 2461, 1146, 2641, 3168, 2665, 1488, 908, 1773, 2031, 1220, 874, 2393, 856, 1933, 1906, 1194, 3090, 1071, 2472, 1900, 319, 1396, 3328, 1758, 2639, 3137, 2264, 2097, 1443, 2175, 3130, 1194, 917, 2470, 2417, 3081, 3196, 1305, 1018, 3196, 1271, 1915, 486, 1519, 1357, 1265, 1522, 55, 1037, 3334, 3066, 1949, 3336, 3316, 940, 858, 2833, 913, 1915, 1443, 1389, 2505, 1028, 2661, 2310, 2732, 3146, 1948, 3315, 856, 1358, 965, 3130, 3071, 1122, 1124, 1913, 2831, 1026, 2417, 1365, 1617, 1012, 1026, 2977, 1384, 316, 3207, 2018, 1930, 1232, 3022, 1036, 974, 1667, 3365, 2107, 1061, 2848, 2157, 1692, 1636, 3325, 113, 1610, 3213, 1519, 3327, 2474, 1867, 1611, 1664, 2558, 3355, 884, 1267, 3211, 1743, 3001, 3451, 1566, 2045, 1439, 1987, 2171, 3463, 1251, 2630, 865, 1072, 862, 3307, 1126, 1447, 3000, 3131, 2848, 1110, 1639, 1847, 3486, 975, 3407, 1895, 2051, 1285, 1648, 3312, 3170, 1271, 837, 1519, 1681, 3404, 1461, 2744, 3407, 1061, 914, 487, 1900, 2971, 2508, 1369, 2138, 1413, 2035, 1129, 2101, 116, 993, 1028, 2801, 983, 2517, 2116, 2805, 2615, 3112, 3270, 1331, 3115, 2945, 1837, 3118, 1718, 1841, 1983, 2818, 537, 2733, 1052, 2172, 2846, 3205, 1750, 3222, 3164, 3134, 2671, 3385, 945, 3252, 3230, 3204, 2672, 3145, 3258, 3148, 2687, 3261, 3184, 3215, 109, 3189, 317, 3191, 3554, 3130, 3247, 3196, 2179, 2633, 3560, 3179, 3172, 51, 1069, 3192, 3137, 3207, 3147, 1124, 104, 3569, 3152, 3571, 3240, 3574, 2395, 3553, 3246, 3313, 3558, 3582, 3227, 3561, 1084, 3563, 3600, 3257, 3208, 3568, 863, 3237, 3213, 3185, 51, 2853, 871, 2642, 3061, 884, 1047, 3190, 1995, 2217, 1267, 1895, 1149, 3023, 3001, 858, 1093, 893, 3451, 104, 2733, 1313, 569, 1025, 3479, 1772, 1788, 871, 1766, 2875, 1395, 3491, 54, 104, 2133, 1756, 1398, 973, 912, 1789, 2086, 2417, 49, 907, 1477, 1456, 1169, 956, 2059, 1223, 2631, 1090, 3083, 3601, 3223, 3580, 907, 910, 3219, 839, 1014, 1394, 2400, 1258, 3367, 1695, 1037, 907, 3637, 1562, 1552, 940, 1654, 1389, 1564, 1806, 2660, 1124, 1009, 3673, 1763, 3605, 3584, 3253, 3586, 2671, 3610, 3591, 2145, 1748, 1308, 3407, 1515, 1126, 3400, 1314, 1522, 876, 116, 1605, 1731, 927, 2989, 466, 2752, 889, 116, 2744, 876, 108, 3502, 1194, 1547, 3706, 3070, 3595, 3239, 3186, 3264, 3533, 3108, 2518, 3268, 1831, 2942, 3114, 1590, 3273, 2440, 3275, 998, 3545, 2816, 2951, 3548, 2534, 1696, 2110, 2395, 839, 1188, 3448, 2276, 2271, 3660, 3218, 2201, 1381, 1131, 3159, 2171, 3761, 1933, 2341, 2226, 2312, 2670, 3756, 2672, 32, 1057, 116, 1057, 1797, 3286, 1422, 1017, 2846, 1517, 2000, 1894, 1347, 878, 1223, 1267, 940, 1407, 1693, 1958, 1933, 1655, 3401, 1011, 3660, 2833, 2665, 1519, 1072, 1355, 1041, 2846, 1789, 1407, 1007, 3807, 3342, 3398, 2458, 1203, 3417, 1744, 1812, 1855, 930, 3796, 3443, 1789, 1634, 3023, 1633, 3369, 2107, 921, 2085, 1079, 1140, 1664, 1358, 1621, 1660, 889, 1813, 1487, 1171, 3142, 1923, 3151, 3590, 3259, 3181, 3732, 3616, 118, 1149, 2494, 902, 856, 1424, 316, 2286, 3510, 1389, 859, 3824, 979, 3735, 1967, 2613, 2939, 1327, 722, 3741, 3271, 3541, 3744, 2621, 2527, 1839, 2815, 1982, 2626, 2952, 1183, 2261, 1370, 880, 2133, 3670, 3557, 3166, 3160, 3583, 3229, 3203, 2840, 3843, 3234, 3592, 2679, 1775, 3424, 3566, 3611, 3592, 3594, 1169, 3262, 3240, 1806, 1484, 1009, 3565, 955, 2008, 1277, 2245, 1398, 2971, 1260, 940, 3910, 1800, 2008, 3021, 894, 3909, 1944, 3918, 3923, 946, 2971, 3921, 2777, 1818, 2777, 1943, 3921, 920, 2051, 3414, 1261, 3790, 1679, 1303, 1078, 1026, 1889, 2063, 1266, 1605, 1492, 2674, 954, 1657, 1088, 1244, 1625, 3951, 858, 2837, 3946, 1038, 3952, 1055, 1247, 2063, 1292, 3956, 3005, 3949, 2013, 1237, 3950, 1027, 3963, 3947, 3960, 3968, 2703, 3862, 1322, 3864, 3536, 2940, 3538, 3868, 3540, 3743, 3274, 2125, 2623, 3875, 2950, 2446, 3751, 855, 973, 975, 1252, 929, 52, 3370, 1253, 1013, 901, 3815, 1011, 2675, 3606, 1998, 3429, 3801, 3228, 2850, 1557, 2699, 3998, 1090, 3755, 1456, 3329, 1333, 1154, 2026, 1496, 1686, 1226, 1169, 1519, 1153, 2505, 2800, 109, 1728, 1690, 54, 1883, 1818, 1940, 1818, 907, 3407, 3613, 2698, 1854, 1482, 2505, 1386, 3370, 3386, 3697, 4002, 1633, 2649, 3179, 1998, 858, 1616, 2655, 2069, 3367, 4012, 1926, 3331, 3697, 2462, 1018, 2827, 3627, 2652, 4038, 937, 2361, 433, 3932, 3096, 1145, 3389, 1796, 1806, 3394, 1686, 3913, 3448, 1364, 971, 1450, 885, 1122, 4008, 3580, 4057, 2638, 2472, 2213, 1616, 1750, 4063, 3258, 2991, 2421, 911, 2848, 1091, 3529, 945, 4090, 3167, 1456, 4048, 4004, 4051, 1420, 1364, 1079, 1498, 865, 972, 1642, 1363, 51, 108, 4076, 467, 1686, 914, 1647, 2346, 1194, 3532, 3863, 3109, 575, 3537, 1328, 990, 3869, 3984, 3745, 3986, 3874, 2949, 2445, 1843, 1344, 1004, 1549, 1750, 3256, 2376, 2337, 2178, 2271, 2382, 2251, 1517, 2213, 2281, 1251, 2391, 3598, 2289, 2377, 2144, 4149, 2185, 4151, 903, 4151, 2152, 2283, 1532, 1458, 2172, 3175, 1474, 2601, 2600, 2493, 1548, 1455, 1766, 915, 2593, 1266, 2484, 3174, 1013, 1754, 2559, 2594, 2550, 3650, 1516, 2578, 1207, 911, 1654, 1962, 2510, 1962, 896, 1354, 1131, 2578, 3468, 4189, 863, 1149, 488, 2560, 2599, 2079, 333, 1274, 1407, 1062, 859, 1806, 3137, 3407, 1905, 840, 3883, 1698, 2176, 2381, 2178, 4218, 868, 3676, 1128, 1511, 1450, 930, 318, 1881, 1821, 1135, 2145, 3189, 3996, 3676, 2335, 923, 2252, 2208, 3189, 888, 2370, 2244, 2215, 2133, 1496, 1142, 2999, 1898, 1048, 1878, 3976, 2803, 3738, 4129, 3980, 4131, 1588, 2524, 3871, 3117, 3276, 3119, 2530, 3547, 4141, 1183, 3955, 467, 1536, 885, 1194, 4105, 3414, 3640, 1266, 3640, 3370, 3442, 1134, 3649, 4231, 2551, 1226, 4284, 4016, 1768, 958, 2600, 1418, 884, 1209, 108, 2498, 3128, 3718, 2731, 1889, 3755, 857, 2156, 2382, 2143, 906, 1450, 3348, 2317, 2165, 3772, 3996, 4304, 1406, 2035, 917, 1634, 1813, 1365, 1263, 3854, 1790, 977, 1391, 50, 3723, 1427, 973, 3636, 1228, 2163, 1009, 1032, 1371, 949, 1486, 50, 4320, 840, 4322, 888, 893, 2959, 2783, 3734, 3106, 2936, 3534, 2938, 3979, 3866, 786, 1329, 3742, 2439, 3872, 2813, 4267, 3546, 3877, 3991, 973, 4032, 2059, 3484, 1898, 901, 3644, 1931, 2018, 2505, 1151, 869, 3003, 1540, 972, 3513, 3199, 2361, 1146, 1444, 1461, 1256, 1635, 2846, 2472, 3356, 1012, 1079, 4166, 2167, 4223, 4160, 2176, 4238, 2174, 4241, 2192, 2144, 3650, 3676, 2225, 4247, 2191, 2382, 2542, 3326, 1126, 2107, 878, 2157, 2959, 1385, 896, 56, 1316, 4098, 1049, 1743, 1081, 1516, 4416, 2175, 1605, 1062, 1519, 973, 2879, 1011, 859, 3421, 860, 3228, 3210, 2697, 1743, 1459, 2701, 2699, 3790, 1393, 300, 3849, 4239, 3758, 2324, 3760, 4226, 2210, 2149, 3771, 4222, 2176, 2578, 1398, 954, 3199, 4457, 1881, 3374, 1404, 1184, 3169, 487, 4423, 3470, 321, 4426, 4011, 973, 2011, 2059, 1789, 3530, 1405, 1075, 3135, 4391, 1457, 2844, 2658, 3049, 3693, 1126, 1516, 1731, 993, 3708, 4375, 1527, 56, 1189, 4379, 862, 2280, 1146, 3783, 2761, 2965, 3126, 1137, 1184, 1305, 1079, 3427, 4406, 918, 2160, 4151, 4126, 3977, 4128, 1326, 3111, 4261, 1974, 3870, 3985, 2622, 4137, 3278, 2531, 2627, 1074, 909, 3649, 3243, 4104, 3284, 3290, 3287, 1544, 2067, 4532, 3300, 3304, 3295, 3300, 2154, 1006, 1223, 3550, 3674, 3609, 4172, 2599, 2549, 1152, 3696, 1697, 4205, 1406, 2550, 4181, 1626, 3587, 3205, 4178, 2568, 4187, 2454, 927, 3142, 3424, 2171, 2462, 1230, 1194, 953, 3375, 1399, 1211, 4568, 4575, 1209, 4541, 50, 927, 3463, 1150, 2465, 2483, 2514, 4256, 3266, 986, 4130, 3867, 4355, 4133, 4357, 4265, 3747, 2529, 4361, 2817, 4270, 2132, 1383, 2331, 1014, 1423, 2653, 2059, 2395, 1012, 1357, 2634, 2826, 2638, 2828, 2700, 2830, 3604, 2834, 2677, 3332, 2659, 2670, 4608, 1763, 2967, 1365, 2975, 3328, 3096, 1889, 1449, 2740, 3100, 1057, 2737, 2884, 1493, 1509, 2799, 2875, 1454, 1864, 2172, 882, 2083, 3331, 3419, 1029, 3479, 2754, 1492, 1061, 1915, 3994, 1663, 1847, 1053, 2003, 1012, 2047, 4327, 1026, 3451, 868, 3653, 1625, 839, 1450, 1427, 3310, 3167, 2149, 4371, 4496, 3664, 1135, 2069, 4311, 2184, 2167, 1350, 2892, 1783, 1121, 3511, 1463, 4428, 3340, 1805, 1944, 2579, 1498, 1870, 1443, 398, 859, 1331, 1169, 895, 1632, 1107, 965, 3327, 4700, 2219, 2744, 1572, 1449, 1632, 1566, 1609, 4432, 1147, 1521, 3365, 1632, 4245, 2303, 4405, 903, 4512, 4257, 3535, 3739, 2521, 3982, 2438, 2811, 2946, 4266, 3748, 3876, 4598, 2533, 855, 1725, 3459, 862, 1412, 1539, 1023, 1205, 3997, 4059, 3374, 3317, 1989, 1764, 1394, 2740, 2510, 1773, 1131, 2996, 3422, 2878, 3578, 3602, 3166, 3604, 3251, 3607, 3203, 3609, 3589, 3893, 2145, 3901, 3238, 3848, 1228, 4411, 2646, 1680, 1429, 2069, 1445, 108, 2470, 2234, 2495, 3694, 2497, 920, 1259, 862, 955, 1536, 1260, 1084, 1759, 1276, 3941, 861, 1625, 1872, 4793, 1659, 3421, 1210, 299, 921, 1536, 3963, 1014, 3927, 4389, 57, 4117, 1467, 936, 1049, 1044, 1232, 1500, 2761, 4504, 1775, 3693, 2855, 3892, 3567, 3900, 3613, 3570, 3733, 3586, 4546, 4756, 3671, 3213, 907, 4759, 3138, 3562, 3203, 1228, 908, 1792, 1271, 1095, 3048, 2883, 1441, 978, 3316, 1112, 3414, 1609, 4391, 1023, 1450, 2466, 1917, 2887, 1271, 1129, 4032, 1511, 1809, 1005, 2977, 2088, 1539, 3026, 1029, 1672, 2959, 886, 878, 1129, 889, 4413, 2029, 3721, 1362, 958, 4365, 2495, 49, 4720, 4587, 1584, 4260, 4590, 4132, 3983, 4593, 4728, 4595, 2624, 4731, 3750, 4599, 855, 3850, 2042, 4607, 964, 3626, 2205, 2220, 4149, 4224, 1402, 1247, 1364, 1381, 2478, 4677, 2272, 916, 3174, 4367, 2148, 2290, 2378, 889, 4339, 1364, 4905, 1312, 4507, 4154, 2325, 4155, 4719, 4586, 4350, 3267, 4259, 4353, 2808, 2943, 4519, 4135, 4521, 2443, 3120, 4524, 3878, 2534, 2820, 3756, 2154, 4898, 4305, 3759, 2160, 2338, 1887, 1364, 4904, 4907, 1249, 3770, 4312, 4396, 2201, 2204, 4399, 2221, 4243, 1613, 1309, 4951, 4919, 1804, 2382, 2165, 4510, 2185, 3216, 3320, 2645, 2231, 1853, 1032, 3692, 1461, 2096, 4813, 4651, 3328, 2993, 486, 4677, 4648, 2176, 2010, 1769, 3442, 1922, 1154, 3383, 1105, 3196, 4780, 1922, 1765, 2846, 1443, 3437, 4997, 1625, 4811, 3170, 4780, 1286, 1230, 1776, 2264, 1876, 916, 1527, 3291, 3457, 1119, 1284, 893, 3502, 3632, 4980, 4807, 1133, 1418, 3490, 4880, 4928, 4588, 4883, 4354, 4885, 4726, 3116, 4888, 2126, 4890, 3989, 4140, 4733, 1187, 4896, 4944, 1536, 4946, 4448, 4948, 4903, 4919, 4952, 1731, 4954, 4069, 4453, 4679, 4958, 4240, 4915, 4401, 4917, 4964, 4920, 4967, 2185, 4969, 4153, 4971, 3241, 4567, 1240, 4974, 1665, 4875, 2074, 2090, 5022, 1028, 3662, 4985, 5018, 4986, 1994, 5013, 1923, 4990, 5009, 3059, 4994, 5005, 1944, 1135, 3950, 3806, 2417, 5093, 4229, 1922, 1046, 5006, 3383, 5001, 1922, 2139, 5012, 892, 5014, 1611, 5016, 4421, 486, 871, 1288, 2110, 2651, 1543, 5073, 1750, 50, 4442, 2211, 2957, 940, 3317, 4382, 2637, 2783, 1536, 4982, 870, 4984, 3643, 1609, 2205, 2245, 916, 1127, 1122, 1067, 1239, 1821, 1851, 4975, 3839, 2000, 1239, 1470, 1526, 1191, 2761, 4978, 956, 1039, 5150, 973, 1635, 5147, 1203, 1776, 1926, 1269, 2240, 4226, 2754, 5159, 3434, 2085, 2665, 2190, 2237, 2178, 4437, 2250, 2074, 4253, 1801, 1699, 3479, 5123, 857, 2875, 4157, 3902, 1305, 4214, 4612, 1402, 2465, 5077, 2682, 1280, 1479, 4909, 5134, 892, 5136, 1484, 3829, 898, 1789, 1145, 4329, 2882, 2656, 1115, 3463, 1358, 3634, 3806, 3527, 3179, 3527, 1006, 1458, 1371, 1407, 2454, 1408, 1758, 909, 3167, 5213, 1352, 3834, 908, 5208, 930, 868, 2669, 1096, 4613, 1096, 1352, 3207, 5163, 5166, 5057, 2206, 5170, 3458, 5110, 1632, 1129, 57, 1476, 1231, 1146, 2014, 1684, 2034, 1432, 4927, 3737, 4722, 4930, 4516, 4884, 4262, 3272, 4520, 3873, 4937, 4268, 4362, 4893, 4038, 1639, 4493, 2216, 2209, 2173, 2223, 2200, 3082, 1532, 5269, 2180, 5271, 4029, 1151, 4607, 3361, 3158, 5276, 1532, 2258, 2230, 1385, 51, 885, 3762, 954, 5288, 2374, 5291, 5272, 4032, 5289, 2202, 2331, 3768, 3766, 52, 1223, 1074, 48, 5297, 4912, 961, 5293, 2171, 2079, 3574, 4237, 3080, 4831, 1149, 3094, 5305, 3080, 3306, 3402, 1010, 5281, 1532, 5270, 5284, 3573, 1726, 5280, 3622, 5324, 5283, 1146, 2200, 3243, 5299, 2374, 5276, 3158, 5336, 5331, 5314, 2333, 5274, 5331, 5344, 5333, 109, 2307, 2307, 3083, 5305, 2653, 2395, 5353, 3593, 1149, 5303, 5279, 5351, 5315, 5354, 5314, 5319, 5251, 1827, 5253, 4515, 3269, 4725, 4263, 5259, 4359, 4730, 5038, 3122, 1985, 5243, 321, 1357, 5308, 876, 1559, 3850, 3593, 3586, 2285, 1223, 876, 901, 3660, 2262, 963, 3729, 1010, 1149, 55, 3666, 1241, 3660, 1436, 4309, 3729, 1436, 5393, 1531, 2846, 317, 5400, 5383, 48, 5403, 3244, 5411, 5406, 4695, 4831, 5392, 5396, 3593, 5395, 5414, 2392, 2211, 5409, 5402, 4275, 5413, 5397, 109, 1734, 5352, 861, 5410, 5412, 5405, 5430, 967, 5425, 5393, 5427, 5436, 1271, 5416, 933, 5434, 5385, 5428, 5415, 5408, 5445, 5426, 5382, 5442, 1608, 4831, 3701, 5440, 5453, 5396, 2704, 5424, 5451, 5458, 5386, 5460, 109, 2496, 5352, 5382, 5452, 5465, 5422, 1857, 5450, 1995, 5446, 5476, 5436, 5431, 5391, 5446, 1349, 5436, 2496, 3659, 5463, 5384, 5459, 964, 5027, 5252, 4351, 4723, 2941, 4591, 4886, 4727, 3543, 4729, 4596, 3749, 3990, 5264, 842, 486, 3588, 1070, 2880, 1446, 2882, 2888, 4633, 1034, 4635, 5513, 2639, 5515, 5517, 2881, 1215, 4634, 5516, 1315, 5514, 4639, 1850, 1521, 3192, 2879, 1317, 1692, 868, 5378, 1134, 1249, 5137, 1404, 5378, 1404, 1070, 2745, 1938, 1073, 3400, 2107, 1763, 1403, 3808, 3365, 319, 3288, 1675, 1557, 55, 3996, 4276, 3096, 1121, 1627, 3067, 2170, 3650, 4276, 5541, 4706, 2018, 3023, 1817, 1931, 1137, 2107, 5019, 4737, 1314, 5537, 859, 5243, 5491, 5366, 5493, 5254, 5369, 5496, 5033, 3542, 2441, 5500, 5037, 4139, 5376, 854, 2248, 5506, 4559, 5508, 1509, 5512, 3332, 1921, 4630, 5518, 5509, 4638, 2741, 5520, 5519, 5605, 5607, 5603, 5597, 2740, 2229, 4365, 4546, 5596, 5577, 5532, 1134, 1807, 5536, 1874, 1124, 1871, 4473, 1242, 5543, 930, 5545, 4276, 3091, 1404, 5570, 1036, 5552, 1114, 973, 5556, 5595, 5559, 2888, 3100, 1244, 5563, 4193, 2698, 4431, 5567, 952, 1385, 878, 1488, 3726, 3509, 2107, 863, 5575, 1874, 3322, 4972, 3757, 5616, 2799, 1756, 5534, 3136, 5576, 5623, 1315, 3449, 3096, 2086, 1642, 2011, 916, 4118, 4490, 3407, 2796, 1793, 5669, 1236, 5558, 1793, 5623, 5544, 3294, 4737, 5631, 3347, 1041, 5633, 1544, 4472, 1675, 2695, 863, 5565, 4474, 5648, 896, 5569, 5652, 5572, 871, 5574, 1316, 5658, 5578, 5365, 1968, 5581, 5368, 3740, 5584, 5371, 4935, 5260, 3277, 4938, 4269, 4733, 856, 861, 1086, 911, 4205, 5407, 2536, 2495, 3370, 3295, 1233, 3697, 1356, 1050, 882, 1055, 3453, 1443, 1418, 869, 1998, 1006, 1312, 930, 4695, 4851, 2028, 2739, 2674, 2861, 1607, 2005, 3823, 1443, 5747, 2332, 1260, 1133, 1793, 1062, 1618, 3414, 2090, 940, 897, 3517, 4011, 2505, 4859, 2987, 2029, 5772, 3517, 3961, 2164, 5243, 1265, 1748, 5623, 1061, 5766, 316, 1057, 1234, 45, 1276, 4701, 4471, 3823, 1153, 5694, 1312, 1688, 2461, 1362, 3435, 1154, 5510, 5762, 1758, 1098, 3778, 1280, 965, 2460, 1285, 1405, 3059, 1768, 1386, 4967, 1885, 1427, 3058, 952, 858, 1094, 3457, 5763, 1790, 2637, 1731, 5768, 3797, 856, 4416, 3399, 3823, 49, 113, 1398, 1347, 1095, 1748, 3023, 1112, 2966, 3449, 5767, 1112, 2035, 5774, 1029, 3389, 1486, 1493, 4776, 4369, 1312, 3098, 3402, 3592, 882, 5831, 2000, 491, 3151, 1131, 4416, 2462, 5532, 858, 1186, 1850, 5222, 2059, 1448, 2092, 4841, 2180, 1215, 1488, 3684, 4212, 1260, 1770, 972, 2097, 5379, 4369, 969, 2458, 3193, 3340, 5305, 5744, 888, 2033, 2500, 5147, 1643, 1949, 1137, 1748, 1242, 4417, 113, 3823, 3810, 2831, 3103, 3509, 5166, 3078, 5348, 319, 4371, 1382, 4062, 2035, 2843, 3446, 2686, 3348, 3496, 4618, 896, 2987, 4044, 1688, 2633, 2460, 3816, 4050, 1242, 1998, 1023, 1238, 4481, 1657, 2667, 2719, 2638, 2079, 3523, 1142, 868, 5911, 4064, 5914, 1420, 5929, 5171, 3331, 5918, 2726, 4089, 5922, 4204, 3815, 5811, 2637, 5927, 4615, 4310, 5931, 2829, 1544, 4799, 5250, 4348, 3265, 5028, 4882, 4931, 3113, 4592, 5498, 5587, 4889, 3988, 5590, 3280, 1240, 993, 1142, 3165, 968, 1186, 860, 946, 5129, 5741, 4859, 3005, 1613, 2216, 1079, 865, 1257, 5987, 4660, 4334, 1517, 5831, 2152, 1700, 3398, 1937, 908, 1247, 4339, 4226, 1519, 1362, 1050, 1487, 1367, 2696, 3449, 4951, 1369, 4951, 5979, 5162, 4675, 3815, 5995, 1951, 920, 1669, 5392, 1146, 5990, 1082, 5841, 1855, 4328, 1391, 5831, 1688, 1690, 3162, 962, 1332, 5579, 5711, 4929, 5713, 4724, 5715, 5258, 5717, 5373, 5501, 4891, 5503, 4733, 3553, 5379, 1931, 3636, 3674, 1790, 4285, 4527, 2643, 1131, 2200, 5314, 6058, 3763, 2394, 937, 397, 1626, 2583, 2481, 2308, 1194, 5469, 5316, 5319, 2284, 3880, 2840, 2265, 4147, 4160, 4948, 4162, 4162, 4510, 2178, 4399, 3618, 3755, 5557, 2462, 4611, 4050, 4439, 2830, 2679, 6072, 2539, 4173, 4549, 5281, 3220, 4178, 4554, 6069, 4561, 1559, 1023, 2663, 4086, 4482, 2668, 2838, 1949, 4559, 2752, 4752, 5148, 3023, 5097, 6117, 5356, 1069, 1686, 4185, 4561, 2584, 4188, 4032, 936, 4553, 1018, 4018, 1660, 1886, 3880, 2261, 888, 2512, 1383, 882, 1154, 3855, 2136, 3189, 5356, 5899, 2033, 1184, 1657, 6117, 3723, 2716, 1445, 6038, 3978, 5494, 3981, 6043, 4934, 4358, 3544, 6047, 5375, 3280, 2230, 4493, 1739, 1902, 841, 1089, 5816, 3529, 3631, 1111, 908, 6174, 2047, 1111, 3006, 4791, 1039, 5816, 6176, 6181, 4292, 4714, 6179, 299, 6182, 1488, 5303, 842, 6114, 1117, 2280, 4537, 1728, 3715, 3298, 1436, 4527, 1412, 1850, 3303, 3300, 4534, 3297, 1548, 5957, 1850, 1384, 4535, 6198, 4536, 2067, 929, 6202, 3284, 3304, 6206, 3300, 3290, 5696, 1797, 4428, 2463, 2141, 2450, 3640, 3003, 1088, 1057, 1445, 104, 2248, 1960, 5646, 6179, 4992, 2006, 6180, 1439, 1681, 2473, 5696, 2079, 5265, 1011, 3907, 1190, 488, 2860, 1198, 4198, 2858, 1529, 2874, 2862, 2872, 1196, 2863, 2727, 2871, 2720, 2865, 6266, 2873, 3861, 5963, 3736, 5580, 6040, 2520, 5495, 5032, 5716, 6161, 5588, 5973, 3279, 4940, 855, 1006, 968, 5267, 1560, 2452, 1230, 4234, 5189, 4324, 5131, 4949, 1766, 960, 1027, 2154, 4609, 1572, 4801, 6177, 5954, 6171, 5874, 4231, 2001, 1902, 1926, 6190, 3420, 6187, 3422, 6306, 2672, 902, 6183, 6189, 3059, 6175, 5816, 104, 4067, 1011, 2033, 6318, 3634, 3003, 5816, 6170, 2660, 3391, 4118, 1027, 1766, 1424, 4079, 6086, 4023, 3331, 5110, 5137, 4429, 5137, 2085, 6155, 4514, 6274, 6158, 6276, 6044, 6278, 5972, 4138, 6281, 3991, 5265, 4067, 3855, 3096, 3354, 1621, 2487, 1962, 2563, 2500, 5891, 2461, 6367, 6361, 1239, 6361, 4195, 1726, 2473, 2229, 1306, 2333, 4249, 4309, 6071, 1006, 1309, 1672, 4868, 6072, 5379, 1898, 3442, 2248, 3666, 3285, 842, 1453, 2422, 2682, 2773, 5959, 6092, 6331, 2629, 2634, 1419, 4064, 6094, 2421, 1893, 4099, 5918, 2842, 3693, 2002, 4559, 1553, 6410, 4384, 2835, 4639, 4740, 5483, 6401, 1538, 1361, 1576, 2402, 1545, 2405, 6072, 2407, 2361, 2419, 1574, 2411, 1542, 2137, 5557, 3686, 1564, 1184, 1566, 960, 1547, 6428, 2423, 6196, 1573, 1371, 3679, 1577, 5710, 6156, 5582, 5714, 6350, 6160, 4594, 5036, 6280, 4939, 3991, 2057, 3486, 1931, 4297, 1519, 5243, 945, 1280, 866, 5668, 5243, 4944, 6442, 2822, 5344, 5422, 1009, 1500, 2188, 1458, 6480, 1854, 4627, 3664, 3804, 1240, 3810, 2892, 930, 3644, 1541, 4695, 3505, 3627, 3627, 4627, 4469, 930, 1797, 5797, 6486, 5899, 6489, 2417, 5429, 5145, 3167, 4118, 1194, 1953, 1043, 3550, 2733, 907, 3905, 5638, 5388, 1369, 910, 1080, 2736, 5663, 1515, 4413, 1361, 3375, 3905, 6052, 1515, 1116, 2475, 1655, 3101, 5698, 5539, 2494, 866, 1075, 5656, 5707, 2933, 4879, 6450, 6347, 2806, 4517, 2809, 4134, 6352, 6457, 6354, 6459, 4893, 3281, 2231, 1561, 5908, 6215, 3288, 6222, 3286, 6197, 3294, 6200, 3293, 3296, 6566, 4539, 6213, 5019, 3291, 4879, 5327, 5120, 398, 4675, 4469, 1308, 1930, 3340, 3786, 1515, 5982, 1540, 2996, 4660, 4032, 1032, 1408, 1449, 2141, 4840, 6004, 949, 3294, 6581, 4951, 3708, 4951, 1005, 3802, 1347, 1081, 2476, 953, 2024, 2776, 2476, 2772, 6609, 2476, 6346, 4258, 6041, 6275, 5257, 6455, 5035, 3987, 6551, 5721, 3123, 855, 5286, 1131, 6071, 4945, 4851, 2758, 870, 1261, 3912, 3933, 1800, 1277, 3930, 6635, 3920, 3920, 6635, 3937, 5278, 955, 5070, 3940, 2086, 3970, 3966, 4384, 3957, 3971, 1112, 3962, 3951, 6648, 3942, 4788, 1503, 5751, 6334, 6648, 467, 3961, 2787, 3964, 1215, 2063, 3942, 3974, 1110, 3923, 3005, 3955, 3973, 6648, 6612, 5367, 6348, 6546, 4933, 6548, 6456, 6619, 4523, 6621, 1985, 5286, 1146, 1188, 1930, 5159, 5215, 4428, 1269, 4620, 1266, 5004, 2505, 904, 1451, 3511, 3408, 5227, 3375, 1744, 6362, 4990, 1763, 3859, 5764, 1491, 4384, 1517, 1451, 1657, 3440, 2782, 4651, 1498, 6015, 1538, 5890, 4629, 5606, 4632, 5608, 5604, 5610, 5601, 2875, 2248, 2263, 3510, 1856, 487, 6604, 1930, 6602, 1783, 6606, 2904, 6737, 3565, 3634, 1633, 3295, 1043, 1356, 2835, 2882, 5551, 3051, 1232, 5751, 872, 1227, 1926, 1677, 1135, 5991, 1554, 1644, 4429, 3011, 3501, 5982, 5847, 6138, 4813, 1227, 841, 1651, 1877, 4335, 2040, 3527, 3512, 1459, 3408, 3299, 3632, 3292, 858, 6269, 1320, 4349, 5492, 6273, 6545, 5256, 4518, 6681, 6618, 4522, 5720, 5263, 5722, 1475, 3354, 1012, 2508, 4572, 4572, 1009, 1269, 1856, 6509, 1011, 3190, 1131, 104, 3674, 910, 6235, 1964, 109, 1487, 3081, 4000, 4572, 1508, 946, 1887, 6735, 2538, 3664, 4472, 5244, 953, 5766, 1309, 6603, 2538, 6827, 1541, 1402, 4543, 4253, 2172, 897, 3757, 6324, 6184, 1463, 1111, 1266, 6179, 6321, 6002, 1616, 6308, 6326, 6843, 1020, 6312, 3693, 3637, 1189, 6316, 6855, 5817, 6320, 5874, 3637, 5431, 5699, 2783, 5019, 1699, 3183, 946, 3656, 2497, 5664, 899, 4480, 1470, 3999, 3813, 3792, 2267, 6057, 4836, 2408, 6426, 1371, 1540, 2401, 118, 6857, 4412, 1546, 2401, 6440, 1546, 4331, 936, 2424, 6431, 6447, 3658, 5457, 889, 2672, 4676, 1267, 4777, 2005, 3613, 2903, 1008, 930, 6142, 2497, 2079, 910, 1943, 2494, 4802, 1146, 2466, 1423, 3881, 1381, 1536, 1437, 1536, 1223, 1487, 1470, 333, 874, 1066, 5212, 6920, 2454, 1655, 1091, 1497, 2550, 2582, 2506, 1152, 2508, 1473, 6137, 2608, 2513, 2482, 4173, 6676, 5712, 6678, 6790, 6547, 4887, 5499, 6353, 6684, 6796, 6622, 6428, 2059, 5637, 1141, 5990, 5868, 6843, 6330, 4384, 6847, 6305, 3685, 6324, 2665, 6862, 6311, 6185, 2670, 6857, 1557, 1107, 6860, 6142, 6310, 1420, 1141, 1947, 4040, 6094, 2851, 2702, 1729, 1292, 2148, 934, 1875, 3758, 1364, 1086, 1026, 899, 6582, 5308, 2087, 912, 6884, 6446, 1555, 6424, 6889, 2878, 1551, 6448, 1543, 6885, 6896, 6444, 5858, 6441, 1575, 2412, 1915, 2681, 3852, 2505, 1909, 4457, 3320, 5680, 6820, 6911, 993, 5242, 3510, 6914, 3573, 1404, 4284, 1887, 4567, 4602, 4221, 4393, 3427, 3343, 1934, 1112, 3657, 5234, 1123, 4299, 6065, 1040, 1259, 869, 2043, 4428, 3852, 1404, 5857, 1422, 1889, 1075, 4059, 4811, 993, 1443, 1925, 6509, 3344, 1553, 3441, 6700, 1128, 919, 1122, 1669, 4662, 1134, 1034, 3948, 4662, 1011, 1257, 6590, 3310, 4848, 860, 1034, 4859, 3162, 1169, 4786, 4219, 4475, 1490, 1670, 3294, 1186, 3365, 2057, 1671, 3365, 1392, 1297, 3948, 3033, 5636, 6406, 4565, 1127, 2999, 5165, 1251, 3688, 4645, 1463, 4246, 897, 1309, 7041, 3484, 3852, 4925, 2313, 4971, 6543, 6613, 6953, 5031, 6616, 6792, 6957, 6550, 6959, 4732, 6961, 3753, 1063, 2136, 861, 3017, 1948, 6329, 6326, 6846, 6304, 1998, 6973, 6851, 6976, 1461, 6317, 1111, 6217, 4819, 6859, 6978, 6984, 6230, 1380, 6864, 5646, 4429, 6867, 1895, 976, 3165, 6871, 3222, 6578, 1761, 1134, 5078, 1617, 3165, 1617, 1259, 1758, 3561, 1361, 867, 6882, 1550, 6430, 7008, 6887, 6434, 6890, 7013, 6424, 6894, 1568, 6864, 6445, 7020, 6438, 3701, 1141, 7024, 6905, 4339, 2967, 2687, 1434, 7064, 3328, 6196, 1121, 1742, 1333, 7036, 1634, 6006, 909, 874, 2067, 1736, 5688, 1306, 1614, 5407, 1256, 1622, 3823, 4742, 869, 1609, 1748, 5753, 2977, 7232, 2846, 1154, 1050, 4387, 1011, 6858, 887, 1614, 1306, 5000, 7224, 7223, 3997, 889, 1944, 1734, 1931, 5549, 2502, 1451, 3783, 7226, 3723, 3859, 3997, 7238, 4606, 888, 2963, 3000, 5506, 1266, 7254, 6951, 6788, 4589, 7131, 6791, 6956, 5971, 7135, 6795, 7137, 5377, 3314, 2956, 2189, 4407, 6056, 4060, 3319, 4454, 1084, 4148, 4957, 5274, 5309, 961, 2349, 4164, 2282, 4508, 2191, 3370, 1726, 4244, 4392, 2362, 6294, 3189, 6056, 1752, 2236, 2290, 4222, 2378, 5331, 5336, 5343, 2384, 2265, 4901, 5047, 2144, 7297, 5206, 5734, 7306, 2206, 4455, 7303, 4244, 4922, 2197, 4970, 2273, 3361, 2354, 5340, 2340, 5053, 4956, 7044, 2167, 1813, 2500, 7325, 2086, 7295, 4924, 7338, 1778, 1142, 7124, 4151, 2363, 4449, 5324, 5299, 2354, 2274, 4914, 5237, 2144, 7293, 1308, 5312, 7346, 4925, 7127, 6270, 4127, 7129, 6789, 7270, 6955, 5970, 3746, 7274, 5262, 7276, 1345, 4143, 1560, 2375, 6079, 2313, 2378, 6056, 1437, 1142, 7071, 4159, 2268, 2293, 3770, 2381, 2215, 6145, 7304, 2380, 4678, 2297, 7313, 2366, 2252, 906, 4237, 4244, 2323, 2367, 2348, 2369, 2303, 2390, 4911, 6056, 4250, 2488, 2389, 7294, 2372, 886, 3702, 841, 6646, 3943, 2761, 6657, 1463, 3957, 3959, 6670, 7425, 6656, 6673, 1788, 6659, 6663, 3960, 7425, 6651, 7422, 6669, 6668, 6661, 1088, 6651, 7441, 7440, 6675, 7128, 6677, 7367, 4932, 4356, 7370, 4136, 5261, 4597, 4892, 5722, 7376, 4898, 7378, 2336, 7380, 4401, 2307, 2360, 4452, 7390, 7329, 4899, 7348, 2193, 2327, 7407, 7414, 2228, 3241, 4866, 4974, 4800, 7438, 3944, 7436, 7429, 7434, 6654, 6667, 3954, 7424, 7481, 7483, 3969, 7432, 7423, 6665, 4647, 3953, 6647, 6653, 3970, 7429, 7442, 7495, 6154, 7445, 6952, 7447, 5968, 5497, 5034, 7134, 6683, 7275, 7454, 6961, 1149, 975, 1141, 6689, 7379, 1439, 3289, 4537, 6222, 3300, 5063, 4155, 922, 5011, 2312, 1796, 3090, 1233, 7305, 6591, 2236, 7389, 7120, 3287, 3302, 7521, 3053, 7321, 2338, 5877, 5132, 894, 6932, 3446, 1697, 7124, 2343, 4497, 7398, 1439, 7520, 4535, 7553, 5997, 7548, 4162, 5112, 2158, 1796, 1236, 7530, 7347, 3071, 902, 2255, 7120, 7538, 3527, 3299, 3053, 7564, 4153, 3632, 968, 2205, 4297, 5626, 7523, 4241, 6815, 954, 5900, 3554, 7477, 7443, 7479, 7498, 7481, 7439, 6660, 7484, 6334, 7481, 7487, 7592, 7489, 7434, 7595, 6650, 6655, 7587, 7489, 7441, 7498, 7603, 3975, 7364, 4513, 7366, 7269, 7448, 5969, 7507, 7273, 7509, 7373, 7511, 1985, 1240, 3855, 2478, 2540, 1611, 1940, 6932, 6465, 7547, 7341, 2338, 4307, 7535, 4895, 5396, 1458, 1358, 6903, 7540, 2197, 2271, 7627, 2799, 1456, 972, 1398, 4219, 4497, 1541, 4219, 1439, 6608, 2476, 1804, 4163, 7566, 6492, 4070, 7120, 1240, 3688, 2930, 947, 2536, 1147, 2168, 1141, 5834, 2734, 7586, 7500, 2637, 6650, 7590, 7496, 7490, 7428, 7486, 7424, 7488, 7433, 6661, 7600, 3965, 7593, 7420, 3973, 7589, 6650, 7607, 6784, 1579, 6786, 6272, 5029, 5967, 3539, 5585, 4264, 6793, 7452, 5502, 5039, 6961, 6136, 423, 2202, 3198, 3144, 3700, 3133, 3592, 4104, 3888, 3184, 3556, 4578, 3161, 1232, 3132, 4830, 3260, 3152, 3171, 3207, 5119, 3647, 1127, 4787, 1623, 1348, 1544, 954, 1525, 4425, 1609, 5997, 4385, 1770, 4411, 1632, 5766, 1463, 1736, 2034, 2578, 2955, 887, 1478, 2219, 4413, 4421, 7068, 5508, 1151, 1100, 1066, 5005, 1891, 3444, 1937, 1018, 2779, 1621, 4637, 2085, 1014, 1365, 1498, 2057, 4549, 5194, 933, 2546, 6249, 4292, 1195, 5995, 1639, 1445, 3159, 3577, 5981, 3567, 1495, 7722, 3902, 7724, 945, 2672, 1909, 1918, 7080, 952, 1240, 1391, 1512, 934, 976, 1906, 1146, 1527, 1508, 6713, 1391, 2465, 1101, 7514, 3640, 6572, 3125, 7708, 7418, 7478, 7421, 7688, 7082, 7598, 7602, 7594, 7678, 7431, 7482, 7597, 3972, 7430, 6666, 7494, 7686, 6670, 7605, 7689, 7671, 7691, 1825, 7610, 7446, 7612, 7505, 7698, 5372, 6162, 5589, 6355, 6553, 6688, 2772, 7707, 1023, 3565, 7710, 3606, 3696, 2233, 3897, 7851, 3209, 2080, 3199, 3138, 7715, 3163, 6298, 6841, 7783, 3611, 1495, 3674, 886, 3696, 7859, 4009, 3607, 1075, 7863, 7718, 3247, 4830, 3883, 3614, 3139, 7725, 5907, 2393, 6063, 6097, 7709, 3590, 7852, 7713, 3698, 3153, 7716, 7886, 4093, 7877, 3134, 7786, 7064, 3214, 945, 5388, 4205, 3905, 6645, 7814, 7672, 6672, 7424, 7591, 7676, 7485, 7492, 6656, 7910, 7599, 7821, 7827, 3967, 7910, 7831, 3039, 7829, 7267, 7695, 5255, 7368, 6680, 7272, 7371, 7617, 7453, 6049, 7512, 5541, 6249, 4579, 1026, 4391, 4955, 4678, 7409, 7354, 2346, 7356, 2208, 3024, 1352, 3307, 3653, 4329, 5127, 4979, 7952, 1557, 1386, 4944, 6966, 7314, 7460, 4308, 7388, 7334, 7941, 2320, 7938, 3662, 2854, 1856, 7952, 5113, 4979, 2109, 856, 3635, 7947, 4404, 7294, 7396, 4899, 4306, 7350, 1078, 1313, 2955, 2286, 5025, 7952, 4416, 3451, 7971, 1559, 7983, 5236, 5169, 4401, 7292, 2295, 2215, 7947, 1535, 1040, 5176, 2105, 3825, 7951, 3451, 3156, 3434, 3128, 2216, 5045, 7315, 2222, 2898, 1352, 1541, 2979, 1271, 3631, 872, 7672, 7990, 8019, 6331, 2930, 7280, 4947, 8014, 7962, 4452, 7335, 7942, 2930, 1515, 3466, 3823, 8021, 2903, 4376, 8024, 1788, 3635, 8015, 5192, 4313, 2355, 7944, 7995, 7946, 2930, 4463, 4414, 7795, 8042, 3059, 8038, 1269, 1488, 5383, 2083, 7355, 8049, 926, 7997, 2318, 7999, 7662, 4867, 3859, 8038, 1297, 6231, 8054, 1292, 7975, 2930, 7977, 895, 7363, 6785, 5964, 6787, 7925, 5583, 6454, 7133, 7616, 6794, 7618, 7933, 1985, 866, 946, 299, 3804, 4496, 1750, 3697, 398, 3399, 5786, 3508, 5532, 1184, 3439, 8106, 2462, 3381, 8100, 7177, 8102, 5783, 3378, 2175, 433, 3662, 3443, 7176, 7015, 3228, 2578, 8106, 1203, 8106, 8117, 3441, 3228, 5701, 4102, 4673, 4496, 1117, 7001, 8103, 3147, 467, 8122, 8108, 8108, 8124, 8133, 3328, 8135, 8111, 2508, 7565, 8116, 3328, 8149, 3902, 1544, 3902, 4408, 8139, 8105, 8108, 1117, 3330, 8143, 6425, 3902, 3790, 3400, 5723, 3908, 1943, 3915, 3912, 3934, 3915, 8167, 6640, 5766, 3927, 3021, 3932, 8173, 3929, 6638, 4805, 3924, 3931, 1992, 3914, 3920, 3917, 3617, 3573, 3939, 1331, 7419, 6669, 3945, 7908, 7817, 7681, 7685, 7422, 8199, 7680, 7426, 7682, 7917, 7493, 7919, 7675, 7921, 6674, 2063, 7924, 5966, 7926, 7613, 7506, 5586, 7930, 8089, 7932, 7703, 1985, 1362, 5577, 1806, 1756, 3627, 1863, 7284, 7336, 2291, 3370, 2554, 2573, 7540, 7307, 7337, 1385, 1026, 1424, 7341, 4923, 2160, 8146, 1541, 2400, 6783, 1260, 1947, 8240, 7327, 2213, 2508, 1817, 1385, 7654, 7573, 2363, 1531, 1900, 1139, 8166, 8187, 8169, 8176, 1277, 8172, 3924, 3934, 6633, 3925, 6636, 8184, 972, 8181, 6630, 3925, 3932, 8176, 8186, 3936, 8188, 2644, 317, 7905, 7690, 8194, 7825, 7823, 7911, 7820, 7913, 8201, 6662, 7916, 7492, 7437, 7690, 6662, 8208, 7830, 7444, 7609, 4721, 7503, 7838, 7697, 6277, 6682, 8218, 7702, 5591, 1004, 6625, 467, 4715, 4494, 4025, 3823, 1656, 1073, 3515, 1070, 2697, 4432, 1909, 1628, 1083, 6963, 1743, 2060, 904, 5247, 2759, 6808, 2100, 4425, 3001, 938, 1632, 1432, 5348, 1877, 8325, 3707, 1263, 3290, 2654, 1446, 3466, 300, 5623, 6628, 5011, 8275, 6632, 897, 1448, 3923, 4974, 1194, 1007, 1104, 2495, 1878, 2392, 5099, 6966, 5443, 875, 1476, 300, 5960, 3015, 4070, 4501, 2976, 2495, 7990, 2979, 8377, 1669, 2973, 3392, 1257, 3037, 2977, 4656, 1405, 1538, 2970, 3025, 8385, 2965, 1378, 2974, 2556, 4662, 4345, 3034, 4869, 3000, 2966, 1470, 3042, 8393, 4344, 4870, 6773, 7834, 1966, 7836, 8304, 5030, 8214, 7840, 6045, 7842, 6458, 6685, 1345, 6284, 6555, 8012, 892, 874, 5593, 6236, 7300, 2342, 7287, 5055, 7392, 2644, 912, 3927, 1189, 1728, 4876, 1544, 2744, 2048, 1203, 2404, 5201, 1657, 2006, 908, 398, 7215, 1201, 7083, 1493, 7522, 1898, 1294, 1639, 2698, 1778, 1378, 2014, 4862, 2924, 3400, 7990, 1141, 3133, 1055, 1456, 4381, 1398, 1789, 3656, 5952, 4660, 1184, 5785, 1096, 2977, 3342, 5791, 4318, 5199, 1681, 1189, 2755, 5596, 6999, 8360, 6295, 1018, 3781, 1027, 5696, 7383, 4559, 8048, 4242, 6083, 1308, 8426, 2234, 7347, 8080, 7692, 8082, 7694, 8212, 8085, 7132, 7929, 7451, 5719, 8090, 8220, 2448, 1155, 1021, 6839, 3143, 4547, 2504, 6100, 3622, 6515, 7904, 968, 2540, 1156, 8522, 3135, 1382, 6067, 4180, 6070, 5638, 6514, 5630, 4553, 6068, 3050, 6106, 4530, 4560, 2484, 6127, 4563, 6515, 6194, 6125, 8544, 2593, 4436, 6131, 4207, 2504, 3849, 1194, 5644, 4581, 4206, 4583, 4208, 7502, 7268, 8413, 7839, 8307, 7700, 8512, 8219, 8311, 1183, 2135, 3551, 7717, 8526, 6099, 2547, 5323, 6401, 6103, 8539, 4293, 4182, 8542, 4205, 6126, 8551, 6412, 8559, 1538, 8561, 2609, 8563, 8084, 6453, 8509, 7450, 4936, 8569, 8310, 3280, 4032, 5146, 872, 5205, 2218, 2085, 1659, 5739, 2109, 2070, 7518, 4672, 319, 7463, 4070, 1875, 2996, 2836, 7086, 1137, 1731, 2175, 1070, 3159, 5411, 3085, 1231, 3099, 2888, 1237, 2379, 1473, 5626, 1244, 7076, 5560, 3174, 5411, 3370, 1551, 1988, 4068, 3448, 8612, 1639, 3858, 1629, 1460, 1693, 2260, 1697, 1401, 7658, 2835, 3453, 8608, 6595, 1137, 4871, 8058, 8623, 8058, 4068, 2311, 8658, 5746, 3023, 8656, 1137, 4626, 7240, 1795, 1727, 1290, 1482, 8646, 2101, 1813, 8642, 8625, 1405, 1883, 1239, 5640, 3099, 2746, 884, 2155, 8634, 3102, 954, 971, 2799, 8626, 1072, 8661, 8643, 8374, 2630, 8621, 952, 8618, 1294, 8650, 8614, 8673, 899, 2157, 1459, 5739, 8658, 8675, 7518, 4871, 8072, 8211, 2614, 8565, 8306, 6351, 8308, 7701, 6048, 8514, 1004, 2230, 4244, 4800, 6252, 7675, 1154, 7673, 7832, 7829, 7906, 7826, 7491, 1057, 7675, 7427, 7912, 6658, 2013, 8288, 8294, 8744, 8205, 1038, 3618, 1252, 5555, 920, 6689, 3578, 945, 5125, 1462, 8530, 6110, 946, 5786, 8160, 4541, 6841, 8762, 7720, 8762, 4436, 4099, 2657, 3207, 3646, 1230, 1487, 3522, 1855, 5831, 1305, 8118, 3347, 1618, 1614, 3622, 1304, 7871, 3444, 3347, 878, 7001, 856, 2508, 1478, 8315, 8159, 4232, 3059, 3340, 1380, 1190, 3731, 3902, 1025, 3453, 1774, 973, 7608, 8081, 6271, 6039, 8595, 6042, 8086, 8510, 8599, 4360, 8601, 6282, 1011, 4567, 4785, 2202, 5546, 5391, 2395, 5546, 1303, 3298, 1237, 7802, 2462, 8800, 1606, 1155, 7576, 1203, 3023, 1533, 8007, 5348, 892, 6511, 1487, 3149, 7518, 4608, 8035, 2360, 4228, 5215, 3063, 8538, 2560, 4173, 6948, 2504, 1152, 6517, 1627, 4559, 2453, 6126, 8582, 937, 1259, 1407, 1205, 4388, 2966, 3659, 897, 4204, 4582, 2583, 4561, 3156, 3836, 3765, 4171, 4828, 3885, 2179, 3674, 8525, 8520, 8528, 8578, 5330, 6627, 8853, 4555, 8534, 6114, 7870, 3888, 4834, 3254, 3175, 4764, 4821, 2145, 6817, 8434, 4784, 3689, 7183, 7421, 1516, 1217, 8906, 2499, 8910, 8023, 8906, 1624, 3457, 5411, 491, 1151, 1875, 2508, 1987, 1516, 5266, 6529, 2423, 3803, 8017, 3909, 5577, 5646, 8911, 8909, 952, 8934, 1297, 8397, 3950, 8915, 1271, 8378, 6234, 8903, 7880, 3596, 4347, 8809, 7365, 7837, 8720, 5370, 8722, 8568, 8817, 8725, 8571, 2534, 4895, 6980, 7517, 2291, 2751, 7046, 7142, 6875, 2637, 8713, 4464, 6467, 1650, 1512, 2152, 1744, 2191, 1743, 7551, 4924, 7261, 7471, 1909, 7226, 871, 5736, 1809, 4857, 4609, 8105, 1645, 4372, 1217, 6141, 861, 1262, 1497, 7413, 8079, 2391, 6731, 3021, 4804, 1280, 1065, 960, 1778, 1614, 3372, 6666, 2402, 1882, 2071, 2181, 3151, 8001, 7056, 4273, 8352, 2454, 6423, 5160, 1393, 1147, 4660, 6916, 1071, 8468, 1770, 3965, 4660, 905, 3708, 7778, 3708, 6419, 5536, 6067, 6762, 3288, 3063, 7241, 5199, 4954, 5227, 3389, 1622, 1375, 948, 2668, 2095, 5077, 1783, 1489, 1943, 1265, 2470, 8936, 2470, 1726, 8852, 1561, 1257, 3217, 5960, 4226, 8434, 1366, 3202, 3018, 1552, 1517, 4659, 1234, 6842, 9007, 3501, 1087, 5137, 838, 3694, 1061, 8345, 2536, 2964, 4815, 7424, 1251, 8057, 4872, 1276, 5146, 1262, 4844, 2495, 1276, 6672, 2837, 4489, 7065, 1114, 1563, 5152, 5782, 2033, 3516, 1517, 1621, 1422, 2100, 2035, 1470, 1306, 1655, 1964, 8594, 8507, 8596, 7271, 8598, 5718, 8955, 6164, 8819, 8573, 3853, 2172, 2824, 6091, 6672, 6093, 2829, 1453, 2397, 6396, 5228, 2836, 4620, 3094, 6904, 2683, 4612, 2844, 962, 2397, 6408, 4614, 6991, 4441, 5348, 7303, 1063, 3554, 1872, 1438, 1750, 5673, 8614, 5815, 1493, 4787, 910, 8714, 1999, 1659, 5691, 7219, 9089, 2651, 978, 4804, 1022, 3859, 1256, 1756, 4369, 3527, 8434, 7736, 2394, 6002, 7732, 7083, 8350, 1542, 1631, 1427, 1423, 8910, 1045, 5818, 3291, 2681, 6755, 3060, 862, 1642, 4626, 4294, 1449, 4802, 6916, 8704, 8490, 8804, 4641, 2025, 8394, 5819, 1923, 2554, 1539, 2644, 1309, 321, 4001, 5831, 1236, 3379, 4740, 1139, 4198, 8023, 399, 8475, 7514, 1418, 9186, 2919, 1749, 9189, 1699, 5302, 9114, 8719, 7696, 8952, 6617, 7508, 8309, 8956, 3280, 2954, 4273, 5930, 6804, 1759, 1244, 3466, 5541, 4414, 5505, 4345, 1284, 318, 2708, 2870, 2711, 7076, 2719, 2861, 6261, 6260, 9259, 2711, 3046, 4856, 4049, 3049, 1847, 1881, 3292, 8093, 2462, 1944, 1118, 5982, 1089, 333, 1132, 4491, 7514, 1490, 9279, 1443, 2721, 2044, 5842, 1222, 5348, 1423, 2170, 2681, 1672, 3130, 1049, 7076, 9061, 3342, 1064, 7023, 4292, 2667, 909, 1650, 1751, 1331, 4093, 9294, 4420, 3151, 4811, 9013, 1253, 2681, 1737, 8018, 1574, 1454, 8369, 1513, 6252, 9061, 2015, 1016, 4543, 4601, 4367, 4995, 7769, 5672, 5182, 1793, 1210, 949, 4648, 1134, 3025, 7733, 904, 8408, 1203, 1135, 5737, 1112, 2241, 6384, 9002, 1355, 6142, 1355, 3070, 2773, 1874, 5835, 2482, 9335, 1441, 1690, 8408, 2462, 9352, 1215, 1411, 6719, 6844, 878, 4255, 8302, 4881, 9233, 8213, 8566, 8953, 9237, 8724, 9121, 6460, 1369, 4496, 4117, 1872, 862, 5997, 4417, 933, 2563, 1271, 7286, 1758, 1027, 9264, 4869, 1458, 9267, 4474, 9246, 1008, 946, 4877, 4194, 8222, 1315, 2168, 954, 1448, 7766, 2264, 7709, 9294, 1046, 5688, 1012, 9298, 1632, 3478, 9301, 6672, 3642, 3940, 9306, 1642, 9308, 2332, 9061, 3555, 1049, 7728, 1022, 4686, 1371, 9317, 2057, 9319, 6760, 862, 9322, 1049, 3156, 5389, 897, 8779, 3644, 5242, 1026, 3298, 1533, 5904, 1357, 9257, 1479, 4032, 6874, 909, 7175, 3430, 5881, 4023, 1203, 5736, 4494, 8118, 9454, 3397, 1610, 9383, 1258, 1624, 1731, 1635, 6631, 1926, 4662, 2965, 1607, 1917, 6691, 4698, 1406, 4506, 5508, 1634, 4647, 1938, 1809, 4284, 2564, 1104, 9253, 4232, 6499, 1124, 3710, 4494, 7774, 1479, 491, 2455, 4571, 1297, 1215, 946, 7990, 1204, 856, 6588, 2100, 3457, 3459, 5379, 1292, 8877, 899, 1422, 2634, 1448, 1909, 5871, 8730, 2962, 8660, 4493, 3066, 936, 7650, 4063, 5310, 6816, 1383, 2298, 6469, 9328, 2754, 5651, 7938, 1750, 2903, 4232, 8775, 1493, 889, 6886, 1806, 3005, 8319, 5144, 1399, 888, 3442, 976, 1122, 4329, 1071, 953, 1475, 5785, 3381, 8164, 3716, 4382, 2555, 4777, 5766, 2234, 2498, 4672, 5179, 2919, 7015, 1505, 3298, 2591, 5991, 1742, 1407, 8718, 3865, 9370, 8721, 9236, 8088, 9374, 5974, 8819, 7705, 6297, 8754, 7850, 2837, 2014, 9134, 4006, 3226, 4617, 9145, 4611, 3422, 6840, 7876, 8459, 5810, 9130, 3236, 6989, 6409, 1276, 3531, 9148, 1793, 7258, 7665, 6026, 9547, 8484, 4106, 9006, 5486, 8786, 4011, 2264, 5146, 7001, 3394, 3510, 8793, 903, 4033, 8150, 5379, 8798, 878, 8800, 1725, 8802, 1075, 1669, 5568, 3041, 3646, 3578, 1049, 3726, 1467, 3850, 1313, 4344, 3414, 1639, 4425, 4782, 1528, 9105, 2469, 4873, 1453, 1070, 5547, 2887, 8385, 973, 1555, 1095, 8116, 5684, 5389, 1856, 3837, 931, 6380, 4213, 1128, 1546, 5533, 2584, 3291, 2499, 6869, 2400, 1134, 9574, 4352, 9576, 9235, 8087, 8217, 9580, 7844, 5722, 1407, 1778, 5044, 3839, 6945, 1347, 839, 8152, 2134, 6004, 2535, 5379, 3527, 4740, 9687, 1960, 923, 1226, 1364, 4388, 9112, 3655, 8790, 902, 1361, 915, 2417, 5160, 5764, 1515, 5731, 3829, 1514, 6965, 3331, 1821, 3926, 5697, 6497, 2854, 3818, 9160, 6519, 3131, 3447, 2179, 1616, 1280, 7232, 3315, 1860, 1790, 1768, 6804, 1857, 1456, 3803, 5952, 5766, 2841, 1790, 4297, 6747, 3492, 3556, 3131, 2280, 972, 2508, 2496, 5541, 6965, 1790, 9718, 2505, 4470, 3130, 8470, 7232, 1856, 2630, 1260, 8922, 5833, 3431, 5807, 5780, 873, 1357, 2919, 3486, 4494, 7748, 3285, 2157, 4604, 1535, 2015, 1674, 9678, 6157, 6679, 7449, 7615, 9683, 8600, 9239, 6282, 6385, 2954, 1496, 6925, 6936, 6924, 6144, 6927, 3241, 8634, 3718, 6926, 3622, 886, 2643, 9802, 3896, 3896, 9797, 2308, 7869, 6936, 3159, 299, 3156, 9804, 9808, 2080, 8825, 9817, 4028, 9811, 5299, 6920, 9806, 9800, 9809, 1157, 4029, 2461, 1261, 3649, 9821, 6920, 9823, 6920, 4209, 3065, 9835, 9805, 9799, 2080, 9831, 5358, 3935, 3649, 9828, 9845, 9828, 9840, 5348, 3157, 866, 4579, 9821, 9815, 9808, 886, 4209, 6804, 8517, 9806, 6904, 6112, 9129, 1446, 5928, 2664, 6397, 9593, 9128, 2660, 6920, 6402, 9875, 5817, 6405, 2687, 9602, 9870, 952, 6415, 5303, 2461, 8517, 9813, 4183, 5352, 9828, 9862, 9855, 3065, 7352, 928, 9845, 9808, 9854, 3125, 5305, 9851, 9838, 9816, 9901, 1144, 5267, 6936, 9867, 6415, 5230, 2652, 4616, 2665, 6990, 6399, 2693, 5044, 2646, 6403, 9140, 9881, 4039, 4438, 9603, 4484, 9402, 3065, 1931, 2216, 5661, 1230, 6532, 3088, 954, 6209, 1238, 8634, 3376, 2600, 3098, 5354, 3281, 1127, 3097, 5560, 5642, 9937, 5331, 6519, 2415, 9670, 2418, 1567, 1547, 2633, 6898, 7008, 7014, 3219, 9836, 3762, 9952, 6437, 6901, 6440, 2420, 9958, 7196, 2426, 9961, 6813, 8690, 3343, 8692, 1153, 8629, 2800, 9232, 9575, 8508, 9117, 9790, 8511, 9120, 9581, 6356, 2496, 1023, 4849, 3446, 1856, 1314, 8265, 1854, 900, 7060, 2649, 3629, 7183, 1262, 3511, 1095, 5389, 6469, 2067, 1217, 6305, 8433, 8896, 4761, 3254, 7708, 8900, 3899, 4236, 2696, 7515, 891, 8143, 1141, 1531, 4608, 871, 1877, 3884, 1887, 6719, 4000, 898, 9731, 9133, 6111, 6415, 7111, 8002, 2081, 893, 3420, 3527, 8167, 3803, 3511, 2653, 8477, 9438, 4662, 1654, 2454, 8676, 1766, 2760, 2011, 1290, 1053, 1512, 2085, 1124, 5983, 1358, 6634, 1007, 905, 1314, 9226, 1133, 1749, 3042, 1681, 6117, 878, 1889, 6744, 4977, 2678, 3765, 8542, 4820, 10017, 1143, 3477, 8137, 861, 1048, 897, 113, 10032, 7719, 3186, 2373, 6218, 3555, 3163, 10029, 865, 10031, 3177, 3213, 10034, 6417, 4619, 9928, 4565, 3764, 1763, 6001, 4417, 1297, 2469, 4406, 3512, 7792, 5019, 2742, 8002, 2024, 6755, 973, 2970, 4412, 5533, 2100, 3288, 2744, 1063, 4605, 322, 3820, 6756, 1236, 7098, 1026, 1373, 9664, 4378, 4052, 6011, 7891, 8897, 5457, 3143, 10016, 3704, 5696, 3463, 943, 8490, 1269, 2584, 4393, 1644, 7102, 4152, 8668, 6530, 5691, 1958, 8470, 8407, 6437, 5751, 1011, 3723, 2016, 4344, 2016, 316, 5144, 6518, 4554, 1055, 9660, 1912, 3353, 10077, 3190, 10079, 3898, 3704, 10082, 1169, 2075, 1309, 902, 10085, 10088, 7719, 3263, 9367, 5965, 9369, 9983, 7369, 9985, 8816, 5374, 9988, 6553, 8421, 2259, 1412, 9544, 10030, 5765, 914, 1634, 960, 487, 2063, 3655, 6067, 2537, 1618, 6638, 3781, 4740, 1256, 3056, 3555, 7084, 5808, 7165, 5809, 1446, 1544, 4707, 7051, 1352, 5227, 1631, 1154, 7001, 3365, 8706, 3131, 4475, 4292, 1124, 6502, 9726, 1016, 5779, 3365, 1231, 3063, 7077, 4865, 1290, 4870, 1789, 5166, 1401, 2832, 1269, 4475, 1758, 9107, 3049, 5786, 2740, 2454, 8779, 1203, 10169, 2973, 3641, 6466, 838, 1378, 1100, 2473, 5873, 6643, 3408, 1256, 3182, 1691, 7762, 5779, 10207, 8487, 10205, 8808, 8504, 8810, 6451, 6614, 6349, 8597, 10196, 9119, 10198, 9685, 6961, 9241, 1187, 8011, 1331, 6465, 9501, 1613, 3945, 1145, 6764, 2754, 5932, 1921, 2992, 5598, 1260, 6714, 1918, 3034, 6737, 7458, 4960, 2378, 4602, 8078, 2166, 7979, 1229, 9633, 5517, 3723, 1278, 859, 4411, 1748, 5651, 4062, 3839, 10064, 1451, 9532, 1413, 2107, 4477, 3048, 5902, 3860, 2888, 10317, 5058, 2208, 10320, 7119, 8997, 4719, 5907, 1603, 5353, 5301, 8423, 2177, 8014, 7042, 7940, 4910, 7965, 4602, 7994, 8497, 3705, 3484, 10321, 5067, 2259, 3575, 10363, 4447, 8013, 4308, 10359, 7963, 10361, 2670, 10363, 8062, 10365, 5297, 4716, 2350, 4718, 2228, 9981, 9679, 10194, 7928, 9118, 6046, 7843, 6552, 5722, 1185, 5379, 4755, 2647, 2827, 2669, 1419, 4551, 912, 4838, 2047, 3140, 10252, 3640, 9047, 8330, 9214, 1220, 2839, 300, 8760, 8045, 2176, 2139, 1470, 904, 1812, 7416, 4602, 1948, 8226, 1758, 4327, 1761, 6906, 4868, 10425, 6765, 3509, 1900, 8027, 5046, 8029, 1006, 5301, 6235, 2847, 4497, 3994, 2508, 4740, 3198, 1576, 1895, 1632, 7902, 7736, 7585, 3010, 1953, 10096, 1237, 3769, 7787, 10430, 2402, 7800, 4117, 2080, 4958, 5160, 6827, 10422, 5167, 10318, 7996, 10440, 6064, 3600, 6582, 3386, 1904, 9178, 3198, 5226, 1448, 4059, 1189, 4056, 9928, 2676, 9884, 6811, 7849, 10148, 9223, 837, 3154, 1521, 4292, 860, 2059, 1032, 10498, 2186, 1696, 4436, 10368, 2191, 9786, 6452, 8813, 10291, 8216, 9986, 10294, 10395, 6622, 3550, 1194, 9126, 5616, 6724, 5598, 5524, 5510, 5516, 5509, 10520, 5611, 1749, 10262, 4637, 4749, 4637, 10529, 1037, 4543, 9160, 5661, 2736, 10519, 10530, 6729, 1112, 1449, 10526, 5521, 5525, 5609, 10532, 10544, 6726, 5612, 2392, 3347, 6925, 6236, 10183, 7003, 10000, 4870, 3369, 1026, 3839, 1012, 1424, 3628, 3481, 2584, 5648, 837, 1415, 4738, 3444, 6053, 6284, 10384, 7358, 10322, 6086, 900, 2193, 8238, 3769, 10377, 5193, 3842, 9619, 10248, 4993, 8676, 2061, 8740, 2472, 1875, 5224, 5292, 838, 7463, 2212, 8032, 7316, 4154, 7411, 1062, 4497, 8378, 6319, 9498, 1207, 3000, 1659, 2071, 2996, 1378, 3005, 3631, 6234, 1012, 1475, 10574, 7998, 10505, 10388, 9787, 6954, 10391, 10292, 10393, 8418, 6960, 1985, 4735, 1818, 3190, 6358, 2821, 3686, 8941, 8439, 2455, 4285, 8589, 3435, 1384, 10050, 9447, 1562, 1397, 3231, 7849, 1242, 1864, 8624, 5792, 10643, 9836, 2032, 9976, 8941, 4412, 2584, 2157, 1654, 9817, 3593, 1455, 1066, 2084, 10638, 10659, 8937, 10506, 10289, 9788, 7614, 10510, 10197, 6163, 10199, 5722, 1995, 8762, 4493, 7767, 3466, 4856, 7528, 1364, 5196, 10107, 5129, 4428, 299, 7776, 1773, 5742, 1480, 4006, 6627, 4420, 1406, 9076, 1266, 9660, 8061, 5724, 3063, 1357, 4964, 1508, 6519, 938, 6244, 10691, 1393, 1132, 3680, 5838, 8800, 4945, 10698, 1086, 1201, 1154, 1373, 8188, 1016, 2891, 6839, 6108, 6849, 8434, 4854, 8326, 10259, 5960, 5146, 8650, 1402, 5707, 1928, 878, 7112, 5787, 4318, 1389, 1631, 3693, 3232, 10641, 4863, 1654, 896, 10653, 3718, 10088, 10656, 4194, 9447, 8681, 7141, 4579, 6644, 10665, 8937, 10658, 10758, 10670, 7130, 8414, 8567, 9373, 9792, 9375, 6553, 10397, 3883, 10437, 10374, 2239, 5324, 2259, 2223, 10618, 8066, 7295, 903, 7318, 7283, 8428, 2318, 7302, 7339, 5938, 4507, 3772, 2227, 10155, 8064, 2822, 10580, 2379, 10360, 10583, 4399, 7344, 7304, 7326, 2226, 8242, 7360, 4098, 7362, 10620, 10191, 8083, 9115, 10508, 9984, 10674, 10293, 10676, 10295, 7277, 3282, 7476, 4900, 8424, 7282, 7299, 7548, 8429, 4395, 5055, 7289, 2259, 10299, 10373, 7960, 2176, 920, 7318, 7393, 10793, 8235, 5675, 7324, 7361, 4968, 4509, 5066, 7466, 6036, 3620, 7943, 5168, 10365, 7358, 7344, 7283, 8502, 10812, 8948, 8411, 8564, 9234, 6159, 9682, 10511, 10820, 10513, 797, 3080, 8314, 3552, 1012, 10106, 7854, 7411, 3216, 2309, 4944, 2662, 7382, 10799, 3189, 6376, 5146, 1009, 5268, 1926, 839, 1559, 9654, 2223, 5413, 8689, 6284, 3079, 2453, 6058, 931, 10875, 2307, 10877, 5068, 3217, 6839, 2261, 10901, 7936, 10877, 10621, 10507, 6615, 10817, 7699, 10770, 9987, 10821, 1345, 1118, 2630, 10648, 4230, 7888, 3179, 7006, 7186, 2404, 9540, 6424, 7876, 8768, 10090, 1500, 10099, 8061, 8586, 8550, 2550, 9632, 3584, 7882, 8282, 4504, 6203, 3285, 6200, 6207, 6220, 6569, 6558, 10949, 7570, 3803, 6564, 3295, 6568, 6572, 10580, 5506, 7291, 9654, 5270, 1269, 949, 2216, 10024, 6804, 2846, 7024, 10059, 2096, 2091, 7672, 2095, 2101, 10973, 3994, 4329, 2109, 2104, 10978, 1492, 2103, 3456, 10982, 7423, 10975, 5025, 10976, 10981, 5285, 1614, 1931, 9858, 3762, 7289, 7312, 9832, 2180, 1120, 962, 10962, 7410, 5224, 1612, 9110, 3622, 1931, 6839, 5347, 10516, 6714, 3190, 9945, 1898, 10537, 5607, 4842, 5608, 9653, 2463, 5625, 10311, 1509, 7076, 10540, 2173, 6689, 5541, 10543, 9885, 5600, 8800, 9654, 6237, 488, 10539, 5779, 5522, 8409, 2430, 10814, 10193, 9116, 10195, 10818, 10626, 6620, 10628, 854, 5041, 3080, 7728, 6360, 2487, 7732, 1928, 3468, 6364, 6374, 2463, 968, 1347, 1107, 960, 4428, 4801, 8174, 8447, 1384, 6368, 6362, 11061, 9449, 4196, 2509, 11074, 6371, 6364, 2544, 1609, 1856, 11068, 1953, 2219, 9377, 1107, 519, 4199, 1621, 6369, 4543, 1681, 10633, 4472, 1761, 10644, 7013, 4391, 1753, 10051, 3392, 7076, 5835, 3961, 1391, 9618, 1620, 6932, 10921, 2925, 2925, 6768, 6947, 5279, 2054, 5137, 3013, 2025, 1067, 6066, 4179, 2550, 1693, 10339, 4032, 7556, 1660, 1213, 1930, 2728, 1515, 2655, 8934, 8238, 1920, 4668, 8934, 2672, 4740, 1656, 1128, 3208, 4666, 1256, 9726, 4814, 10602, 4040, 8936, 1385, 5568, 4862, 5010, 1699, 2086, 10704, 4190, 866, 1480, 2639, 6747, 5547, 9047, 1401, 1438, 1555, 2170, 1057, 1247, 9099, 11102, 2672, 4214, 1408, 1621, 2399, 4506, 4040, 8767, 1022, 8709, 9511, 1265, 2982, 6650, 1021, 7776, 3930, 9192, 7990, 1806, 10766, 7504, 9577, 10866, 10675, 10394, 8419, 484, 5041, 10202, 4531, 6561, 11119, 6560, 6571, 4538, 10955, 6564, 6562, 3302, 10956, 6571, 9848, 5321, 9946, 9934, 5641, 9941, 8631, 1403, 6532, 6520, 10521, 5604, 6725, 11226, 10528, 4636, 10540, 2200, 11203, 8685, 3092, 10261, 2170, 11222, 8839, 7643, 11016, 11229, 2882, 11038, 10546, 11231, 10545, 9841, 1148, 1632, 2154, 9631, 8100, 1876, 1773, 3459, 8622, 1271, 7743, 9742, 6911, 877, 1660, 4420, 1383, 1236, 6249, 7167, 10169, 1897, 1765, 5012, 7169, 2081, 4294, 2667, 8071, 8658, 11261, 2264, 3803, 2472, 3400, 7530, 7030, 1448, 1316, 7058, 9016, 7177, 8345, 7257, 4477, 10881, 4007, 9617, 5159, 8610, 8436, 8622, 3508, 8322, 9409, 3081, 1199, 11283, 840, 9452, 6503, 4059, 3658, 3802, 10215, 1610, 1184, 5766, 11315, 4740, 1242, 9441, 3337, 3137, 4215, 1070, 7021, 9431, 3561, 1610, 10007, 9696, 9244, 2001, 1189, 956, 2657, 5226, 5841, 1559, 11253, 9620, 6022, 5649, 2175, 1037, 6944, 1387, 4427, 1775, 1090, 5161, 4811, 4666, 1243, 6249, 11337, 9743, 4112, 7068, 3823, 1730, 10331, 1859, 1019, 3716, 7766, 1011, 8329, 871, 6801, 5517, 1313, 1257, 2051, 1881, 1347, 4428, 2041, 11302, 3340, 3444, 5780, 2662, 4007, 11367, 9305, 8805, 8797, 3482, 1472, 5851, 2075, 6565, 861, 6801, 4786, 1079, 3909, 841, 6489, 11385, 7035, 4114, 6930, 946, 10561, 11319, 3177, 5012, 1226, 6526, 6487, 4307, 7849, 3165, 4601, 1736, 4339, 3880, 1634, 8158, 1347, 1541, 2882, 11255, 2168, 10871, 1070, 5472, 10570, 862, 10086, 7068, 1640, 10331, 1473, 6244, 1413, 6244, 1231, 968, 5939, 5094, 1958, 10690, 3340, 4025, 4671, 2410, 6804, 9344, 3663, 10331, 4660, 11382, 7859, 3047, 1864, 2600, 3071, 9512, 913, 1384, 1614, 10339, 1253, 5227, 5747, 5018, 6226, 7646, 1934, 5780, 9740, 3374, 917, 1906, 5433, 4309, 11140, 1750, 1135, 3527, 3414, 1048, 5683, 9037, 3688, 11470, 2149, 7002, 4214, 11462, 9529, 1234, 10059, 4420, 5780, 4276, 10148, 11460, 1132, 1473, 6587, 1116, 1672, 1121, 2264, 9552, 837, 1960, 10044, 10634, 2087, 4777, 913, 3463, 1648, 5886, 899, 10497, 3340, 7752, 11439, 2134, 6870, 1898, 9692, 1251, 2074, 10086, 11233, 1603, 5413, 11430, 1761, 3063, 1226, 11434, 11527, 3402, 2425, 11524, 891, 11442, 5740, 5705, 8989, 10339, 1792, 4070, 6432, 11450, 2181, 11452, 1169, 7076, 2264, 11456, 3511, 11458, 9659, 1546, 1607, 11463, 8984, 5227, 960, 6489, 3386, 5853, 1636, 7625, 1268, 11473, 1856, 11475, 1450, 11482, 5410, 11480, 11431, 9669, 1553, 3356, 11575, 9066, 2419, 6762, 11440, 5939, 5736, 7002, 1121, 9002, 3723, 1135, 2332, 4494, 5832, 891, 1963, 3405, 1864, 2742, 11506, 4434, 913, 11509, 936, 1644, 4411, 5212, 11514, 1358, 11517, 1767, 11519, 2332, 11520, 6492, 1268, 11543, 7165, 4302, 486, 11528, 1297, 11481, 1205, 11194, 8305, 9681, 8815, 10819, 11199, 11050, 8312, 9888, 9952, 9359, 3061, 3331, 6886, 3189, 3012, 5835, 3048, 1658, 1116, 1085, 8436, 2175, 2175, 9111, 9761, 1674, 1533, 9767, 1737, 8557, 948, 11280, 1926, 4279, 1557, 1276, 7556, 10411, 875, 1265, 9634, 1463, 875, 1813, 1290, 7089, 1274, 1486, 1239, 899, 11676, 6008, 9080, 1924, 5006, 5817, 1851, 2692, 1511, 4645, 9337, 841, 1391, 2001, 11464, 11083, 917, 1875, 919, 10339, 8433, 10484, 10032, 6714, 1371, 11645, 3291, 9332, 10341, 7098, 9396, 4876, 8464, 10072, 3429, 2651, 10305, 5429, 3125, 7402, 1639, 3081, 4870, 11167, 920, 3501, 9168, 8143, 1145, 1749, 1487, 5799, 8830, 6992, 2497, 2218, 9093, 1463, 1944, 1947, 1896, 1148, 1527, 2996, 11520, 1029, 10611, 3482, 11745, 1864, 3776, 4344, 1217, 9629, 11650, 11405, 2682, 1267, 2762, 871, 2743, 3395, 10272, 8624, 6008, 5011, 9770, 8631, 4572, 11129, 10062, 2003, 1549, 1203, 3810, 4219, 6132, 11520, 9697, 865, 3941, 2142, 889, 1257, 2495, 1143, 1446, 11064, 1768, 1012, 2584, 3823, 1786, 3081, 3823, 7742, 1912, 5198, 4870, 5505, 973, 1153, 3295, 1634, 9980, 10813, 8506, 11044, 10816, 11046, 10915, 9579, 10771, 10677, 6622, 5593, 4640, 4158, 6080, 3772, 9703, 8975, 6084, 4153, 6338, 2391, 7936, 3564, 3096, 3466, 4801, 9415, 1244, 1998, 9857, 9946, 4219, 1398, 8658, 1133, 3353, 3408, 5897, 1040, 1450, 4979, 2393, 11461, 10207, 1508, 11308, 2712, 3020, 1141, 10588, 1110, 8972, 6494, 3916, 5577, 6006, 5079, 4302, 9257, 1486, 3466, 8337, 1427, 7903, 3217, 1215, 4665, 1288, 4817, 2639, 5481, 5342, 1424, 2698, 1208, 6829, 11755, 5903, 3323, 10500, 1746, 7808, 1481, 3633, 9546, 1740, 2929, 1958, 5288, 2002, 1804, 10656, 11613, 4365, 3344, 4211, 11607, 6509, 10259, 8685, 3023, 1449, 8333, 2466, 1079, 5508, 487, 5508, 6974, 10477, 1617, 2901, 1936, 2742, 7798, 2735, 1391, 11706, 1918, 2067, 2853, 901, 3677, 1805, 3486, 2069, 5982, 7719, 8867, 10169, 9269, 9154, 10497, 1769, 2404, 6238, 3403, 4232, 972, 11641, 5123, 5841, 2762, 4432, 3683, 1443, 11100, 6430, 9302, 10486, 1915, 10005, 5158, 6808, 10053, 11572, 1149, 9800, 2743, 7179, 11033, 2712, 11027, 5353, 9946, 6723, 10522, 11032, 5516, 1496, 3786, 3355, 6930, 2417, 1956, 10050, 4539, 5411, 11000, 7241, 10695, 1393, 2761, 5836, 4318, 1210, 6606, 3348, 3434, 5531, 5680, 4567, 2084, 1476, 1416, 5650, 5551, 11872, 3357, 4804, 960, 8273, 4579, 4364, 1117, 3182, 856, 10169, 3835, 9781, 9366, 10861, 8303, 10863, 9680, 10865, 11634, 11048, 7136, 7619, 5592, 1226, 4763, 8961, 7541, 6082, 11823, 8975, 6085, 7357, 4167, 3880, 4763, 9529, 11925, 10125, 5152, 3710, 11698, 4645, 10733, 11917, 5010, 1355, 5674, 6974, 947, 877, 947, 1407, 10227, 8804, 12043, 1290, 5812, 1112, 4368, 5328, 908, 9338, 3388, 11057, 1949, 2379, 1213, 1770, 2999, 2008, 11673, 4389, 5511, 4998, 10976, 6537, 10412, 3327, 3466, 1695, 1506, 1029, 11877, 11963, 1228, 7070, 11887, 3184, 8586, 1316, 9501, 1657, 11870, 1105, 4338, 2725, 11866, 11526, 1960, 4344, 11374, 3322, 11085, 969, 8968, 3040, 952, 11990, 7779, 6666, 7762, 10088, 7209, 4712, 953, 11576, 1923, 10059, 4666, 6072, 3690, 11839, 2640, 11836, 487, 3855, 1858, 5779, 11832, 4639, 1987, 6203, 3916, 12016, 4534, 12014, 1453, 2832, 11266, 1690, 12008, 5858, 1533, 3298, 7803, 9365, 8238, 467, 5075, 1681, 333, 4651, 8483, 3376, 4461, 1402, 6506, 857, 6696, 10545, 956, 7161, 1199, 3559, 4666, 1270, 11984, 1684, 1026, 6226, 6226, 11980, 6095, 6581, 5565, 11024, 5739, 11031, 5317, 11971, 10521, 5598, 6725, 5509, 9813, 1678, 491, 1365, 4205, 4168, 10334, 3170, 9447, 387, 1458, 962, 8501, 6131, 1267, 1210, 1605, 3529, 2779, 1194, 2247, 2423, 11936, 1086, 4469, 10148, 1854, 11941, 3103, 4365, 3327, 3839, 865, 6747, 9365, 6875, 8983, 12224, 1348, 11631, 8951, 12022, 10392, 8417, 11049, 7374, 4142, 2041, 6072, 2396, 1122, 1905, 3163, 1763, 6495, 1913, 1765, 1769, 1917, 10009, 1920, 6233, 2010, 1778, 1926, 1138, 1928, 8350, 1784, 1775, 3769, 1788, 1936, 1792, 3712, 1795, 1797, 1376, 8177, 1268, 1815, 4967, 1900, 1906, 11193, 10911, 10671, 10623, 9789, 11047, 12232, 12025, 8091, 2448, 1066, 2459, 7728, 3826, 10009, 2402, 8345, 10315, 10008, 1274, 2674, 2554, 3063, 3914, 7950, 5946, 2097, 10069, 1103, 12204, 5691, 8389, 4982, 993, 10220, 11759, 5533, 1458, 7231, 2568, 1406, 2090, 11188, 3294, 6806, 1045, 9196, 5822, 1446, 11308, 11642, 3063, 12291, 486, 2674, 1956, 10315, 2048, 1750, 4644, 1194, 7645, 1316, 1263, 1797, 3292, 1131, 1898, 9520, 1263, 4506, 4787, 7974, 5176, 1775, 6815, 1532, 8283, 1426, 4049, 2191, 5532, 1694, 1086, 7547, 7645, 4226, 1699, 1555, 11373, 3794, 2005, 1376, 8117, 9761, 1620, 1622, 1625, 11135, 2470, 8612, 10055, 4318, 1633, 1635, 4458, 2773, 1767, 4461, 9420, 6762, 2696, 1647, 1767, 4799, 1651, 10616, 486, 1655, 8445, 7990, 1660, 1411, 2475, 3833, 1666, 10310, 11711, 10616, 1673, 9646, 11667, 3517, 1679, 1008, 5209, 1683, 3632, 1185, 12228, 10864, 8814, 12231, 6279, 12233, 12026, 484, 10515, 6625, 2452, 1896, 299, 5804, 5648, 948, 10325, 8791, 2837, 10069, 11835, 6819, 7151, 6985, 6854, 6978, 1350, 842, 6315, 6982, 7159, 6852, 6321, 3160, 9144, 2850, 9879, 12422, 11800, 12425, 5553, 4689, 1375, 894, 4791, 4876, 12432, 6429, 3687, 2426, 7188, 1558, 10633, 7191, 6893, 7016, 861, 11418, 2092, 11886, 870, 4341, 1659, 10090, 8832, 2168, 2631, 5145, 10824, 7281, 5070, 4973, 8228, 7301, 8430, 7409, 9905, 4220, 10801, 8046, 10380, 8496, 4400, 2208, 2133, 9866, 10364, 12494, 8498, 6499, 3783, 4022, 10811, 4926, 11807, 8811, 10815, 10913, 11811, 7841, 12416, 12280, 8726, 537, 3667, 1877, 2262, 10775, 10923, 3146, 3606, 3580, 7716, 10775, 7895, 10932, 3163, 9730, 7901, 5430, 6922, 11836, 10776, 10837, 2179, 1362, 6578, 1681, 839, 5745, 1912, 1096, 11693, 6970, 4292, 4006, 3334, 1770, 1768, 3804, 5072, 1725, 6514, 12439, 10418, 2167, 3046, 6630, 9471, 2048, 896, 8704, 3008, 3693, 8427, 9940, 8688, 8637, 11239, 8631, 8688, 5356, 887, 8691, 1236, 8693, 9979, 3086, 1243, 12576, 2136, 6236, 2755, 4232, 2737, 3479, 8071, 1267, 2112, 12506, 10288, 10767, 9371, 9578, 9791, 10917, 10869, 1345, 9654, 467, 8879, 4184, 6967, 7145, 6845, 6309, 6186, 7149, 4836, 11915, 12607, 1393, 4376, 7154, 6313, 6980, 6974, 12615, 6319, 6985, 6322, 12439, 8945, 4825, 3669, 3193, 3556, 3248, 4037, 12555, 7007, 10928, 7009, 6888, 7190, 2416, 12466, 6446, 7017, 9959, 7197, 6901, 9891, 3565, 10935, 10145, 4767, 3615, 3572, 3157, 9865, 10554, 10836, 10357, 4399, 10839, 956, 4425, 1053, 11503, 3907, 8791, 4009, 319, 7711, 319, 11283, 2260, 11333, 8118, 8128, 8119, 4777, 11450, 9740, 1665, 12010, 8234, 7322, 4393, 2378, 6236, 10504, 12505, 12018, 9368, 9982, 11045, 10624, 12278, 12512, 7510, 12281, 4142, 12193, 7279, 12654, 8425, 9690, 1686, 10788, 4394, 7639, 2670, 12488, 4227, 12490, 4957, 12492, 10854, 12499, 8902, 10890, 9910, 12498, 4961, 12500, 12482, 6644, 10859, 10351, 9857, 3896, 1077, 8359, 7144, 6302, 6970, 7148, 2830, 3887, 4481, 10102, 4483, 2669, 10741, 1633, 5786, 1620, 1215, 8757, 1110, 11342, 12544, 11670, 4109, 1013, 12641, 1554, 7198, 12438, 2681, 2399, 9967, 2409, 2405, 12468, 11283, 1217, 11666, 1112, 1618, 4794, 3253, 8837, 1923, 1257, 1926, 919, 12740, 1029, 12742, 467, 12744, 10712, 12746, 10753, 11915, 6969, 6242, 6173, 2061, 3531, 12274, 12593, 11196, 12023, 12279, 12693, 12514, 702, 1516, 8448, 5997, 9544, 10118, 1253, 2107, 10875, 11640, 6755, 1995, 3027, 4327, 9480, 2100, 8188, 3380, 9761, 2670, 6813, 7304, 8191, 10130, 1071, 3527, 4215, 3356, 12806, 2097, 1543, 12803, 3392, 5118, 10551, 3158, 2298, 11465, 2092, 2985, 7955, 5862, 5151, 1232, 4707, 5147, 11184, 11650, 2999, 1522, 2498, 11142, 10246, 7236, 9225, 2649, 3642, 1083, 2924, 2744, 12112, 5243, 1667, 11231, 5899, 1119, 11316, 1486, 2761, 8911, 7084, 2660, 9126, 8881, 12629, 10729, 10012, 3585, 9137, 9477, 12390, 1525, 6231, 9285, 5083, 2423, 6492, 12373, 9551, 11990, 5623, 9946, 4686, 3640, 2667, 6020, 9226, 11965, 3411, 11142, 11142, 11588, 4652, 11694, 1773, 2008, 12373, 2087, 10265, 5894, 11476, 6902, 9060, 7093, 1666, 8551, 9851, 9965, 7191, 2403, 9968, 1568, 3600, 12641, 9972, 7010, 6813, 9877, 8553, 8592, 4585, 12591, 6544, 11632, 12230, 10625, 12789, 8513, 8957, 4894, 6922, 6443, 7385, 11820, 7285, 4150, 11824, 4165, 10829, 7666, 5328, 11819, 7460, 11821, 10806, 4163, 12035, 10788, 11927, 2679, 4171, 8862, 8521, 8888, 4176, 8531, 11123, 6105, 8584, 8899, 10937, 12906, 4188, 8222, 9546, 4195, 9104, 2821, 4709, 9361, 10601, 2959, 1572, 1921, 3835, 1045, 1006, 3650, 3415, 12920, 2548, 4208, 9855, 1268, 1931, 5930, 4214, 5671, 1474, 10875, 12525, 7959, 12655, 2239, 7299, 12708, 5055, 6379, 7299, 4252, 5139, 11961, 4233, 3555, 3793, 2133, 4450, 1062, 6337, 10807, 8251, 2133, 9511, 4701, 8370, 4093, 9573, 12785, 11195, 11633, 12415, 6958, 12790, 12930, 10516, 4775, 2681, 1610, 6901, 1773, 8860, 4982, 1230, 8436, 4226, 3140, 4337, 904, 4663, 4989, 5129, 1626, 3405, 1395, 2010, 4463, 3096, 13039, 6226, 9214, 11101, 9399, 1389, 5905, 4651, 11319, 12658, 2977, 10227, 11347, 1523, 1242, 3001, 8330, 1020, 11739, 12885, 5873, 2833, 4713, 1926, 2955, 1500, 1664, 7742, 3025, 11955, 1020, 3530, 1358, 3631, 1392, 2539, 8647, 7514, 9072, 5025, 8795, 3508, 10684, 4057, 11151, 1121, 9332, 6877, 3517, 3182, 9226, 1557, 3715, 5155, 1960, 6492, 1194, 3025, 4815, 6241, 5147, 13009, 2058, 4498, 5840, 4780, 905, 12820, 6805, 3023, 9210, 5105, 8705, 1503, 2168, 4168, 3129, 4487, 3502, 333, 8610, 9160, 6935, 1146, 7570, 6702, 1252, 9511, 1040, 1563, 7236, 5747, 973, 3144, 11256, 5672, 6718, 2887, 9226, 1750, 3858, 2029, 3007, 1800, 1305, 2915, 3514, 1087, 7801, 5084, 9619, 2482, 4003, 4032, 7112, 1305, 1631, 5511, 10976, 2002, 2010, 2030, 1699, 1915, 8657, 6187, 3039, 1087, 5485, 2764, 911, 1872, 10253, 7798, 3314, 2554, 6755, 1209, 942, 12212, 4232, 2779, 1683, 2771, 2696, 6169, 5000, 7794, 6643, 5832, 2058, 8820, 6711, 953, 3326, 9304, 7064, 12104, 1622, 1661, 398, 1896, 9503, 12111, 4469, 11779, 2065, 3027, 11883, 3654, 11904, 1169, 3994, 3479, 7115, 1222, 13019, 12925, 12414, 12927, 12692, 12929, 9240, 1987, 9333, 1303, 9621, 9104, 1266, 4856, 3451, 1607, 1129, 1270, 6495, 6204, 9756, 4428, 1737, 1644, 7575, 11906, 1112, 13054, 8702, 6584, 11476, 1290, 2767, 1045, 4744, 8434, 12147, 956, 1393, 5766, 2393, 9557, 5633, 12894, 4384, 5156, 11784, 4651, 4666, 10592, 1394, 3993, 9047, 2086, 1147, 4789, 1045, 7730, 7104, 13253, 2846, 1057, 12060, 2010, 1066, 6762, 13247, 11344, 3527, 6204, 10562, 4645, 11367, 10133, 4708, 9104, 1026, 10940, 1476, 6869, 1479, 6630, 2157, 5211, 4434, 3320, 1643, 10073, 2725, 11922, 6530, 11779, 9538, 5817, 2721, 1657, 3859, 13239, 1331, 11102, 585, 2469, 3810, 7183, 3810, 3414, 11192, 3554, 1821, 2827, 8464, 3020, 7262, 8330, 894, 5899, 3354, 6491, 3350, 5817, 12080, 3786, 3788, 3852, 1651, 1306, 3151, 10712, 1018, 2692, 486, 13009, 11601, 11102, 10327, 1855, 2781, 13360, 1272, 13239, 3614, 12393, 1643, 3481, 6340, 8807, 11505, 2919, 13314, 1205, 2584, 9276, 1294, 11598, 5899, 1680, 2231, 2735, 10497, 1316, 3510, 12412, 12021, 13227, 12691, 13023, 13230, 8819, 6817, 10458, 3684, 6883, 10927, 12461, 9961, 12636, 6892, 9955, 10928, 12640, 7196, 12750, 12643, 10729, 2415, 6433, 6439, 12756, 5429, 6920, 6387, 7011, 3129, 12727, 12783, 6303, 12608, 2830, 7150, 11101, 12443, 12614, 6860, 7156, 3424, 7158, 9002, 8460, 7152, 7017, 12779, 6326, 12781, 12605, 12784, 12923, 7611, 12229, 13388, 11812, 12596, 10512, 11200, 1183, 12600, 5340, 11533, 1252, 4339, 1362, 6296, 890, 5219, 3317, 1104, 3317, 13454, 1474, 10178, 13452, 2704, 2203, 5979, 9511, 7719, 8487, 5984, 11866, 2166, 4876, 5322, 9452, 9433, 5993, 1622, 5985, 3319, 5999, 2050, 915, 1394, 6931, 6005, 1853, 6008, 12271, 6011, 2461, 6013, 1889, 3414, 7055, 3162, 12160, 1553, 6020, 1806, 2245, 6023, 2173, 6026, 9308, 2674, 10303, 13500, 6032, 6465, 13136, 2161, 6037, 13225, 13442, 10509, 13444, 10867, 11636, 12234, 13448, 2543, 333, 10264, 4003, 9766, 9047, 8839, 9094, 3420, 7079, 10736, 9479, 4391, 12762, 3427, 3164, 2903, 3418, 11650, 976, 4710, 1090, 13252, 8912, 6699, 5982, 9708, 4494, 13286, 4979, 12370, 8991, 9048, 1103, 4651, 1877, 10054, 13141, 1631, 1195, 4608, 8991, 6702, 1230, 3366, 11476, 12735, 4472, 1114, 5004, 9636, 3842, 9273, 11170, 5106, 11692, 9998, 6672, 12975, 13169, 3096, 1915, 8439, 1934, 7072, 4391, 6880, 3400, 13157, 6696, 5083, 5824, 904, 4707, 3035, 13573, 7625, 6704, 937, 4838, 1475, 5808, 3071, 1688, 4493, 3002, 1747, 6930, 11843, 9508, 1418, 9294, 1029, 10527, 11933, 8143, 3025, 13613, 946, 8370, 12210, 5379, 1145, 2868, 10712, 12119, 9228, 1206, 2423, 837, 13309, 10164, 10283, 10612, 1055, 11933, 11485, 11745, 4420, 12061, 13104, 12881, 9294, 12823, 8447, 1678, 4473, 6482, 1475, 7726, 1875, 5555, 3232, 12604, 12728, 7147, 13421, 10404, 6981, 6975, 12435, 6843, 12612, 10647, 8755, 13430, 12612, 7160, 12613, 1380, 3220, 13435, 6971, 11185, 12728, 13386, 10390, 12277, 13518, 11198, 10627, 13521, 2534, 10630, 4038, 6059, 7585, 10825, 12994, 3581, 10581, 8031, 7964, 12705, 7384, 10134, 6558, 6207, 10951, 3286, 10957, 4578, 10489, 8590, 1156, 12982, 8555, 4546, 12953, 8887, 4175, 1124, 7849, 8581, 8533, 8541, 4763, 12962, 2482, 8551, 6129, 7111, 2707, 6268, 9260, 4571, 1197, 2867, 2866, 2863, 2871, 13678, 12689, 13680, 12511, 13390, 8570, 3280, 857, 10305, 911, 12915, 1574, 9961, 8589, 6422, 12462, 6425, 12639, 2406, 10926, 3687, 2410, 12751, 9283, 4559, 12910, 13402, 2420, 6428, 2258, 7139, 2147, 12733, 6398, 9879, 3309, 7291, 5380, 2680, 9911, 6695, 9589, 2830, 13762, 2284, 13764, 10681, 9144, 8772, 9136, 1044, 5330, 13771, 5944, 9921, 9879, 10487, 10403, 13777, 2913, 11785, 6071, 3361, 4237, 7289, 10884, 10904, 3575, 5276, 10998, 3768, 13734, 11810, 12690, 13681, 11635, 13683, 12418, 537, 6248, 3245, 6359, 11079, 2473, 11057, 11080, 11090, 6371, 6363, 6369, 2510, 13816, 11072, 4195, 6375, 2876, 1912, 5794, 7774, 4214, 7646, 3510, 6887, 1632, 9131, 11650, 9252, 941, 1206, 6846, 12901, 1911, 1689, 1611, 10245, 5778, 2712, 13849, 13847, 6718, 9734, 5150, 12424, 1515, 1391, 5457, 866, 2139, 7791, 7188, 6504, 959, 956, 6235, 10602, 9921, 1866, 2983, 3059, 5166, 3300, 3457, 9013, 1413, 13874, 1463, 2085, 3529, 2884, 1850, 5320, 1497, 6994, 7799, 2417, 1333, 4035, 299, 1548, 12541, 4069, 5550, 13129, 4326, 13033, 4652, 12173, 1766, 4648, 7214, 11170, 6821, 1358, 1202, 3850, 1375, 4954, 917, 4976, 2144, 12896, 13858, 6411, 8026, 2558, 1672, 7565, 13834, 11315, 4295, 4245, 1347, 5129, 9553, 13086, 5024, 2779, 2451, 856, 7649, 1867, 11250, 4815, 1653, 13927, 13805, 12509, 13807, 13737, 7372, 13739, 8819, 2495, 3354, 6124, 6583, 3860, 1962, 13054, 4799, 9091, 9604, 13955, 4211, 9598, 13957, 1294, 5844, 13951, 13067, 13963, 13962, 5119, 12350, 13949, 1278, 7777, 13953, 10056, 13956, 12742, 6371, 13958, 13975, 13960, 13956, 13962, 10325, 13981, 6117, 10024, 5834, 5354, 8899, 6414, 13774, 9141, 13757, 6110, 9917, 13768, 8880, 10485, 6404, 9600, 6401, 13781, 8677, 4620, 2258, 11805, 4663, 5305, 8820, 8104, 5000, 839, 1382, 4002, 1358, 2090, 1401, 8043, 872, 3363, 4240, 4987, 1778, 1530, 2284, 866, 4378, 2395, 4171, 12754, 6893, 2403, 6895, 13991, 3686, 6858, 7020, 13410, 3701, 8899, 2783, 10946, 9755, 3808, 5866, 4472, 9248, 5122, 1621, 6751, 4906, 14017, 12103, 569, 6828, 1734, 1021, 14041, 5725, 10602, 585, 9508, 1728, 13939, 10290, 10914, 13942, 7931, 8818, 4363, 9241, 1351, 6534, 5518, 13202, 5606, 5603, 10262, 11245, 10355, 11527, 12579, 11237, 1237, 937, 4472, 1049, 7096, 9934, 3096, 8273, 5668, 10644, 5724, 322, 3032, 2821, 6718, 865, 13495, 13546, 10566, 4194, 9285, 2781, 2042, 14059, 10154, 6711, 1607, 1821, 3653, 1490, 9219, 1515, 8023, 9049, 3806, 5158, 11796, 1511, 3640, 12181, 1091, 4714, 5122, 2086, 5634, 11677, 12564, 2648, 1557, 11951, 10562, 13753, 14034, 13755, 13407, 10015, 13759, 6439, 6899, 3650, 10681, 869, 1119, 4527, 2201, 11626, 11037, 4113, 8694, 3093, 2331, 14003, 2455, 842, 3231, 1786, 2754, 11598, 1799, 1151, 1246, 2643, 5678, 1071, 5184, 6555, 1105, 6542, 13440, 8950, 12413, 13517, 14065, 9238, 10772, 6797, 12193, 13741, 11140, 1515, 14181, 5235, 12173, 13897, 2177, 5201, 1677, 9459, 6820, 5960, 5379, 4603, 10689, 7103, 8669, 3001, 6764, 14058, 1466, 1515, 4543, 6704, 9920, 11626, 14080, 9936, 8523, 4446, 6557, 10957, 10948, 11205, 10954, 6558, 6514, 4227, 12567, 2170, 12569, 7530, 1899, 2991, 4025, 4026, 2097, 3005, 2052, 1397, 2996, 9406, 2190, 1620, 8755, 6945, 5694, 9565, 9552, 11980, 13239, 10215, 4801, 9531, 8549, 12963, 8855, 11115, 3626, 2081, 1067, 894, 7093, 4434, 1541, 8906, 1566, 13321, 5812, 2646, 4155, 2071, 11495, 1331, 1664, 13064, 8911, 3317, 6324, 2651, 2026, 1702, 14170, 8412, 14172, 14064, 8416, 13229, 13944, 4363, 879, 10872, 4456, 2462, 6530, 14252, 1498, 3708, 4288, 11560, 3402, 3316, 11838, 13382, 11384, 10064, 11067, 5111, 11690, 3063, 3727, 6578, 3429, 5674, 9527, 5044, 10234, 11830, 14205, 11538, 8973, 9669, 11830, 1458, 2542, 1191, 4457, 1207, 2181, 2854, 3081, 13323, 4215, 4003, 1644, 1009, 3652, 1611, 7646, 13305, 14083, 11272, 9612, 9039, 7630, 4217, 11914, 10272, 4787, 4227, 2453, 11917, 5225, 1617, 2999, 1991, 3460, 3440, 6469, 11572, 6149, 1352, 7624, 14345, 1765, 1900, 10968, 1812, 7974, 4663, 12051, 1021, 3342, 1949, 923, 5020, 11482, 14297, 7568, 13247, 2404, 7646, 3431, 7736, 5853, 12539, 10690, 5111, 7544, 6149, 9359, 14283, 9340, 5889, 4477, 14287, 1811, 3330, 10071, 1812, 14304, 7645, 1928, 1312, 14322, 1958, 1065, 1205, 11736, 902, 4217, 4473, 3429, 5176, 2042, 8559, 4983, 3810, 13293, 2054, 14286, 11806, 12686, 10192, 12688, 13806, 13736, 14276, 13738, 14067, 6553, 8728, 5978, 2017, 4113, 7489, 8733, 8195, 8209, 7828, 7437, 7816, 8740, 7818, 8198, 7683, 8745, 7915, 8203, 8295, 7819, 8281, 5857, 1009, 7737, 9213, 9542, 1773, 1089, 1512, 9976, 3365, 7794, 4011, 1039, 4486, 6489, 6482, 2074, 1924, 9740, 1121, 1103, 11541, 13526, 11462, 5751, 9567, 1631, 1313, 11462, 3400, 8073, 930, 8660, 12310, 7068, 4428, 11908, 2469, 11667, 1303, 1924, 1792, 5199, 11665, 13338, 13511, 7556, 1783, 5160, 5739, 10176, 13049, 13839, 1239, 9048, 5511, 6659, 4982, 3816, 1290, 1747, 12746, 5227, 1625, 2767, 8804, 4985, 8452, 1609, 2996, 10230, 5691, 901, 3690, 1032, 868, 12741, 11747, 11756, 1925, 9501, 1020, 1378, 1062, 1274, 10413, 3443, 8384, 12427, 1805, 871, 10232, 13567, 4083, 13541, 5227, 4662, 4987, 9198, 1441, 875, 10405, 14495, 4811, 2667, 4951, 12156, 8790, 13064, 2882, 6877, 11677, 13085, 1894, 1928, 10721, 12746, 1639, 4603, 4093, 5892, 8143, 1677, 12427, 3353, 5379, 14191, 2234, 11680, 1398, 3012, 9635, 2966, 3517, 13632, 9281, 7076, 1486, 14501, 1517, 14558, 1028, 1887, 11510, 4011, 9002, 1669, 7732, 1620, 3655, 13586, 1508, 3228, 8783, 1251, 14495, 1567, 1633, 5206, 3202, 10050, 1996, 4369, 1189, 3294, 10467, 2086, 1121, 1924, 7085, 3023, 12766, 14469, 13877, 1768, 946, 4369, 10238, 9885, 1441, 951, 1669, 9643, 11746, 6858, 4985, 3994, 8991, 5701, 8991, 10088, 1924, 3130, 4815, 14197, 10076, 1294, 3731, 6776, 1525, 11700, 4791, 10082, 1476, 11335, 14606, 1627, 5001, 1451, 1521, 3312, 1145, 3398, 6693, 3039, 11256, 4335, 3041, 1239, 4105, 3511, 14621, 10103, 14613, 3312, 9492, 3509, 5122, 1557, 10150, 7232, 3431, 14608, 8783, 8471, 5227, 12776, 4979, 10613, 2743, 3644, 3950, 1651, 3634, 3633, 486, 9505, 1517, 13353, 1029, 14639, 3855, 3555, 1347, 13567, 11677, 5693, 14579, 7183, 899, 1352, 11520, 3193, 1266, 1750, 2743, 14495, 3657, 3858, 13857, 1116, 5577, 4324, 7528, 3441, 937, 1384, 1778, 6846, 14516, 9223, 908, 937, 14666, 4059, 11862, 1451, 11567, 14670, 5933, 2081, 13272, 10660, 11642, 1900, 2157, 1765, 13241, 14470, 3792, 5568, 1239, 5782, 9423, 5797, 1072, 1274, 14639, 1778, 13220, 5226, 1253, 11334, 7769, 1764, 1226, 1541, 3810, 13171, 11466, 10412, 12665, 1919, 3387, 3400, 13541, 4381, 14695, 8097, 9520, 9480, 1285, 1958, 7167, 8361, 11779, 5110, 4698, 2100, 10500, 11662, 1107, 10497, 3852, 5882, 1145, 1876, 13213, 1769, 11940, 2059, 8791, 1398, 3417, 1447, 3140, 1933, 5129, 11752, 1699, 14573, 14554, 11569, 2826, 4570, 913, 11872, 11754, 3860, 1813, 321, 14702, 12028, 5873, 3059, 2092, 8972, 1413, 9273, 1494, 13456, 4063, 1048, 14576, 1958, 5837, 8796, 11890, 3783, 3330, 4612, 13351, 5188, 11751, 13580, 14630, 11739, 4016, 2264, 1032, 4280, 975, 3638, 14254, 4977, 10751, 1201, 1894, 1944, 467, 953, 2059, 4094, 888, 5159, 10993, 6734, 13586, 8318, 9047, 11678, 2903, 14515, 13255, 11505, 4206, 321, 11185, 1215, 10609, 14689, 1121, 14702, 3859, 4469, 8669, 14801, 10434, 1255, 2462, 13631, 2157, 1470, 1482, 2646, 1061, 6325, 398, 12562, 841, 9702, 11308, 2018, 3723, 3000, 888, 3503, 1201, 8669, 2829, 10446, 4063, 10338, 9702, 1347, 9221, 14816, 14688, 8158, 8403, 970, 3642, 14807, 1207, 13551, 14525, 11462, 4389, 13318, 3510, 1662, 4704, 3994, 14470, 14800, 3453, 5879, 2651, 13148, 1294, 12546, 1116, 4344, 6869, 1271, 5861, 1271, 2423, 11545, 1135, 4063, 3859, 9072, 2040, 3070, 12427, 9293, 4569, 1297, 12309, 13542, 4001, 1444, 3690, 14534, 5815, 958, 3081, 2996, 14782, 569, 948, 5823, 10976, 2460, 4105, 3653, 12769, 5001, 14938, 11680, 2086, 13456, 9063, 8367, 14514, 14931, 4979, 12457, 13541, 8905, 9174, 12427, 4329, 3453, 4659, 5820, 3783, 10232, 6590, 8337, 4646, 14517, 9884, 12165, 1280, 4982, 14596, 10207, 1189, 860, 14947, 5511, 14628, 1446, 11761, 6489, 3414, 1145, 7265, 14660, 3815, 4043, 9094, 12735, 9025, 7206, 11138, 5779, 7047, 9166, 6530, 14465, 2657, 8127, 5768, 1367, 1217, 11744, 1119, 1257, 12741, 4047, 6006, 9047, 1442, 1253, 1895, 1944, 7083, 8056, 1032, 5108, 11367, 1854, 7046, 1633, 5918, 10742, 14613, 7423, 11736, 14824, 1472, 2996, 12562, 14511, 14850, 10495, 7794, 14699, 4985, 14932, 12746, 8158, 9013, 9109, 14853, 12193, 6034, 15039, 14853, 10429, 4618, 1384, 15032, 10743, 8846, 908, 11339, 2472, 14723, 9714, 5107, 4318, 896, 1217, 8914, 15085, 5762, 2026, 14963, 5649, 13553, 11888, 14723, 8974, 14950, 6537, 13104, 6465, 14604, 14544, 14642, 14526, 4714, 14632, 11673, 6509, 1112, 14532, 2097, 3715, 1375, 10188, 11538, 4870, 3644, 972, 6582, 3294, 12745, 1115, 4416, 4618, 5899, 13632, 2505, 896, 7068, 13264, 3463, 11680, 11284, 4198, 1239, 8793, 1557, 14469, 2887, 1701, 13632, 11537, 13293, 14670, 1358, 865, 875, 13277, 4751, 14743, 15023, 3527, 1918, 14573, 14977, 14917, 1617, 2417, 4425, 14495, 969, 1012, 13763, 12472, 1875, 1513, 1663, 12407, 9737, 1442, 14965, 1773, 1427, 5188, 947, 7226, 3312, 11357, 1441, 1020, 9067, 5815, 14670, 1396, 1768, 5226, 6362, 10409, 3294, 1391, 3640, 1276, 8791, 14584, 5997, 14617, 2779, 13054, 12741, 11619, 1169, 6718, 14477, 6690, 1854, 13911, 14323, 12249, 14606, 3441, 1525, 1659, 14681, 14700, 14936, 14740, 14591, 9298, 13370, 10233, 13211, 10230, 11344, 15192, 11847, 11681, 2097, 15064, 1356, 15193, 14978, 14696, 10116, 2404, 14633, 5994, 2059, 1607, 6703, 1918, 1195, 12327, 14575, 3328, 2332, 7794, 14082, 11288, 7068, 11145, 3859, 1280, 1690, 1609, 3505, 11538, 2280, 4475, 12544, 11700, 3857, 6993, 1778, 5379, 14062, 10672, 8215, 13808, 12024, 13024, 2627, 6051, 12933, 4146, 12944, 12936, 8498, 4164, 12948, 12940, 7902, 6008, 299, 1693, 2982, 883, 5536, 3335, 12576, 10252, 7046, 6466, 3377, 13698, 1535, 1352, 11658, 11236, 915, 11030, 1627, 1812, 883, 3403, 3053, 5137, 8175, 12848, 5154, 11907, 2029, 3642, 5388, 11352, 13860, 865, 3447, 6557, 3679, 9310, 5633, 3510, 5739, 1141, 7990, 2995, 13541, 3317, 1917, 13729, 14447, 6256, 13726, 2722, 6253, 1677, 4194, 1767, 2092, 10714, 5411, 1507, 9506, 14853, 6509, 3050, 15347, 2551, 4807, 5379, 1068, 9211, 1471, 3462, 15111, 3716, 1392, 4198, 1625, 3292, 13300, 5102, 3509, 8803, 1110, 3529, 1378, 11041, 3107, 11808, 14414, 13940, 14416, 6549, 14066, 9793, 4363, 7705, 949, 12573, 10963, 3080, 10966, 9895, 7236, 10874, 10834, 5338, 10834, 5326, 3080, 2309, 5306, 5338, 10998, 5320, 2733, 13688, 10356, 7632, 2292, 5380, 10596, 7631, 8046, 7402, 10381, 12712, 4097, 2591, 10349, 10576, 2168, 11830, 880, 11721, 12993, 15402, 6394, 3582, 12997, 12487, 13697, 12493, 12717, 2161, 15404, 12684, 7473, 15416, 15400, 12534, 13691, 15421, 13693, 10597, 13695, 8494, 4959, 10346, 8064, 15429, 15413, 8503, 7835, 12019, 8812, 15374, 10673, 15270, 12928, 14278, 6553, 1423, 8443, 4921, 4214, 4686, 5111, 5664, 2404, 4807, 881, 4681, 11117, 6290, 11438, 6292, 7542, 10790, 7319, 7531, 7630, 7965, 839, 7528, 1134, 960, 4807, 1352, 2970, 4230, 3727, 13004, 11496, 2161, 6688, 3463, 9976, 5166, 1122, 15267, 12276, 15451, 14174, 9684, 12598, 484, 1074, 5299, 4529, 7289, 3243, 5326, 7936, 5651, 4303, 3757, 14028, 1565, 14030, 6427, 3245, 14033, 13412, 7009, 7022, 3756, 10663, 1010, 10648, 2385, 7404, 906, 3160, 7567, 8997, 7942, 6108, 6129, 6247, 5359, 13798, 10078, 5274, 13799, 9666, 4943, 5340, 2954, 5307, 1777, 2416, 12911, 14140, 9857, 6107, 6689, 13720, 4562, 3361, 3600, 12981, 2468, 2599, 7863, 885, 3907, 13744, 6900, 2428, 13515, 14274, 12510, 14417, 13943, 14419, 4733, 1516, 11423, 10139, 1647, 5190, 7514, 5330, 9425, 5224, 11071, 1147, 15004, 3389, 13322, 1775, 8094, 1785, 1695, 1499, 1650, 12854, 12099, 3994, 7791, 2056, 13643, 13495, 11680, 5540, 6891, 14259, 1018, 4870, 6060, 2284, 5411, 4856, 15017, 11722, 8277, 13078, 2004, 9365, 7149, 6581, 2002, 1384, 9209, 11277, 5766, 11955, 12184, 1635, 6845, 3390, 2017, 5553, 1535, 2021, 9490, 13474, 11120, 6667, 11648, 2030, 14643, 6496, 5883, 1651, 1869, 2040, 13833, 14283, 15263, 14381, 12330, 3380, 4663, 4034, 1383, 8338, 1677, 12973, 6963, 2061, 12206, 4753, 13474, 15602, 1494, 8646, 3074, 15628, 2074, 3072, 14553, 6232, 2168, 10580, 5756, 9625, 6204, 14211, 7536, 14213, 4532, 14213, 10952, 11213, 11210, 6565, 3300, 6192, 2332, 9326, 9386, 7955, 10983, 10974, 9108, 2099, 2097, 10979, 4668, 10985, 7971, 10977, 1292, 10988, 15688, 10986, 7971, 15698, 6730, 3836, 3069, 10169, 6643, 13307, 4987, 1231, 10001, 9131, 11333, 13264, 3414, 4487, 12349, 7554, 4429, 4535, 3598, 4229, 7183, 1022, 1778, 5983, 4689, 12326, 5858, 1758, 6772, 1449, 5116, 10694, 1915, 1143, 12012, 6377, 1070, 14153, 1044, 8367, 15672, 10947, 15674, 6571, 15676, 11208, 15677, 11207, 6567, 6570, 3296, 15494, 7927, 15375, 8723, 11814, 10918, 1004, 2971, 11007, 6841, 10971, 10980, 10985, 3945, 2108, 1452, 4661, 5930, 15330, 9260, 2727, 7732, 15334, 6904, 11444, 2977, 12388, 9464, 3037, 15240, 2489, 13062, 1915, 6738, 6737, 6605, 6734, 1739, 15339, 1152, 1210, 1536, 4416, 9538, 7230, 9033, 5834, 1053, 2955, 6196, 15362, 8703, 6200, 4603, 10469, 3461, 4390, 13309, 7741, 2462, 6328, 3350, 1460, 15755, 10768, 9372, 11813, 12597, 13447, 2534, 3828, 1297, 2832, 1726, 8362, 5870, 12847, 10001, 13312, 13776, 6137, 10134, 15076, 12318, 8460, 2095, 5995, 12265, 3916, 15464, 2754, 13692, 15405, 7640, 12936, 905, 12682, 4779, 15445, 10784, 10578, 8014, 9931, 1254, 6247, 3716, 1423, 8715, 6922, 12537, 6322, 6800, 1260, 1400, 9388, 1128, 3996, 15381, 3158, 869, 9113, 14272, 12020, 13679, 15496, 15567, 15377, 14176, 10296, 13289, 1487, 9962, 6841, 13418, 6844, 9588, 13436, 6848, 6102, 12611, 13425, 6977, 13431, 10746, 10922, 12618, 6983, 15895, 1420, 13673, 6169, 15891, 15815, 13419, 15370, 7693, 12507, 11809, 15450, 15269, 15497, 15759, 15499, 8572, 1066, 4640, 10835, 15419, 7350, 9642, 12556, 7942, 6479, 15426, 7309, 9642, 15430, 15415, 10879, 2365, 7981, 10579, 2285, 15847, 5054, 15926, 4398, 15442, 2161, 15930, 15853, 10351, 15432, 15934, 8028, 7961, 15924, 15423, 7965, 10853, 10471, 8050, 3348, 15931, 15818, 12594, 11197, 13809, 12417, 12694, 1183, 954, 14395, 7359, 4807, 1511, 5783, 3394, 8318, 5090, 8188, 1487, 15973, 13234, 1698, 10826, 1532, 8710, 14361, 4221, 7665, 12360, 2314, 932, 8278, 2971, 7644, 13599, 7665, 5828, 8424, 15981, 2180, 4098, 13921, 3291, 2325, 2485, 8175, 15990, 7664, 9675, 15668, 6149, 11067, 1692, 3927, 5780, 16011, 1783, 3446, 1533, 11844, 3914, 10331, 16018, 11781, 3008, 9819, 1466, 11418, 9160, 4850, 897, 1022, 10699, 894, 1053, 8484, 2205, 16032, 16031, 4812, 16027, 910, 3666, 10331, 1422, 873, 16013, 3008, 11607, 16019, 16016, 3008, 16049, 16047, 4477, 16012, 10999, 15393, 3080, 4297, 14319, 16045, 5780, 16051, 16053, 16050, 16015, 16052, 5897, 15959, 12787, 13022, 15568, 15378, 5264, 1467, 11035, 5683, 9943, 2883, 15300, 11223, 9977, 3102, 12581, 2799, 3086, 9943, 11249, 15394, 2354, 7392, 8941, 13992, 1232, 2472, 4298, 1656, 8434, 3177, 3073, 8626, 2853, 6388, 2310, 6804, 16076, 11221, 12581, 14080, 3104, 7546, 16108, 16084, 5560, 7726, 7377, 11203, 14950, 4073, 14447, 14572, 3392, 14688, 12773, 7637, 1378, 12320, 9916, 1025, 8462, 15744, 3296, 14212, 15747, 13702, 6571, 3768, 10945, 6205, 11206, 15805, 3289, 16133, 3287, 5315, 14702, 9873, 8967, 14958, 5228, 14616, 1669, 14711, 12761, 12766, 15085, 14677, 9168, 12716, 2178, 12644, 2081, 15050, 866, 116, 3101, 15175, 3001, 5835, 8244, 10225, 2699, 1405, 9755, 3913, 14673, 2152, 1502, 5842, 3723, 7083, 11895, 1023, 13724, 15409, 15427, 10851, 15412, 4717, 7978, 10387, 15876, 15449, 14063, 15566, 15376, 14175, 11815, 797, 10515, 6688, 15395, 12812, 5331, 6379, 7084, 3378, 2043, 10329, 11950, 15490, 5680, 8345, 2846, 1496, 9831, 5269, 16039, 13829, 12813, 14297, 4990, 1362, 1622, 9336, 2016, 2092, 1475, 1203, 2854, 11157, 1533, 6646, 2095, 16226, 8667, 8969, 1744, 14344, 4686, 3810, 14466, 2075, 16232, 11483, 16230, 2462, 16228, 12152, 1055, 13241, 16223, 7035, 5026, 13829, 4060, 7854, 3662, 11954, 10954, 11700, 16134, 1557, 3907, 398, 10946, 16130, 15746, 2321, 3854, 15804, 3297, 6199, 3296, 12200, 16262, 15836, 14213, 4416, 10954, 11927, 15399, 7936, 15401, 7350, 2954, 15938, 10598, 4621, 6137, 16157, 7996, 16284, 15958, 15564, 13387, 14173, 15880, 16195, 15760, 13522, 8710, 6090, 12993, 4218, 13014, 12484, 10830, 12657, 13007, 4220, 10842, 12680, 924, 4401, 6202, 15958, 2373, 10372, 15922, 10579, 6202, 15925, 7316, 4118, 4666, 7879, 8249, 13011, 7544, 13013, 16325, 2219, 15446, 8410, 15448, 12508, 16192, 13941, 16296, 15498, 15823, 855, 12600, 13747, 12698, 4450, 16304, 12702, 2151, 4903, 16308, 4227, 16310, 2237, 7308, 16313, 6519, 16292, 16190, 16335, 15268, 8415, 16194, 16339, 11637, 16299, 1227, 7669, 13690, 15420, 3623, 16285, 13695, 10803, 16350, 16174, 5064, 10848, 16328, 15650, 3676, 12721, 16189, 14412, 11043, 15373, 16336, 15757, 8954, 13446, 16364, 2534, 8421, 1139, 2136, 1605, 4974, 15511, 13411, 7016, 3255, 7185, 13754, 6432, 13756, 16395, 3463, 1148, 3337, 2026, 4418, 9109, 1563, 8326, 1049, 1294, 14166, 1006, 4876, 2761, 12823, 14104, 7259, 1438, 1496, 11511, 5858, 11108, 9885, 7104, 6937, 1669, 1776, 13141, 1443, 15463, 1533, 905, 5000, 6342, 8350, 4417, 2200, 2573, 10169, 11930, 1297, 6559, 12243, 5745, 1071, 1778, 2979, 433, 7968, 1036, 3644, 5116, 11990, 1622, 15684, 8685, 13544, 1274, 9538, 10252, 3446, 1381, 1607, 1259, 1081, 1084, 13285, 12260, 16103, 1444, 3217, 13912, 10225, 8434, 3403, 1451, 6606, 14237, 1926, 11476, 5812, 3819, 5797, 4431, 16261, 13054, 1191, 16156, 13187, 5153, 1748, 1566, 10049, 12009, 3245, 8924, 1572, 5741, 6900, 12807, 16067, 13021, 13228, 14418, 16071, 5722, 909, 6462, 4974, 5662, 1233, 2472, 8918, 15297, 9531, 5538, 5624, 12179, 2746, 3804, 1888, 6579, 15298, 6690, 9943, 15301, 11941, 13714, 10840, 9149, 2346, 7638, 9311, 6027, 5673, 9310, 2591, 14825, 1671, 1652, 1201, 8159, 16225, 12476, 878, 16549, 3950, 1212, 3012, 7767, 6940, 2470, 1889, 14711, 15986, 7566, 1087, 8023, 5920, 10606, 1764, 1758, 1563, 13272, 8532, 11124, 13901, 13901, 2574, 6070, 11071, 15228, 1731, 1667, 14756, 2767, 5834, 15088, 10589, 12036, 14492, 1313, 8527, 2593, 3330, 9253, 14868, 11343, 11748, 16549, 3354, 13637, 14486, 9921, 7973, 1912, 4982, 9061, 4230, 9294, 9293, 3997, 1049, 16436, 9771, 3137, 16541, 953, 6877, 15784, 14993, 11791, 16616, 5783, 16152, 3441, 1039, 2474, 14580, 16151, 3052, 5136, 7806, 14161, 14947, 1114, 5792, 9388, 16119, 16559, 14457, 1415, 3222, 1361, 1061, 15555, 873, 7634, 15957, 2598, 8857, 2825, 3631, 6362, 3073, 6694, 14129, 9258, 9471, 3033, 4221, 9168, 11294, 2484, 7774, 10213, 14571, 4979, 4840, 14663, 15149, 14722, 3441, 16232, 4002, 4329, 9664, 3457, 14552, 9309, 5673, 16675, 4388, 8710, 7345, 16680, 3463, 960, 2069, 1361, 5984, 11037, 1871, 1309, 1734, 1888, 2931, 5576, 5659, 16293, 15878, 15914, 16338, 15916, 16340, 11817, 15489, 4628, 10524, 4631, 12180, 10545, 12185, 10547, 10549, 10527, 5518, 6727, 10531, 11232, 2284, 5212, 12519, 10518, 11973, 11019, 16704, 5602, 16709, 11243, 5606, 16725, 10541, 10548, 5598, 6928, 1155, 839, 14357, 16226, 15966, 14939, 10254, 7805, 1747, 9471, 2674, 1383, 5835, 15318, 11258, 13603, 16736, 4812, 3452, 959, 1389, 1734, 3045, 11311, 14943, 8098, 14256, 8327, 4673, 1498, 5219, 4431, 10602, 1044, 16666, 9658, 930, 1091, 6572, 1357, 1783, 8061, 16719, 12186, 16706, 11973, 16708, 11040, 16727, 5604, 16727, 6728, 11248, 5348, 16055, 3095, 5674, 11031, 16721, 11031, 16778, 16726, 16724, 11245, 16713, 11247, 11973, 6928, 9527, 10143, 16774, 16705, 11230, 16707, 5597, 16724, 16794, 16712, 16804, 5608, 16730, 7474, 5980, 4899, 4686, 1367, 13275, 8325, 5145, 2497, 6209, 5536, 9298, 1522, 4780, 9381, 1458, 16816, 4663, 4784, 11186, 11867, 16632, 1633, 1737, 1146, 2205, 1476, 13273, 16839, 2051, 4870, 11660, 5378, 9439, 15794, 5705, 1105, 14271, 16383, 15372, 10389, 13735, 15879, 16362, 16699, 16390, 6623, 7242, 14569, 838, 5878, 7097, 2667, 4382, 1699, 6590, 842, 15369, 6993, 2087, 5705, 1650, 13432, 2092, 8437, 1439, 10109, 1272, 5577, 12242, 1186, 3803, 9536, 1297, 5691, 3923, 11698, 14389, 5776, 5407, 13743, 14783, 4504, 4094, 5505, 4113, 15242, 1482, 9558, 13932, 1055, 4714, 9081, 16869, 2993, 5805, 7969, 10542, 12291, 1355, 2875, 4527, 11217, 4232, 11785, 10097, 10206, 15726, 10209, 3855, 14117, 10213, 900, 16173, 4469, 904, 10218, 5797, 1761, 3390, 13351, 7937, 13541, 9412, 3394, 11256, 1619, 4621, 10230, 1050, 10232, 3307, 16577, 10236, 5198, 14696, 1627, 10241, 1205, 10243, 12111, 10245, 10242, 10248, 16462, 1366, 6994, 10253, 9780, 1456, 5000, 5219, 1256, 4707, 13856, 10262, 13132, 11174, 9110, 4682, 1651, 9277, 945, 2404, 1081, 3962, 10279, 3962, 9277, 1075, 8094, 16918, 10285, 15447, 12687, 16853, 14415, 16855, 15758, 15822, 16858, 3550, 8427, 1988, 2665, 13247, 4660, 5241, 4977, 3803, 8023, 5243, 3677, 13329, 8937, 2015, 7115, 4339, 8326, 2500, 6537, 3484, 5005, 1538, 6289, 16323, 9669, 7935, 7748, 4114, 1297, 11405, 17023, 1743, 1781, 12805, 14762, 1900, 8057, 9439, 942, 3044, 3826, 2095, 12818, 17027, 11233, 3524, 5378, 1680, 2065, 3479, 11707, 3357, 11717, 11643, 11642, 1141, 11793, 1212, 12315, 15585, 11713, 4651, 1737, 11652, 14181, 13135, 4787, 858, 11657, 3449, 4801, 4413, 3800, 11297, 12776, 2961, 3368, 4277, 4001, 1132, 11672, 1925, 1796, 1444, 14127, 12096, 11680, 14451, 7002, 1751, 14700, 11686, 10722, 14119, 6992, 11690, 11574, 13335, 11694, 3342, 5736, 11697, 956, 6886, 11701, 3283, 9340, 3002, 1790, 11706, 6117, 3470, 11872, 16622, 8840, 857, 11376, 4212, 11729, 12544, 9511, 11733, 11692, 2849, 12819, 1867, 8459, 3331, 1894, 1367, 15228, 1133, 11745, 14830, 1278, 8660, 11750, 16550, 14980, 4369, 16657, 11757, 3525, 16999, 1958, 11762, 5226, 11764, 8662, 8862, 9380, 2393, 11267, 12659, 5881, 2089, 2149, 9782, 877, 9399, 11778, 8403, 2058, 3706, 2237, 11784, 11952, 11787, 10641, 3128, 15787, 11792, 1790, 9191, 14118, 6136, 3356, 7740, 11801, 872, 16271, 11805, 1990, 11723, 1285, 8040, 4298, 9342, 16506, 12926, 13389, 16070, 15882, 8221, 2959, 1407, 3613, 7212, 4214, 4742, 7621, 2059, 2846, 3801, 12268, 4317, 5939, 7709, 1856, 10252, 12320, 4312, 10245, 3460, 1852, 4493, 15581, 4736, 14717, 14376, 13246, 1770, 7058, 13599, 1191, 2754, 1813, 16226, 857, 1116, 9423, 6704, 3208, 1627, 927, 14673, 6252, 16601, 5649, 5090, 2924, 6643, 1699, 10591, 1367, 16690, 6916, 15990, 2505, 12245, 2219, 9571, 1271, 17183, 13443, 15915, 16992, 13684, 6283, 3314, 16450, 9824, 6098, 4548, 12955, 7858, 13716, 8892, 8541, 12961, 12905, 13721, 4188, 6055, 7052, 15505, 12978, 10709, 4582, 13708, 1156, 17256, 8576, 17258, 13713, 3887, 8891, 12959, 4557, 7858, 14244, 17266, 4563, 17268, 12978, 15933, 17271, 5726, 17273, 15556, 8555, 12952, 16588, 4174, 2465, 8825, 11122, 6104, 8540, 12960, 4184, 8543, 14245, 3361, 17288, 16102, 8686, 5561, 5643, 15503, 17289, 9729, 17281, 17303, 17283, 17264, 4186, 8545, 7330, 1013, 16641, 4584, 2232, 17296, 8577, 13713, 3674, 4299, 6236, 12575, 14149, 9979, 13704, 17272, 8560, 17274, 883, 17248, 16295, 16856, 17251, 13811, 2534, 4898, 1232, 3765, 1654, 6841, 6193, 11129, 4493, 12139, 4975, 12013, 5161, 12677, 10681, 16289, 12937, 7125, 6993, 6735, 1107, 895, 1104, 11118, 4235, 5138, 909, 1069, 10681, 6599, 4856, 2260, 2584, 5146, 11216, 3415, 2825, 13789, 10402, 14818, 2003, 8103, 12309, 4070, 15969, 12056, 8238, 7789, 2547, 1305, 2854, 6886, 7440, 1628, 9708, 3441, 9538, 2961, 13082, 11261, 14236, 6497, 14952, 16826, 5199, 16666, 4714, 16676, 4707, 1238, 938, 16027, 1376, 1034, 17398, 9189, 5684, 1684, 5521, 11136, 2639, 1396, 11423, 14996, 2548, 14764, 14896, 5790, 11690, 6834, 16997, 11335, 2005, 14764, 13059, 14996, 2454, 8865, 16765, 3951, 1628, 1544, 2393, 9025, 12402, 1434, 2035, 2402, 15351, 5876, 11410, 12664, 10484, 16126, 9884, 12735, 2638, 9946, 9213, 4214, 3291, 6871, 15175, 11948, 8377, 10889, 9361, 12318, 9771, 991, 2052, 1474, 7235, 1212, 10492, 8872, 3012, 1576, 2779, 14198, 15118, 1740, 15533, 3909, 858, 3219, 17416, 15187, 2967, 6586, 1145, 3231, 15941, 7945, 15279, 16332, 11042, 16852, 10622, 15756, 16990, 16388, 10868, 16340, 1252, 2051, 12439, 17383, 2692, 4613, 9139, 10102, 9868, 2010, 4070, 3406, 6559, 6204, 3069, 10101, 15049, 6415, 17517, 11689, 10058, 466, 9358, 4570, 16879, 2332, 4634, 1531, 11319, 1127, 4604, 1049, 1441, 5673, 11354, 13927, 16434, 3819, 10273, 9928, 2487, 11689, 4658, 878, 1091, 8448, 1102, 1201, 8359, 13603, 1467, 13607, 8149, 8370, 9499, 9552, 9499, 1143, 5879, 11405, 8407, 3474, 3524, 11317, 5074, 2968, 12774, 11367, 13644, 1543, 17579, 2423, 3909, 1356, 7646, 4028, 12349, 15764, 1038, 4372, 924, 1448, 3478, 6886, 8713, 10310, 9308, 15343, 17224, 13321, 6892, 2982, 3488, 14714, 10305, 1292, 6340, 4371, 14079, 905, 3299, 15728, 6446, 13357, 1204, 2107, 11700, 13317, 9473, 13136, 4740, 3407, 1020, 3859, 6511, 3823, 16032, 4231, 8644, 11795, 1276, 2712, 1918, 3341, 9618, 6091, 1556, 2964, 2167, 11120, 1938, 4645, 17495, 12260, 12985, 2887, 2744, 1556, 1862, 3410, 9310, 17598, 16222, 1034, 4794, 3365, 5898, 6656, 2419, 3954, 5279, 3336, 12838, 13852, 5649, 6827, 2999, 2976, 1104, 11716, 5842, 11646, 1215, 5025, 4371, 17669, 4429, 3490, 12838, 9230, 16985, 16333, 16987, 17505, 15819, 12595, 13519, 13810, 15964, 16391, 17254, 1012, 8575, 9127, 17515, 17385, 4006, 17255, 7812, 13988, 6992, 17516, 14818, 7046, 9006, 5532, 10085, 17260, 1447, 3253, 15047, 3898, 6383, 4682, 887, 3493, 3179, 4062, 1426, 5959, 13768, 4299, 8105, 4419, 9926, 9145, 9879, 5334, 13948, 8881, 10457, 3887, 10032, 12523, 13766, 17461, 17519, 4621, 17289, 17723, 13992, 17527, 13783, 10015, 2673, 6695, 9141, 17723, 16182, 10080, 10181, 6339, 13350, 1692, 10085, 1205, 1079, 10089, 10190, 16851, 15911, 16385, 16360, 10769, 15821, 16389, 17252, 4464, 2075, 13697, 8756, 4829, 3148, 4169, 3174, 16274, 17700, 4107, 10102, 10417, 17735, 4010, 13994, 3695, 4169, 17741, 9874, 2692, 10931, 4319, 9857, 1008, 936, 10089, 3615, 3179, 6831, 9247, 5831, 3441, 2955, 2977, 10452, 17179, 2957, 2086, 15766, 14014, 15695, 2096, 1453, 6627, 6251, 15331, 6257, 4979, 1202, 9263, 10484, 10169, 9618, 14944, 3353, 14494, 11382, 15786, 8339, 2772, 15789, 2476, 2913, 14525, 10603, 1657, 4417, 7989, 8459, 5856, 3403, 15801, 13360, 5908, 9495, 16270, 10957, 4603, 6525, 16245, 5862, 14397, 7741, 1201, 2761, 15328, 1075, 8007, 16695, 16854, 16697, 17344, 17766, 17346, 855, 10397, 12517, 9586, 4102, 9826, 12662, 17709, 3699, 3213, 6823, 3323, 14488, 14738, 10183, 491, 7865, 8136, 10018, 4170, 16262, 4062, 13789, 2849, 2640, 9601, 17725, 13782, 10104, 9812, 8433, 14000, 2701, 2669, 17803, 9877, 2084, 17806, 2111, 15689, 10986, 17811, 14305, 17813, 15774, 2861, 15776, 6258, 6904, 17820, 2977, 17822, 8926, 3417, 17825, 969, 11281, 15788, 6604, 17830, 1287, 17832, 17026, 17834, 9429, 7970, 7214, 5899, 17839, 6528, 1647, 17842, 9253, 17844, 15807, 12014, 14363, 15810, 10331, 5724, 17851, 1207, 17853, 3015, 9337, 17342, 14275, 17860, 17509, 16858, 1074, 2248, 6235, 17692, 5338, 15505, 5347, 3896, 3575, 3281, 16143, 10641, 14605, 2466, 6362, 10749, 2308, 6980, 1066, 17968, 10751, 17966, 5356, 13984, 397, 9932, 17811, 10852, 16199, 5345, 10922, 15551, 17322, 884, 15554, 17293, 1153, 15557, 6072, 5277, 11720, 2642, 6890, 5212, 10758, 10637, 4412, 5315, 11028, 6146, 10762, 10657, 10757, 10660, 16850, 10286, 8949, 14273, 16294, 17949, 16991, 17861, 17689, 6623, 14178, 17100, 6820, 14182, 11101, 12003, 904, 10000, 14187, 13169, 11653, 1515, 14568, 9151, 14194, 7514, 6231, 9153, 17486, 6196, 11653, 3079, 9210, 4274, 4504, 8653, 1539, 5896, 8663, 3550, 14312, 17705, 1461, 6692, 6334, 13168, 4443, 3041, 3948, 2095, 6241, 1771, 12330, 4493, 1669, 3337, 15009, 12601, 6520, 1768, 1551, 2733, 8258, 17602, 8628, 9935, 11239, 14216, 3017, 16129, 6206, 15746, 16140, 6563, 16142, 13008, 16461, 8635, 8693, 11236, 1960, 11082, 3322, 4837, 12206, 6981, 1659, 5550, 8911, 1272, 6211, 6028, 889, 14234, 11376, 5791, 1416, 1748, 14239, 17056, 2236, 16244, 17285, 15552, 8857, 14247, 3940, 3312, 6342, 1236, 2705, 16518, 14255, 5647, 5124, 16871, 18115, 14261, 3723, 14263, 8983, 1282, 15327, 15593, 14269, 6132, 17948, 16193, 18013, 17951, 17767, 8573, 1351, 2081, 11055, 13817, 6365, 4285, 15857, 3767, 2633, 13607, 2646, 11058, 6152, 2487, 13763, 4371, 10900, 1346, 16136, 15673, 6562, 2209, 7547, 6211, 2707, 16258, 6558, 1531, 4735, 7462, 17899, 15687, 10987, 17902, 7971, 18000, 2878, 17996, 18006, 17998, 1357, 12630, 1933, 10665, 1397, 1562, 2469, 10651, 1350, 11062, 16183, 7309, 6137, 9386, 1743, 17809, 3528, 4980, 10991, 17857, 16989, 17859, 18135, 13520, 17862, 11202, 10440, 11053, 8389, 11875, 6963, 1235, 9225, 8826, 4426, 14079, 9979, 14207, 8633, 15293, 14219, 11236, 1350, 4470, 7243, 10649, 8804, 5786, 5097, 2030, 12183, 17362, 17501, 2246, 8885, 7944, 15525, 16376, 7524, 15476, 6436, 15928, 7357, 7328, 2153, 18233, 8977, 15281, 18237, 3773, 18239, 12711, 15427, 7358, 4511, 6642, 17961, 2422, 18214, 18072, 12581, 18217, 5542, 8636, 18220, 15394, 17785, 17526, 17736, 10036, 8447, 8755, 1058, 1451, 3722, 12203, 3061, 10601, 16357, 17760, 12592, 13020, 17184, 15452, 14277, 15569, 6622, 13813, 6074, 8359, 10400, 5185, 17886, 9871, 17786, 11336, 18268, 3891, 10485, 2684, 17779, 9882, 17725, 12447, 2852, 2373, 5313, 18288, 9918, 17702, 18292, 18266, 18294, 13783, 18296, 17529, 9880, 4618, 6146, 12446, 14001, 6992, 13966, 2395, 12864, 18289, 9869, 10403, 3559, 17735, 18311, 17891, 18313, 9912, 9141, 18300, 17719, 17726, 18303, 6056, 7382, 18323, 18307, 17696, 4615, 9872, 13775, 17462, 7956, 3702, 2841, 17746, 18299, 9925, 18335, 18302, 18320, 18254, 3243, 18340, 17384, 18291, 18343, 18293, 9135, 18330, 7201, 18314, 10487, 8759, 18334, 2699, 18354, 9147, 18338, 18305, 4610, 18359, 6405, 18327, 9592, 18329, 2669, 12870, 18349, 10486, 18333, 18352, 18370, 18319, 18372, 10845, 3190, 18358, 17695, 18360, 17963, 18328, 18363, 18381, 18348, 17745, 18384, 18351, 5945, 18360, 9146, 5935, 9148, 10791, 18391, 18306, 18376, 9130, 18378, 17460, 18380, 6113, 18331, 18350, 18316, 18369, 18404, 17727, 18356, 17692, 18392, 17701, 18342, 18395, 18379, 18397, 18416, 18365, 18332, 18402, 18318, 4440, 18406, 18373, 3765, 18425, 10401, 18394, 18413, 9873, 18415, 18347, 18417, 18401, 18419, 18386, 18421, 18337, 18390, 12626, 17694, 18426, 18442, 9915, 18444, 18430, 18446, 18432, 18418, 10488, 18420, 6990, 18422, 18438, 18409, 18375, 18393, 18377, 18458, 18345, 17737, 18382, 18400, 18298, 18449, 18403, 18466, 18303, 17953, 18424, 18410, 18471, 18412, 18473, 10035, 18312, 18462, 18448, 18464, 18450, 18481, 18355, 18468, 18454, 17700, 18441, 18472, 18344, 18489, 18364, 9138, 18433, 18479, 18435, 14620, 18496, 18453, 18440, 18290, 18501, 18362, 2739, 18490, 18505, 18463, 18368, 18494, 17720, 18303, 5593, 18374, 17514, 18456, 18514, 18310, 18460, 3693, 18447, 18478, 18493, 18480, 18522, 18510, 18408, 18498, 18324, 5125, 18487, 18502, 12734, 18475, 18399, 18297, 9923, 18507, 9883, 18371, 18406, 3598, 18539, 18341, 18457, 18543, 17742, 18504, 17459, 18506, 18534, 18508, 18405, 8340, 7282, 17723, 15395, 1988, 10639, 2287, 18569, 15395, 11702, 18383, 18533, 8759, 12445, 18550, 18388, 2838, 2644, 3306, 2406, 6298, 9126, 16318, 8029, 15489, 16321, 4621, 15404, 18230, 15488, 10681, 18277, 18008, 10862, 16191, 17763, 15820, 13445, 18136, 17862, 3021, 2075, 17905, 11350, 13414, 910, 6823, 1121, 5811, 1996, 5381, 4742, 2495, 10074, 4579, 4212, 4404, 6231, 1847, 3044, 14781, 15850, 12458, 4183, 6122, 8894, 2394, 16093, 5912, 5308, 18610, 11845, 1349, 3167, 4564, 1040, 10893, 908, 18632, 2977, 2173, 9755, 1768, 2202, 5330, 10798, 333, 5481, 6507, 934, 18651, 18610, 3128, 17179, 7110, 18630, 9931, 18640, 15527, 4246, 18622, 14781, 13348, 1391, 1517, 5928, 15968, 18618, 5356, 1813, 1306, 4371, 17791, 4332, 2959, 4194, 1146, 8931, 18133, 16337, 17950, 18202, 18015, 10515, 11533, 6064, 7401, 7384, 13382, 16709, 11228, 1509, 5277, 10370, 12496, 7052, 7936, 4565, 9769, 18638, 2269, 18192, 5011, 15699, 7972, 15694, 10414, 2080, 8651, 4605, 13182, 884, 3756, 6383, 5276, 1187, 6383, 1120, 18714, 880, 6167, 18683, 16387, 10916, 18014, 12791, 16341, 2543, 7457, 8047, 7459, 10357, 2268, 9859, 17305, 12030, 7381, 8030, 2243, 7395, 2320, 9860, 4000, 7534, 2272, 10323, 7403, 7399, 926, 9861, 12603, 18234, 18752, 18594, 10782, 7408, 10362, 13891, 18663, 8980, 10795, 7726, 5070, 15886, 1412, 15888, 6969, 13658, 6327, 5743, 13715, 15894, 7152, 12436, 15897, 12811, 15899, 13668, 7146, 15902, 10489, 6168, 14888, 12730, 12782, 15889, 17681, 17503, 17761, 16988, 15913, 16361, 18201, 17688, 18730, 1190, 13307, 9898, 12617, 2647, 17778, 18316, 13752, 18266, 17782, 2692, 13416, 9878, 17515, 18394, 6443, 17894, 18509, 17896, 12826, 16280, 4945, 13748, 7014, 5693, 13403, 12479, 7767, 8017, 8714, 12119, 16848, 11904, 9050, 12654, 16369, 8427, 15952, 10584, 5881, 11732, 6996, 14200, 872, 907, 6644, 15516, 6899, 15518, 6434, 15771, 15544, 9954, 14139, 9956, 6406, 887, 15561, 2427, 1542, 18726, 17507, 18728, 18603, 18015, 3756, 1750, 4310, 12632, 14135, 7022, 6358, 9966, 15546, 18854, 6287, 18857, 9961, 12464, 6423, 14029, 16399, 1560, 4209, 1099, 9931, 11095, 13996, 18548, 4614, 6036, 5044, 18816, 6991, 18398, 18871, 17777, 18513, 18806, 6287, 18808, 18363, 9147, 17723, 2821, 8689, 16181, 11640, 2453, 2400, 6949, 1545, 5323, 6395, 18868, 3050, 1556, 2232, 13714, 962, 882, 9825, 9289, 1232, 4098, 18036, 18028, 17059, 10639, 18775, 6430, 4413, 5919, 5379, 6406, 18860, 18200, 17508, 18686, 18799, 17348, 18569, 12943, 18736, 15278, 12033, 15280, 11825, 12036, 2391, 3157, 12237, 13714, 18270, 17737, 9913, 12609, 4054, 17460, 18809, 6992, 18768, 13788, 18813, 6405, 3637, 18892, 9886, 12826, 10298, 6287, 18822, 7192, 15513, 1547, 12867, 18868, 16403, 14136, 18821, 18872, 13760, 7194, 1228, 18876, 6424, 18935, 18796, 18937, 18798, 13025, 9068, 18941, 16772, 13974, 6151, 13977, 18994, 13971, 6468, 2996, 18998, 13980, 10072, 13950, 17105, 13950, 10343, 13983, 3573, 1514, 18951, 18895, 18804, 18897, 10488, 2309, 17786, 18959, 2699, 12725, 18812, 17701, 18394, 6236, 18966, 14002, 5907, 5212, 2171, 6556, 18027, 11661, 6097, 10476, 6582, 4570, 6807, 3649, 6097, 12090, 6820, 3790, 12344, 11014, 12697, 16103, 18258, 4113, 18844, 14569, 14218, 18262, 9943, 7992, 17100, 9947, 5641, 12572, 17333, 9976, 12581, 14150, 14411, 18597, 16334, 15912, 16386, 18861, 17765, 18863, 18939, 1306, 3774, 9017, 8173, 8355, 3914, 6634, 8182, 6637, 16003, 4489, 8275, 8183, 3926, 16926, 8187, 8266, 8174, 16173, 8171, 6641, 17953, 13948, 7670, 7829, 8286, 8739, 6652, 14433, 7828, 8199, 7596, 7490, 8293, 14438, 8748, 8296, 7833, 8298, 14431, 8300, 8210, 18198, 18795, 17764, 18602, 18938, 12930, 11202, 7457, 10372, 12341, 6361, 13818, 6810, 10466, 18148, 18143, 1622, 3468, 12752, 2672, 5505, 10001, 3934, 5568, 5751, 3042, 4864, 7938, 6588, 7079, 3683, 2633, 15931, 15921, 16368, 4449, 3604, 18162, 15746, 16259, 3296, 9817, 13084, 4548, 4175, 8433, 18148, 4196, 5860, 11074, 10534, 2211, 14078, 2983, 13825, 6362, 11077, 4285, 7042, 19128, 2486, 5860, 13821, 2473, 19132, 1434, 3019, 3044, 3641, 12110, 11133, 3027, 15623, 3030, 19143, 2686, 16186, 10385, 16188, 2383, 7980, 15949, 2239, 19150, 16257, 3293, 19153, 4540, 2878, 10937, 8528, 19158, 2696, 19160, 19170, 6152, 2510, 18986, 19116, 17687, 15963, 18730, 5041, 12496, 11095, 6193, 15832, 3021, 1920, 8391, 1635, 19139, 19183, 19221, 1517, 11951, 15422, 10582, 8046, 15954, 15942, 18317, 18162, 15679, 6199, 3287, 4183, 13163, 6070, 2561, 5281, 10011, 19173, 11090, 19130, 2487, 15543, 18140, 13819, 14047, 11090, 10383, 19207, 11072, 19209, 13828, 16914, 8826, 17513, 4120, 3645, 2213, 4987, 12110, 10398, 3041, 2077, 5751, 8399, 15712, 3559, 18837, 10345, 17500, 4766, 3613, 19236, 11207, 19238, 4540, 1040, 19241, 8863, 8551, 18265, 19246, 18150, 19176, 10965, 5056, 11070, 6369, 4198, 11058, 19255, 11089, 9449, 19258, 949, 19211, 18601, 19213, 12513, 12930, 9835, 4144, 2734, 4850, 5116, 4415, 14184, 1517, 1550, 10213, 12266, 16221, 1853, 12151, 16488, 8253, 19318, 11610, 6148, 13927, 2034, 5024, 1055, 12825, 869, 11789, 6520, 14075, 14497, 5602, 16810, 16722, 16729, 4749, 16810, 16781, 16714, 5606, 3079, 1514, 18206, 10122, 18823, 18973, 13412, 14036, 18852, 13621, 6441, 2425, 9676, 18985, 15605, 11870, 2217, 4070, 6999, 12205, 930, 1048, 15843, 12160, 6597, 19367, 19366, 10026, 1402, 10026, 11933, 19364, 8364, 6849, 16370, 10169, 11488, 14195, 11847, 14197, 2095, 3060, 10306, 10306, 1252, 2996, 19386, 13064, 19387, 2092, 18034, 1490, 6764, 1682, 2875, 433, 5992, 2734, 19123, 2510, 19125, 3468, 13821, 13823, 13823, 19174, 6372, 1726, 19163, 1224, 3839, 19348, 13711, 6949, 2493, 8582, 16575, 4561, 6941, 18111, 2512, 17341, 9148, 1514, 12525, 6015, 13969, 13952, 13976, 19005, 2047, 13954, 13963, 13977, 13962, 12773, 19003, 17946, 19000, 18791, 15371, 18793, 17684, 15960, 12788, 18283, 16510, 15883, 2955, 3283, 7813, 8285, 7480, 7909, 8741, 14440, 19102, 7679, 7824, 8202, 3962, 14435, 8749, 8737, 19110, 8734, 7922, 6669, 19303, 17686, 13682, 19214, 13025, 10201, 11146, 4738, 11654, 17466, 3466, 9441, 9228, 16676, 9276, 17459, 4669, 11410, 5791, 17408, 9412, 15623, 14523, 2993, 1127, 1909, 12771, 1154, 13956, 1960, 2547, 4318, 4784, 16226, 13370, 4533, 13040, 14315, 3640, 1434, 11377, 12370, 14466, 960, 4329, 16825, 2095, 16877, 875, 2663, 15433, 18834, 4902, 7317, 2309, 19016, 12679, 16353, 7337, 6731, 19024, 16326, 5065, 16331, 2246, 6145, 8433, 2107, 2698, 4417, 19228, 5129, 5983, 3783, 13494, 3617, 19114, 19067, 18936, 18862, 19118, 13231, 11403, 5354, 18871, 12953, 1666, 8582, 18180, 17301, 8582, 4556, 18917, 2840, 19559, 19419, 4188, 17260, 8891, 17431, 15557, 13655, 19203, 17266, 4550, 8589, 12920, 8875, 2484, 11927, 13687, 10633, 18176, 17007, 1397, 17999, 14032, 18182, 8941, 18184, 10645, 8941, 13666, 19498, 10650, 1397, 17973, 1562, 10753, 18003, 10756, 11177, 18006, 10662, 6129, 10754, 491, 19604, 10668, 8941, 19474, 15961, 15271, 13391, 4363, 2171, 1110, 9405, 1775, 16788, 13776, 8890, 6067, 19466, 2090, 15695, 15841, 2603, 16691, 1698, 9006, 4219, 466, 6537, 11030, 1420, 6287, 6131, 1100, 11759, 10339, 1070, 2586, 1253, 876, 13009, 14756, 16230, 2258, 16827, 1348, 6322, 18917, 7886, 10053, 19286, 19570, 10475, 17317, 8583, 17283, 19567, 7624, 19569, 4563, 19571, 16570, 19573, 8555, 1725, 4117, 7303, 4793, 16406, 14401, 3375, 4417, 3630, 1783, 6191, 5423, 11931, 2398, 1144, 8710, 5863, 2498, 19632, 12108, 9561, 13456, 8610, 4205, 17542, 19624, 14305, 19591, 10653, 18185, 10646, 18952, 19597, 10122, 10636, 19592, 18179, 3160, 19603, 10667, 10758, 10662, 10761, 10755, 19712, 19606, 17991, 3198, 4705, 6753, 10608, 8935, 10329, 3408, 14668, 6602, 12922, 18278, 12924, 13516, 18012, 18988, 19477, 3280, 1122, 1767, 9389, 7030, 1744, 4702, 6416, 3009, 1458, 3909, 2460, 3913, 11650, 6698, 17083, 3479, 1403, 1677, 1268, 11838, 1486, 4571, 6666, 4343, 2983, 14095, 7514, 1482, 4855, 1486, 13106, 7792, 9542, 16671, 1512, 4373, 11350, 8693, 12272, 2932, 1204, 1148, 8840, 5533, 6008, 15317, 5530, 11040, 11019, 12185, 19338, 16791, 16791, 19342, 16795, 16709, 5320, 10536, 19335, 2739, 19337, 11967, 19339, 16811, 19341, 11967, 19343, 16797, 5604, 13966, 15408, 4816, 13248, 15359, 17551, 9002, 1451, 6193, 17549, 2977, 10049, 10267, 19391, 10889, 4750, 16492, 2061, 15387, 3000, 7990, 1681, 11146, 1201, 4799, 5505, 16862, 17549, 19825, 19391, 19834, 1274, 11800, 2460, 2716, 2987, 5505, 19809, 8840, 17587, 8284, 7833, 19097, 7435, 14437, 14434, 8204, 7914, 19460, 19466, 8204, 19108, 7829, 19470, 14427, 19112, 7501, 16358, 19066, 18600, 19475, 15962, 19306, 19736, 11267, 1882, 11600, 12268, 2042, 1747, 11288, 7796, 11567, 9934, 1787, 8447, 3435, 1631, 5933, 10306, 7793, 3051, 19766, 1034, 13088, 8972, 993, 1508, 2721, 11459, 11192, 8849, 8839, 1128, 14955, 13083, 4463, 4990, 3440, 1656, 1417, 19746, 1285, 3009, 17848, 897, 15668, 1134, 7236, 13476, 19783, 10538, 19797, 10523, 19788, 10540, 16796, 16793, 19804, 10550, 5593, 19794, 18694, 10525, 10540, 10524, 19920, 16707, 19790, 16712, 19792, 6573, 7283, 17819, 9066, 19828, 17816, 19841, 19813, 19839, 9089, 19817, 19816, 19819, 19832, 13038, 19811, 1171, 16958, 19941, 11541, 19955, 19833, 16862, 19950, 4799, 7105, 19827, 1392, 19954, 19814, 13038, 19821, 19820, 19843, 12134, 943, 19846, 19096, 19458, 8196, 19465, 19101, 19467, 19853, 19100, 8287, 7498, 14440, 6669, 19859, 7825, 8298, 8301, 19730, 13441, 15565, 18684, 18797, 19735, 13392, 12236, 6421, 19525, 10579, 11053, 18590, 4399, 10600, 11053, 16315, 19528, 12525, 16719, 11227, 19929, 12164, 16806, 19921, 19789, 19802, 19791, 11040, 19793, 19334, 19928, 11245, 16776, 19799, 19786, 16711, 5523, 20017, 19345, 19937, 19807, 11473, 19818, 19942, 4791, 19944, 19811, 19948, 19837, 20038, 5853, 19960, 4843, 19823, 19954, 19962, 4870, 7105, 19958, 19831, 11801, 19967, 19955, 19963, 19817, 19953, 19833, 19815, 16862, 19970, 13123, 8835, 19973, 8193, 19975, 14432, 8197, 19978, 19852, 8292, 8292, 19467, 19857, 19985, 7440, 19111, 19988, 19113, 19863, 17762, 15495, 19552, 19069, 19554, 6282, 16914, 6412, 2375, 17771, 3557, 7712, 8010, 10179, 7856, 17773, 2293, 7891, 7861, 7874, 18700, 3250, 7860, 7873, 3173, 2298, 3843, 12527, 3210, 17693, 20106, 7784, 18758, 7880, 7788, 10014, 12978, 7898, 10941, 12530, 6051, 2840, 16802, 19336, 10523, 20022, 16807, 16779, 16795, 19342, 11031, 7726, 15408, 20122, 19796, 20124, 16723, 16779, 16808, 10548, 19922, 19800, 10533, 19937, 2345, 9547, 6735, 10303, 6737, 2772, 1752, 8964, 3440, 19244, 6819, 7565, 17449, 3327, 2489, 9456, 17922, 423, 8439, 6739, 17920, 1865, 6740, 5305, 16314, 6339, 6608, 1287, 10751, 12221, 5118, 19550, 19865, 19615, 15453, 18284, 797, 13013, 4390, 3624, 3577, 11653, 18933, 13714, 9026, 14189, 10178, 9965, 19037, 1515, 13705, 19040, 4413, 12950, 3765, 11640, 7031, 11661, 10011, 7070, 18927, 10647, 11581, 11653, 10146, 20195, 15266, 7883, 6698, 20183, 11430, 17066, 20187, 19034, 6820, 20205, 14667, 20207, 6519, 20209, 4125, 15605, 16860, 880, 20199, 20185, 11661, 8517, 20188, 20204, 20187, 20220, 20193, 20231, 20223, 6815, 5353, 7382, 20228, 19035, 4285, 9729, 20203, 20218, 20234, 20243, 20193, 20222, 18036, 20210, 2180, 20241, 20184, 20243, 8895, 20246, 11653, 20219, 20249, 8557, 20251, 8919, 20210, 11720, 20198, 20256, 19037, 20258, 18930, 1515, 20261, 20192, 20263, 18924, 20265, 20224, 20254, 4237, 20242, 20270, 20216, 20259, 20273, 20248, 20275, 3649, 20264, 1466, 20266, 4567, 20281, 20269, 20215, 20245, 20272, 12208, 20287, 4413, 20250, 20277, 20291, 20224, 20267, 20213, 14200, 20283, 20297, 14718, 20286, 20191, 20301, 20276, 14199, 9508, 20279, 19533, 17692, 20282, 20296, 3697, 20298, 20190, 6413, 20314, 20289, 20303, 20317, 6815, 18553, 20321, 20186, 20310, 20189, 20274, 20327, 20194, 20252, 20224, 18553, 12533, 9455, 20215, 20202, 20324, 20337, 20344, 12200, 2262, 1256, 8755, 20338, 20290, 20330, 3618, 1728, 2262, 4527, 15436, 6889, 9974, 5380, 16279, 3674, 10093, 20009, 16803, 5518, 15436, 11965, 5542, 5516, 11026, 10545, 6217, 9965, 11030, 10540, 12187, 18696, 11012, 11036, 7546, 10548, 14073, 5607, 19614, 19450, 16509, 17187, 12282, 18101, 3701, 2057, 20323, 10032, 8349, 2630, 4025, 17711, 5842, 1026, 4848, 13847, 2240, 12896, 12367, 13541, 13152, 8489, 1684, 2247, 10027, 2965, 15513, 17376, 5129, 12857, 6179, 3453, 4805, 1664, 11288, 1018, 13613, 8650, 1987, 4204, 5200, 12152, 15257, 4112, 2497, 6478, 2258, 1185, 942, 6966, 14348, 2023, 5673, 9649, 8709, 2187, 6299, 10094, 4757, 15846, 12868, 3700, 2137, 4609, 4229, 11096, 9660, 19169, 1449, 20121, 11972, 12186, 19934, 20139, 19936, 4640, 5651, 1410, 4644, 11995, 16415, 7001, 12045, 15731, 2286, 4654, 2059, 6511, 4838, 10050, 866, 3370, 1398, 1933, 4624, 1500, 1805, 2600, 10269, 17806, 9296, 12151, 3228, 12096, 5673, 3016, 19330, 16962, 3177, 6999, 14973, 12549, 5763, 11083, 11845, 10078, 2000, 2310, 6537, 3063, 1956, 12040, 871, 7079, 12001, 14634, 6602, 11869, 13106, 2144, 4427, 9976, 8730, 861, 6142, 1107, 911, 4702, 16759, 1255, 9976, 861, 6858, 5912, 15131, 14477, 16951, 6509, 4123, 17850, 865, 13241, 15909, 8505, 19447, 10912, 19551, 18987, 19553, 18989, 2627, 11202, 5345, 3226, 3299, 11851, 8604, 11252, 11505, 1118, 13714, 10458, 14130, 2200, 1806, 6381, 3381, 6922, 8839, 9110, 11014, 9452, 1632, 2097, 3352, 2260, 9832, 3550, 433, 5457, 3484, 6467, 20477, 14146, 2107, 13772, 6691, 5163, 14766, 15036, 5766, 6886, 19697, 11335, 1771, 1112, 18094, 1098, 14541, 4690, 6233, 14534, 10248, 14473, 7048, 1391, 5162, 4954, 7055, 1048, 3309, 12009, 4506, 1817, 1065, 2088, 8997, 9158, 8239, 13469, 11529, 11252, 5806, 11422, 12106, 17677, 20434, 18617, 3435, 20564, 17491, 1860, 8468, 20398, 1405, 20400, 7525, 942, 15080, 16028, 3070, 4219, 5559, 7092, 20437, 11329, 7623, 6911, 13370, 5651, 9659, 1507, 20446, 7782, 12628, 3672, 18327, 4760, 12869, 3388, 12242, 7049, 9649, 1940, 12057, 7183, 2681, 20379, 10545, 20381, 20137, 19924, 20142, 20466, 18885, 19648, 15318, 11349, 5000, 4983, 4674, 1915, 20475, 1930, 4655, 4837, 10642, 12147, 20482, 1450, 7006, 1253, 20486, 4663, 1235, 15483, 7084, 20690, 20492, 8970, 6713, 2762, 9221, 9733, 20499, 4676, 20203, 934, 1533, 20504, 934, 20506, 4681, 11349, 20510, 1510, 1769, 8057, 5073, 1566, 12845, 16886, 7796, 1282, 20520, 16872, 8191, 13374, 8730, 14361, 20528, 17669, 20530, 6252, 16668, 20534, 9704, 20536, 11537, 1022, 2035, 20540, 14397, 1263, 20389, 16069, 15881, 16196, 854, 13653, 6963, 3818, 433, 1963, 8099, 12774, 8111, 12666, 5532, 1081, 6825, 8127, 3443, 3223, 12673, 1122, 1247, 15969, 20766, 2754, 5745, 20762, 8119, 8129, 4319, 20760, 1739, 15018, 5783, 8136, 12667, 20753, 8709, 4098, 13209, 8160, 8152, 3240, 3380, 2191, 5555, 12864, 3194, 17772, 3166, 15893, 20658, 20452, 18399, 10180, 3209, 13673, 4824, 3616, 20745, 16508, 17186, 20748, 484, 15305, 16886, 6485, 1898, 18161, 20756, 8762, 20758, 1756, 2399, 20454, 20772, 12672, 8121, 20753, 1940, 20784, 8134, 20779, 8145, 11913, 20777, 14828, 3671, 8160, 1887, 15351, 20766, 1067, 1889, 15481, 9626, 20786, 20827, 1879, 6466, 5908, 16525, 1992, 4878, 17213, 7742, 9504, 4384, 3015, 8622, 6606, 3381, 11568, 6028, 5892, 14914, 2977, 5895, 3919, 20849, 5807, 5156, 17470, 2047, 8671, 11422, 4437, 14884, 1282, 3059, 9206, 11426, 16892, 1225, 20818, 20754, 7175, 17458, 20817, 3410, 20761, 1434, 20763, 8120, 4102, 20769, 20891, 20768, 15481, 12671, 20888, 20774, 4117, 20776, 8142, 7787, 12665, 8145, 20782, 20753, 15066, 13209, 20833, 8162, 20175, 20081, 20548, 20083, 20550, 6282, 1074, 2002, 19261, 6288, 9531, 10971, 13042, 5080, 13249, 4903, 20319, 1616, 7630, 10843, 8424, 20926, 14383, 5724, 14287, 2791, 13213, 6344, 1068, 3793, 2754, 5707, 5930, 7524, 2276, 10369, 3880, 12378, 12390, 6826, 9285, 8637, 8450, 15648, 9411, 19264, 5604, 4045, 1474, 10405, 6497, 1987, 3808, 2745, 14953, 1393, 3561, 11265, 6296, 4531, 1131, 20666, 5628, 956, 1087, 15124, 1731, 1629, 7956, 1141, 9440, 5797, 20937, 6291, 20923, 5757, 19527, 20931, 19530, 2142, 4455, 20931, 4997, 1740, 3176, 6342, 6540, 2085, 2643, 2478, 1806, 16843, 12326, 3073, 9699, 9086, 9397, 1821, 1078, 20805, 17185, 20747, 16298, 2534, 1071, 2040, 1725, 7338, 11793, 9051, 1928, 5691, 11344, 1405, 17445, 11496, 1267, 9962, 20898, 10086, 1205, 4378, 4852, 1775, 4318, 1562, 6928, 9244, 4963, 1930, 10074, 1891, 1738, 9702, 4951, 1479, 5765, 1701, 4982, 5757, 1755, 4226, 3207, 1908, 1762, 16468, 14354, 1914, 6016, 9310, 4648, 1928, 3369, 1781, 12256, 4624, 14157, 18654, 14616, 5139, 3405, 9312, 1137, 1942, 10063, 1802, 20559, 14363, 12272, 21001, 968, 1811, 18674, 4152, 1816, 11894, 3463, 6868, 12851, 4376, 7242, 15817, 20910, 17506, 20082, 19117, 20914, 14068, 1769, 1422, 3804, 10871, 9945, 3664, 6469, 5407, 21104, 10642, 5925, 14544, 16581, 16118, 20605, 2670, 3553, 18844, 10255, 3627, 1783, 14466, 18541, 10716, 14581, 14344, 6759, 9769, 1406, 3084, 1553, 3859, 1448, 17606, 19191, 11529, 14561, 9501, 4376, 9332, 21091, 20079, 18794, 20547, 19212, 19476, 19868, 20915, 16931, 5384, 2085, 21113, 1656, 2079, 15855, 1797, 11142, 21148, 18844, 1656, 20414, 13123, 3880, 1875, 20109, 20793, 8882, 19523, 11702, 20448, 20794, 3249, 14018, 3606, 20659, 2694, 1042, 2001, 20797, 3563, 9889, 18265, 10140, 10013, 10142, 3897, 12646, 3209, 3895, 18574, 17750, 3845, 3476, 3902, 8946, 3586, 2694, 1725, 1954, 8374, 9512, 1617, 12528, 4698, 2069, 15116, 3446, 3195, 10095, 2977, 7257, 3190, 21195, 20208, 20803, 17759, 19064, 17683, 20546, 20176, 20390, 20807, 21012, 77, 6167, 6387, 15550, 19666, 17298, 19422, 16556, 19426, 19425, 19424, 4186, 11233, 16288, 19658, 8544, 19421, 19420, 2599, 8856, 13707, 2599, 13918, 19582, 5430, 12193, 6479, 19568, 21226, 19423, 2592, 21229, 21241, 2504, 21243, 1626, 6391, 13967, 21037, 18923, 3858, 6721, 6718, 1152, 7584, 1953, 2005, 2854, 4027, 12472, 10690, 19635, 1515, 14227, 3288, 4978, 494, 20998, 16406, 6340, 3502, 2006, 10722, 21260, 6993, 19404, 18142, 19170, 18143, 19291, 5639, 8645, 1132, 9033, 1460, 6217, 4000, 3464, 3294, 9477, 2637, 11163, 2010, 13607, 19295, 19411, 19161, 11075, 11081, 14205, 914, 1035, 11700, 21262, 2186, 1134, 1126, 16825, 10660, 13139, 13361, 15720, 10228, 2037, 1921, 16249, 4649, 19228, 10250, 2559, 3005, 4662, 13849, 3349, 1934, 21294, 21301, 13714, 21303, 1898, 3468, 19296, 19168, 6373, 6361, 21009, 18282, 20391, 20808, 4271, 6807, 2333, 20352, 11430, 2035, 8583, 1639, 1381, 3084, 19034, 3371, 8474, 1768, 2308, 21353, 14667, 21363, 2483, 1443, 4021, 1739, 10603, 1639, 1652, 8858, 3241, 3375, 18256, 7029, 12837, 5551, 7076, 5019, 4840, 13121, 16463, 2021, 8381, 11887, 14330, 12196, 8942, 3945, 4876, 9625, 5094, 16462, 4181, 10606, 21358, 7547, 9412, 3953, 19266, 5516, 3996, 1923, 1369, 15717, 6151, 9465, 15663, 1960, 1758, 4432, 7236, 1621, 1268, 3588, 16930, 1095, 2000, 8152, 10542, 1550, 15220, 11378, 5091, 13296, 16518, 8164, 9397, 11583, 11654, 2665, 1393, 2472, 2975, 17525, 7072, 14605, 17631, 3723, 5788, 13868, 8623, 8709, 16481, 13456, 519, 4867, 7091, 13456, 8762, 8710, 1504, 6776, 17856, 21139, 19448, 16068, 20806, 21011, 15917, 21013, 10561, 1549, 19147, 15935, 8014, 18836, 19231, 7288, 15927, 18250, 2378, 18661, 5336, 19230, 13694, 10378, 19276, 8063, 10366, 19190, 10575, 2215, 21114, 19145, 15945, 7473, 20254, 18701, 7812, 18587, 4308, 12996, 21472, 10832, 10143, 18240, 4243, 5978, 21490, 20543, 10287, 19731, 19992, 18727, 20913, 19995, 4363, 2820, 17748, 21166, 21495, 12995, 5938, 19275, 17785, 18593, 18276, 21504, 3156, 1434, 4200, 2558, 2316, 4870, 15147, 12859, 2143, 6588, 10106, 15938, 3044, 14720, 1802, 20689, 21528, 4914, 15733, 2192, 5550, 3705, 1013, 2196, 13064, 8079, 1504, 21505, 18009, 15877, 17858, 20912, 21095, 21511, 4893, 11202, 9654, 10707, 6064, 931, 4950, 1484, 3767, 931, 2229, 21440, 15167, 14668, 1186, 1659, 5765, 10069, 5849, 20086, 2956, 3086, 1610, 9160, 8844, 7462, 3086, 21300, 14587, 2177, 1629, 3007, 3711, 3162, 8804, 16973, 12318, 4776, 14145, 10202, 12192, 1186, 1760, 19655, 4701, 10148, 6241, 13627, 10259, 3320, 19445, 15910, 18279, 13226, 17343, 19994, 21144, 19618, 6374, 12203, 3677, 6006, 13064, 16162, 16434, 2996, 3373, 2003, 12563, 15221, 13002, 4321, 5835, 3909, 14477, 4982, 6483, 7259, 13135, 15318, 20317, 14936, 3509, 6249, 12209, 1764, 16772, 9213, 11497, 15630, 15005, 5693, 3950, 1039, 3927, 11650, 12973, 7428, 1195, 5797, 15328, 5136, 6491, 21592, 4082, 10072, 4321, 9086, 8804, 2742, 3081, 3829, 11785, 9588, 6149, 4226, 17056, 4854, 969, 13120, 16222, 1639, 21667, 1494, 3509, 9219, 14102, 15323, 14102, 7935, 1816, 2924, 10578, 13456, 9341, 20648, 6343, 1446, 9412, 2964, 13497, 12550, 1391, 21393, 904, 2542, 11516, 15103, 9745, 17704, 901, 19054, 16542, 3527, 4636, 10244, 5240, 2721, 5016, 17877, 4501, 9111, 519, 14084, 9105, 12359, 4070, 9486, 6480, 14766, 12077, 1262, 4905, 1669, 18094, 6002, 7728, 16239, 5756, 3630, 6008, 1776, 19256, 1148, 3003, 10126, 3860, 2452, 21632, 10115, 16740, 12326, 3086, 17105, 20649, 17634, 5506, 2034, 1227, 5568, 7248, 2056, 12012, 9520, 21639, 9438, 5555, 4092, 1230, 14658, 3514, 4995, 3015, 14564, 13350, 1272, 2963, 14144, 13380, 5647, 3839, 3071, 1104, 13605, 15491, 1087, 7794, 21730, 10167, 13576, 3634, 7742, 5832, 10656, 9229, 13880, 13120, 12331, 21346, 17250, 18729, 13025, 3753, 16280, 7313, 16236, 4636, 6172, 6579, 17483, 6331, 18651, 8729, 21504, 4968, 20000, 21359, 18837, 20003, 4916, 15536, 4836, 1632, 15178, 1784, 15088, 19695, 16910, 8059, 18734, 15955, 18231, 18750, 1699, 6268, 2871, 13728, 13732, 15337, 6262, 2711, 21482, 10855, 18242, 21491, 19675, 3218, 12653, 1399, 17049, 3722, 7636, 17102, 18274, 2554, 8232, 889, 16255, 10484, 2991, 18272, 21417, 1401, 2587, 21311, 7100, 1285, 15875, 19990, 14171, 18011, 18134, 19734, 21614, 4893, 2085, 13293, 1261, 16517, 13293, 5997, 19322, 19517, 7023, 21839, 12712, 18252, 7999, 2384, 21687, 2428, 6076, 3130, 1023, 6593, 4867, 2057, 10835, 21846, 21861, 6706, 21862, 2743, 21426, 7341, 11110, 18923, 10088, 1521, 11800, 1294, 7570, 1119, 21836, 17233, 15334, 21882, 18251, 21841, 19193, 1687, 9428, 6666, 4376, 21822, 3298, 974, 2396, 4579, 21810, 16187, 10350, 10577, 1802, 4308, 20001, 21815, 16354, 21502, 13463, 12610, 1286, 13495, 1393, 3818, 7200, 3331, 11333, 20815, 14851, 3561, 12667, 5224, 5224, 8126, 20887, 20764, 8121, 4658, 21670, 19279, 20827, 1026, 20780, 1780, 8361, 3854, 20832, 8161, 3240, 1244, 21856, 3794, 4856, 11251, 19016, 21856, 21850, 18273, 21860, 19279, 10656, 6329, 13880, 8334, 2919, 20174, 21459, 21216, 20911, 21142, 19867, 15272, 13392, 12932, 18733, 5314, 4450, 2154, 8105, 4427, 1408, 1944, 7072, 9995, 14348, 20293, 6469, 949, 17586, 5212, 3082, 18139, 1052, 1402, 4335, 5511, 9377, 1270, 5729, 7086, 2072, 13264, 1740, 9198, 10613, 16742, 2088, 7547, 1864, 2148, 6706, 1053, 8468, 14752, 4668, 5786, 11955, 10123, 12375, 10156, 3388, 8745, 8820, 21736, 13263, 2913, 22012, 11698, 1037, 1350, 1411, 21521, 16281, 18596, 16986, 14413, 21140, 21217, 20746, 16297, 21464, 77, 9795, 20116, 3850, 21709, 9938, 10880, 5302, 10904, 13757, 12497, 12520, 17772, 7712, 4832, 7872, 1235, 7874, 17898, 12526, 20111, 18317, 3261, 20114, 8188, 5304, 22070, 20089, 7711, 20450, 20097, 20103, 21193, 14204, 20110, 7866, 19278, 10940, 7881, 12530, 3157, 9931, 11015, 14205, 18215, 18073, 9667, 18083, 9941, 14220, 9944, 16702, 16461, 16076, 12572, 9951, 13758, 15545, 18981, 9957, 1646, 9971, 13745, 12917, 9963, 2202, 12909, 22117, 18853, 6441, 6146, 18984, 6888, 9974, 2138, 17334, 1237, 19062, 21796, 16698, 17345, 18687, 1353, 18739, 18735, 2291, 4161, 18945, 15850, 18947, 12949, 109, 14145, 1349, 8880, 21434, 19755, 3644, 14286, 17201, 11337, 4225, 20245, 1633, 13599, 3288, 11360, 10875, 8254, 13170, 7177, 17854, 2030, 3715, 22025, 3586, 6167, 16282, 10579, 21471, 21480, 10583, 6217, 1893, 6219, 1613, 3044, 6750, 10154, 1557, 21826, 2030, 5391, 2743, 18021, 3509, 3860, 20695, 4753, 3686, 3513, 20955, 10341, 13351, 21589, 12335, 5902, 14348, 4381, 10482, 3508, 4569, 4633, 953, 7796, 19503, 8149, 4714, 7764, 1629, 2065, 1045, 3502, 2708, 4365, 15663, 13250, 19880, 5797, 19755, 2361, 14138, 7015, 9956, 19357, 4214, 10930, 14097, 3137, 6053, 1748, 13429, 22157, 14944, 1557, 16323, 8860, 14614, 9441, 3329, 11386, 3329, 14880, 10023, 21092, 17685, 20177, 19451, 20392, 1004, 14280, 13719, 21225, 19243, 16659, 21251, 21240, 2493, 21231, 8876, 8189, 1451, 14204, 1256, 9404, 2021, 5511, 1141, 9276, 1109, 10405, 2026, 8484, 11727, 20957, 1071, 7939, 20344, 2018, 7040, 5200, 1933, 11492, 11904, 7068, 14594, 6578, 7204, 2654, 4230, 20709, 1138, 1788, 3430, 16835, 6745, 13456, 14520, 14487, 10012, 18713, 3604, 2417, 3829, 17220, 2644, 4958, 7073, 3758, 1796, 22285, 1926, 12116, 22189, 4469, 2205, 9444, 1611, 12335, 6698, 1153, 869, 10044, 10940, 21572, 5649, 18335, 22138, 18685, 21096, 14420, 4802, 12710, 10794, 12031, 2213, 17363, 18946, 12939, 18247, 4543, 1058, 2822, 20343, 15046, 16021, 7067, 14309, 4481, 1500, 6932, 1500, 20771, 3852, 2749, 13211, 21864, 3690, 11738, 21756, 18023, 3057, 1039, 7142, 1431, 4844, 10060, 4813, 16096, 10033, 4854, 15187, 1672, 4027, 1405, 17775, 21183, 3844, 3148, 11836, 21117, 15812, 14693, 1948, 12335, 16517, 495, 12877, 20625, 11955, 17023, 8056, 14111, 18461, 18974, 10480, 21519, 19233, 19277, 20108, 11133, 2743, 16436, 10060, 19882, 2712, 4318, 15584, 17842, 16276, 15751, 11212, 17845, 17912, 12080, 13591, 22376, 16417, 2364, 876, 10503, 21504, 21468, 19195, 21169, 3083, 3710, 7800, 1288, 11925, 12001, 22035, 1988, 16746, 1434, 21401, 14181, 1881, 3634, 7065, 9406, 15559, 21190, 4768, 21213, 22053, 16384, 22055, 21987, 19304, 21143, 21990, 4363, 7706, 1083, 17292, 17339, 17294, 17275, 13710, 17297, 8529, 19704, 17261, 17282, 18917, 22261, 17321, 8551, 18637, 13987, 14267, 17817, 13842, 21911, 6264, 2870, 9255, 13630, 15434, 16369, 21479, 15438, 10378, 19133, 10946, 19509, 11207, 18078, 13703, 7869, 9835, 22337, 21613, 22461, 7845, 17562, 12697, 14210, 15745, 6562, 18079, 13701, 11208, 22420, 15805, 15681, 11926, 10551, 12350, 1269, 17900, 15691, 15768, 8004, 2102, 15690, 15692, 15700, 15702, 10981, 15703, 15701, 10981, 18170, 15696, 10991, 22518, 3757, 8339, 2913, 977, 11454, 17933, 6603, 20166, 22044, 20170, 22544, 13094, 15791, 22541, 6609, 6607, 1613, 6088, 17911, 19940, 19810, 20058, 6193, 9078, 20058, 19964, 20060, 20041, 20051, 1197, 19830, 19824, 20053, 20047, 8023, 20052, 20050, 6930, 19961, 19826, 22571, 21329, 22561, 19967, 22559, 3783, 20033, 22555, 12814, 19457, 19111, 8746, 19461, 19979, 20070, 19464, 7435, 19983, 7685, 20074, 7497, 19471, 14428, 21608, 20544, 21610, 19732, 21869, 20549, 21557, 4733, 5265, 9865, 7812, 19418, 17298, 4550, 7713, 19662, 19565, 6381, 2310, 17984, 8588, 1606, 17325, 12983, 19926, 17693, 22612, 22471, 10480, 22616, 8893, 10015, 22620, 4188, 3198, 22623, 2609, 16253, 4607, 8519, 22627, 17259, 22629, 16570, 22474, 22618, 13163, 22477, 22634, 22622, 17988, 17326, 18007, 22455, 17504, 21986, 21093, 21555, 19305, 22504, 5722, 21513, 17698, 22640, 22470, 22642, 3136, 22630, 8541, 22632, 17265, 18110, 8552, 22651, 12983, 15947, 22664, 17329, 17299, 22615, 22644, 17318, 19656, 10143, 22633, 4563, 22635, 22674, 22637, 22676, 2734, 22641, 13713, 22643, 12958, 22682, 22646, 18109, 17985, 22673, 22466, 17989, 8593, 21985, 12275, 22657, 21988, 19616, 15454, 22608, 9641, 3348, 16703, 16789, 20023, 20125, 20671, 16726, 20128, 19802, 20130, 9803, 5242, 22298, 1634, 17203, 4233, 6362, 1122, 4425, 3381, 12768, 1306, 2214, 3902, 21895, 12472, 1415, 4019, 8467, 8019, 15073, 4672, 4708, 15616, 11784, 17123, 8767, 12561, 3627, 7975, 17573, 7723, 12665, 10258, 4972, 5997, 8039, 13821, 2495, 8610, 20603, 18099, 16484, 22764, 22763, 1184, 2837, 12373, 10792, 22732, 20706, 8100, 8764, 20105, 11932, 11759, 13243, 1513, 11522, 21014, 15654, 5817, 12588, 8071, 15635, 2741, 3431, 4062, 10022, 1417, 7785, 22752, 20901, 1572, 12529, 10091, 6025, 3694, 1068, 13655, 6842, 13438, 13420, 18773, 2830, 15893, 12434, 12166, 18778, 13665, 19704, 6858, 12441, 18779, 13670, 6843, 18785, 21998, 3271, 18788, 22803, 21551, 18598, 16359, 22458, 19866, 22708, 20179, 1345, 12038, 4493, 10185, 1484, 3375, 2846, 3810, 17541, 3375, 1209, 5311, 11367, 1628, 1308, 2057, 2972, 16375, 18247, 10583, 1887, 2024, 7653, 15992, 15987, 7632, 1612, 976, 22845, 12484, 20944, 7296, 7652, 2478, 16005, 2150, 22330, 3291, 4543, 5219, 876, 3804, 1233, 5617, 1238, 5575, 3656, 4635, 16790, 8096, 2140, 6903, 6366, 9449, 11056, 21290, 21289, 19170, 8869, 3388, 8016, 5684, 5538, 2882, 22892, 1137, 22872, 2888, 20527, 1881, 5617, 22212, 10539, 8922, 7514, 11650, 19413, 11058, 19405, 11074, 21307, 13824, 4200, 10025, 9411, 16692, 2798, 16705, 5531, 22601, 21506, 19991, 21868, 19993, 21870, 22660, 6961, 16342, 18733, 10853, 22343, 7381, 16320, 18748, 2363, 19147, 7468, 2222, 16314, 8996, 18765, 6573, 12479, 18961, 13656, 15908, 18772, 6242, 13660, 18776, 13663, 12619, 18780, 13667, 22814, 13669, 18784, 15904, 18787, 13421, 18789, 6969, 22502, 22924, 19617, 6553, 4143, 2631, 18498, 21163, 12866, 6973, 21176, 3890, 7024, 20800, 3148, 18965, 21212, 20788, 16732, 12714, 6980, 12754, 12911, 13412, 13395, 16401, 14034, 13398, 7010, 13400, 18823, 7016, 7195, 7019, 13406, 2403, 16279, 1349, 6890, 22802, 13657, 12612, 22947, 12867, 22949, 22809, 13664, 6326, 13428, 12440, 6242, 22955, 13433, 18965, 15905, 13675, 2994, 13677, 22254, 19449, 22057, 16363, 17767, 1070, 19381, 7556, 17397, 12402, 1071, 8530, 6889, 20792, 20655, 4830, 6314, 3401, 2264, 13278, 8783, 11441, 20481, 6072, 4104, 17806, 13296, 3659, 9821, 21994, 22694, 14088, 17423, 22899, 3177, 2456, 10424, 7123, 4043, 6875, 1458, 1952, 10431, 6719, 10367, 1316, 2991, 19729, 21214, 22054, 21460, 16507, 21010, 22058, 16700, 3839, 5299, 6323, 18579, 18436, 3422, 1021, 11895, 22650, 628, 17397, 22076, 20939, 10432, 20581, 7168, 12307, 9029, 10428, 10096, 10466, 1401, 12295, 1355, 13171, 3712, 1533, 6442, 10473, 21994, 12732, 4465, 22244, 10479, 9591, 4230, 9312, 3177, 7566, 7341, 22962, 22606, 21871, 5040, 3379, 8222, 4777, 21890, 4737, 4922, 2357, 4455, 17393, 8254, 12704, 17206, 8251, 1940, 4214, 4857, 5241, 1915, 7556, 15475, 3771, 8242, 12151, 23128, 7557, 2324, 2185, 6831, 2854, 1654, 8255, 12033, 15427, 11093, 14224, 3586, 22801, 18770, 7146, 23003, 15892, 18775, 22808, 13671, 7153, 13427, 22812, 13661, 22951, 22816, 6321, 22957, 22820, 22959, 22822, 23115, 21510, 23117, 6622, 16771, 8456, 1796, 7705, 3806, 3810, 16934, 20325, 7853, 6371, 6928, 9293, 7563, 6930, 12427, 1748, 8231, 8407, 11128, 6497, 17941, 4230, 14819, 16171, 4878, 4858, 9668, 6343, 1783, 5311, 5857, 1407, 1692, 5070, 12479, 6936, 23213, 12719, 15885, 9838, 9854, 5929, 13784, 4297, 6938, 6138, 21255, 6949, 4561, 4090, 6734, 4954, 2575, 8533, 2585, 10641, 4542, 22068, 2333, 23155, 6301, 22945, 23158, 6305, 22807, 13424, 18777, 23008, 7155, 23165, 15900, 12442, 13433, 23170, 1331, 22821, 23019, 22704, 12786, 23071, 21347, 21219, 22059, 18569, 12601, 10178, 3774, 12934, 15277, 12536, 10681, 1853, 15301, 4254, 3664, 23119, 15461, 9194, 9154, 2011, 19547, 2001, 20943, 23144, 7296, 12002, 12365, 7573, 2244, 4224, 1070, 7236, 9421, 6877, 17191, 7655, 14880, 14751, 1029, 3657, 5138, 6345, 22941, 3243, 23237, 6968, 23157, 15906, 18774, 7547, 23161, 6853, 23245, 6313, 10747, 23248, 22815, 22956, 7849, 13674, 23253, 15908, 23174, 21556, 23176, 1985, 889, 5209, 5730, 12723, 11836, 23124, 2266, 23126, 23327, 12662, 16060, 3403, 5672, 4178, 11096, 4253, 7875, 13661, 11281, 14232, 16663, 1418, 9037, 4687, 20407, 2639, 4665, 14550, 15731, 10124, 11676, 7238, 8462, 20555, 12988, 11392, 11538, 7514, 1895, 2825, 1944, 1091, 923, 4951, 11329, 3724, 1144, 1869, 21020, 12833, 16877, 1417, 1451, 9595, 15523, 2999, 5727, 14880, 7743, 5240, 8996, 1879, 10705, 1725, 22943, 23001, 23239, 23305, 22806, 23160, 23243, 22950, 23164, 23312, 18782, 6845, 23315, 18786, 23171, 22805, 22960, 6326, 23320, 22659, 22964, 4733, 20086, 2629, 10804, 13124, 5891, 2822, 13799, 3242, 6471, 6486, 8425, 23360, 10178, 6486, 19042, 16228, 9610, 13273, 8280, 8263, 3914, 8265, 8187, 4034, 8180, 3922, 3929, 19078, 19085, 3928, 8178, 23431, 19085, 8268, 8187, 3938, 1241, 20063, 6648, 19848, 7674, 19981, 3958, 22591, 22593, 20071, 19856, 19984, 7920, 20076, 7690, 23406, 22460, 23408, 7512, 13603, 4493, 4921, 23147, 11680, 10706, 2080, 16346, 7656, 16461, 858, 13479, 9768, 10465, 12489, 1247, 10045, 8642, 22447, 5506, 1775, 12573, 13706, 21105, 13123, 15100, 1475, 19596, 10484, 18954, 13775, 22948, 9592, 19018, 2838, 22801, 18887, 2843, 6405, 13673, 9883, 17890, 18818, 7303, 10298, 23302, 22822, 22946, 23159, 23307, 23394, 23007, 22951, 23492, 23166, 15901, 23250, 23316, 23016, 23318, 18790, 22823, 19065, 20080, 22706, 22459, 21989, 23463, 8221, 13603, 1252, 20410, 6911, 23488, 5361, 19563, 16438, 3291, 20678, 1562, 17713, 13008, 10426, 1521, 12550, 4328, 1292, 17713, 16304, 7169, 13241, 4412, 1531, 6537, 6965, 23518, 18896, 9869, 8759, 22472, 17781, 18901, 23499, 15523, 18400, 13997, 18889, 23504, 17889, 18319, 23507, 2500, 23509, 23568, 23156, 12606, 23391, 22948, 23308, 21805, 23517, 23247, 23398, 13432, 12621, 23251, 12780, 6172, 23173, 23020, 21461, 23072, 23023, 18604, 10397, 16115, 6015, 23548, 16303, 3887, 17942, 3792, 5191, 20441, 19622, 2846, 18229, 4178, 21104, 22205, 22857, 1479, 22245, 4014, 888, 14788, 3632, 1009, 1531, 1066, 4943, 23247, 21698, 20090, 8883, 18775, 3200, 20098, 3173, 22801, 17879, 4830, 20802, 7723, 7900, 22797, 23576, 18906, 23578, 23238, 23525, 23512, 23241, 23393, 13662, 23516, 23396, 18781, 22954, 18783, 23521, 23401, 23252, 23172, 23254, 21866, 18010, 16696, 22658, 23462, 22709, 6961, 5291, 2735, 19038, 8921, 16768, 20682, 14649, 15186, 14181, 1779, 6514, 14584, 12603, 3466, 3012, 15105, 7036, 1946, 6662, 3129, 16944, 9172, 1128, 10086, 4480, 3446, 17734, 17704, 22359, 10465, 12732, 3392, 5226, 17013, 22449, 1926, 22409, 17740, 3703, 21189, 22097, 21192, 2396, 882, 8770, 22978, 10091, 1139, 13307, 15353, 4906, 1673, 22125, 17754, 5215, 1009, 4506, 7969, 13835, 858, 6801, 1124, 3174, 11564, 1406, 14622, 2007, 23732, 3812, 1247, 865, 1381, 5483, 1271, 2146, 5354, 1267, 2145, 1131, 5555, 7216, 20684, 2735, 2407, 3813, 21529, 11283, 2059, 2643, 8146, 11516, 1758, 11607, 21926, 12714, 6324, 2194, 6572, 13457, 1628, 4944, 4285, 9851, 5908, 6322, 7518, 3691, 5308, 4385, 1756, 8244, 961, 1728, 23767, 6924, 8753, 23770, 4217, 14004, 1357, 12009, 4963, 11805, 4412, 4579, 3407, 23461, 23531, 23665, 8092, 22015, 6108, 973, 12551, 11790, 5833, 1540, 15240, 6704, 23702, 868, 23678, 6841, 15093, 15986, 9538, 19378, 1815, 1018, 3311, 11729, 1887, 10186, 10087, 7001, 10033, 9456, 17796, 23696, 6819, 23698, 23483, 4027, 23759, 14006, 10473, 23704, 10144, 23706, 12624, 3848, 18567, 20117, 3903, 10091, 1006, 7743, 19044, 23768, 9798, 23783, 23772, 2417, 21582, 23775, 7188, 8844, 23779, 23770, 2454, 23782, 1850, 12622, 4320, 2415, 23787, 4339, 23789, 23786, 12622, 5936, 17806, 1225, 2643, 23717, 1654, 23719, 16689, 3829, 11786, 9547, 7033, 9768, 4003, 1123, 12541, 4179, 23732, 15105, 13033, 15002, 17941, 23738, 1010, 23740, 4693, 2661, 23744, 4032, 20362, 22850, 9722, 23750, 5770, 22288, 4471, 14026, 23756, 1312, 2086, 11903, 4021, 6071, 10797, 14169, 23660, 21553, 18199, 23663, 23794, 22829, 12419, 4672, 12421, 1914, 23817, 23689, 17756, 5078, 23822, 23694, 3345, 23825, 22445, 3375, 23828, 23701, 13891, 20092, 23833, 21188, 3235, 3846, 21191, 12625, 23838, 23939, 22453, 20788, 10920, 5266, 21162, 23034, 3558, 22971, 4833, 21181, 17749, 22975, 3592, 22977, 3847, 3572, 5220, 17270, 3129, 22969, 20656, 20001, 21180, 20659, 17744, 23955, 19278, 1739, 23712, 10724, 17164, 23961, 3884, 12866, 16309, 22972, 20115, 22386, 4765, 4402, 9771, 23958, 21967, 23974, 17692, 17699, 23963, 23035, 10828, 23979, 21182, 12645, 22387, 3894, 7346, 23972, 23793, 22828, 19452, 8092, 11406, 17331, 8519, 12865, 20656, 23992, 23952, 23967, 10143, 23937, 23997, 4098, 23999, 8841, 21761, 2384, 9611, 3000, 23818, 23690, 23925, 23693, 23952, 23094, 23697, 22446, 11349, 23829, 11382, 23831, 5392, 16450, 23995, 23982, 23839, 23708, 23942, 22452, 12649, 3240, 6129, 2374, 23989, 23949, 3166, 23978, 24010, 20798, 23968, 21184, 3148, 7879, 24016, 23987, 1010, 24006, 23990, 3603, 21359, 23966, 24051, 24012, 23969, 23486, 23836, 3572, 24057, 23948, 3579, 23035, 23951, 22295, 24011, 23981, 8901, 13434, 23999, 23594, 23257, 21797, 19070, 21799, 8253, 6009, 1777, 960, 2260, 19169, 6334, 11303, 9940, 6014, 20592, 22723, 4325, 23349, 4120, 19759, 12129, 7762, 5759, 6469, 19427, 8369, 12380, 23816, 10183, 24022, 23924, 23821, 24025, 22295, 24027, 23826, 24029, 23700, 6719, 22450, 23935, 24035, 23705, 23938, 24041, 23840, 5386, 16450, 23711, 23985, 10091, 1728, 9477, 19686, 2682, 18052, 1555, 15154, 21267, 17349, 1034, 8942, 1631, 9538, 3007, 12385, 4661, 23675, 1103, 19320, 1271, 1309, 17806, 4921, 6868, 14092, 1871, 4062, 4539, 12472, 12012, 20593, 14255, 22200, 2537, 4052, 13240, 7064, 14106, 9551, 6968, 9410, 19151, 5154, 5628, 16752, 6504, 14258, 9443, 3619, 956, 5792, 6213, 4921, 13467, 299, 2639, 6328, 4317, 18565, 5780, 2107, 5555, 7084, 6514, 1407, 1559, 862, 2421, 8753, 19332, 17540, 11752, 2165, 8991, 6107, 1381, 1073, 14559, 15179, 15716, 8868, 13362, 4786, 18884, 18722, 1190, 2194, 3586, 1516, 13770, 23526, 21215, 22705, 22255, 21218, 21463, 17510, 21891, 1953, 8684, 5389, 11315, 14806, 3951, 24093, 7046, 24095, 9257, 3002, 24098, 17349, 24100, 4647, 18087, 488, 2708, 23475, 24105, 16054, 17563, 1225, 24109, 24021, 23923, 10187, 24113, 10100, 23823, 23695, 10424, 24117, 23931, 24030, 23933, 24033, 2413, 3588, 24013, 3180, 24126, 24039, 24129, 24038, 4825, 5303, 1498, 1634, 2136, 24195, 1940, 7051, 24199, 3728, 15871, 2310, 859, 21536, 24206, 20193, 913, 24209, 14569, 2043, 6995, 3818, 15574, 24215, 1085, 17164, 24218, 4658, 2823, 1240, 2421, 9402, 10484, 861, 24135, 14615, 2090, 3379, 21890, 12391, 24142, 16418, 24144, 20876, 7006, 15047, 19010, 13081, 1618, 16488, 7651, 24154, 14525, 15039, 15154, 2932, 10338, 10607, 11998, 15814, 1290, 3479, 24165, 13120, 16467, 3401, 12196, 2721, 6886, 6329, 24173, 6430, 2008, 15767, 1395, 956, 24179, 1063, 24181, 11802, 16277, 1943, 1143, 4040, 9274, 12823, 3529, 24190, 22919, 21552, 18599, 22826, 22256, 21348, 21220, 20181, 13814, 15276, 18943, 7939, 20985, 6588, 4534, 12859, 13234, 14878, 903, 5014, 16119, 18759, 13211, 10795, 6418, 15432, 19348, 21516, 9732, 14305, 21519, 18206, 18189, 5059, 5044, 16315, 8820, 23446, 7622, 2760, 11629, 10435, 10421, 13381, 13306, 1523, 8156, 6763, 6445, 11980, 23484, 2744, 2496, 1847, 10220, 6222, 18154, 2205, 10329, 18649, 4849, 6430, 11315, 7421, 18052, 20455, 12776, 10248, 3342, 16683, 18183, 3464, 2175, 2338, 5082, 9568, 3094, 10264, 5126, 939, 1527, 4847, 13097, 11462, 1665, 21981, 19507, 4715, 2470, 10109, 6751, 12389, 7663, 10242, 9693, 19508, 20048, 16622, 3408, 13004, 10976, 7770, 6028, 3097, 7236, 1739, 19535, 7560, 24247, 5025, 2882, 10218, 1563, 8526, 8394, 7293, 3810, 1898, 4164, 1215, 20440, 1627, 1659, 19169, 1356, 5011, 19000, 14702, 11344, 16560, 11724, 3507, 961, 858, 4410, 10491, 19637, 1371, 5728, 866, 24000, 20178, 24002, 854, 13013, 10633, 24391, 12548, 2212, 21536, 16154, 5194, 5011, 14878, 5083, 2221, 16583, 11505, 7119, 10268, 24382, 13123, 4740, 4529, 24395, 18740, 7461, 9877, 7394, 18749, 2320, 24390, 18245, 2222, 9877, 15528, 22940, 2087, 5672, 11911, 8406, 14103, 11582, 1740, 6643, 8452, 21621, 4464, 2996, 18974, 24497, 11517, 3151, 993, 1683, 11724, 8159, 3431, 17397, 17606, 7234, 902, 12861, 12014, 2924, 1614, 24483, 13207, 925, 24480, 7760, 3035, 3043, 7183, 7280, 9565, 11890, 4909, 14856, 19682, 3066, 13502, 1274, 16672, 7183, 5997, 1805, 9994, 1669, 13166, 15733, 4662, 9059, 1352, 4905, 13900, 12401, 1906, 2975, 24450, 22165, 1928, 7939, 13854, 24445, 7953, 24443, 2670, 1931, 24441, 10854, 3003, 2178, 5782, 917, 8937, 12359, 10592, 16536, 10309, 8669, 2031, 1251, 24426, 8800, 23876, 6999, 11064, 24422, 12390, 12223, 16931, 9270, 5658, 24415, 1604, 8400, 5566, 3071, 2959, 15163, 1314, 10097, 1269, 2231, 24504, 22257, 21349, 3752, 8614, 9326, 22692, 2465, 2743, 2003, 9520, 869, 3370, 11434, 1806, 6514, 2364, 6931, 16965, 1953, 9215, 11628, 19367, 8976, 21469, 7961, 10440, 4053, 2452, 6821, 10026, 11700, 19367, 6394, 4552, 2361, 3716, 4081, 12160, 1605, 1437, 1423, 10417, 18837, 2981, 20705, 3838, 5199, 1011, 2413, 7937, 10826, 1267, 1685, 7737, 1690, 5122, 968, 6296, 22695, 19663, 22049, 17435, 14392, 10804, 4602, 3919, 16518, 12677, 5411, 10383, 7440, 4232, 3459, 8697, 9058, 7123, 1778, 14911, 15740, 8841, 19679, 22183, 4813, 8916, 2919, 4987, 8933, 3953, 8915, 12371, 24737, 24143, 2903, 8914, 8938, 18128, 24317, 4344, 8939, 21458, 23912, 24366, 23529, 22827, 24505, 22258, 16365, 15399, 8885, 24655, 4186, 2480, 17263, 17784, 9931, 5243, 22691, 24678, 19365, 2752, 19370, 19369, 15843, 3996, 6053, 2653, 3849, 9126, 19363, 6630, 1084, 24769, 19368, 4965, 24772, 5623, 7937, 15857, 17883, 24759, 4561, 24761, 8584, 8525, 19294, 21341, 19411, 23486, 19256, 19300, 19414, 23213, 12525, 17391, 24748, 4751, 24741, 14229, 8907, 16431, 8913, 24746, 24807, 8937, 24809, 24734, 24746, 13546, 24813, 24223, 23069, 22656, 24226, 23022, 16857, 17767, 7139, 7279, 5554, 13593, 3791, 15174, 15620, 11373, 21670, 1458, 5152, 16581, 1089, 13120, 13847, 8456, 16434, 9230, 5083, 1285, 24838, 2782, 2029, 22170, 1701, 9110, 23364, 24846, 1415, 24836, 3012, 21670, 24841, 3372, 24524, 24835, 5180, 3836, 15167, 5939, 13590, 1331, 8231, 2991, 3190, 1866, 11430, 7248, 24647, 7176, 1690, 24868, 3061, 1611, 10183, 5930, 2825, 2346, 3164, 2474, 3316, 9618, 7026, 21857, 7859, 1851, 6703, 16619, 11584, 10178, 1866, 24877, 20297, 14495, 11506, 13583, 4429, 2553, 3522, 24887, 24879, 19816, 9065, 1567, 11690, 10455, 24900, 2586, 1091, 24895, 5866, 14667, 24212, 8164, 4697, 23807, 2495, 21857, 1699, 24887, 14632, 15258, 1443, 21283, 6800, 12013, 19825, 2497, 14122, 14946, 1867, 13214, 8159, 7248, 8626, 17077, 6933, 20277, 9364, 1653, 18839, 6873, 24879, 24932, 24931, 19480, 14880, 2556, 24649, 24369, 23260, 1225, 4114, 24309, 16820, 17806, 23692, 3853, 1770, 22892, 7265, 1387, 5510, 10737, 7790, 2955, 1785, 11360, 4856, 4682, 8464, 2495, 17448, 21804, 18288, 6388, 19836, 19296, 19823, 1171, 19821, 19836, 3402, 3070, 3212, 2759, 10154, 1417, 1087, 10985, 3790, 6334, 9631, 17049, 7594, 17854, 333, 4376, 1806, 24848, 14564, 4839, 2665, 3914, 7770, 2977, 8383, 1515, 7253, 24588, 2980, 14605, 5129, 10228, 12001, 7339, 21276, 13116, 9518, 1481, 10172, 17224, 10336, 4867, 1251, 4219, 4428, 5019, 24216, 9380, 9502, 12291, 21532, 4685, 13322, 1750, 3935, 2777, 2166, 8273, 19082, 1818, 4427, 12214, 2393, 14375, 1698, 12932, 17024, 9013, 4636, 20443, 6666, 24954, 23259, 17510, 2820, 10747, 24529, 2268, 21497, 7464, 18744, 18947, 7358, 21522, 18764, 2283, 3553, 3167, 22943, 24391, 9938, 16371, 21481, 23165, 21501, 8064, 15944, 21928, 15414, 7902, 21995, 15418, 19148, 15936, 11035, 18590, 15440, 22050, 11035, 22052, 17682, 24820, 24225, 23021, 21462, 23073, 16858, 9124, 9242, 22177, 8014, 21166, 10120, 1395, 2497, 1692, 299, 1333, 4506, 12504, 7126, 2191, 7644, 20003, 16348, 19527, 15989, 1396, 1294, 24874, 10462, 21355, 16431, 24098, 15579, 4780, 8326, 1558, 3623, 5269, 16320, 12157, 18022, 12766, 17623, 12160, 18043, 4688, 20598, 8846, 11476, 1611, 9273, 15186, 4024, 15648, 1688, 1679, 13841, 2336, 947, 12776, 9568, 14847, 16928, 8660, 12266, 24701, 22411, 22189, 1673, 10312, 6109, 20002, 21935, 926, 21186, 1995, 10591, 20591, 20771, 20928, 16311, 22148, 17363, 8793, 6871, 5288, 2171, 7258, 3919, 1959, 10806, 19536, 7573, 7281, 5154, 4469, 21193, 1995, 10146, 20006, 3756, 3204, 23539, 24308, 4981, 3049, 1132, 12203, 1034, 3015, 3074, 4807, 5114, 1415, 13224, 23255, 18280, 17249, 22139, 21798, 3280, 7846, 13687, 24535, 24673, 23820, 11358, 19902, 4225, 3887, 1640, 23547, 8685, 8733, 8685, 22245, 7858, 6827, 1121, 21396, 16315, 3574, 6167, 23560, 19013, 23562, 2652, 15893, 23497, 23566, 7956, 23500, 9922, 23502, 9130, 23572, 18335, 23506, 18552, 23641, 2395, 23510, 23002, 23581, 23564, 23583, 13426, 12437, 23586, 23653, 23399, 23655, 22819, 23657, 23403, 23593, 25215, 21611, 19733, 23116, 22925, 23323, 22506, 19455, 22508, 16265, 22510, 22497, 15677, 15750, 6569, 15752, 22516, 10958, 7303, 18845, 4785, 6629, 1818, 19076, 23435, 23440, 8272, 23439, 19079, 24348, 23442, 8279, 19091, 8280, 8170, 8264, 25305, 11216, 6644, 22586, 19847, 20065, 19099, 20067, 8745, 23453, 19104, 23455, 14439, 22596, 23458, 22599, 19861, 24364, 22824, 19864, 24367, 24227, 25103, 17767, 20573, 2720, 7552, 1817, 10595, 12402, 4860, 1632, 4697, 18226, 6342, 1011, 16962, 8469, 4662, 8704, 13237, 11281, 17630, 5805, 22417, 3299, 16906, 1402, 1234, 5864, 11667, 14357, 3326, 7556, 3627, 1522, 19911, 5379, 7421, 6634, 9568, 1412, 22481, 13730, 5779, 9258, 1198, 1143, 4497, 12155, 8907, 5919, 11698, 12096, 9587, 9287, 5976, 494, 12337, 2059, 11013, 5266, 3801, 8318, 16456, 9036, 22447, 3370, 3434, 21099, 6514, 4177, 25155, 5073, 14711, 13237, 11107, 8622, 9200, 4470, 9766, 14549, 9692, 16958, 16963, 1416, 1852, 25378, 22131, 1542, 2398, 23875, 4474, 15174, 968, 3369, 9995, 909, 12979, 5386, 5281, 5396, 14902, 5274, 12269, 6131, 23488, 18674, 7650, 24819, 22456, 23070, 18281, 24083, 20084, 4363, 22966, 2822, 23033, 24072, 3558, 15548, 20343, 24007, 23035, 22074, 21171, 20798, 9857, 3660, 12662, 24063, 3563, 3891, 24066, 15548, 3896, 24036, 24078, 12648, 24127, 3159, 3695, 23328, 24056, 22980, 17969, 2855, 22983, 15512, 14140, 18975, 13397, 18977, 12635, 7012, 12637, 13402, 6895, 22994, 1572, 12642, 22997, 18819, 22999, 4755, 23579, 15890, 23017, 22986, 9742, 23515, 23162, 22810, 23009, 13408, 23519, 23249, 12621, 23015, 22958, 25274, 23659, 23068, 25442, 24821, 25101, 23596, 24824, 17862, 1263, 8710, 16351, 7208, 16481, 2455, 7004, 10798, 24774, 18488, 4668, 9588, 12327, 16493, 3814, 1906, 10050, 24914, 1375, 16740, 12456, 4647, 25542, 21284, 5231, 5226, 21418, 5533, 24964, 2683, 6151, 2656, 3860, 18629, 6053, 2155, 10657, 2189, 25527, 12200, 1184, 15490, 11269, 17052, 13881, 4977, 5832, 21133, 2776, 10001, 3529, 24838, 9538, 5741, 9873, 4172, 17854, 11905, 25570, 13134, 1484, 8447, 14846, 10134, 3012, 1453, 18859, 21889, 3383, 11610, 1889, 13305, 12969, 4473, 6382, 9270, 18856, 13483, 4778, 12308, 25600, 12825, 1557, 13351, 883, 6036, 14971, 21820, 3089, 8842, 19167, 5407, 22988, 7224, 6002, 2042, 20482, 3494, 13414, 24531, 11850, 4231, 21531, 1047, 21533, 16533, 22413, 19401, 1496, 9478, 11621, 2008, 1931, 23207, 11066, 23768, 1308, 15969, 25629, 10709, 2280, 11267, 895, 3502, 8424, 25620, 9689, 11779, 13293, 5779, 9228, 14370, 10612, 4869, 17121, 13147, 1115, 4118, 15828, 5352, 5551, 13541, 21377, 14650, 3792, 9231, 25276, 22604, 22923, 25279, 23532, 12599, 19831, 7346, 23523, 23658, 15908, 23388, 25498, 22804, 23004, 23242, 23649, 25504, 23310, 15898, 22953, 23012, 23654, 23589, 1023, 3156, 2955, 10078, 15874, 15482, 6911, 4371, 8345, 13641, 9994, 4294, 13552, 1490, 10027, 16045, 6692, 4371, 17392, 2976, 5876, 19363, 11576, 10314, 15831, 2835, 16486, 3442, 1533, 3936, 9257, 1260, 3849, 11062, 1474, 8856, 6127, 4550, 3637, 19580, 17294, 21256, 2373, 2846, 10936, 6745, 18225, 2549, 9094, 25501, 17261, 19671, 13208, 19776, 1749, 9342, 11792, 4876, 1751, 2400, 12054, 4637, 1019, 4390, 4292, 5851, 14576, 1576, 14816, 4093, 19903, 13981, 3525, 25705, 13354, 9538, 9228, 16584, 14914, 16170, 9538, 10314, 13976, 25764, 11758, 15460, 6827, 3369, 9539, 956, 5656, 6468, 4412, 6023, 25376, 12058, 25329, 23527, 22457, 24752, 24368, 25060, 16858, 11202, 1146, 9748, 4113, 11010, 18649, 7980, 13352, 7380, 17003, 9653, 7638, 8835, 19510, 4312, 25159, 13776, 10798, 5326, 6306, 15508, 7411, 1410, 8689, 10798, 10900, 4237, 18155, 25819, 25606, 25821, 25606, 5331, 25820, 3765, 10900, 7766, 8835, 19874, 2318, 25802, 10501, 7004, 13771, 18348, 15000, 18668, 11841, 3044, 6235, 1123, 21567, 2284, 21148, 18923, 7240, 11500, 17003, 6142, 12859, 10888, 3128, 22110, 4398, 25810, 25842, 16290, 857, 25059, 24228, 25104, 1931, 10921, 9608, 1211, 11517, 5215, 2982, 1532, 3133, 2639, 22372, 7169, 10245, 3170, 20593, 9480, 10060, 3640, 10136, 8777, 1209, 10960, 3296, 12190, 15642, 6447, 3909, 23385, 4682, 7476, 3414, 4683, 11283, 9363, 5910, 11377, 321, 8152, 901, 1693, 9244, 5866, 1523, 4811, 4411, 22786, 9295, 12213, 2056, 25592, 10073, 15665, 6721, 25341, 8640, 9399, 1989, 25414, 5977, 3495, 2973, 2059, 17780, 21696, 14670, 16668, 8783, 6243, 1147, 4746, 20480, 6643, 3347, 5747, 1800, 15717, 11367, 13526, 8918, 16018, 23193, 4904, 10560, 13845, 4043, 7075, 12215, 14357, 12401, 11836, 1257, 17577, 5701, 321, 6801, 25899, 12190, 12306, 11630, 24081, 25444, 25218, 24084, 20551, 8149, 299, 4061, 13264, 16127, 17632, 15213, 8715, 1242, 21334, 22382, 5199, 10482, 10422, 19899, 2712, 2550, 13056, 11423, 5766, 9308, 4535, 3292, 12892, 9274, 7238, 5939, 11083, 19757, 15085, 8283, 9711, 1859, 1066, 25154, 1736, 3953, 14936, 17031, 856, 9668, 11435, 10301, 5779, 3285, 10116, 14794, 7259, 6013, 1925, 9229, 12181, 3001, 6754, 13355, 14918, 14470, 13166, 1419, 14681, 7178, 6776, 3196, 5199, 13140, 1147, 24761, 15035, 1928, 3196, 1358, 19723, 1239, 10587, 7183, 1960, 14566, 10127, 12054, 12256, 1110, 5009, 20756, 13865, 11948, 3464, 6758, 14984, 11925, 2015, 14580, 17132, 14866, 9547, 11933, 3663, 15766, 10701, 15657, 12045, 9285, 1787, 1015, 6997, 1213, 6907, 3318, 1226, 14264, 17673, 25748, 1463, 5806, 13210, 9228, 5149, 1215, 20142, 22764, 15477, 3638, 14471, 7774, 17453, 3066, 3089, 10331, 3442, 10447, 18066, 9047, 7800, 8115, 10467, 1147, 14357, 11662, 7063, 5841, 486, 10722, 14958, 20948, 4276, 4690, 21321, 24639, 4024, 4469, 5388, 8175, 5730, 1734, 24701, 9340, 1853, 19652, 2041, 6167, 4777, 8232, 18637, 1088, 6004, 17190, 16982, 4944, 861, 2704, 4215, 1477, 8252, 4683, 3289, 15571, 20404, 4228, 2820, 22927, 4683, 2281, 14563, 4856, 15668, 423, 13074, 4339, 25735, 9230, 4912, 4028, 861, 11483, 4319, 10657, 13499, 8403, 1903, 20820, 11362, 3936, 3459, 25937, 1765, 16845, 7937, 20581, 2752, 8484, 3948, 2214, 15328, 12065, 14543, 4475, 19034, 4341, 25141, 13499, 16640, 9495, 15112, 17566, 14574, 6844, 2100, 5899, 4629, 7106, 4876, 12388, 16472, 19723, 10088, 12857, 4857, 3642, 10751, 16465, 5016, 15008, 21783, 10244, 8973, 7083, 9287, 13007, 20789, 6472, 6578, 1875, 7253, 3697, 14603, 1071, 7514, 12181, 4809, 25006, 16831, 9133, 6693, 5457, 5411, 5789, 1690, 20472, 11685, 14626, 6557, 12080, 25537, 13986, 2171, 1797, 4194, 9000, 10656, 1109, 2760, 13728, 4661, 3027, 1918, 3048, 9432, 1742, 11251, 20565, 25863, 25334, 17862, 6527, 6236, 25420, 1558, 18970, 19349, 18972, 18881, 2147, 18976, 10929, 7022, 18970, 18980, 22128, 13761, 11011, 16450, 10398, 26045, 1105, 6769, 5023, 22424, 16394, 22049, 467, 16264, 18077, 18159, 21174, 14133, 15517, 14036, 10891, 18188, 22685, 3361, 19608, 19641, 6133, 1732, 6944, 20517, 11114, 14292, 6141, 16761, 24280, 876, 6247, 2461, 2971, 7051, 6479, 22087, 7889, 20096, 23631, 22091, 21895, 23635, 7897, 3524, 22082, 23639, 8188, 4046, 20088, 23627, 22088, 12070, 26320, 22076, 20104, 24019, 26323, 22792, 23984, 7787, 26327, 16442, 15536, 26316, 26331, 26318, 13765, 26334, 7893, 26337, 10933, 17880, 10781, 20113, 26342, 19937, 15503, 26345, 20094, 20091, 26348, 20102, 26335, 25431, 3017, 26338, 20112, 26326, 16579, 10091, 26329, 2355, 26317, 7857, 26319, 26363, 26350, 26366, 26352, 7721, 26325, 23638, 26370, 26328, 10882, 7354, 26374, 20095, 26362, 22075, 26378, 17789, 22095, 26354, 26369, 10942, 19413, 17956, 26387, 26346, 26375, 26390, 3580, 26364, 26322, 26380, 26324, 26340, 7899, 26384, 26343, 13463, 26359, 10924, 26389, 5930, 26349, 7862, 20105, 26367, 26395, 26383, 7882, 26372, 26400, 26360, 2339, 26417, 26377, 26419, 26351, 7896, 26339, 22097, 22083, 6391, 5337, 16089, 13715, 22668, 8584, 17991, 10354, 17954, 4527, 26259, 23597, 18015, 6962, 8065, 10386, 22428, 18586, 25090, 18588, 23268, 22406, 18592, 24396, 7946, 6688, 5936, 877, 9828, 20792, 26407, 1495, 25471, 22083, 18476, 26401, 17773, 25457, 3615, 3556, 1433, 16254, 26466, 26433, 22096, 26355, 26384, 26471, 26427, 18395, 26418, 3240, 13220, 18469, 3193, 26467, 26481, 26396, 22973, 17866, 22072, 22089, 26487, 26371, 26478, 8359, 26421, 26469, 26327, 26484, 26415, 22073, 21175, 26430, 23986, 2705, 9898, 25465, 26485, 20657, 26510, 3173, 26479, 20107, 26504, 26411, 18304, 10078, 26514, 26507, 26498, 26517, 24220, 26502, 26492, 22081, 26423, 12530, 26372, 26525, 12521, 7857, 26474, 7892, 7862, 26519, 22080, 26521, 26424, 10882, 26536, 26497, 26486, 26528, 22968, 26531, 26544, 26534, 26546, 22974, 26515, 26539, 23632, 26529, 26393, 26353, 26553, 10091, 16701, 9909, 23968, 26515, 23105, 26550, 23989, 26531, 12445, 26494, 26371, 10879, 20799, 26557, 26509, 26391, 26541, 26530, 26480, 26532, 26341, 26522, 26535, 26556, 26526, 26549, 26580, 7874, 26542, 26394, 26563, 26385, 4237, 26577, 26589, 26516, 26591, 26518, 26582, 26520, 4823, 26533, 26575, 26597, 26547, 23628, 26590, 26404, 7716, 26593, 26562, 26605, 26585, 26397, 3459, 3620, 26609, 26332, 26600, 26612, 26581, 26561, 4830, 26595, 26412, 26506, 26537, 26473, 26579, 26624, 26592, 26603, 26543, 26616, 26410, 26545, 26608, 26588, 26631, 26508, 8787, 26475, 26625, 26491, 26583, 26628, 26523, 10178, 26621, 7889, 26558, 26321, 26614, 26627, 26638, 20118, 26607, 26524, 26642, 26548, 26623, 26646, 26635, 26626, 3134, 26628, 25965, 25217, 22338, 22607, 22926, 6922, 4032, 7528, 24922, 24933, 6889, 19455, 24778, 24679, 19372, 24770, 24783, 19366, 5307, 18174, 24654, 24767, 24780, 19371, 24685, 24598, 24688, 5224, 18616, 6934, 3136, 2566, 6126, 19423, 16589, 2585, 3016, 19908, 885, 2569, 2489, 2195, 21228, 2583, 22267, 21242, 12983, 1040, 8384, 4974, 24803, 24745, 13552, 24806, 8941, 24814, 24733, 24812, 11135, 26725, 24815, 24808, 26731, 24817, 11151, 8906, 26447, 25520, 18015, 1628, 1864, 24731, 16038, 2401, 16752, 2069, 8444, 11121, 2240, 15580, 2831, 2739, 9994, 5004, 14605, 10264, 10447, 24154, 9054, 6478, 1055, 7048, 5899, 13643, 19826, 20422, 2092, 20509, 11999, 3646, 1248, 2042, 4644, 24659, 13925, 2214, 24565, 4391, 1660, 3144, 26253, 24427, 300, 1441, 22372, 2903, 2310, 13607, 16488, 10586, 6842, 11279, 26779, 1750, 19397, 4815, 26783, 1207, 15247, 20722, 9402, 8232, 3710, 13542, 3331, 17427, 5810, 3163, 5577, 4317, 13204, 7658, 10329, 21656, 11192, 20666, 2061, 26749, 5158, 17661, 16902, 1802, 4534, 11869, 21653, 6430, 22427, 12838, 6846, 11731, 21589, 1369, 2707, 11317, 2361, 13291, 920, 12388, 20603, 3128, 21807, 11476, 2190, 3688, 8364, 1634, 15731, 5997, 21654, 26047, 1084, 5389, 22427, 7306, 9223, 17540, 11598, 19887, 9885, 9049, 14317, 1290, 2742, 15653, 24353, 1122, 13375, 19762, 16331, 26855, 19381, 4477, 4855, 18210, 14283, 1441, 4341, 974, 6928, 7798, 12439, 6997, 6300, 12326, 1527, 26775, 2924, 5144, 12080, 1009, 8152, 3020, 12875, 9381, 2996, 14117, 13140, 1948, 13880, 24151, 4085, 3081, 15247, 13117, 22335, 9076, 6877, 26781, 25788, 24224, 23256, 25966, 26673, 23322, 1845, 19416, 18692, 10214, 7245, 21671, 6945, 1922, 25659, 20426, 6032, 22318, 7315, 14884, 24691, 13894, 4956, 7182, 25659, 5224, 24589, 10541, 6805, 5157, 13252, 2977, 9050, 11000, 25405, 22273, 3825, 4707, 399, 4850, 22785, 17621, 14114, 25767, 11063, 8394, 21138, 24750, 22825, 25791, 25333, 26448, 19071, 1604, 4387, 15393, 1049, 1123, 876, 7528, 10871, 10208, 881, 23622, 16785, 12301, 1439, 1407, 6698, 2005, 23430, 3713, 4805, 1240, 22350, 9739, 880, 22010, 22003, 2499, 3004, 1546, 1073, 5505, 10359, 4378, 8369, 14567, 8369, 9716, 6306, 10466, 11537, 25981, 2410, 12055, 2670, 18139, 4560, 3916, 1543, 16452, 1072, 4038, 7304, 1854, 4219, 1103, 1133, 1736, 3726, 25674, 20527, 17022, 24643, 11706, 8275, 26737, 22140, 18730, 11817, 18920, 7121, 19402, 3174, 862, 22289, 13624, 3159, 1362, 10897, 916, 3997, 1149, 7085, 6296, 27043, 1766, 1604, 12808, 17348, 892, 16607, 3065, 20092, 861, 4742, 7811, 15857, 27038, 26973, 27040, 6333, 27045, 27042, 5151, 27046, 25195, 21151, 11145, 4807, 27031, 6529, 1437, 23470, 27056, 2172, 9539, 27039, 22285, 16323, 13246, 1805, 14322, 5219, 6009, 11156, 2229, 4802, 24957, 8556, 3554, 2579, 1356, 17594, 10064, 3804, 13013, 10011, 2783, 21320, 9434, 3437, 27034, 4450, 18265, 9734, 17411, 2035, 6489, 7227, 2810, 6011, 27098, 5902, 27100, 20679, 27109, 4043, 14798, 5766, 21020, 27003, 6589, 5638, 16627, 15263, 4231, 6152, 7805, 4118, 21059, 23263, 22183, 3086, 8441, 17622, 17105, 1886, 26216, 8834, 5783, 1901, 14262, 8137, 20181, 1606, 12080, 9449, 2039, 22739, 5019, 3755, 300, 27129, 1701, 20527, 7751, 5407, 9693, 20717, 19063, 22654, 20545, 25100, 23595, 23258, 25864, 17252, 910, 9110, 1628, 4090, 977, 17243, 9997, 11506, 13588, 1508, 24350, 6254, 2411, 11139, 14670, 25230, 14451, 2192, 1624, 4999, 4685, 21731, 1130, 1312, 10119, 24480, 7027, 9841, 10252, 14055, 24931, 22320, 9317, 3136, 1734, 9782, 14486, 25160, 16768, 1671, 21112, 13608, 5015, 9644, 1756, 13835, 6840, 1775, 20567, 2356, 15708, 2584, 1540, 1138, 1611, 9643, 7773, 20697, 7974, 3378, 2081, 12348, 7214, 3402, 8096, 22341, 7766, 11433, 1135, 1373, 21656, 3015, 11345, 15979, 3655, 1740, 1915, 1255, 1138, 13624, 945, 6739, 3859, 4003, 6608, 6491, 15458, 20291, 5246, 26109, 16433, 1364, 6247, 2708, 1006, 3373, 1478, 15716, 9070, 7518, 1477, 22327, 7306, 5912, 5838, 2488, 1917, 7000, 2142, 21761, 7240, 14653, 20048, 10429, 3526, 1953, 9499, 977, 12098, 5845, 1067, 17673, 1008, 5388, 20511, 8640, 17827, 16691, 9548, 14758, 24486, 21701, 8983, 17198, 21644, 24171, 5245, 2050, 16637, 3679, 21061, 4977, 4035, 14569, 25909, 18066, 8331, 22319, 13587, 16007, 8338, 3837, 3490, 6002, 1458, 3488, 11066, 9388, 16446, 1042, 1352, 1106, 4536, 10644, 19521, 4658, 21731, 19512, 2411, 9649, 10591, 2682, 7513, 14812, 10247, 24633, 15124, 9077, 3451, 6801, 1297, 1313, 1356, 15154, 11064, 27160, 25098, 25516, 27163, 24082, 25967, 25446, 4893, 18865, 13747, 10645, 7198, 18824, 19353, 17637, 6424, 13401, 13877, 17613, 6899, 19354, 9437, 9822, 5551, 7528, 5219, 19871, 3417, 20483, 14996, 13237, 23563, 2316, 13424, 5242, 10693, 14876, 23489, 12532, 17305, 25480, 16398, 9956, 19351, 7014, 27369, 19355, 27398, 6887, 7198, 17538, 1242, 24870, 15685, 24060, 20795, 11014, 2384, 21286, 949, 19406, 21289, 6369, 10963, 15391, 27410, 6360, 19405, 13822, 19407, 22882, 19249, 5338, 20245, 23993, 19250, 22376, 26729, 18119, 24738, 6234, 25796, 10127, 9541, 966, 11642, 3018, 10256, 11907, 21999, 1380, 1351, 8435, 6577, 15833, 5701, 10421, 974, 8252, 5996, 4236, 965, 15351, 10666, 24746, 9672, 26722, 27026, 25219, 8819, 13741, 10872, 10088, 8932, 24741, 27458, 26731, 19166, 25455, 3558, 3674, 9126, 27411, 19169, 11072, 27414, 19131, 2653, 17979, 9125, 4974, 27475, 27413, 19411, 21290, 3094, 20258, 27427, 19293, 17455, 24740, 5837, 24744, 6986, 2485, 20560, 27436, 3179, 2075, 3010, 8805, 3716, 3037, 18641, 21187, 24066, 24055, 24131, 21193, 11383, 2138, 27445, 6600, 3037, 27448, 15826, 4503, 9274, 9541, 9797, 2258, 22463, 3774, 12749, 22122, 19352, 17659, 27395, 6885, 13749, 27398, 22234, 23623, 1361, 4493, 25607, 27377, 5091, 23674, 27381, 21627, 6033, 1998, 27385, 3802, 4010, 25055, 12134, 4288, 10681, 27526, 6900, 27528, 7072, 27530, 6446, 27532, 27397, 6885, 27460, 25968, 9122, 10447, 21378, 25077, 1940, 10563, 4429, 19694, 3405, 4273, 24568, 9673, 20719, 24409, 974, 17300, 4324, 7229, 27382, 7625, 5073, 27124, 1036, 24337, 9162, 2830, 433, 5052, 22180, 12945, 7337, 1149, 1913, 10594, 11786, 25171, 27594, 19318, 8492, 920, 15186, 21498, 19526, 27070, 10425, 24470, 895, 8242, 3125, 27608, 19537, 4901, 5064, 15936, 27170, 27595, 1474, 4921, 25117, 14679, 2164, 10579, 23743, 6333, 10064, 9389, 16381, 25441, 22655, 27356, 26912, 22503, 25672, 8727, 9111, 16356, 24645, 9511, 16683, 12119, 8481, 2154, 5678, 25918, 7440, 25873, 2454, 3446, 22372, 4745, 16954, 20596, 5788, 1242, 15623, 13264, 6071, 5678, 15900, 1090, 26225, 27017, 11941, 26477, 2254, 27640, 1487, 27642, 4210, 5756, 27645, 15510, 8192, 27649, 7846, 25211, 19099, 27286, 3952, 16952, 27650, 25882, 3958, 5345, 27661, 6859, 27663, 21679, 27665, 959, 2353, 10367, 27669, 938, 2985, 27672, 20413, 13141, 25422, 6668, 27677, 13607, 27679, 3952, 27681, 3949, 27683, 6688, 27685, 17658, 25812, 27688, 6982, 27690, 1684, 27692, 5906, 6858, 3907, 25114, 8731, 1029, 3003, 27678, 2077, 8094, 24280, 2384, 18050, 27729, 4181, 27651, 14432, 27708, 2708, 25880, 9520, 27706, 3951, 5345, 6479, 8867, 27742, 17294, 27657, 7827, 16952, 27562, 27359, 5722, 2459, 585, 2224, 6139, 2051, 21417, 6143, 21996, 24788, 22665, 22693, 9132, 26441, 17283, 15275, 26298, 884, 6202, 26301, 841, 3715, 1732, 27067, 7253, 4170, 23710, 24035, 20763, 10428, 1949, 23818, 23480, 20771, 9664, 3411, 1267, 22756, 1009, 6626, 10881, 7904, 22473, 22696, 8535, 5350, 18572, 3281, 2079, 1225, 7236, 15481, 24630, 13456, 3783, 1479, 21130, 16489, 8244, 13104, 6997, 16931, 9005, 13632, 8691, 4428, 837, 3370, 837, 2154, 7006, 3089, 10330, 13483, 27721, 14969, 19808, 12541, 14790, 2895, 8361, 7742, 7248, 18647, 5843, 6734, 17437, 3804, 9006, 1616, 17073, 14597, 20887, 15169, 1805, 21340, 5781, 17233, 25539, 1947, 21163, 16550, 20741, 10064, 14205, 14267, 12171, 8326, 4778, 18732, 16481, 18647, 21950, 12881, 9386, 9054, 24318, 1947, 6006, 11063, 1766, 2695, 966, 6252, 13372, 7168, 7034, 2491, 14549, 14903, 14784, 1018, 8626, 11564, 4658, 3137, 18657, 1956, 2962, 8098, 17855, 27801, 6134, 25347, 11332, 8140, 19592, 12539, 2081, 9158, 20443, 14227, 22067, 1122, 1627, 23826, 14409, 4575, 3803, 16456, 2887, 6630, 24409, 11591, 10215, 9214, 11608, 15050, 15155, 917, 14499, 6482, 11171, 491, 4369, 15417, 14003, 1996, 9431, 21672, 8440, 3065, 15721, 9214, 2647, 9063, 26855, 5161, 26205, 25230, 1665, 6781, 6511, 3926, 1881, 27848, 17610, 8188, 25866, 1515, 12311, 9061, 17635, 3836, 1674, 1145, 17022, 9253, 15103, 22163, 19549, 25668, 21508, 19068, 23321, 25280, 8515, 3783, 16644, 2513, 6140, 27759, 6132, 27761, 22691, 27763, 22679, 17768, 19563, 13717, 26442, 18256, 17306, 17286, 3361, 27771, 466, 6919, 1234, 6134, 10999, 6929, 2977, 27778, 9836, 10255, 24875, 6480, 8224, 11143, 11143, 14362, 4283, 4049, 27790, 25812, 1603, 8536, 10107, 22681, 24709, 2308, 3905, 4037, 3127, 10892, 27800, 5907, 13276, 6058, 3380, 23859, 27891, 1357, 8871, 2085, 18703, 839, 14712, 14726, 7543, 25412, 18647, 3650, 9212, 13193, 10497, 27239, 21443, 7118, 9769, 2042, 19639, 28028, 25711, 2057, 12622, 7992, 18974, 5896, 6472, 6811, 5532, 2755, 7056, 14681, 1991, 8709, 27820, 13837, 23807, 11165, 11668, 13039, 4708, 24899, 8846, 1610, 1240, 15834, 4742, 23275, 28071, 11564, 1805, 20876, 14578, 27188, 23772, 3510, 23677, 3816, 7737, 2311, 5199, 7528, 13558, 7056, 28054, 28050, 3660, 300, 27751, 22339, 27753, 7242, 27971, 16732, 27758, 6913, 6925, 16281, 17277, 12954, 27764, 12701, 27766, 19656, 27984, 27769, 6054, 22465, 6143, 27773, 27992, 27776, 27995, 3159, 27779, 27998, 23038, 28000, 3818, 8993, 28003, 14970, 1144, 28006, 13800, 2261, 27792, 5308, 27794, 28109, 28014, 11661, 5273, 28018, 26462, 8341, 9557, 1049, 23780, 13132, 7992, 4285, 1728, 8252, 27119, 5831, 15122, 3441, 21293, 14663, 14127, 24496, 1894, 14830, 8143, 11520, 3001, 3453, 14822, 15795, 27519, 8017, 5486, 882, 28145, 6471, 10134, 4831, 15988, 6934, 8184, 16908, 10663, 28092, 4788, 28053, 2000, 16517, 1472, 4391, 11380, 8149, 15243, 12476, 27820, 10594, 4105, 7236, 3443, 3389, 11335, 4319, 15296, 2085, 19655, 28180, 2495, 4897, 9957, 2485, 8362, 9782, 2587, 1139, 28174, 28095, 26674, 1985, 27754, 423, 27756, 27972, 28101, 26309, 27976, 17257, 28106, 27979, 27765, 28012, 22617, 15549, 21224, 22648, 4563, 27988, 24247, 26302, 2042, 28118, 10277, 28120, 27997, 8099, 4229, 9997, 28125, 1553, 8993, 28004, 28129, 1458, 28007, 28133, 28010, 27981, 17262, 24792, 28138, 28017, 15381, 28019, 3336, 14616, 6839, 23858, 13128, 28147, 3673, 5457, 5296, 21997, 26793, 22041, 3509, 23134, 21454, 14120, 953, 5751, 8116, 2081, 8036, 1450, 17523, 27901, 13601, 7306, 11498, 2179, 9333, 28053, 10440, 1263, 22806, 12825, 8093, 27650, 25587, 1123, 1359, 2194, 12574, 9976, 9377, 4341, 1484, 5129, 13307, 14144, 1408, 1912, 27274, 5545, 5879, 28212, 26914, 2953, 28098, 28217, 28100, 2231, 28102, 24280, 16288, 8886, 19569, 22614, 27980, 27795, 28013, 28228, 22647, 8587, 4188, 28232, 28115, 12424, 28117, 8841, 3464, 15885, 24129, 27780, 27999, 28242, 27784, 28127, 9547, 28247, 27789, 28131, 27791, 22064, 6194, 28326, 28227, 18630, 28139, 28257, 28141, 20254, 12496, 9815, 15389, 3128, 18646, 4670, 12349, 12349, 9856, 9525, 19379, 10480, 19289, 6371, 19248, 21288, 2596, 11090, 22910, 11078, 11078, 19170, 28312, 27968, 12419, 9160, 26358, 25800, 5268, 15506, 1987, 25812, 8579, 27730, 25818, 10999, 28365, 28390, 28386, 5346, 9832, 28395, 13795, 28397, 3361, 5326, 3407, 2170, 28316, 26307, 27974, 28103, 28321, 24789, 15577, 28108, 28226, 22631, 28111, 22671, 22699, 28332, 11778, 28334, 27775, 28336, 27777, 28238, 885, 28122, 28241, 28129, 28343, 28245, 28128, 27788, 28292, 8821, 28349, 10799, 28351, 28136, 27797, 10779, 28391, 10963, 15505, 28140, 4493, 3079, 1640, 1423, 16734, 1685, 11397, 17606, 4341, 28300, 3916, 5025, 11025, 25149, 21623, 15088, 1262, 3455, 9550, 21667, 4324, 6643, 3526, 27224, 6384, 17268, 28403, 6474, 3361, 4426, 22390, 6342, 7866, 9436, 5907, 12271, 1516, 20384, 6727, 918, 5597, 9998, 21542, 10311, 1948, 4749, 1948, 4637, 10065, 21550, 16781, 897, 28381, 27636, 8572, 28315, 26306, 14104, 26308, 27760, 28104, 28322, 22613, 5323, 28225, 24708, 28353, 27768, 28418, 8551, 28420, 27990, 27774, 28235, 28424, 28119, 28339, 28428, 5007, 28430, 28002, 28432, 28345, 28434, 28249, 28350, 28135, 28415, 8541, 28015, 27798, 28446, 18921, 4787, 7218, 9319, 7212, 1748, 2247, 19094, 1779, 11607, 22356, 27107, 24260, 23928, 10516, 3709, 9131, 7556, 27490, 24052, 23996, 2161, 11394, 28553, 3728, 16764, 14668, 3294, 23188, 1478, 9452, 5724, 20813, 3444, 4390, 22520, 3498, 21039, 17448, 27236, 20771, 14013, 941, 25615, 3679, 3769, 21711, 12773, 10694, 26059, 3785, 8917, 1767, 8762, 7093, 8474, 320, 4382, 2751, 27213, 8337, 3453, 13950, 27584, 2536, 19228, 1297, 22841, 4686, 2224, 7657, 11360, 10149, 15351, 9383, 4699, 25142, 4699, 15991, 10838, 13856, 7565, 28610, 9568, 9675, 9168, 11436, 23548, 2720, 13479, 2720, 3319, 9292, 7647, 10605, 25372, 3314, 17193, 26118, 26671, 21612, 22963, 23795, 27969, 27755, 28503, 27973, 28319, 28221, 28105, 13712, 28224, 28414, 28512, 28416, 27132, 28112, 28517, 28234, 839, 28236, 28338, 28121, 28240, 28525, 27783, 28527, 25562, 28433, 12818, 28435, 10421, 28008, 27793, 8537, 28534, 28254, 28148, 28256, 19038, 28357, 15393, 6202, 22135, 12577, 6532, 19166, 19046, 3087, 22105, 7042, 19051, 18085, 19053, 19293, 19056, 8687, 5562, 14152, 6816, 26003, 28542, 1742, 28544, 4546, 22354, 28548, 7069, 28550, 4760, 8641, 5190, 20190, 25113, 4487, 4871, 14632, 21200, 14703, 3329, 21984, 26956, 25331, 26958, 24823, 27027, 13025, 28215, 28099, 28408, 28646, 28507, 28412, 15713, 3373, 28674, 27767, 28417, 28230, 27987, 17338, 28333, 27991, 28423, 4226, 28425, 28523, 28662, 27782, 28001, 28126, 28528, 27787, 28668, 28531, 28438, 28533, 28652, 28535, 28255, 24280, 28538, 6915, 7884, 6519, 3653, 27213, 2843, 1996, 21072, 3352, 4427, 14903, 2088, 3288, 19961, 3316, 9109, 9500, 28776, 11600, 13297, 8394, 17448, 1650, 23420, 14082, 5769, 10571, 2637, 10690, 11301, 23096, 10617, 23199, 11101, 954, 6837, 11507, 17799, 14884, 8731, 24661, 1484, 28792, 2286, 3798, 4050, 2005, 8622, 1644, 4458, 14670, 5833, 11667, 2584, 9089, 3522, 18647, 15620, 28817, 14543, 13161, 9089, 16545, 1676, 6225, 1244, 11348, 24557, 12746, 4019, 13085, 28448, 7576, 7556, 3414, 11664, 1191, 9045, 1387, 4456, 6002, 6032, 24136, 24608, 7235, 15152, 9560, 467, 4437, 2035, 26892, 28041, 24255, 3461, 1139, 14444, 22001, 15261, 3444, 19862, 28720, 23528, 24822, 25102, 26960, 13025, 6687, 24561, 20531, 6140, 1809, 16837, 894, 5211, 16843, 1664, 16841, 5628, 16849, 26837, 15794, 9018, 28873, 1016, 16842, 28884, 20972, 16837, 26837, 28889, 28888, 10339, 16608, 11547, 28893, 17032, 28872, 28888, 16846, 16608, 5628, 26477, 20096, 5682, 1930, 5242, 17208, 14884, 863, 1859, 8923, 5791, 5919, 13321, 9755, 5992, 2001, 10339, 2746, 2979, 1318, 16785, 10119, 4390, 28915, 2004, 2479, 28910, 3353, 11706, 28929, 16093, 28916, 9176, 4469, 7628, 977, 1809, 12576, 2057, 5388, 6755, 5396, 1804, 19636, 28920, 8104, 2554, 8872, 10405, 21355, 3709, 17431, 3728, 2562, 8872, 894, 3613, 11612, 12221, 28906, 27694, 6909, 6325, 10985, 18170, 1566, 18710, 22524, 10977, 28970, 10972, 22530, 10972, 18196, 18194, 17901, 18171, 10986, 6928, 3188, 973, 28915, 28957, 10088, 8436, 28906, 28905, 16077, 949, 3818, 28956, 28949, 8516, 21355, 5379, 11644, 4378, 5397, 28638, 25278, 23175, 28382, 1183, 10201, 22507, 1859, 10330, 9693, 28880, 28888, 28872, 17032, 28893, 28892, 16840, 9018, 28889, 28896, 1100, 29015, 1637, 13243, 6006, 26206, 858, 5835, 6343, 10262, 11259, 9876, 13715, 12589, 2164, 949, 5961, 6559, 21794, 1149, 3577, 26011, 24982, 20049, 11730, 22575, 8394, 22577, 19836, 19965, 19945, 4192, 20035, 20041, 13083, 3228, 3144, 11873, 22728, 22200, 12589, 27072, 7240, 14668, 1476, 28492, 2901, 29026, 2725, 11423, 1367, 15314, 29000, 22605, 29002, 28500, 13685, 15919, 4085, 24630, 14787, 5651, 10786, 18941, 11680, 4997, 10064, 11476, 3398, 5724, 28764, 9618, 15137, 916, 15620, 1387, 2035, 16095, 19633, 15480, 7207, 2834, 6703, 10482, 12881, 22196, 16152, 13038, 3174, 1134, 12254, 10166, 6646, 8867, 23842, 10307, 1515, 15289, 23110, 13048, 3417, 19696, 3806, 1308, 11012, 19704, 11284, 11350, 1909, 28945, 3665, 29072, 25670, 29074, 28641, 1004, 909, 26775, 1313, 1944, 29080, 6463, 18566, 25092, 1481, 8002, 925, 1736, 9669, 29090, 7233, 8425, 1640, 20573, 17576, 13128, 25120, 1688, 8245, 15460, 14594, 5992, 23699, 3228, 3367, 1930, 3693, 892, 6004, 11774, 1471, 22890, 3432, 29119, 20767, 11350, 28046, 5380, 19704, 20512, 2467, 4209, 17667, 9335, 18674, 6226, 3508, 4375, 20426, 1316, 13523, 4432, 5389, 876, 1805, 6755, 1605, 28999, 27964, 22922, 21509, 27967, 29075, 855, 9241, 16115, 4839, 26995, 8377, 10734, 8401, 25011, 27247, 8377, 4869, 8963, 12549, 8471, 4050, 17495, 16906, 14591, 1617, 5920, 14869, 21586, 8122, 16227, 8133, 9515, 3495, 15265, 7177, 11894, 24243, 6600, 1454, 1417, 1294, 3854, 12012, 10315, 25571, 19140, 3024, 3029, 19269, 3032, 19181, 25408, 2144, 9181, 19138, 19224, 19186, 29248, 13597, 11650, 8435, 14327, 11887, 5960, 17556, 7552, 1314, 1636, 1313, 13016, 3151, 6692, 12988, 5139, 12990, 18082, 21519, 12519, 23379, 12989, 8009, 1478, 24626, 2578, 1767, 20613, 3394, 20047, 18094, 25206, 6183, 1279, 17924, 4697, 2969, 7235, 8402, 13624, 8401, 8400, 8377, 10897, 2540, 2136, 12525, 27471, 3886, 20154, 24050, 25464, 22974, 24053, 3894, 3620, 12533, 23834, 3612, 23707, 24276, 29131, 29200, 23407, 29134, 1602, 6377, 23089, 10331, 24887, 19391, 6846, 29045, 19822, 6844, 22569, 20046, 24987, 29043, 24985, 19958, 29332, 19941, 29049, 19952, 22582, 29053, 19947, 29338, 22582, 10889, 20037, 29338, 1225, 11216, 24390, 3941, 22587, 25327, 22589, 19851, 8291, 23454, 22593, 20072, 23457, 8207, 23459, 7833, 28499, 29320, 12792, 12236, 10962, 10997, 10887, 13802, 26972, 12723, 26451, 19192, 19524, 27567, 25066, 22492, 22181, 12813, 26460, 25173, 15604, 23043, 13803, 21174, 5270, 8517, 29299, 15933, 20153, 7707, 13796, 1256, 23557, 17457, 2642, 7289, 9835, 5270, 22501, 8341, 16027, 6946, 22431, 25089, 25224, 9732, 21518, 27605, 7965, 15408, 25082, 4236, 15604, 11427, 15852, 25085, 7391, 18692, 29378, 29411, 27592, 4957, 29414, 21475, 5059, 15604, 6385, 28474, 8785, 17980, 17572, 22067, 15947, 5281, 9865, 5276, 29390, 29317, 27966, 29319, 23917, 1183, 7376, 18191, 6999, 1426, 1210, 27679, 1667, 25209, 1095, 27679, 22366, 25205, 25212, 29458, 1446, 21651, 4659, 16493, 14309, 9639, 1930, 2707, 1697, 1066, 19642, 976, 10272, 29449, 7636, 25208, 2739, 29463, 29459, 29475, 2648, 29455, 5077, 10025, 4024, 11308, 22319, 16027, 26457, 6481, 1082, 25203, 27706, 25207, 9880, 29482, 25213, 29459, 25204, 29457, 27685, 29500, 29494, 25204, 3342, 4381, 947, 14055, 29467, 24924, 14897, 6494, 1105, 14705, 9639, 22006, 29510, 19028, 14021, 4786, 21865, 25515, 27632, 26911, 26672, 27635, 29366, 18731, 3354, 11420, 2081, 2466, 19518, 6559, 16176, 933, 10405, 21675, 1294, 2551, 14394, 7240, 6582, 14616, 1266, 4102, 1256, 10690, 18856, 13241, 4114, 29539, 11778, 2084, 15838, 2584, 29533, 1855, 9187, 29559, 13328, 8910, 21971, 1669, 1472, 13611, 14875, 28198, 29547, 11722, 24320, 27101, 900, 16963, 20479, 10069, 2649, 22185, 9227, 13474, 1282, 3020, 16176, 17554, 1061, 26832, 9534, 2831, 3838, 5209, 8653, 17149, 3183, 28115, 1734, 1287, 5837, 29563, 29579, 29561, 4344, 19518, 20142, 7303, 1875, 22800, 23643, 23303, 23580, 25500, 25264, 25503, 23309, 23585, 23397, 25269, 23588, 12166, 22818, 23317, 25677, 23525, 29365, 29445, 12792, 2755, 24193, 8117, 11574, 1785, 26989, 18161, 27015, 28880, 27718, 5756, 28873, 5078, 9252, 6875, 13311, 9425, 11438, 7263, 19315, 4206, 4185, 7066, 1186, 7083, 15359, 4785, 24316, 13371, 14453, 5838, 16163, 5533, 5398, 5009, 4075, 1963, 27995, 3000, 1695, 2504, 23149, 4151, 1994, 24524, 8651, 5651, 25568, 9698, 8327, 1310, 3193, 3688, 2787, 26920, 2921, 9392, 17828, 2780, 1623, 2768, 2760, 1431, 9535, 22044, 1945, 29685, 2771, 29692, 2910, 2905, 2912, 2785, 2900, 16432, 17602, 1311, 1083, 6907, 2671, 10806, 21536, 21794, 7120, 1151, 19427, 15708, 20882, 14756, 17459, 14594, 21949, 6466, 11285, 6646, 7710, 3207, 29228, 26410, 17872, 7562, 17799, 21204, 10022, 1920, 9147, 23789, 17176, 4011, 9731, 22088, 7545, 12882, 3443, 29720, 14832, 9873, 24926, 25256, 20902, 24473, 6464, 7643, 3337, 26352, 26476, 6816, 13246, 12332, 27407, 23629, 26645, 3889, 10100, 3165, 20801, 24015, 27510, 2258, 11613, 10440, 20199, 29755, 12522, 3563, 20191, 23969, 3238, 10933, 5406, 20542, 7642, 11285, 8150, 29714, 10034, 24893, 1242, 20763, 12001, 9873, 7578, 12882, 21199, 29724, 21202, 29749, 3579, 22454, 27354, 29523, 25216, 28639, 25671, 29527, 1261, 8223, 7246, 28613, 11378, 10109, 25114, 9533, 10686, 25461, 7666, 9383, 2067, 15998, 28869, 16842, 2483, 2190, 28874, 16847, 29008, 21631, 28879, 16846, 29011, 16844, 16833, 28894, 29016, 28898, 20845, 10269, 29020, 29827, 29021, 28883, 28897, 10272, 5539, 16840, 5388, 7059, 6833, 22437, 11405, 2167, 5298, 16517, 8361, 10258, 2773, 1996, 6003, 19546, 24210, 1287, 1926, 11851, 5218, 26156, 15586, 23856, 7106, 23856, 28574, 11914, 27111, 5137, 1665, 9403, 1152, 11418, 14348, 1864, 18612, 15009, 1426, 2016, 1099, 1068, 4644, 20979, 11629, 27050, 1849, 11775, 1090, 24476, 14380, 17471, 6808, 9365, 4427, 6540, 20352, 1067, 7235, 21118, 11283, 10057, 11641, 29213, 16974, 5357, 29442, 21094, 29444, 24506, 484, 15274, 6817, 24071, 20449, 17780, 28557, 24065, 29309, 24271, 29315, 20804, 19027, 9934, 8518, 23962, 24047, 21169, 29757, 10141, 23954, 29917, 24130, 23940, 29920, 6051, 5343, 24059, 29925, 29914, 29306, 3203, 28558, 24037, 23943, 24042, 10091, 5220, 29935, 29924, 25451, 3225, 21170, 3699, 3563, 29941, 24078, 24275, 29920, 2831, 8384, 8653, 11550, 22312, 5193, 26413, 23744, 862, 2187, 7958, 22312, 8709, 11562, 2239, 5294, 6076, 11913, 15885, 24046, 29949, 29926, 20451, 29953, 29916, 28559, 29931, 23944, 29945, 17164, 29947, 23976, 20656, 10480, 25463, 29940, 29982, 29942, 24272, 24276, 1224, 11264, 3218, 29977, 29913, 7890, 29915, 24077, 10017, 29984, 29944, 23973, 5212, 29988, 12627, 29978, 29938, 24075, 24064, 30005, 10145, 29956, 12650, 3065, 22063, 1184, 19049, 7707, 8755, 6193, 15966, 17393, 15966, 21645, 25872, 1376, 4944, 30024, 2413, 11174, 14690, 939, 16613, 4605, 11135, 16877, 4606, 8804, 4413, 1406, 25574, 6008, 23812, 1635, 8464, 15351, 22365, 8282, 21606, 12124, 4344, 8452, 1745, 12394, 13320, 6715, 18614, 14690, 27693, 2169, 1474, 24280, 29936, 30013, 30003, 29939, 23980, 25469, 30006, 30019, 26488, 12258, 29967, 15978, 7560, 29971, 28286, 20581, 20924, 5133, 7527, 2137, 29965, 25667, 28861, 25790, 28863, 25519, 28724, 2627, 20578, 10890, 22010, 24391, 3576, 25107, 4308, 22179, 29380, 8046, 2248, 3838, 4801, 1959, 11796, 16951, 1634, 12979, 27905, 4112, 12725, 10901, 4038, 10903, 4526, 4545, 2322, 19999, 21470, 16861, 29412, 21113, 21116, 30128, 22048, 18716, 10019, 3182, 23605, 5285, 5891, 3372, 13769, 25461, 20351, 18018, 24066, 9877, 24068, 24043, 6922, 2395, 21173, 25467, 27507, 29930, 30145, 24080, 29198, 23662, 22707, 24754, 24651, 4734, 1369, 1654, 5831, 22875, 2933, 18226, 11861, 1756, 13603, 1149, 29554, 17828, 6386, 19033, 1348, 10398, 1244, 13077, 21656, 14762, 26797, 22850, 22549, 1453, 6216, 3287, 16689, 2477, 1616, 19634, 1036, 13258, 13065, 17670, 30178, 4503, 16027, 10447, 2920, 1474, 1754, 30164, 23101, 18089, 9551, 15291, 30166, 4633, 20956, 1766, 8526, 4870, 13641, 11265, 16226, 30171, 1313, 30204, 15294, 1371, 15291, 29623, 29908, 29321, 18614, 5432, 3218, 7352, 5290, 9525, 12349, 15384, 7289, 15384, 5276, 6075, 3081, 2232, 21994, 30235, 5363, 5357, 21245, 12014, 28392, 19049, 6024, 17986, 15164, 26651, 10888, 28385, 17955, 12825, 26329, 15504, 26399, 15553, 30250, 30256, 5281, 30253, 6390, 5907, 12600, 10298, 18952, 16215, 15523, 18756, 4400, 22348, 6087, 13778, 17608, 7992, 4274, 10964, 19044, 14204, 17376, 5651, 1421, 8260, 24539, 4167, 21361, 12208, 16343, 27484, 27421, 20371, 11070, 10484, 19290, 27415, 15771, 25816, 5283, 2954, 30223, 24755, 17347, 13350, 1516, 7737, 6067, 15969, 1293, 11700, 22361, 13046, 29874, 1290, 1683, 6175, 13243, 25209, 29584, 13377, 18113, 1800, 29452, 22376, 1293, 3790, 3708, 2089, 23730, 19658, 4979, 17546, 13242, 9471, 22416, 15369, 12173, 1015, 15832, 21439, 1792, 27706, 6214, 19521, 15481, 17459, 8119, 20513, 5746, 16036, 2002, 3147, 24089, 16982, 13468, 16028, 1639, 29727, 21965, 9495, 3290, 5114, 1235, 1089, 14061, 3573, 3917, 6850, 4833, 4457, 11344, 2993, 6734, 21089, 2470, 7793, 10405, 15220, 12968, 12308, 11431, 4430, 10492, 10118, 9722, 9669, 19490, 5747, 22008, 2007, 29461, 3046, 20756, 13925, 25702, 4014, 16484, 971, 3081, 3943, 19381, 4014, 841, 1947, 20785, 1426, 30361, 5732, 17454, 1958, 7666, 11701, 3341, 17068, 1091, 1250, 10256, 1793, 2031, 13038, 1555, 12776, 7424, 1362, 25746, 3948, 15695, 4790, 25663, 10099, 2991, 3664, 18224, 6563, 16259, 25208, 9138, 30348, 13932, 4468, 1487, 25355, 4328, 3394, 23183, 15572, 9511, 26081, 14372, 30360, 27960, 30043, 5023, 22414, 3293, 30302, 30160, 11817, 26459, 20133, 5599, 20135, 16729, 20126, 22718, 16809, 22720, 16715, 9902, 11971, 19799, 22878, 16805, 10542, 22717, 5607, 19803, 14074, 19344, 16798, 15386, 28693, 11017, 16775, 19338, 22716, 19923, 30466, 20139, 20129, 16715, 15501, 4913, 30461, 30473, 16777, 20013, 30488, 30477, 22719, 5523, 22721, 2306, 10380, 30495, 22715, 20136, 30499, 16781, 30501, 16728, 20141, 26770, 9896, 30494, 30484, 20369, 30463, 16811, 30465, 30500, 30467, 30502, 30492, 14161, 30516, 30472, 30507, 30464, 30476, 30510, 30523, 30512, 20025, 30514, 10905, 30471, 22714, 30486, 30508, 30477, 20138, 16710, 30524, 16784, 1074, 3082, 28693, 11219, 8630, 8688, 12570, 17336, 10372, 9947, 3087, 16082, 8688, 3089, 28921, 2306, 27006, 30506, 30540, 30530, 30509, 19801, 30490, 30468, 16784, 9856, 9898, 29427, 22930, 7461, 21102, 22933, 2382, 29377, 24536, 2278, 15489, 30286, 2391, 10097, 11029, 30517, 20123, 30512, 20011, 30534, 30511, 30478, 11246, 19340, 20673, 2568, 5316, 18992, 22103, 19047, 8632, 22106, 28690, 9942, 8638, 30279, 11218, 30560, 17312, 9950, 9642, 28682, 9978, 6532, 30457, 21220, 11259, 1655, 27552, 3323, 1867, 4341, 5328, 30601, 28687, 18259, 13008, 16263, 16137, 6559, 16139, 12013, 8804, 3455, 21403, 26087, 23288, 1052, 21371, 8919, 18926, 6820, 22193, 3445, 7792, 18024, 1375, 14188, 18927, 30643, 4413, 14193, 3402, 19383, 1652, 19385, 5526, 12266, 6443, 2040, 15112, 10325, 8152, 2692, 3316, 12932, 1613, 1616, 3855, 12773, 11644, 10975, 7217, 3162, 1763, 8782, 4707, 5247, 9188, 3369, 14302, 2535, 7305, 7798, 11176, 30339, 14223, 18090, 9254, 26108, 14228, 26730, 1015, 25971, 12455, 5190, 18100, 9394, 18121, 14238, 24807, 28820, 14242, 5137, 22698, 26705, 16645, 25744, 22382, 14250, 13135, 27878, 1107, 12001, 9527, 16472, 6508, 11658, 4921, 14249, 10343, 11924, 2100, 30617, 23260, 842, 9253, 18018, 19031, 24605, 30646, 14185, 30422, 30649, 18026, 18927, 18029, 30654, 19398, 19390, 5649, 19396, 15345, 20308, 20239, 1070, 26033, 16878, 10592, 18920, 3054, 4837, 11775, 10009, 1195, 24830, 1274, 14240, 27455, 21273, 12100, 11847, 14111, 12318, 18062, 28572, 1118, 16555, 2460, 1478, 7473, 6149, 9500, 4033, 28686, 30551, 19048, 30629, 26288, 30631, 16131, 24879, 30635, 8804, 30637, 4503, 3374, 2495, 23771, 3381, 4863, 28613, 1640, 892, 29123, 23880, 4486, 30622, 2960, 2781, 6815, 29473, 25596, 21599, 28779, 10169, 13958, 30665, 6992, 30667, 7668, 30670, 6879, 1659, 25407, 2097, 30675, 20216, 30678, 13956, 14837, 2055, 7552, 11764, 23137, 11845, 1948, 1551, 14222, 18089, 15796, 30691, 27904, 24810, 1816, 29857, 30697, 1731, 30699, 16489, 30701, 18104, 30703, 14241, 5763, 11101, 27769, 21253, 8856, 18113, 16246, 30713, 7033, 30715, 3630, 5879, 27450, 20565, 21039, 8133, 3530, 8804, 27149, 29130, 30156, 21554, 30158, 24650, 21220, 12420, 14155, 6314, 7887, 26643, 26527, 26601, 3586, 11095, 26503, 26659, 22098, 23640, 19165, 30874, 22071, 26610, 26665, 26540, 7874, 30880, 26552, 30882, 26436, 19937, 19557, 17513, 30887, 26622, 26655, 26405, 30892, 26649, 30894, 26356, 23212, 12517, 23983, 14326, 16763, 10481, 11335, 3799, 1520, 29638, 6826, 6572, 3667, 1349, 25450, 30002, 6812, 4446, 3678, 8244, 21671, 1413, 1109, 25741, 18868, 14255, 6433, 4978, 14156, 7937, 27426, 30073, 20395, 29308, 29983, 3706, 27019, 3709, 14917, 3712, 2005, 1543, 13266, 10753, 6131, 3721, 11091, 29852, 27019, 28996, 885, 7983, 30146, 8947, 29522, 27162, 29524, 29798, 29133, 29624, 4894, 18097, 299, 1010, 7993, 1015, 19967, 1019, 11642, 26248, 13200, 25381, 5554, 26195, 16484, 12072, 9550, 2214, 16806, 28277, 6309, 13824, 4110, 6829, 11157, 20527, 13098, 12096, 4774, 6869, 26827, 4420, 8867, 19003, 11308, 5404, 30971, 20200, 18570, 5930, 20347, 17628, 27581, 12371, 22761, 4707, 21589, 8538, 20496, 2639, 12314, 8464, 2885, 11999, 3322, 26954, 3059, 14102, 3045, 11116, 11572, 7224, 9033, 10178, 27646, 27108, 25976, 30823, 5874, 6324, 13631, 1572, 17125, 15005, 9841, 1099, 26009, 10265, 3364, 22577, 29327, 19968, 29043, 20045, 29047, 19957, 22573, 29044, 24986, 22570, 29048, 19827, 19966, 19840, 29052, 20060, 22557, 16179, 19943, 29346, 22562, 19817, 29350, 3095, 19456, 25316, 22588, 19850, 20068, 29357, 25322, 29359, 23456, 25325, 29362, 25327, 20077, 28860, 30961, 22603, 27965, 29906, 23664, 30966, 10562, 6532, 8061, 8001, 22202, 25710, 11905, 11327, 5431, 8989, 16458, 14130, 23012, 7689, 1404, 12112, 12013, 18769, 13329, 4335, 7015, 29583, 9431, 10535, 22324, 1562, 8669, 4329, 7013, 22033, 9605, 1131, 9110, 9440, 2030, 11286, 6886, 8399, 21672, 2870, 30693, 13115, 10116, 6430, 1445, 14657, 5158, 2498, 3144, 3806, 13330, 24771, 27321, 11503, 2474, 2108, 8763, 2771, 12701, 11780, 2977, 12293, 7421, 7954, 889, 1512, 14605, 1478, 1851, 9072, 9557, 1745, 1256, 26014, 29585, 13104, 20511, 26796, 2630, 20428, 4166, 10004, 5762, 1479, 10232, 13507, 12200, 965, 12857, 13621, 5110, 1029, 5379, 4388, 8389, 1933, 7743, 17081, 10148, 6342, 23345, 10429, 21620, 23223, 13241, 15190, 13101, 3444, 10592, 11913, 10257, 8394, 8141, 23038, 17203, 6008, 10644, 20824, 973, 2654, 6067, 22570, 31047, 19815, 31049, 20054, 19835, 31052, 22568, 29335, 20052, 20046, 1678, 11500, 20560, 23275, 23880, 3494, 17989, 5209, 6508, 6875, 28779, 14774, 7241, 6091, 11538, 3307, 27833, 5213, 1671, 4293, 8911, 7772, 25007, 23038, 2972, 24966, 25013, 31249, 20416, 8379, 3927, 31252, 4378, 25014, 29210, 27891, 17471, 9431, 10397, 8454, 14021, 17028, 13327, 29521, 27161, 31086, 29199, 29443, 31089, 30224, 13685, 10207, 3310, 24416, 21863, 29494, 3339, 1801, 28790, 2648, 8762, 27501, 20906, 14831, 21966, 29568, 14563, 20814, 30439, 8112, 1026, 16517, 1036, 24577, 3682, 16449, 15290, 3488, 1381, 1027, 29082, 30598, 10128, 2489, 10078, 6189, 15622, 22876, 4777, 6334, 1023, 5783, 31295, 21952, 20896, 12673, 25343, 1915, 20777, 21959, 20902, 8762, 8252, 27501, 24845, 9392, 27465, 21847, 1625, 1995, 2986, 11717, 19652, 11660, 21014, 3780, 1928, 12677, 29765, 5093, 1479, 28170, 17722, 4542, 29905, 23915, 24001, 30303, 29203, 15163, 2138, 3502, 1767, 5741, 11502, 10989, 16156, 10073, 2183, 28809, 877, 1613, 1805, 8924, 20358, 9490, 18089, 1632, 1655, 10690, 29506, 29455, 2649, 16968, 5841, 3046, 6937, 15787, 9560, 24548, 11911, 21669, 12833, 26982, 8341, 2017, 1088, 5656, 5198, 3459, 2716, 9072, 29583, 882, 2508, 5705, 11517, 7741, 11952, 5873, 20592, 24460, 11695, 2655, 947, 9649, 8439, 16671, 9198, 16631, 11484, 27322, 15127, 5996, 4434, 29556, 17679, 15492, 27237, 4469, 3463, 2058, 25700, 15253, 3686, 16472, 28966, 8446, 1660, 14338, 14509, 3414, 5092, 1036, 26909, 25099, 30963, 29001, 29201, 29527, 25856, 17023, 27405, 7004, 15542, 4958, 905, 16922, 1450, 11596, 16939, 9670, 2885, 11382, 21906, 8740, 27127, 5880, 1291, 11367, 7778, 4458, 12819, 3785, 22136, 18680, 29191, 14706, 31449, 24103, 26206, 25538, 13833, 5509, 9546, 2152, 30978, 24249, 25032, 16751, 3294, 14624, 21340, 2100, 3723, 19894, 11114, 1148, 2797, 3405, 8981, 4292, 15664, 9254, 3783, 21414, 5847, 31476, 31456, 30655, 6652, 31459, 15139, 10719, 31461, 1809, 19398, 31464, 24557, 6892, 11025, 10253, 9158, 2074, 2353, 928, 10480, 6537, 13048, 14641, 13250, 28826, 28241, 13595, 18262, 31474, 12065, 20698, 3071, 27228, 1750, 1622, 9097, 25751, 2181, 11064, 19374, 23475, 11583, 13547, 1396, 31520, 18996, 10164, 1366, 8740, 14108, 11919, 31527, 9761, 1042, 31530, 9298, 14267, 4376, 31468, 15648, 2885, 3798, 1135, 2106, 24240, 14471, 30365, 1352, 16824, 5636, 1622, 2710, 14318, 7232, 1556, 28459, 10059, 17422, 31496, 17629, 24300, 5673, 31558, 31536, 14351, 16959, 19894, 19130, 2100, 16182, 21304, 24795, 19254, 18661, 4249, 4237, 31594, 25695, 839, 25816, 31596, 23263, 31598, 31595, 31598, 18147, 19299, 4197, 24800, 3281, 26292, 11936, 5840, 24386, 10641, 4978, 20372, 5626, 20374, 19799, 13861, 25551, 28871, 22372, 2332, 16835, 16951, 1204, 10343, 28622, 13507, 1126, 11440, 6770, 21422, 2150, 423, 20019, 31611, 2543, 31613, 23624, 14564, 16523, 11967, 20375, 11973, 31620, 12327, 31622, 1102, 30113, 16955, 2103, 5152, 26022, 1669, 31631, 10148, 1369, 31634, 9227, 31637, 1727, 31612, 4648, 31641, 12156, 11966, 31618, 11031, 31647, 10250, 3147, 31650, 9039, 31652, 13976, 31629, 31656, 30218, 24247, 6630, 1642, 31635, 27353, 18792, 31268, 30157, 23530, 31349, 30160, 1170, 11012, 10888, 992, 26296, 28678, 24280, 5384, 25856, 16086, 2259, 10857, 20360, 6523, 2202, 3553, 25235, 6051, 31709, 882, 30726, 16340, 21577, 8792, 1240, 1479, 9661, 17842, 8001, 16965, 3027, 4293, 8399, 29032, 14423, 8742, 1027, 19097, 8200, 29358, 19104, 29360, 7685, 1410, 12825, 13932, 878, 6322, 1959, 2084, 14042, 2960, 11256, 24557, 26878, 4029, 29352, 5281, 30548, 2254, 14423, 22597, 3208, 31082, 23460, 31347, 30869, 24955, 16340, 31692, 13771, 13798, 1332, 31696, 10893, 2285, 3210, 9825, 4168, 17511, 25724, 6993, 8974, 13636, 22415, 8804, 11258, 1744, 5922, 6999, 876, 20771, 8110, 20816, 21948, 5863, 19431, 25636, 6510, 5220, 27889, 2708, 1654, 30405, 31322, 25360, 31324, 10208, 30355, 19401, 1940, 11785, 10690, 7556, 18027, 10542, 4500, 19271, 1380, 14143, 29919, 29794, 31686, 21507, 31269, 31088, 23916, 31272, 3992, 6945, 24827, 27439, 19135, 19227, 8152, 29252, 29246, 3038, 29255, 19264, 19136, 21328, 3392, 19270, 1375, 19223, 29249, 3921, 29247, 19265, 29245, 2966, 5773, 31835, 31841, 31833, 31839, 29256, 19268, 31829, 11857, 31828, 24576, 31832, 11216, 30026, 11766, 29255, 31826, 31828, 19184, 31851, 31832, 19264, 3761, 4098, 902, 11267, 17928, 7224, 21604, 4787, 31872, 14371, 1415, 961, 954, 20784, 29240, 19188, 11343, 29254, 31852, 31834, 31840, 31855, 22537, 2634, 14307, 19941, 11057, 20044, 20042, 1387, 22577, 28016, 5930, 29324, 20038, 1366, 29327, 20037, 29345, 22564, 22564, 29341, 22580, 22576, 10250, 21601, 2697, 991, 20046, 6142, 29328, 31055, 19842, 22578, 27631, 30962, 29797, 31440, 29907, 31350, 10823, 17911, 29342, 6119, 19943, 20056, 31221, 19817, 31911, 16895, 24880, 29326, 31894, 31917, 22583, 31057, 31919, 19952, 9078, 31894, 20040, 1225, 31897, 2833, 31211, 22563, 5552, 31059, 20043, 19812, 31063, 4639, 4895, 19024, 16897, 31848, 19264, 5919, 31883, 3072, 31853, 31824, 29241, 13176, 29251, 31861, 29243, 19226, 31968, 29255, 31854, 4864, 31965, 31851, 31850, 20955, 19227, 24576, 31848, 31978, 31850, 31986, 29244, 31846, 24576, 31712, 16858, 1370, 1430, 3407, 24701, 44, 9411, 293, 457, 893, 72, 1474, 1377, 1134, 19619, 32, 113, 32, 4817, 12468, 1654, 44, 316, 3066, 46, 5855, 2171, 44, 19899, 1748, 10109, 6694, 1757, 889, 32019, 1192, 32021, 31174, 1261, 857, 57, 32019, 8608, 4807, 1314, 490, 6477, 46, 6929, 5411, 44, 4807, 957, 11805, 1155, 32008, 26751, 15966, 910, 32019, 5818, 1261, 1118, 870, 4693, 46, 1995, 1131, 50, 32051, 957, 32053, 5541, 1557, 978, 4793, 52, 32013, 32009, 8356, 951, 2535, 32060, 3058, 964, 2057, 1007, 5224, 32057, 19619, 56, 44, 32075, 1021, 1413, 32079, 15762, 32012, 30969, 46, 2962, 5565, 31997, 9503, 26233, 11417, 32080, 892, 32082, 32090, 32092, 20426, 32098, 32012, 32084, 4414, 8408, 32073, 32083, 1388, 32076, 21877, 951, 1759, 32032, 4232, 1430, 5241, 1122, 32019, 5570, 19673, 20424, 46, 883, 882, 32032, 2653, 46, 19673, 5577, 957, 12517, 869, 32019, 9518, 4496, 898, 122, 32, 538, 1526, 32005, 2000, 32094, 9337, 300, 870, 582, 9518, 6189, 5541, 32047, 1526, 909, 5527, 32019, 5737, 1027, 2744, 31116, 5241, 49, 32136, 12155, 1122, 1129, 32140, 109, 2034, 293, 1728, 1063, 32069, 7200, 46, 7515, 2057, 32026, 10694, 300, 3292, 32002, 32127, 32016, 15479, 859, 108, 32009, 19680, 27906, 1357, 32094, 3022, 26233, 5137, 32008, 16417, 1407, 28290, 32042, 1377, 2473, 15919, 2060, 1634, 433, 53, 44, 1273, 32039, 2644, 1007, 32150, 5105, 5380, 969, 32169, 3450, 3022, 20358, 1806, 44, 13285, 7515, 1129, 32008, 48, 32136, 32095, 872, 1017, 32087, 19619, 32051, 17419, 32092, 32055, 5179, 15762, 54, 32019, 32106, 1226, 1873, 32072, 1613, 32243, 32111, 32085, 32078, 4334, 910, 1536, 32069, 25585, 857, 1118, 32210, 1214, 16453, 2752, 32189, 22442, 9991, 55, 32210, 25381, 872, 1551, 32008, 8475, 10219, 32060, 10712, 20507, 13353, 857, 857, 44, 5742, 2733, 1129, 14517, 1806, 32223, 3824, 17050, 898, 8757, 23714, 44, 1136, 872, 32086, 32273, 1863, 32042, 32130, 1254, 32009, 1192, 32295, 32068, 1430, 1139, 2755, 5809, 909, 1725, 32256, 1528, 872, 5243, 32051, 1264, 1995, 3509, 543, 30442, 32091, 1376, 32242, 1877, 1388, 3756, 1017, 32047, 5179, 5551, 32082, 3058, 2971, 8918, 32079, 32331, 32210, 9553, 7575, 32194, 46, 32096, 32103, 32241, 32338, 32203, 1931, 5207, 32098, 32242, 32244, 894, 1460, 2535, 32110, 32342, 32085, 20477, 951, 1209, 32069, 32071, 1225, 32248, 6184, 32112, 32344, 32235, 32366, 32358, 32240, 32369, 32101, 32348, 32, 32219, 9183, 457, 51, 32069, 32228, 31997, 8909, 839, 1737, 32065, 32342, 1233, 32164, 5246, 32091, 897, 859, 32387, 1078, 1475, 32094, 957, 876, 32245, 6673, 1806, 1078, 32398, 32125, 12468, 32070, 3028, 886, 32267, 32014, 32402, 1535, 32230, 32399, 32407, 32395, 32389, 32415, 32406, 11367, 32418, 32397, 2454, 293, 6324, 4695, 32243, 950, 32127, 1685, 32130, 2107, 32164, 25013, 32091, 433, 1048, 1388, 4417, 1012, 32158, 957, 14165, 2017, 1031, 1357, 1139, 32165, 32172, 9277, 840, 32189, 32048, 32449, 9162, 5380, 914, 1128, 1214, 31782, 32242, 9541, 32360, 1023, 32328, 32070, 1264, 32156, 32193, 32288, 2846, 32290, 5105, 1376, 1890, 32268, 32177, 32473, 620, 32070, 1289, 5243, 905, 32047, 10691, 1748, 7062, 31997, 32313, 32160, 32070, 1198, 20766, 32032, 8393, 1385, 32284, 15635, 32207, 1516, 32042, 3022, 27906, 32394, 6965, 951, 1422, 1009, 32503, 46, 32505, 32408, 293, 32410, 32164, 32412, 3946, 32403, 32311, 30979, 32400, 1007, 81, 9629, 1877, 2000, 3407, 32032, 2473, 1214, 26846, 32526, 1628, 1422, 32404, 6324, 1264, 24133, 32467, 32229, 6529, 32039, 1536, 1576, 950, 32396, 4390, 32435, 32391, 32427, 4655, 32388, 1475, 32068, 32522, 26161, 2035, 32519, 1535, 32209, 32557, 16872, 14093, 3080, 32255, 9253, 32306, 1435, 32463, 1430, 8356, 6999, 490, 19541, 32177, 5535, 32380, 883, 1024, 9335, 1306, 32002, 1225, 1264, 32144, 32467, 2650, 1656, 10085, 32256, 7077, 1423, 1357, 32267, 13857, 1877, 2057, 32055, 1200, 1875, 16608, 32136, 950, 32598, 32296, 32430, 1261, 839, 32019, 3629, 21943, 32542, 32472, 32270, 9627, 32602, 32610, 3645, 22277, 2896, 32608, 32603, 32597, 910, 14819, 31994, 4871, 32596, 1200, 32606, 870, 32002, 1725, 32326, 1877, 4194, 86, 1156, 32581, 32134, 32, 32002, 4658, 3451, 1306, 543, 3026, 839, 1422, 32224, 8909, 1877, 16512, 32643, 18923, 957, 9335, 1737, 32486, 1377, 32590, 856, 32592, 32628, 1357, 32242, 32625, 32599, 32408, 32016, 32609, 32082, 32669, 32607, 32672, 32624, 32612, 4705, 32051, 293, 17050, 11660, 32623, 32619, 32679, 32301, 32601, 32673, 32604, 32057, 32626, 20839, 32016, 4871, 32668, 32631, 32693, 32481, 25207, 32000, 32467, 9093, 1399, 32116, 8709, 32016, 29136, 32210, 1264, 842, 1407, 870, 32189, 12806, 32434, 32209, 9010, 2067, 1846, 32007, 13871, 10686, 32060, 4649, 866, 1995, 8017, 1460, 300, 32556, 7077, 32727, 27307, 32515, 25114, 32175, 32560, 32537, 8807, 32400, 11410, 1200, 32548, 32405, 32400, 31388, 32744, 32419, 32551, 32393, 32139, 3862, 92, 110, 25330, 28862, 25518, 27165, 26260, 18015, 21101, 2414, 16788, 20380, 30529, 30520, 30531, 30568, 30544, 30534, 22721, 10370, 30587, 30528, 30565, 32768, 30567, 20026, 32771, 16783, 30481, 1940, 2754, 7528, 17541, 20581, 6468, 5228, 28459, 31824, 23241, 31043, 6016, 19220, 21089, 13613, 27450, 16768, 10458, 14681, 26096, 19547, 23061, 11895, 1850, 4810, 466, 10463, 9322, 24728, 7636, 8369, 2310, 9292, 9312, 9295, 4083, 11970, 10483, 16539, 1544, 9422, 9419, 26282, 24199, 20005, 19636, 9321, 16606, 6928, 320, 15861, 2823, 27602, 28442, 2217, 20368, 30589, 30535, 30590, 12182, 5338, 5273, 21886, 11017, 20010, 20022, 19787, 11969, 10833, 25529, 9389, 20533, 4645, 3791, 28150, 27040, 14632, 12802, 6590, 9551, 14004, 17369, 12079, 20541, 13613, 5182, 8327, 8678, 3377, 24353, 27050, 27875, 5650, 29760, 30960, 31267, 31815, 31688, 24753, 30870, 22059, 872, 3994, 15381, 8095, 7859, 19592, 8399, 31891, 9299, 5607, 8468, 17704, 8054, 32065, 18210, 2715, 7790, 1186, 23480, 13349, 17376, 2742, 25296, 3902, 8361, 30221, 7257, 24553, 19739, 20971, 5097, 1877, 1020, 2710, 22905, 5747, 7970, 1109, 11865, 3501, 21680, 1383, 6327, 5861, 6241, 5727, 7097, 2157, 27454, 20420, 11157, 8364, 2107, 3343, 1496, 25907, 9013, 10050, 4805, 19810, 9413, 5604, 32895, 21435, 5550, 14806, 26853, 1209, 32901, 24732, 26161, 31023, 9561, 32906, 7761, 22725, 8490, 12854, 3000, 32912, 3373, 10046, 6469, 32916, 2025, 1775, 2743, 32920, 8378, 12077, 16876, 32925, 4341, 3006, 32928, 3965, 3005, 19398, 11151, 5806, 9103, 21630, 6829, 30649, 9819, 17806, 6026, 8095, 16651, 8683, 2469, 1087, 31098, 10215, 1635, 20495, 15840, 17059, 9382, 1053, 3792, 1852, 29192, 13840, 2107, 1538, 7116, 14611, 21648, 3798, 9061, 14637, 937, 4344, 16030, 27867, 13552, 4434, 25040, 27723, 14668, 17652, 27565, 3408, 14822, 21640, 6861, 4977, 27389, 14559, 23075, 4689, 22023, 1575, 3036, 8927, 1150, 33006, 25126, 1604, 13100, 12776, 9013, 19224, 5205, 16037, 25032, 8079, 12062, 8364, 17164, 5855, 2154, 10892, 10889, 6071, 10892, 992, 4512, 806, 34, 84, 101, 120, 349, 69, 100, 105, 116, 295, 822, 824, 276, 264, 266, 31438, 31922, 29073, 31441, 30966, 20552, 10887, 30555, 9934, 30627, 30779, 12566, 18218, 19052, 30607, 30505, 17311, 9949, 30249, 11610, 19060, 17335, 30616, 2373, 3082, 33087, 14206, 22105, 33091, 18261, 28691, 33094, 30494, 33096, 19058, 2234, 30614, 22137, 22151, 9160, 33104, 9326, 30777, 14081, 9937, 19529, 30605, 22109, 27428, 28694, 30611, 33098, 1960, 33100, 22136, 9979, 5295, 7141, 33121, 33088, 30778, 30603, 33108, 18084, 30606, 10344, 30549, 30610, 33097, 30254, 33132, 14148, 33134, 30616, 31757, 31689, 30159, 21220, 32763, 31344, 22677, 17278, 22679, 17280, 28734, 22683, 22619, 28515, 4188, 3160, 22636, 2514, 25734, 23988, 33160, 28223, 22614, 33163, 28756, 26442, 22684, 33167, 4563, 33169, 22688, 33171, 29418, 24058, 27977, 22678, 33176, 21297, 33164, 22697, 27985, 22672, 33183, 22701, 22652, 29391, 15391, 33174, 28649, 33190, 4552, 33192, 16182, 28112, 33196, 8591, 17340, 9832, 33186, 22626, 27978, 33203, 28252, 22645, 33206, 33181, 17323, 3719, 33197, 12983, 33212, 22611, 33214, 5281, 33177, 17302, 28327, 8585, 33219, 4295, 17324, 33184, 24106, 15393, 33200, 33188, 33161, 33215, 28352, 22631, 33180, 28737, 33233, 33221, 33209, 22467, 19427, 33224, 33201, 28323, 33227, 33191, 33178, 27767, 33244, 28330, 33182, 33234, 33222, 22689, 17290, 33239, 33175, 33254, 33204, 33256, 33165, 28329, 10938, 33260, 33247, 21253, 33198, 33154, 32882, 31759, 16858, 33158, 11014, 33252, 28509, 9807, 33255, 33229, 28513, 33258, 33272, 33220, 13706, 8554, 33171, 22690, 28222, 33202, 33267, 33216, 27796, 33231, 33245, 30950, 33235, 28399, 7846, 23975, 28648, 33253, 3622, 6102, 28440, 33301, 33259, 17308, 7849, 33170, 24106, 31609, 33238, 33296, 33309, 27579, 33312, 22670, 33302, 33208, 33275, 12983, 6554, 33307, 28508, 22471, 33311, 33205, 33313, 33290, 884, 3220, 33317, 9832, 33295, 33308, 33284, 13660, 33324, 33289, 17307, 33338, 33316, 33304, 31991, 18137, 28502, 6947, 28645, 28220, 28730, 33226, 28413, 28733, 33269, 6071, 28736, 33314, 27770, 28739, 28421, 28741, 28520, 28743, 28522, 28661, 29628, 28747, 28243, 27785, 28246, 28530, 28348, 28671, 28134, 28673, 33362, 27797, 28355, 31697, 31685, 19446, 31687, 30868, 33155, 32883, 17510, 9241, 6378, 4446, 27567, 4220, 13001, 12122, 13035, 6342, 26978, 28840, 29265, 4851, 8124, 1016, 11157, 4077, 15617, 11192, 13166, 19225, 6659, 31837, 31849, 31982, 19220, 31128, 19267, 31977, 33423, 33422, 19272, 19726, 15905, 11622, 4327, 4860, 1454, 6502, 8160, 14476, 3212, 2639, 8138, 29265, 14783, 13580, 3858, 17788, 9533, 21846, 11784, 1171, 1747, 3632, 12888, 1269, 22208, 31247, 25011, 31249, 8376, 2978, 2970, 2969, 17576, 33456, 7743, 8383, 2960, 9318, 1468, 7093, 14197, 4500, 28622, 4839, 4503, 11498, 11786, 20992, 14367, 20935, 29028, 12326, 33352, 25521, 11410, 12468, 18554, 18411, 18889, 18443, 18474, 18295, 18491, 18576, 2640, 18465, 18536, 9147, 26329, 18512, 18325, 9914, 18557, 18267, 18517, 18560, 18519, 33492, 18521, 18336, 18355, 33496, 18485, 18527, 18542, 18515, 14664, 18431, 18518, 18492, 18520, 18535, 33507, 18902, 12038, 18484, 18470, 33511, 33486, 25247, 18414, 18530, 24611, 33490, 18888, 8759, 25255, 18387, 18436, 8340, 33509, 33524, 18500, 18412, 33527, 18459, 18516, 18559, 18575, 33532, 2640, 33534, 18451, 33508, 18339, 33510, 33540, 33526, 18775, 18429, 33544, 18398, 18532, 33547, 13672, 23316, 23078, 18509, 18902, 1155, 13687, 25507, 23561, 21120, 23563, 11818, 18900, 33544, 19019, 23000, 23501, 9599, 18889, 11818, 19025, 9928, 11927, 16114, 18821, 26267, 18880, 13751, 33573, 26271, 18848, 25135, 26274, 22231, 12912, 6442, 16500, 22121, 15562, 18859, 33277, 25792, 27166, 18203, 27570, 4417, 10591, 2350, 887, 29449, 31055, 5919, 9228, 7654, 1898, 5755, 28613, 14336, 21738, 25603, 15861, 4606, 3482, 19366, 27437, 1939, 3528, 20679, 11731, 28276, 1486, 4714, 11432, 16176, 4320, 3808, 15349, 6818, 7291, 2138, 17022, 15045, 1954, 27520, 17375, 12559, 26288, 11643, 3825, 14787, 1751, 21571, 27343, 25160, 30668, 13239, 4691, 1480, 21754, 3852, 3634, 993, 4042, 11730, 2056, 12217, 21754, 11441, 14557, 14848, 7773, 8484, 2081, 2245, 4025, 3655, 29506, 5019, 10227, 11308, 7112, 15236, 872, 2578, 16835, 1894, 1767, 1276, 5837, 13551, 14930, 14994, 14950, 17480, 3312, 23045, 4329, 7024, 19893, 21338, 2007, 22726, 4326, 20404, 1756, 1272, 7463, 11982, 1212, 2992, 1622, 3036, 14258, 15257, 17536, 24444, 20876, 25833, 16551, 4432, 12101, 3613, 16331, 24633, 23692, 32559, 17451, 25781, 1375, 10227, 5550, 1697, 1792, 3074, 33000, 1486, 10405, 12627, 12345, 862, 33480, 18687, 4539, 1931, 1079, 5857, 12054, 29121, 1315, 2280, 16450, 1402, 15220, 3432, 13246, 7526, 1610, 22188, 21422, 13045, 25162, 18053, 2993, 6176, 8477, 13646, 1249, 20411, 5551, 16590, 2879, 1282, 1084, 18128, 3677, 17134, 5739, 9167, 15062, 22171, 10650, 9637, 5736, 8116, 12073, 15665, 4432, 10656, 938, 18853, 1609, 28163, 17656, 6672, 3953, 20713, 30328, 14608, 2649, 3716, 1859, 9014, 1635, 9006, 31186, 10213, 26096, 2698, 3519, 16446, 1133, 16886, 15978, 4292, 12739, 5019, 6966, 7565, 9365, 27801, 8259, 7216, 24934, 26091, 9254, 14047, 17524, 4410, 14476, 15694, 15368, 4846, 11748, 1040, 12741, 1509, 1102, 2839, 12049, 2971, 5811, 8238, 13039, 25950, 26206, 21673, 3387, 19886, 5199, 7079, 5785, 3779, 14537, 23905, 17243, 1049, 6858, 11039, 2647, 27875, 8591, 23884, 11504, 1061, 31354, 24986, 14139, 13157, 21755, 1535, 16848, 5857, 3018, 10271, 8108, 12850, 9766, 2651, 7421, 29868, 9164, 24552, 12058, 2164, 4567, 21127, 12851, 13879, 2716, 30316, 2088, 14209, 26049, 6577, 29477, 1201, 9076, 11852, 31966, 8451, 14883, 3349, 11071, 1230, 7732, 1230, 16256, 1770, 21430, 3133, 5209, 33742, 27028, 19491, 16516, 4472, 9631, 26040, 16911, 12561, 22786, 31476, 17449, 5996, 30338, 27911, 2024, 6025, 20720, 5145, 1278, 1768, 1035, 7383, 7231, 26165, 24520, 10111, 10410, 10050, 4776, 3427, 9389, 24630, 11722, 11755, 17008, 12474, 10616, 1378, 16640, 10148, 12329, 24624, 6489, 10315, 16657, 23296, 5998, 6759, 17577, 19327, 22425, 15663, 6766, 19749, 9703, 11250, 2739, 4172, 21550, 17075, 6488, 5021, 4666, 19680, 27452, 8648, 11872, 5158, 30432, 11438, 4293, 7546, 6582, 26181, 31343, 4503, 1699, 4213, 11779, 4745, 19484, 11318, 6753, 11297, 25381, 16592, 7076, 5025, 6718, 11101, 9464, 22034, 11344, 2833, 2505, 29857, 3417, 25139, 969, 2214, 4990, 23911, 31085, 32880, 33391, 33278, 25793, 17767, 4417, 6602, 2463, 33611, 17667, 4987, 1367, 5652, 3388, 5379, 4954, 7280, 10430, 6362, 26101, 16678, 29116, 9473, 2356, 21619, 26885, 15085, 3636, 9944, 28009, 13647, 19374, 11082, 15085, 1566, 33847, 8922, 11653, 1497, 4240, 26101, 23061, 23180, 2346, 2478, 24278, 13307, 26828, 23269, 13211, 3684, 4897, 2662, 28447, 5907, 1357, 13264, 1605, 6499, 1292, 10082, 4685, 23555, 12220, 4568, 11608, 33445, 14922, 4694, 23884, 3380, 23732, 25630, 1312, 4497, 1129, 6319, 26111, 22839, 27389, 3495, 11698, 1137, 16488, 11616, 4093, 3630, 11752, 14897, 16872, 1121, 2461, 13815, 11857, 9531, 24314, 13171, 12268, 7236, 13794, 13277, 14670, 29009, 14913, 2759, 31807, 13056, 10215, 24587, 8439, 16150, 11584, 15088, 27920, 978, 21048, 4179, 1095, 3858, 3365, 27189, 1799, 4856, 16096, 25991, 4196, 3446, 14653, 954, 17989, 903, 16871, 1358, 21573, 1265, 3446, 19395, 4876, 1079, 8586, 12408, 2034, 8669, 3488, 9080, 25726, 3324, 12627, 5090, 2748, 14812, 26749, 23801, 908, 6846, 3394, 11762, 10642, 5242, 31409, 1232, 10230, 28809, 8685, 3231, 9668, 3632, 22188, 2985, 12329, 5198, 9761, 12270, 31538, 23667, 19513, 15036, 31728, 34193, 5457, 3654, 2264, 24204, 5892, 17631, 20964, 1057, 7233, 20698, 4003, 9547, 6606, 1230, 7179, 8094, 1020, 2189, 7284, 2891, 3619, 1747, 2108, 6006, 23345, 5188, 22228, 11058, 4226, 4912, 27963, 30092, 25443, 29525, 28640, 30966, 1364, 15253, 14747, 14787, 34077, 3510, 34079, 24162, 1768, 4198, 1768, 13379, 3477, 1114, 9552, 34136, 7743, 4214, 5782, 946, 6364, 11394, 34100, 12012, 1017, 34103, 15245, 11538, 5982, 9753, 3096, 3072, 34111, 24140, 25158, 6699, 6506, 4168, 1500, 34118, 8610, 3294, 14454, 1930, 8126, 3936, 2236, 9734, 9210, 4477, 27657, 901, 8152, 9745, 2587, 20561, 1396, 1107, 11447, 2473, 31397, 2287, 8685, 1080, 975, 8072, 15087, 3298, 5784, 9566, 10570, 9225, 1651, 34152, 1671, 34154, 8559, 5085, 33969, 30743, 34160, 14933, 34162, 14059, 34164, 24947, 9308, 33677, 26019, 29507, 34171, 13301, 26094, 26755, 7715, 3880, 13588, 9066, 3688, 2262, 4506, 8037, 25655, 8331, 1667, 16741, 30349, 3415, 15160, 14781, 21422, 8115, 3950, 8910, 867, 8910, 1039, 12885, 17540, 20861, 12561, 34351, 24179, 24288, 6699, 15130, 20411, 9342, 9047, 11504, 14503, 12610, 10690, 29116, 14649, 4657, 29595, 21671, 5245, 21589, 1255, 1082, 24349, 9502, 10412, 5116, 14157, 34222, 13821, 15885, 1244, 12808, 23743, 5266, 1424, 14450, 11064, 3405, 21456, 8619, 19766, 27285, 7230, 10207, 21529, 29640, 2148, 7174, 5939, 27925, 16496, 21069, 1517, 3829, 34390, 18023, 30697, 6110, 1087, 13166, 2540, 33689, 33833, 975, 11170, 16592, 11342, 27481, 1303, 16592, 30697, 34298, 13949, 9499, 12454, 13157, 28836, 24580, 9456, 16488, 12886, 15733, 26253, 16742, 27236, 1405, 8849, 25154, 1361, 4698, 34440, 15133, 25592, 1405, 11596, 7796, 5506, 6031, 4338, 11342, 18403, 3020, 6750, 7093, 33951, 1029, 1635, 9499, 14977, 30697, 16185, 2139, 14977, 11342, 1544, 34416, 15175, 2077, 13324, 33046, 10533, 33602, 26959, 26738, 18799, 10201, 21467, 15948, 10438, 7961, 15404, 25093, 21827, 19234, 20383, 20006, 28367, 25799, 30103, 10778, 18589, 22406, 21474, 21828, 18594, 8708, 21132, 25086, 22941, 10998, 34490, 2292, 25092, 34493, 17499, 21483, 11002, 2463, 34487, 30515, 34489, 22489, 7350, 15835, 34505, 15441, 22408, 22051, 21523, 34473, 28723, 27461, 4363, 34477, 1423, 22432, 34480, 10778, 34482, 34516, 22050, 15444, 29420, 10505, 30482, 34501, 34513, 16319, 9729, 34531, 29383, 2145, 22938, 34534, 10351, 21843, 34512, 30125, 15950, 4310, 34541, 29415, 1421, 15957, 21523, 34536, 30000, 7397, 29409, 23539, 34483, 22407, 34507, 20005, 34520, 30867, 23914, 31758, 34020, 18604, 34525, 13475, 34502, 30293, 34552, 29428, 7946, 34533, 34498, 5067, 9290, 34527, 10777, 26428, 18042, 29425, 10832, 34494, 34485, 30583, 34556, 34582, 34479, 34584, 11021, 12242, 30131, 34484, 34518, 25096, 34592, 24045, 34559, 22433, 25587, 12662, 34576, 34495, 16273, 8995, 34545, 16382, 34016, 22921, 32881, 33603, 32761, 34476, 3314, 34478, 34604, 34528, 15403, 22491, 15406, 21473, 34506, 10382, 34486, 34602, 34537, 34549, 34529, 34625, 15848, 34588, 34628, 15410, 34630, 34612, 15932, 34632, 27567, 20383, 34562, 34589, 34518, 34579, 21486, 34535, 34593, 34622, 34595, 31705, 25079, 29381, 34563, 34629, 34649, 10619, 12685, 34614, 21867, 34616, 34474, 30096, 9794, 8821, 29911, 17699, 18540, 6416, 18412, 29991, 33557, 33514, 18347, 17744, 18547, 25253, 10488, 17888, 18353, 18580, 33537, 24045, 24006, 34672, 18308, 13776, 9591, 33528, 33558, 6113, 34679, 18366, 17747, 3150, 33564, 18564, 2875, 34593, 34688, 18555, 18377, 34675, 34693, 34677, 6411, 24012, 34680, 33579, 8759, 34683, 33535, 33565, 18406, 23261, 5273, 34704, 33485, 18326, 28325, 18396, 34694, 34678, 34711, 34697, 17779, 27980, 18563, 18467, 18569, 16261, 33187, 33539, 19014, 34723, 34692, 33543, 34709, 17738, 3424, 34712, 18315, 34682, 34699, 18301, 34685, 4639, 12600, 34720, 3129, 34689, 18427, 9457, 33500, 18445, 34710, 34744, 34729, 18316, 34731, 34700, 18422, 34703, 34754, 34705, 34674, 9132, 34725, 34742, 17749, 34745, 18367, 17887, 9143, 34765, 18303, 34767, 34737, 33498, 17697, 31149, 34676, 18346, 34760, 33516, 33491, 8800, 34778, 34749, 33536, 31437, 27355, 31439, 33082, 31924, 30458, 26077, 34526, 4827, 34755, 18360, 29927, 6578, 13131, 19699, 3202, 3590, 3207, 1813, 17061, 5044, 17716, 10934, 34732, 18303, 2285, 6555, 20109, 34804, 34706, 2135, 33513, 34787, 34743, 34789, 33561, 19639, 34825, 34818, 33551, 30011, 18455, 33554, 34723, 17812, 34786, 18545, 34696, 18561, 34714, 4945, 34833, 33495, 34687, 34768, 34722, 2652, 18899, 34772, 34827, 34774, 34762, 34682, 34845, 34779, 34834, 30000, 34721, 18486, 33486, 1986, 31898, 34708, 34854, 10079, 34775, 17747, 34832, 34859, 4441, 34521, 28864, 34475, 12930, 18865, 23634, 3556, 20482, 2465, 1238, 17733, 24259, 34840, 18268, 4763, 18477, 34830, 29315, 34813, 34883, 10188, 17794, 12808, 13393, 4943, 34671, 34769, 34864, 34825, 18529, 34726, 34788, 33503, 33517, 17887, 34872, 34793, 34717, 34686, 34835, 18499, 34738, 34851, 34839, 34867, 34841, 34728, 34843, 17887, 34858, 34911, 34701, 34642, 34861, 34849, 34863, 34838, 17905, 34887, 17743, 34921, 33504, 10717, 18891, 34873, 18406, 34781, 18526, 34837, 34851, 34903, 34853, 34920, 34761, 34922, 8800, 34910, 34684, 34794, 31920, 33390, 34568, 33392, 33279, 24825, 9527, 32764, 21248, 4045, 4027, 31572, 24790, 11848, 7046, 27391, 28039, 16331, 17044, 2103, 5870, 16331, 11740, 14870, 7423, 21689, 33359, 20498, 24489, 13251, 6712, 14541, 3427, 1676, 12404, 27210, 920, 24597, 31626, 19083, 8526, 8856, 17221, 14750, 2502, 8070, 21241, 12988, 8560, 1731, 8243, 1450, 2511, 23224, 6505, 3407, 3916, 30769, 1903, 23226, 34009, 32888, 24791, 19421, 30706, 8578, 8096, 28583, 12242, 7806, 2490, 7657, 14252, 2569, 11378, 15957, 34999, 2467, 14166, 10169, 4569, 15036, 7306, 13902, 3368, 8910, 28284, 17205, 2047, 28466, 27769, 24328, 1288, 34977, 5799, 16546, 33661, 15644, 15646, 17003, 29138, 9669, 6597, 8188, 909, 27150, 16871, 22382, 15889, 3378, 8244, 30677, 12472, 4847, 35066, 9283, 6975, 1103, 25977, 15147, 1396, 1394, 35075, 35067, 11463, 12472, 4027, 6578, 28540, 1238, 1737, 17061, 26127, 5833, 31211, 6193, 26243, 9470, 9470, 29537, 33765, 3188, 842, 18091, 6189, 35004, 8132, 35076, 6170, 25616, 15616, 3540, 7762, 34996, 841, 1126, 1369, 35110, 9273, 5646, 3170, 27990, 1308, 4802, 5044, 1100, 27990, 7094, 33946, 35105, 26243, 27723, 25114, 5832, 1736, 35128, 1171, 33913, 28866, 4802, 10202, 15931, 21812, 22345, 12486, 10599, 2178, 21524, 1538, 3997, 423, 20941, 11114, 13220, 11060, 11262, 21908, 9706, 29672, 2682, 25395, 13864, 9474, 1612, 8688, 3658, 6422, 20959, 11785, 5110, 3151, 16931, 3446, 8471, 31663, 6374, 10733, 29886, 27333, 14981, 8361, 14650, 21415, 6363, 2773, 1799, 5560, 33765, 9557, 8918, 8471, 22883, 29236, 11130, 1252, 2697, 1099, 14787, 4786, 1736, 8932, 1476, 9442, 17137, 14313, 10562, 10043, 1854, 1959, 3815, 27782, 1854, 14161, 25032, 35195, 35005, 2758, 35192, 21950, 11914, 11537, 25615, 5891, 11461, 12292, 16565, 1565, 8385, 15481, 2708, 3721, 35201, 24626, 5017, 6997, 4567, 30162, 30395, 8456, 19258, 3676, 19778, 23821, 4214, 13210, 3810, 6801, 6422, 9365, 2170, 22436, 18114, 34290, 4497, 5198, 28043, 2633, 26096, 3906, 11541, 34444, 5018, 20239, 15305, 30840, 33049, 16237, 4661, 8152, 3389, 34288, 29122, 23960, 17592, 12460, 1354, 11460, 11790, 4273, 5701, 13307, 3492, 16239, 1120, 15729, 5857, 25492, 1930, 5936, 5019, 5194, 4535, 6244, 13294, 16767, 1744, 4310, 11995, 3389, 11171, 20404, 15617, 21735, 12338, 11377, 35274, 28830, 15297, 5537, 13307, 25915, 705, 23974, 33054, 1872, 32599, 9748, 12390, 24198, 5195, 6583, 22912, 24150, 15358, 17626, 2018, 14702, 27140, 31546, 11410, 4954, 1925, 2332, 1747, 10568, 7666, 7221, 9172, 9160, 11263, 4199, 12677, 31304, 1074, 22331, 21996, 10464, 6386, 9728, 23815, 20741, 7749, 1148, 15346, 33430, 31230, 11850, 15683, 6510, 18703, 2967, 1009, 1754, 8470, 3326, 2181, 15002, 10338, 35131, 13740, 20226, 33292, 12921, 3127, 19998, 28731, 22472, 33312, 9905, 18845, 33312, 19608, 6125, 29531, 11841, 2240, 6333, 15581, 27756, 21527, 27536, 3529, 4027, 8558, 33340, 9817, 965, 30376, 1767, 15581, 5644, 33821, 13625, 10464, 8363, 2497, 4236, 1877, 1437, 1877, 29391, 2331, 8231, 8343, 25630, 28296, 35403, 16716, 1022, 1422, 22833, 1196, 27797, 6378, 6090, 35369, 6515, 5314, 4529, 15408, 8586, 35377, 13273, 6815, 1656, 21449, 7707, 10907, 2374, 24758, 33359, 28010, 5360, 26446, 34875, 30095, 34523, 15455, 21772, 25562, 4706, 19372, 16028, 2245, 1664, 4480, 31544, 25881, 322, 1073, 30751, 27998, 27556, 12821, 2091, 10642, 1847, 5011, 25360, 6692, 25347, 25558, 8179, 3315, 1023, 33018, 20784, 20832, 26247, 16169, 31408, 1940, 26086, 5128, 4833, 21949, 1023, 16032, 17428, 11287, 16140, 3394, 24347, 5198, 2007, 9500, 31124, 9274, 17354, 1812, 1875, 20424, 4486, 1695, 11405, 9644, 10332, 30630, 16221, 19322, 4559, 1859, 9438, 10826, 30163, 1673, 7737, 24323, 4850, 7241, 30848, 8273, 2319, 2217, 26464, 8705, 6508, 25426, 20831, 9626, 22390, 22839, 1367, 10929, 1205, 3812, 2773, 31293, 1949, 7736, 2407, 3792, 3403, 11317, 34003, 22837, 9340, 4198, 34405, 5832, 10491, 11097, 20898, 12338, 7572, 320, 8175, 28595, 24503, 35438, 32760, 28865, 2627, 21101, 5380, 21601, 26689, 5350, 28697, 19260, 18641, 6218, 23199, 11169, 6970, 16952, 20482, 22304, 31316, 17015, 7076, 6646, 27089, 33321, 33344, 3564, 33242, 28757, 10639, 29432, 14006, 10798, 24793, 28655, 1228, 35388, 3905, 16086, 22967, 17284, 35203, 13989, 17779, 7890, 25248, 33575, 2838, 13995, 25252, 33579, 13791, 34748, 25256, 23574, 18406, 10871, 1349, 2631, 35577, 22628, 28511, 33287, 22631, 34961, 33232, 6811, 2138, 27772, 28422, 25617, 7846, 30583, 27757, 28318, 26309, 35362, 6282, 11817, 16074, 25612, 19124, 27421, 27478, 35635, 28375, 22907, 19170, 13827, 19302, 33172, 19403, 27419, 21287, 27477, 27486, 19409, 11059, 21306, 35640, 19414, 34820, 6515, 34900, 34850, 4006, 8580, 34946, 18268, 34842, 34936, 19639, 13999, 34939, 18565, 2285, 3435, 2217, 30291, 28374, 13820, 35649, 6363, 35651, 13826, 35653, 7634, 30289, 34862, 33525, 34723, 35659, 34933, 17891, 35662, 34908, 24628, 4276, 34846, 34940, 33264, 34782, 21120, 35683, 5630, 35660, 34934, 34948, 35663, 23763, 17724, 34952, 34912, 34795, 29796, 25277, 34798, 31271, 31350, 423, 9086, 30924, 4072, 1671, 27476, 12096, 8099, 24347, 21021, 3780, 4837, 3485, 7293, 6211, 13115, 5890, 1087, 27726, 30647, 12251, 10166, 6371, 8641, 6371, 5832, 7001, 30978, 28587, 25405, 12851, 9269, 6411, 20232, 20048, 1555, 8023, 2247, 5292, 5908, 10891, 9858, 1364, 6889, 932, 4298, 14938, 10711, 15659, 1134, 11509, 9802, 10158, 24194, 28200, 6742, 15149, 1354, 1928, 17646, 30213, 25208, 31504, 29710, 6423, 19444, 8331, 31677, 5084, 14865, 11834, 13850, 14663, 31579, 35547, 7217, 12292, 7261, 16958, 28965, 3957, 5701, 2767, 13239, 13152, 8456, 27283, 7794, 16502, 12850, 19682, 31021, 30391, 5651, 30786, 14230, 12250, 29238, 24628, 8753, 23798, 1118, 8258, 2076, 897, 34822, 34901, 35696, 3697, 35685, 18398, 29954, 30076, 35665, 34925, 34733, 3850, 1047, 22800, 28286, 866, 3231, 13513, 8684, 1900, 9184, 5804, 9283, 2137, 24340, 2134, 26094, 1240, 5544, 26749, 2486, 1684, 6036, 3190, 27042, 18890, 35814, 21268, 24194, 35681, 34943, 35658, 35697, 35821, 34695, 29994, 29955, 35825, 35704, 34926, 5334, 33173, 34929, 35682, 34851, 35684, 34919, 35661, 34935, 35688, 35664, 35690, 35666, 35706, 31921, 35708, 29132, 33083, 31819, 7974, 2040, 13193, 23972, 22968, 29937, 24351, 26429, 30015, 29307, 30075, 30018, 2135, 14003, 10592, 15422, 13261, 1644, 24659, 1627, 33850, 29259, 18163, 15814, 1405, 7115, 34073, 20838, 29636, 24102, 3728, 7750, 8710, 4469, 15642, 3328, 5245, 15154, 33642, 7177, 1701, 5646, 17236, 15980, 14609, 9930, 4230, 1249, 1270, 3374, 7594, 20560, 9159, 3826, 1242, 7058, 4854, 2982, 10059, 5614, 6921, 27892, 30402, 8642, 1149, 14426, 3498, 2423, 29128, 25195, 6891, 18680, 12391, 11626, 4037, 5906, 35144, 4060, 5563, 5856, 14250, 26809, 5858, 29024, 6733, 3196, 11292, 13293, 12798, 20648, 2017, 25991, 6285, 10964, 10122, 13607, 25154, 7497, 35941, 15617, 6468, 27227, 1766, 32971, 22446, 21363, 1618, 4786, 1458, 30036, 1434, 34008, 29206, 8349, 11123, 1813, 1793, 4238, 26141, 11516, 33653, 10331, 17616, 2849, 21616, 1492, 14624, 5407, 27705, 1148, 35304, 9274, 5407, 10253, 35231, 3627, 17608, 29901, 16207, 4914, 27014, 15545, 27023, 11952, 13484, 1103, 25032, 12159, 16826, 7060, 34015, 32879, 34615, 34018, 34617, 35555, 9794, 26992, 24253, 5684, 1144, 21702, 13528, 3431, 5766, 4172, 24974, 5858, 27856, 4573, 8017, 1664, 1052, 8919, 1533, 20583, 6877, 10739, 30625, 19642, 2472, 25761, 20467, 9992, 23112, 22733, 4812, 21668, 13296, 17136, 5983, 10656, 870, 17673, 11671, 13879, 33989, 34384, 13351, 27552, 1682, 19956, 1817, 19637, 10032, 2630, 8361, 7095, 35919, 13401, 31960, 29019, 11080, 1655, 3829, 16817, 3449, 4487, 18676, 22907, 11914, 13351, 3803, 22000, 1689, 9712, 1135, 1631, 17070, 5740, 16665, 33020, 9173, 27234, 7183, 15178, 4787, 4811, 6469, 10592, 29466, 492, 11576, 14984, 1042, 3636, 7246, 25994, 9779, 14784, 6916, 12667, 7168, 13631, 1231, 21045, 488, 5199, 16951, 2150, 35190, 6091, 1992, 3803, 9086, 24874, 6910, 10436, 7167, 1492, 34423, 24309, 8273, 3505, 22729, 16550, 19911, 24647, 32488, 24647, 5072, 23325, 3086, 25941, 13830, 3303, 20679, 2982, 16762, 2076, 31434, 34457, 28952, 2540, 31206, 6981, 6433, 3716, 35199, 2979, 1665, 16818, 23698, 21761, 13906, 8753, 4966, 2707, 9764, 31400, 11574, 8115, 4233, 18069, 4114, 3308, 26598, 30876, 12956, 29757, 26559, 26551, 26583, 33581, 26574, 34226, 34663, 23661, 36039, 34666, 35440, 22608, 11801, 7706, 23954, 26568, 29305, 30878, 21162, 26572, 1013, 26482, 26545, 7353, 24065, 36221, 7547, 26499, 5386, 24059, 36225, 23971, 26606, 8188, 5593, 36229, 7855, 26599, 26569, 36223, 26571, 26583, 26573, 36238, 27801, 3442, 30548, 26567, 36243, 36222, 26634, 20104, 36235, 36247, 36226, 36210, 5320, 36241, 26496, 30888, 36244, 36256, 36234, 23962, 36236, 26435, 26356, 36240, 10996, 36230, 36254, 36232, 26570, 36258, 20107, 36248, 26617, 12530, 19528, 36252, 36275, 36203, 17260, 22090, 26405, 36246, 36280, 36260, 36249, 16253, 36263, 30875, 26664, 36266, 26666, 36257, 36269, 36259, 36237, 36282, 26575, 36296, 30899, 7889, 36299, 30890, 36301, 26668, 1495, 36281, 26639, 12530, 34269, 31518, 33586, 16397, 13750, 18825, 28325, 33591, 26295, 18850, 9953, 27364, 14140, 27980, 26264, 36211, 36037, 34664, 36214, 34522, 27563, 3991, 17791, 11012, 3593, 964, 24198, 24763, 30599, 10616, 19021, 23570, 1419, 23557, 29869, 5392, 10616, 5361, 27976, 36342, 36049, 23573, 17895, 34718, 30288, 27409, 6090, 36321, 18824, 14031, 36324, 10927, 18869, 18849, 27362, 33595, 36330, 2397, 36332, 35629, 14068, 15919, 22507, 2958, 17571, 29209, 20416, 8375, 17495, 31253, 11128, 8964, 28449, 29218, 19944, 4651, 3394, 14503, 4612, 16654, 33472, 3439, 14372, 3222, 15006, 15347, 3183, 14757, 4775, 27446, 29236, 1300, 29239, 491, 31974, 31882, 31836, 31842, 31862, 31976, 36412, 31864, 31988, 31862, 36421, 36420, 19227, 19264, 13260, 6212, 23147, 11256, 29262, 33438, 4458, 10704, 26491, 29269, 4172, 5905, 5352, 12489, 34598, 29275, 27628, 29271, 29278, 12223, 27034, 16895, 4390, 1117, 29284, 3000, 29286, 3059, 29288, 16432, 30625, 29213, 7770, 36385, 8403, 21774, 29297, 2971, 36377, 4893, 20086, 9796, 6063, 21994, 28755, 35615, 35581, 5300, 7936, 16113, 29911, 18546, 23494, 13990, 4067, 33574, 10103, 19019, 18323, 35602, 34746, 10403, 23077, 36359, 18817, 25258, 9170, 21926, 2792, 1511, 1758, 35401, 8363, 5320, 5324, 35375, 33332, 17259, 33334, 33384, 2394, 18844, 28651, 36471, 26442, 35617, 33302, 19640, 33304, 35389, 12966, 14819, 9688, 35380, 30068, 28644, 28219, 6143, 36464, 28097, 27970, 28407, 28504, 28409, 28320, 27762, 33189, 28510, 36508, 19564, 28653, 28229, 33365, 28113, 13706, 28518, 28335, 33371, 28237, 28745, 33374, 28124, 28431, 28666, 28529, 28752, 33380, 28250, 28439, 33335, 28536, 33386, 2223, 31769, 10353, 20231, 24124, 5854, 12623, 35889, 30921, 21168, 19562, 29980, 22973, 9887, 9005, 30882, 23708, 36566, 21164, 23036, 29992, 3254, 25465, 29930, 4038, 26477, 7325, 36565, 26502, 35891, 36480, 36578, 30939, 35896, 3209, 36582, 35553, 25445, 28096, 23177, 14092, 1254, 10786, 10828, 33726, 20706, 23927, 17709, 21199, 3146, 34812, 18390, 29723, 3584, 3213, 21203, 29750, 24069, 8867, 1806, 17276, 21167, 8882, 29769, 4835, 17305, 24270, 29773, 23959, 22315, 25109, 29755, 27579, 36589, 10935, 7899, 12778, 25476, 22743, 3017, 35061, 6170, 35063, 8098, 10405, 35068, 6189, 6756, 35104, 29346, 21016, 1402, 20692, 13839, 3826, 19320, 4200, 26846, 19633, 19078, 2591, 35030, 4489, 9054, 4373, 30788, 23849, 35006, 2608, 25111, 35012, 2577, 10312, 8247, 34113, 29078, 4685, 4195, 1362, 10707, 34260, 35127, 36058, 20293, 842, 3079, 4472, 2459, 25399, 25030, 8171, 5864, 16574, 2593, 14243, 35019, 36640, 8132, 21255, 35024, 891, 35026, 2494, 5857, 5864, 19633, 21359, 12040, 34380, 6593, 2475, 11022, 27934, 8843, 19820, 1305, 31450, 35098, 9317, 35100, 5122, 35112, 35103, 12246, 24985, 21016, 1364, 2332, 13860, 14790, 6010, 1962, 15315, 24161, 29989, 23035, 36310, 10141, 36632, 3209, 36315, 30008, 35395, 22942, 8880, 29768, 3179, 25459, 36623, 29772, 3213, 29774, 6816, 18118, 21942, 7298, 10792, 9442, 26475, 10925, 9067, 29783, 3223, 36608, 18408, 36610, 3139, 36612, 29792, 21205, 3155, 36594, 27358, 36596, 1985, 16996, 11431, 24194, 5296, 19816, 4090, 25590, 31573, 1249, 14648, 13526, 5486, 10464, 7791, 29638, 11570, 8776, 1269, 13879, 9892, 10661, 28554, 1532, 14041, 4858, 2856, 15867, 9131, 23782, 25824, 31396, 22767, 19908, 14897, 3350, 21755, 1655, 15073, 23047, 14469, 1847, 1915, 7338, 34065, 8862, 13796, 23610, 12333, 2146, 8846, 20293, 4877, 19831, 9974, 21008, 5437, 3808, 24688, 25971, 30024, 1887, 1260, 14724, 11848, 4035, 21126, 3758, 9658, 4487, 12315, 3006, 27186, 3065, 8074, 4487, 8440, 1053, 2681, 7768, 13507, 33800, 9188, 3007, 12157, 16413, 5672, 14792, 13492, 15988, 20560, 8834, 1508, 27264, 3686, 1394, 8924, 14358, 36868, 6496, 11802, 26884, 8935, 5879, 25040, 25021, 3960, 13326, 2231, 7809, 2996, 14538, 24480, 24814, 31502, 16169, 22429, 22725, 22182, 2194, 31266, 29795, 35881, 25669, 29318, 35710, 30160, 6249, 29845, 36775, 24553, 1886, 22520, 9738, 36780, 14543, 17806, 1915, 3660, 6932, 14921, 8134, 36788, 28073, 1956, 7515, 3764, 33363, 6473, 16002, 8318, 13246, 1788, 7937, 8105, 6107, 3474, 36803, 9077, 2195, 11520, 11415, 14776, 1847, 28082, 5851, 25925, 36814, 17199, 18866, 19745, 4250, 36775, 18649, 36822, 4073, 14943, 2556, 19038, 36827, 29193, 15324, 2643, 23858, 1366, 7227, 36834, 26100, 12762, 31531, 4605, 2140, 36840, 10713, 6186, 36844, 34115, 16418, 16820, 1401, 2840, 36851, 25785, 2007, 36854, 12156, 2003, 36857, 27888, 3466, 21565, 31294, 3435, 4245, 5680, 29192, 21449, 27186, 36869, 3994, 519, 6755, 11840, 16073, 25040, 18043, 13064, 31613, 35229, 6747, 5993, 14120, 31360, 17030, 5288, 36889, 8447, 36891, 36524, 6622, 21559, 949, 21561, 5336, 21563, 1402, 21565, 23778, 19427, 5551, 15971, 12044, 26282, 21274, 1747, 21575, 8622, 21577, 13491, 29633, 21581, 5308, 2316, 11590, 8446, 13627, 13254, 5145, 4982, 20596, 2668, 15767, 12881, 8934, 1138, 36136, 2956, 21598, 18923, 4226, 31911, 31632, 21604, 14551, 5848, 6191, 36769, 26913, 29003, 4941, 13607, 30235, 3245, 6495, 2332, 36518, 16643, 23984, 36084, 977, 25402, 25603, 28366, 27977, 25727, 4175, 18767, 9150, 35612, 22642, 35614, 36535, 22669, 33364, 33337, 34044, 3599, 1487, 37010, 28214, 18675, 36564, 25761, 2854, 4285, 21467, 1540, 1497, 9692, 27285, 17959, 1422, 4413, 961, 37078, 10920, 37080, 28107, 33361, 36509, 28735, 28654, 35618, 25242, 25314, 25726, 19157, 2465, 27403, 10631, 26630, 26664, 36588, 36233, 36207, 20107, 6323, 36261, 30251, 36202, 37123, 12555, 36289, 26613, 26636, 26394, 37128, 36294, 26587, 36264, 26622, 37124, 26550, 26657, 3134, 37138, 36305, 36333, 36893, 34955, 19115, 34957, 34570, 26449, 2067, 32117, 1382, 4854, 30978, 34369, 22372, 13272, 37159, 1121, 14447, 37165, 13839, 27913, 11360, 14447, 12876, 28309, 28087, 28275, 3664, 11611, 2281, 6530, 6710, 6599, 1149, 15082, 32167, 2139, 26231, 13050, 24468, 868, 4831, 1728, 15298, 15301, 1367, 9174, 15001, 11394, 5850, 21753, 17678, 29264, 4672, 9507, 34960, 7256, 14553, 31635, 1742, 13120, 4946, 5741, 9942, 5961, 937, 13140, 20603, 34369, 24595, 13272, 4784, 2705, 15174, 1316, 6718, 1259, 5097, 28067, 14965, 1923, 26096, 4665, 12111, 4425, 5847, 31777, 19315, 1269, 35054, 7169, 11317, 35340, 2831, 6217, 35443, 12427, 12368, 6739, 15029, 6652, 13551, 19320, 9353, 1525, 25984, 17059, 9243, 14528, 15086, 5674, 28247, 3390, 7665, 15441, 9908, 6605, 12310, 31531, 16245, 35047, 1636, 34977, 25563, 12386, 13551, 1652, 5835, 3517, 21910, 25574, 28823, 14404, 16021, 24902, 9588, 11692, 14913, 7793, 17083, 5983, 31567, 13835, 27146, 3460, 23618, 26117, 12000, 4062, 20839, 860, 3593, 20415, 21910, 36060, 11289, 3466, 11418, 35593, 22767, 19622, 23043, 7663, 3511, 7083, 29577, 2474, 17205, 30377, 5057, 11869, 9978, 16966, 21279, 2646, 37167, 34241, 11677, 16682, 1648, 36112, 30743, 37329, 19760, 34312, 1285, 37280, 4446, 11498, 1504, 20443, 3193, 10250, 15201, 9110, 4651, 23558, 1247, 8870, 31397, 10679, 18769, 32439, 18866, 20317, 7576, 12476, 10327, 15062, 21276, 21380, 27015, 24568, 21434, 29009, 3360, 28719, 36212, 23913, 37152, 34019, 33604, 26449, 23786, 1205, 5555, 31740, 4782, 22365, 25010, 16457, 35933, 9036, 1470, 22028, 8002, 27342, 27251, 20467, 28507, 1286, 4219, 10462, 9500, 17904, 26071, 27581, 5827, 27583, 6902, 856, 13892, 2187, 26009, 14751, 20649, 12831, 10694, 1699, 37393, 2294, 30051, 20665, 939, 3996, 27426, 5094, 33454, 10971, 1401, 10050, 24301, 27504, 2260, 5549, 9759, 14718, 13456, 2550, 37426, 1557, 25115, 28574, 31125, 1314, 4076, 1793, 3650, 28476, 15031, 9500, 5861, 3078, 3976, 33064, 83, 112, 105, 110, 110, 101, 114, 33075, 825, 33078, 26910, 33081, 35883, 34799, 30618, 7846, 11234, 22508, 22496, 10950, 22510, 10957, 25292, 25291, 15751, 14213, 18583, 3024, 20611, 3311, 3530, 6846, 2462, 4845, 3318, 16175, 3321, 5539, 3324, 3380, 19910, 1767, 14831, 3332, 1075, 12548, 5538, 3337, 20488, 11446, 35529, 2311, 14301, 3440, 4310, 10334, 3351, 3089, 21351, 5141, 14302, 13321, 3449, 20153, 29951, 17656, 3367, 34988, 20689, 3372, 937, 14973, 12158, 3378, 21874, 24024, 1284, 36858, 11916, 31372, 25167, 3391, 14113, 11337, 3395, 6016, 3425, 11291, 3401, 10153, 11502, 9458, 6718, 16465, 12890, 14301, 1394, 3415, 5952, 3418, 3528, 8783, 6313, 3475, 30393, 3421, 2198, 3428, 19642, 16610, 3433, 1447, 3436, 33629, 36399, 8118, 3307, 3444, 7206, 3447, 23096, 2630, 9181, 20422, 3455, 1677, 5239, 36137, 3327, 8627, 3464, 2069, 3466, 26994, 2509, 16826, 1737, 19492, 3473, 2695, 24041, 3478, 3825, 3481, 34813, 9230, 35724, 6509, 15291, 8146, 3491, 28715, 3494, 7115, 5109, 25970, 3499, 25369, 4469, 11270, 3504, 35524, 1099, 7207, 4685, 16958, 3513, 16459, 5111, 3517, 1892, 11085, 3521, 5723, 26076, 14850, 5085, 11185, 10325, 37090, 2448, 22224, 37513, 4368, 27243, 5909, 2491, 4374, 19697, 7009, 4378, 16657, 8097, 2540, 4383, 7265, 4386, 22879, 1255, 4480, 18247, 12703, 10793, 15476, 4239, 34542, 23983, 10782, 26452, 25193, 29264, 9025, 4411, 8642, 9249, 33430, 10109, 6227, 10719, 7515, 1624, 4424, 1250, 11348, 6763, 32957, 6879, 23759, 23082, 11879, 35826, 18303, 19755, 4444, 12992, 26455, 4308, 36439, 34587, 27606, 14349, 28810, 4785, 33408, 26965, 33408, 4464, 21435, 1538, 7953, 12016, 17406, 10252, 13621, 15260, 25879, 3902, 4479, 34826, 18545, 4486, 5190, 4489, 7229, 24615, 36189, 11728, 37267, 4498, 2781, 8798, 2919, 4844, 4816, 36448, 25190, 16377, 7573, 37623, 15500, 2543, 13814, 27275, 24473, 28594, 9281, 19316, 3445, 1400, 30422, 19321, 31238, 8314, 1853, 21413, 14052, 4338, 19329, 26050, 26879, 19333, 11016, 19795, 30462, 30513, 32842, 20014, 19921, 20463, 6726, 19936, 13784, 11970, 18971, 33588, 10928, 19352, 7198, 19354, 2401, 27559, 22235, 21888, 3018, 16814, 24677, 19374, 24768, 26694, 6018, 19370, 6583, 2752, 26695, 19375, 6999, 19377, 26463, 29879, 18030, 31547, 18032, 15174, 30658, 4318, 14451, 26253, 19392, 19391, 1631, 19393, 37789, 19383, 31502, 37797, 30742, 6928, 2975, 8519, 35671, 35647, 35673, 11059, 19410, 28376, 35652, 21345, 19415, 30226, 37108, 16628, 2575, 21250, 16659, 30708, 2513, 26717, 29807, 19430, 13495, 35777, 31587, 19438, 19435, 13973, 19442, 13972, 13978, 18999, 37831, 13981, 19004, 25214, 34227, 25517, 27164, 36595, 28213, 8420, 7278, 25283, 29007, 16841, 33675, 28881, 29012, 15294, 28870, 28886, 11701, 29838, 11067, 16835, 3285, 16833, 2139, 29023, 1949, 27726, 34359, 1477, 1067, 21783, 7780, 18099, 1911, 1367, 9343, 29036, 32823, 12096, 24916, 17849, 31216, 17233, 31219, 31938, 31056, 29348, 19838, 29340, 19951, 20059, 20033, 2139, 11498, 24839, 29039, 11104, 5920, 5401, 37868, 25336, 10704, 29065, 4500, 9342, 37373, 20432, 32286, 25329, 33064, 70, 105, 417, 32, 84, 121, 261, 37451, 33077, 827, 33080, 35882, 36896, 31818, 31350, 1986, 36526, 36521, 35627, 28506, 28411, 35434, 34757, 33299, 33230, 28514, 33302, 28656, 28116, 28742, 27994, 36544, 33373, 27781, 36547, 28665, 27786, 34366, 28248, 36552, 28532, 33383, 37111, 18917, 36556, 28677, 36558, 37722, 28501, 37922, 33355, 36522, 27975, 33358, 36532, 33360, 37929, 28513, 37085, 33348, 36539, 35621, 33369, 28658, 28521, 37937, 28239, 36546, 28342, 37941, 33378, 36551, 7811, 28437, 10780, 36554, 36505, 37950, 28759, 28356, 34070, 15669, 36561, 29313, 36563, 36573, 12625, 36575, 12866, 37143, 35894, 36570, 9833, 36572, 31812, 26667, 30012, 30002, 37995, 25458, 35895, 36562, 2145, 36582, 30067, 36584, 27510, 35890, 30071, 38004, 29952, 26495, 38007, 12622, 30091, 37366, 24751, 30094, 35554, 34877, 25220, 37062, 5316, 37098, 12190, 9309, 37067, 2041, 9642, 9311, 2513, 15872, 1549, 14153, 1090, 19156, 8521, 37077, 29976, 37107, 33343, 35613, 36534, 27982, 37112, 36537, 37086, 37115, 37089, 37058, 29526, 31090, 27754, 32466, 14639, 27958, 37071, 37098, 3996, 1455, 37065, 37101, 27993, 11771, 37105, 38044, 18692, 35369, 28325, 33324, 37964, 27986, 27770, 4444, 37116, 19576, 4187, 21375, 6386, 29401, 37131, 30888, 38015, 36311, 26560, 26648, 37127, 37093, 37148, 26629, 38086, 37142, 37133, 37125, 37145, 1495, 37147, 36316, 26661, 26652, 26663, 38087, 38098, 37144, 37136, 26353, 38102, 26660, 37149, 31814, 36038, 34956, 37369, 34618, 28725, 33354, 35626, 28505, 37958, 37926, 37960, 28732, 37962, 36536, 33271, 37965, 37933, 35622, 37969, 36543, 28660, 37972, 37939, 37974, 28749, 36549, 28751, 28130, 37978, 33381, 28251, 35580, 28675, 31897, 33057, 37985, 9825, 27802, 5139, 5851, 7248, 3006, 6373, 27809, 36684, 4144, 491, 27813, 3486, 6493, 14147, 318, 27927, 28061, 27822, 1924, 1365, 27825, 15648, 27827, 13856, 27829, 37869, 3494, 9549, 36645, 9757, 33928, 14344, 6740, 27839, 3998, 1443, 14661, 15149, 1036, 28195, 17064, 4178, 23576, 26838, 27851, 14946, 3163, 27854, 13632, 27856, 9864, 1110, 22312, 28568, 35675, 22560, 38183, 27865, 21783, 1482, 1114, 9189, 11348, 7903, 1913, 27874, 13467, 26889, 6869, 1769, 17584, 11462, 26001, 1896, 34251, 7141, 29591, 27887, 9013, 13289, 29294, 8097, 24279, 27894, 1563, 27896, 18647, 27898, 33941, 1367, 27901, 6186, 3004, 18093, 3156, 3914, 10573, 24647, 22228, 27910, 11310, 12220, 12427, 5199, 14617, 1148, 27917, 6693, 4660, 37248, 27920, 27923, 9994, 5670, 9213, 4870, 2643, 27929, 4412, 17799, 21104, 27958, 36031, 3417, 13050, 5933, 16623, 11650, 1665, 27941, 6504, 10062, 22011, 11087, 27947, 6364, 27949, 7902, 11653, 27953, 4309, 31198, 9688, 36086, 20429, 30361, 4657, 17916, 37953, 15824, 38121, 28218, 37924, 38124, 36531, 33240, 36533, 37110, 37083, 27983, 37113, 37932, 33367, 36541, 37935, 28337, 27996, 28427, 28746, 37940, 38140, 37942, 28005, 37944, 38144, 36553, 36470, 38311, 17283, 37983, 38150, 33387, 19652, 3286, 28022, 24718, 4217, 28025, 28048, 9386, 28029, 9631, 28610, 14343, 12252, 15347, 2977, 28036, 29139, 14849, 14553, 12424, 7763, 28043, 28030, 11002, 29123, 7204, 28048, 3407, 28180, 28052, 28023, 16516, 17662, 28057, 29084, 3081, 28060, 14918, 5486, 27055, 15736, 4001, 28066, 10125, 9747, 1450, 34115, 28072, 3378, 12502, 13839, 3177, 13082, 1747, 37587, 25996, 38373, 3370, 38375, 26099, 28087, 6932, 4688, 33338, 34045, 28051, 28094, 38055, 34230, 35885, 28726, 36527, 33356, 37925, 38307, 33266, 37961, 38147, 38050, 38130, 38077, 37966, 27989, 28657, 27993, 38318, 28426, 28340, 28123, 38139, 28244, 38141, 37943, 28347, 38327, 37946, 28011, 37982, 28758, 38333, 37952, 28142, 3207, 28261, 9850, 30186, 23855, 28149, 27742, 9431, 28153, 13550, 8703, 28156, 5152, 16424, 17124, 3497, 27856, 28163, 9054, 4063, 28166, 25338, 28168, 28016, 28171, 5401, 23855, 2602, 17164, 19080, 28178, 23895, 3438, 1381, 24688, 28023, 28183, 27703, 27234, 28187, 1466, 33970, 9223, 28191, 24340, 15035, 38191, 28196, 5793, 16517, 8624, 38008, 13463, 24718, 1511, 28204, 3593, 28206, 8981, 11083, 27958, 5292, 17341, 38402, 29799, 38057, 38303, 28317, 38123, 28410, 38409, 33297, 38411, 38075, 38313, 36538, 38132, 37968, 38419, 28744, 37938, 28341, 28526, 38323, 37976, 38143, 28436, 38145, 37981, 37948, 28137, 28676, 37984, 38334, 8341, 6934, 28144, 23770, 28263, 28173, 10060, 6107, 6442, 37655, 6445, 11839, 1370, 8101, 1095, 17835, 26839, 30986, 4535, 4463, 13501, 26145, 17657, 12123, 11157, 8484, 3660, 3127, 24718, 28289, 1263, 3673, 28292, 9479, 27537, 6981, 27072, 25818, 28299, 31681, 6869, 9058, 28304, 17196, 24247, 28307, 15609, 14092, 3294, 28311, 38500, 30965, 38404, 38503, 28728, 33357, 38125, 38308, 38509, 33335, 37931, 38512, 38315, 38418, 28659, 38319, 38422, 28429, 28664, 38520, 28667, 38522, 28670, 38328, 37947, 38330, 37949, 38433, 27799, 28357, 12194, 10890, 28360, 18689, 28362, 24301, 15919, 28389, 21268, 10905, 37781, 7713, 28371, 19175, 35674, 35638, 21343, 22906, 22911, 6370, 28380, 38581, 35884, 31350, 16914, 30253, 12827, 28473, 33305, 11657, 27416, 29432, 5277, 11000, 27743, 28402, 28393, 8751, 28396, 5269, 28398, 6192, 28406, 37923, 38505, 36530, 33265, 38508, 38127, 38412, 28110, 38511, 38052, 38593, 37934, 33370, 37936, 38136, 38320, 37973, 38519, 38425, 38324, 28346, 28669, 16886, 38604, 38431, 38526, 28441, 38642, 5282, 30257, 1010, 28760, 16785, 36390, 28451, 1105, 28453, 6781, 38166, 6756, 25657, 28459, 5723, 28461, 17467, 30315, 9203, 1441, 28466, 1284, 28468, 13835, 29595, 28471, 26413, 28393, 5268, 28476, 20531, 7115, 8136, 28480, 28280, 8709, 14933, 2698, 29029, 895, 28487, 30590, 900, 38720, 10520, 28493, 28496, 28494, 30477, 28498, 38632, 37457, 23260, 38405, 38654, 36529, 28647, 36502, 37109, 38128, 37084, 38662, 38131, 38664, 38133, 38515, 33372, 38137, 38518, 38599, 38672, 38521, 38326, 38523, 38677, 38741, 38148, 28537, 38151, 27260, 4786, 4737, 16761, 28701, 37088, 7476, 28547, 9773, 28706, 38770, 24115, 6523, 28554, 2709, 34806, 24076, 36591, 3235, 28561, 4863, 13162, 6803, 6911, 5429, 4119, 883, 3831, 31424, 17635, 28573, 18192, 28573, 1888, 28577, 30861, 23675, 6006, 15009, 12634, 7220, 28585, 28601, 5247, 28599, 28590, 35797, 36127, 12162, 35294, 28596, 3664, 16236, 37234, 13344, 15592, 13356, 10435, 2084, 28606, 4851, 23619, 891, 28610, 9383, 28612, 5830, 1084, 28613, 23820, 7663, 17639, 28619, 9781, 4743, 13064, 28632, 14933, 22837, 14147, 1213, 28628, 1213, 28630, 2707, 32707, 6861, 12838, 9319, 24902, 1604, 38301, 29203, 38584, 36528, 28729, 38587, 38410, 38659, 38510, 38051, 38744, 28114, 33368, 28519, 38134, 38667, 38596, 28524, 33375, 36548, 38673, 33379, 38429, 28754, 38605, 38049, 38607, 38528, 38434, 28258, 28680, 6519, 33116, 30554, 33138, 33106, 30628, 28689, 33092, 33110, 33145, 33095, 33147, 12572, 28697, 5535, 11510, 38764, 24120, 30102, 1884, 22355, 38770, 11576, 24026, 1731, 28710, 3231, 28712, 28710, 37595, 17717, 15738, 837, 38852, 37921, 28643, 37956, 38305, 38506, 38657, 33322, 37928, 38660, 33363, 38743, 38415, 38513, 38865, 38747, 37971, 38669, 38138, 38671, 33377, 38601, 38754, 38603, 38430, 38757, 38331, 38608, 38685, 35669, 16370, 28764, 31779, 9628, 4844, 12154, 3431, 2026, 13085, 3510, 14479, 7743, 28775, 29664, 1699, 28778, 3856, 19961, 28782, 4685, 28784, 37685, 15092, 18675, 28788, 4646, 28801, 1405, 28556, 2152, 2170, 28796, 4434, 28798, 17245, 1237, 28801, 38978, 20959, 36783, 13085, 15011, 22375, 28809, 5930, 4025, 14993, 4708, 2987, 9608, 28817, 1611, 28819, 10215, 3403, 28822, 10990, 1812, 38989, 28827, 3494, 25206, 5209, 3646, 1613, 28833, 3416, 1779, 15181, 15152, 2977, 28840, 28855, 14855, 13877, 28844, 7222, 8671, 8762, 28849, 17114, 6439, 13190, 3346, 1227, 28856, 25989, 28858, 7242, 37904, 368, 68, 414, 347, 116, 819, 110, 97, 32189, 823, 37452, 37915, 34796, 37455, 37918, 31690, 30618, 26279, 37079, 23921, 24110, 24256, 38830, 36755, 7892, 23824, 24262, 23930, 3285, 24265, 24120, 23702, 27053, 17776, 24066, 30077, 3173, 25460, 39071, 10724, 12723, 10475, 32907, 3915, 25298, 8268, 8176, 23437, 8271, 23438, 6639, 25304, 27008, 3933, 25307, 23441, 8171, 15989, 9761, 27008, 25313, 19094, 29352, 31072, 29354, 31074, 25320, 20069, 31731, 8747, 8738, 20073, 25326, 19860, 31083, 35880, 37151, 21141, 37153, 37370, 18799, 1071, 2075, 12555, 13889, 11453, 25661, 10440, 25454, 36629, 30072, 37996, 8898, 17784, 29991, 23993, 30393, 7176, 16607, 28493, 10087, 31227, 36611, 2069, 23552, 12445, 2966, 15039, 15668, 866, 5558, 21175, 33734, 3924, 25299, 8177, 39087, 3928, 39086, 19083, 23441, 39089, 3927, 19087, 19087, 39093, 25308, 39096, 7476, 39098, 19974, 31073, 19854, 31075, 8748, 19980, 25319, 19098, 7436, 29361, 7604, 29363, 7923, 38732, 36897, 30618, 29005, 19455, 16302, 10827, 10792, 37644, 25122, 12704, 10963, 2333, 5299, 29375, 21929, 18241, 8715, 36753, 5734, 25121, 7286, 19527, 36609, 20988, 5649, 12681, 7996, 18650, 3767, 34603, 19194, 34623, 15472, 10841, 25179, 19531, 10844, 36762, 37719, 27610, 10849, 7979, 15395, 7332, 4451, 30106, 15849, 3482, 39217, 27609, 7343, 10809, 29667, 3759, 27616, 26456, 10441, 7353, 34647, 21483, 10856, 39231, 27630, 38916, 28290, 2034, 12538, 5724, 1070, 13241, 39247, 24309, 27630, 2363, 21437, 6524, 16305, 10789, 4903, 20507, 3820, 20927, 12704, 10795, 3726, 14746, 2892, 39218, 7343, 10516, 6052, 39232, 4448, 17502, 33389, 34017, 38117, 36040, 38025, 13392, 16845, 300, 7518, 32277, 20507, 39256, 37645, 14301, 38781, 7320, 37646, 39204, 5675, 39248, 2011, 3511, 20510, 24959, 16352, 20989, 8236, 39288, 7580, 8250, 7544, 39283, 39266, 27622, 8257, 39179, 37919, 36898, 29204, 13451, 32846, 33835, 11018, 6968, 18696, 6306, 2586, 5090, 5656, 37095, 16108, 8637, 6522, 10956, 5547, 31299, 5669, 12567, 8036, 25905, 3403, 23333, 22899, 5684, 28904, 3097, 3656, 15304, 10153, 2997, 11240, 15294, 28455, 33151, 2747, 10956, 39322, 3103, 8629, 9038, 31371, 8231, 15974, 38019, 33150, 3855, 3001, 11025, 33998, 5612, 39309, 39051, 38734, 1987, 33586, 1522, 1317, 24297, 3512, 36044, 5667, 5539, 10252, 36978, 5627, 16133, 16528, 11223, 5623, 4082, 5243, 39320, 15970, 36568, 24094, 10245, 14121, 20376, 2355, 11030, 6749, 13676, 11975, 4038, 39355, 2555, 39380, 11851, 5641, 9943, 3726, 6563, 30218, 14080, 21750, 38719, 3352, 12674, 26152, 30164, 12335, 30166, 38916, 23466, 3072, 6966, 28809, 5617, 8320, 3293, 37192, 3098, 3352, 16820, 33143, 8231, 2553, 30879, 19262, 16103, 27902, 20134, 10249, 25811, 9939, 31668, 17671, 11968, 12166, 12752, 39429, 20435, 5867, 16530, 18085, 8688, 8320, 3290, 39380, 19898, 39338, 3943, 5685, 30306, 1624, 30164, 10541, 16083, 30946, 16687, 1315, 39411, 2499, 39413, 14250, 39370, 39416, 3970, 13655, 16515, 12354, 39372, 5621, 5681, 16522, 11966, 1793, 39333, 1624, 5536, 15299, 16530, 4628, 30560, 35493, 5736, 6530, 21692, 30220, 13382, 16109, 3377, 2588, 2552, 19178, 22112, 9948, 22114, 22134, 33133, 28683, 8695, 39397, 2570, 2573, 31105, 5617, 16210, 19060, 16688, 11214, 16692, 5708, 36036, 37150, 39275, 37368, 39277, 34667, 19618, 25942, 30796, 39254, 25369, 39285, 39188, 7535, 39293, 39531, 39250, 23137, 39199, 8230, 38773, 3391, 15474, 3772, 3023, 2167, 5571, 39265, 17799, 39229, 8242, 39305, 39545, 27614, 21677, 2382, 39111, 39519, 39113, 38118, 36041, 39523, 5242, 37013, 39260, 8983, 39534, 7285, 39536, 39259, 2000, 30827, 39290, 39541, 5083, 10446, 11653, 8248, 10847, 39219, 7544, 39248, 2735, 39249, 39295, 39545, 39575, 39268, 37657, 8248, 39550, 24427, 2191, 39553, 38116, 39520, 36215, 36338, 10773, 21778, 33397, 37679, 34491, 24280, 28009, 39193, 15414, 7281, 39231, 16347, 39200, 12657, 39202, 39298, 39291, 25181, 10797, 36553, 18742, 34626, 7336, 39216, 15473, 39267, 10808, 39197, 39271, 34662, 36334, 36213, 39276, 39593, 27752, 6961, 39182, 12480, 23145, 39185, 39198, 39564, 7541, 34627, 27481, 34583, 12535, 39212, 10828, 39214, 39299, 39618, 10805, 39546, 39220, 2344, 28403, 38614, 39238, 21840, 8251, 39241, 27622, 38852, 7811, 24372, 25064, 18944, 18252, 22148, 30273, 4167, 35828, 4763, 28809, 12133, 7153, 12131, 2830, 12029, 2084, 19510, 6829, 24403, 21044, 5879, 6843, 1777, 5199, 10235, 8610, 5156, 11990, 5753, 5542, 29901, 21741, 36986, 24575, 9196, 29587, 4411, 7554, 23534, 6204, 30999, 23849, 33616, 12087, 5305, 4770, 26247, 23065, 2166, 2065, 1604, 9028, 13009, 6148, 16762, 11900, 8666, 11079, 11498, 2416, 13287, 5649, 11908, 30051, 9349, 11912, 37745, 15894, 38191, 11918, 12268, 27578, 1364, 28152, 33100, 8636, 16085, 12826, 35490, 6563, 3012, 30632, 25746, 18928, 28186, 17554, 7030, 10186, 7035, 12216, 8448, 4812, 36872, 11483, 4801, 4685, 16865, 6781, 13134, 29474, 333, 5691, 14973, 27803, 24835, 5139, 11964, 11023, 16810, 31645, 5598, 23611, 20668, 16720, 16810, 12189, 6496, 8441, 27726, 32999, 16170, 7168, 18272, 25769, 15646, 23352, 14458, 3654, 13126, 39118, 36029, 11584, 5244, 6029, 9999, 31854, 1734, 8345, 37287, 8446, 13370, 11787, 3271, 11992, 1371, 12325, 9741, 8591, 14756, 7330, 3786, 9068, 9487, 28318, 11129, 1605, 39243, 36218, 15381, 18637, 23104, 16823, 4179, 7086, 13326, 4633, 3410, 11551, 21669, 15240, 1247, 15226, 1555, 14994, 39833, 38280, 31042, 7955, 11846, 35932, 11219, 4778, 10411, 9188, 12847, 24595, 15147, 11875, 30824, 10225, 16154, 8330, 27242, 9069, 35476, 2177, 26022, 32925, 1472, 12781, 31781, 2854, 20419, 11628, 1392, 21115, 1763, 12129, 1051, 9337, 35574, 12849, 17365, 5559, 30557, 19048, 39732, 20498, 5694, 28589, 30332, 37713, 15264, 9722, 6967, 9548, 23724, 12056, 21752, 25573, 6585, 13272, 3494, 27807, 24247, 1517, 8023, 3722, 6149, 11866, 36679, 9253, 6003, 2166, 6908, 28996, 1040, 23424, 25839, 22144, 22344, 11822, 39663, 4152, 39665, 11827, 25050, 28170, 19348, 32839, 39435, 10521, 39766, 14183, 3791, 21749, 6840, 12150, 37864, 6692, 13001, 14004, 25351, 1999, 13172, 4503, 15012, 36185, 8387, 36872, 2773, 15002, 2749, 3688, 39336, 23762, 21273, 3662, 15220, 18060, 3294, 15189, 21403, 13525, 3970, 12677, 12205, 17358, 28121, 3769, 12303, 21726, 25807, 13295, 16911, 1857, 6142, 10005, 31657, 4206, 3025, 8657, 34404, 31840, 25916, 10066, 34107, 17554, 36012, 1110, 29282, 15143, 14561, 9429, 15594, 26194, 28080, 7263, 17118, 7987, 25763, 13625, 14699, 12189, 14071, 20386, 19792, 39364, 33156, 24956, 2543, 34825, 23265, 24374, 22146, 39912, 39912, 22150, 4168, 882, 7024, 39714, 13888, 16567, 15301, 5191, 22839, 5558, 11923, 13149, 8991, 18061, 33990, 20885, 9561, 3829, 31434, 15301, 3969, 7009, 15369, 3174, 24309, 16075, 9948, 9941, 24657, 13484, 32980, 20951, 3634, 1068, 10475, 11358, 19964, 15217, 25700, 3792, 25720, 13664, 14971, 39715, 8646, 27205, 31106, 13109, 17877, 36804, 9216, 7262, 8924, 1314, 4371, 12193, 2150, 2732, 1740, 13293, 4736, 21754, 39700, 18866, 19607, 38028, 2855, 27391, 3709, 17379, 4783, 17673, 1250, 19971, 14660, 2646, 33005, 1090, 29122, 27247, 36019, 22092, 32838, 32847, 30518, 11020, 32820, 31643, 31669, 11969, 17898, 14528, 34988, 32823, 13974, 25158, 4668, 4668, 6700, 25542, 39848, 3427, 23849, 3655, 2005, 4318, 6646, 11281, 3815, 22851, 2402, 17541, 3808, 6296, 20723, 2766, 17442, 2006, 3046, 30058, 29857, 8838, 4801, 15652, 10491, 2607, 2262, 39117, 19133, 3340, 2175, 17355, 4860, 2847, 9274, 17935, 3293, 2037, 32932, 22047, 13105, 2423, 36054, 10186, 27250, 12427, 2749, 20432, 11944, 12212, 37308, 10558, 21331, 2994, 9228, 858, 38916, 5380, 25106, 2081, 3999, 25149, 2469, 28916, 30828, 38468, 18651, 10354, 2878, 29873, 1370, 19875, 30320, 4035, 20760, 16407, 34140, 27888, 31042, 24354, 40064, 5811, 13005, 21268, 14947, 10402, 20975, 2543, 24595, 2779, 16014, 3481, 12761, 14878, 4603, 17564, 3994, 16419, 37338, 16640, 19542, 18094, 8545, 6999, 40046, 25833, 1269, 38901, 14059, 11692, 1019, 22399, 4085, 17334, 39735, 33094, 24309, 3433, 8300, 4344, 6148, 26898, 1889, 14906, 36445, 11803, 9468, 39890, 13595, 13097, 11746, 1563, 7762, 1648, 27536, 1527, 6226, 6154, 20211, 18168, 24373, 22145, 12032, 40005, 18246, 30274, 3574, 40009, 3161, 1799, 15798, 8102, 20649, 33607, 14597, 34319, 8018, 6755, 8379, 7046, 2749, 16820, 11498, 40151, 6298, 15743, 39950, 24924, 13031, 3297, 4982, 3970, 8436, 1448, 15189, 40138, 13986, 12178, 5200, 11985, 9664, 4657, 7954, 25037, 33761, 40128, 37229, 2134, 18061, 1527, 12327, 9644, 20955, 40119, 39745, 1989, 25700, 19763, 35294, 9645, 17666, 27149, 8973, 2031, 40162, 9089, 34113, 5025, 23376, 14699, 30824, 22070, 39772, 20462, 11967, 23486, 39994, 5608, 20387, 5604, 9831, 1080, 4234, 24845, 36445, 10132, 10086, 29197, 37837, 27633, 34229, 38501, 35885, 22927, 23846, 21474, 30575, 2268, 1798, 3522, 13278, 25116, 10788, 22849, 8351, 17004, 22853, 925, 11459, 3298, 30183, 22541, 6470, 23027, 13171, 7799, 5649, 7650, 29747, 5539, 20165, 6336, 16006, 12360, 40355, 6464, 29788, 13834, 31407, 24609, 15980, 16762, 25429, 1798, 24385, 15529, 7473, 7303, 18586, 39165, 20064, 39167, 23451, 7677, 31076, 29355, 6664, 19107, 39175, 7687, 31755, 29364, 39997, 33393, 25104, 1240, 13293, 17100, 25230, 7665, 7627, 8351, 17830, 22852, 24456, 22854, 2183, 35756, 5242, 40361, 24456, 2220, 40363, 40347, 11156, 18844, 12365, 24532, 22934, 2365, 22936, 906, 40346, 1860, 11156, 22859, 23281, 10785, 5378, 17004, 22864, 3298, 12717, 873, 40410, 1647, 29718, 17799, 40375, 7665, 4442, 1916, 23447, 7588, 39100, 39168, 39102, 40392, 39101, 39173, 22595, 14429, 39108, 19987, 31756, 34567, 39592, 36337, 39629, 7620, 12696, 29530, 1935, 40376, 30183, 6737, 40352, 23027, 27583, 16000, 40414, 29777, 36981, 22549, 25120, 40418, 20989, 40365, 40436, 40445, 40370, 5827, 40372, 1857, 1860, 2247, 12365, 18751, 30272, 39613, 40382, 10795, 1069, 1376, 40421, 9741, 23285, 10848, 10839, 40444, 19649, 7664, 2372, 7667, 14812, 25315, 39166, 40452, 40390, 8743, 8738, 39171, 19977, 19982, 7601, 31080, 39176, 40398, 39178, 40463, 39555, 39521, 36216, 22926, 40468, 5084, 13888, 5675, 40474, 28617, 7665, 1611, 22855, 3316, 25030, 1123, 40381, 40002, 2291, 10800, 5053, 7465, 2153, 40430, 40491, 9741, 23129, 25122, 7544, 40360, 40482, 15999, 37440, 7651, 40368, 12106, 40437, 7645, 7293, 22866, 1611, 40373, 40367, 30189, 40508, 12358, 40384, 9740, 40450, 7815, 40515, 39172, 40391, 39170, 22592, 31732, 31079, 40459, 31081, 39109, 40462, 40336, 34797, 37456, 39180, 39999, 1356, 23087, 31167, 11161, 1008, 2074, 9061, 2591, 14366, 20934, 30712, 20996, 1068, 37678, 34560, 18082, 33400, 27847, 20594, 24626, 1355, 8146, 40600, 21033, 40617, 11160, 40598, 11938, 9194, 29266, 13633, 1996, 23297, 2453, 36437, 18074, 34656, 8046, 36441, 36436, 23271, 27570, 29280, 31226, 23075, 40304, 5838, 40640, 38380, 9154, 39528, 14608, 3364, 15162, 13035, 40627, 1123, 12519, 34553, 3883, 4252, 15729, 12193, 5707, 22238, 14301, 21466, 15247, 40597, 11160, 40617, 9194, 38380, 15482, 21023, 21890, 36150, 23380, 27873, 3883, 19146, 12525, 20981, 15468, 20922, 25126, 10360, 39243, 9888, 2878, 39184, 16329, 16351, 39187, 39607, 7633, 16324, 40686, 39262, 25172, 34543, 16356, 34566, 40589, 39049, 31270, 39310, 30618, 16342, 2414, 34633, 2179, 22932, 30128, 16373, 40690, 22847, 8241, 13012, 16379, 17230, 37721, 40400, 34958, 23598, 9690, 28170, 10093, 24391, 6294, 16374, 39539, 20929, 1439, 40724, 39620, 39649, 34954, 39554, 22056, 34876, 39522, 22505, 31926, 15434, 16303, 16309, 40687, 22145, 4957, 35565, 29415, 10856, 40685, 40714, 17364, 38916, 36804, 1287, 18306, 20834, 35843, 31290, 20883, 31786, 20880, 20825, 31316, 20773, 12673, 20824, 20905, 8127, 7207, 31797, 8137, 20830, 31285, 20842, 40754, 20837, 40774, 20836, 20840, 30406, 3240, 30470, 2825, 40754, 40770, 12663, 8101, 20884, 40764, 20820, 20887, 40762, 20823, 20819, 20826, 33434, 31323, 40769, 20813, 40771, 8151, 20827, 20835, 20839, 40802, 20838, 40798, 36768, 40527, 40733, 35439, 39594, 5722, 37483, 26266, 21440, 1075, 20880, 20783, 29713, 20757, 40758, 20885, 18161, 20895, 21954, 20890, 20893, 20767, 40827, 40761, 20822, 4102, 20899, 40766, 8144, 31324, 20904, 8987, 40778, 10091, 40780, 31236, 8153, 20825, 40817, 40784, 40819, 8103, 8425, 3096, 40822, 20762, 40824, 17790, 40826, 20770, 20770, 40829, 3426, 8121, 40832, 20778, 21960, 20903, 7013, 40837, 21965, 39243, 35925, 31070, 40814, 28198, 40783, 29779, 40846, 8113, 40855, 20892, 40802, 40818, 31785, 40847, 40821, 40857, 40852, 4117, 40787, 40793, 22794, 21961, 4118, 40864, 35470, 35523, 26385, 10372, 40870, 10464, 40872, 31784, 21947, 40881, 40877, 20770, 40804, 40845, 40880, 40875, 20899, 20895, 40790, 4102, 40886, 20900, 40767, 40889, 40836, 40892, 20907, 38114, 39274, 39591, 40528, 39628, 36771, 12599, 3213, 34704, 40754, 40916, 40879, 40900, 40875, 40912, 40909, 40830, 20775, 40849, 40913, 40834, 10084, 40776, 40802, 40856, 40833, 20828, 31324, 40770, 20841, 8162, 16316, 15685, 27140, 28198, 40929, 40905, 40931, 35531, 40933, 20821, 40858, 40831, 40937, 40944, 40862, 31324, 40775, 40942, 20766, 40938, 40945, 40796, 585, 40805, 32878, 39518, 40921, 40808, 38024, 40735, 10396, 5724, 36501, 40896, 40801, 20838, 40985, 40968, 40948, 3195, 40782, 40797, 40955, 14763, 40881, 40958, 40789, 40935, 40885, 40792, 40969, 40964, 40971, 6833, 40838, 40919, 21609, 40732, 25332, 40465, 40924, 2819, 2896, 33586, 40983, 40843, 20905, 40992, 31292, 21949, 40908, 40959, 40884, 24153, 40827, 40876, 20894, 41021, 20889, 40936, 3066, 41000, 40795, 20781, 40891, 40973, 41005, 22602, 41007, 28722, 40734, 40530, 7620, 7177, 12468, 4610, 40990, 40972, 41017, 20884, 40902, 40966, 40930, 40993, 40907, 40937, 40934, 40960, 4319, 40912, 40963, 41032, 1692, 40929, 40988, 40974, 38115, 36335, 39627, 41009, 37841, 8312, 3165, 36561, 40841, 40815, 41015, 40788, 21946, 41053, 40957, 40999, 41056, 41022, 40860, 31796, 40889, 40966, 35913, 40987, 40861, 41061, 12265, 40972, 41064, 41036, 22920, 41067, 40464, 41040, 40810, 7704, 36868, 6477, 36004, 22168, 8240, 23125, 7337, 8683, 8683, 14253, 8683, 7580, 41107, 40535, 8237, 23142, 23138, 23130, 40556, 27050, 903, 23279, 39911, 39299, 10785, 41121, 32874, 40504, 39219, 920, 5388, 30795, 10027, 40513, 40388, 40578, 40520, 23452, 39103, 31077, 40583, 25324, 40585, 40524, 40587, 40399, 40807, 41008, 41099, 40466, 11051, 1992, 41103, 27050, 32859, 23329, 2337, 23126, 41155, 32874, 40554, 39200, 40556, 23283, 20927, 41124, 39204, 10785, 18104, 41111, 41170, 18104, 40433, 40419, 23282, 19323, 20619, 8498, 23151, 22151, 6228, 7958, 40387, 23448, 25317, 40393, 40454, 40581, 39104, 19106, 39106, 40396, 7830, 39177, 19473, 40716, 37154, 18799, 1870, 9646, 3489, 30660, 23284, 41106, 23330, 41108, 41160, 14157, 39290, 41119, 7633, 17647, 41209, 23280, 41175, 10785, 41165, 29667, 2295, 4224, 30844, 41172, 8918, 41173, 41129, 41180, 12816, 26940, 40576, 7907, 8287, 40456, 40580, 40518, 40582, 39105, 39174, 40523, 40397, 41146, 40526, 40697, 37917, 40699, 39365, 17510, 1850, 24626, 23726, 41208, 3613, 41205, 41158, 41108, 41116, 40424, 41210, 40555, 7535, 41223, 27947, 41262, 39539, 7640, 23140, 41218, 7300, 22860, 41126, 41213, 41252, 23293, 41180, 15456, 6295, 41230, 6649, 19860, 41187, 41139, 40455, 40453, 40457, 40522, 41144, 41240, 40461, 41147, 41243, 36895, 41245, 39998, 17510, 1518, 2983, 23467, 23537, 4412, 10457, 40740, 16959, 32559, 23476, 23726, 23478, 12707, 23480, 14495, 23482, 20678, 22447, 23486, 25437, 12335, 23557, 27150, 5401, 23312, 25244, 33571, 25246, 33556, 18958, 25249, 2660, 25251, 17885, 23503, 33563, 36489, 18893, 36491, 18952, 25679, 23644, 18771, 23240, 23306, 25502, 25684, 29613, 23651, 25688, 23167, 23400, 25272, 23591, 15907, 29622, 41197, 39115, 13025, 41295, 23535, 28597, 23613, 1008, 34561, 8538, 23541, 7625, 19637, 23544, 7416, 16325, 5877, 9244, 24501, 32559, 23552, 40673, 1889, 23555, 1357, 41316, 9721, 25243, 36478, 35596, 33542, 18342, 4483, 19019, 41327, 18963, 25254, 41330, 35606, 36360, 8340, 23508, 23642, 15887, 41336, 23304, 29610, 25683, 9406, 23395, 25267, 29615, 25689, 25270, 25691, 23656, 41348, 39395, 41350, 41148, 41039, 40809, 41151, 1004, 23599, 12697, 23601, 11626, 23603, 4000, 23605, 31427, 37309, 22447, 37242, 37756, 23612, 16463, 20648, 10638, 486, 23617, 15527, 23620, 23548, 23623, 10064, 9909, 23312, 26472, 7712, 20796, 26550, 23634, 26531, 23637, 38094, 22941, 23577, 41394, 29608, 25499, 12730, 23582, 29612, 23584, 41343, 23011, 41345, 25271, 29620, 25513, 23319, 41351, 38119, 3280, 27340, 3490, 35109, 1130, 1008, 6823, 25798, 41052, 3176, 29091, 21949, 40663, 7042, 7072, 26038, 6537, 8240, 16826, 17881, 2137, 37648, 24270, 30007, 25472, 17511, 25198, 13111, 4155, 38916, 27340, 1613, 24589, 923, 4806, 19523, 17511, 36732, 3558, 39130, 30938, 41486, 29433, 28584, 25008, 2165, 5838, 6831, 9290, 41031, 26491, 40056, 17754, 20511, 7123, 9397, 6341, 40731, 40976, 41149, 41412, 41010, 29004, 1498, 22967, 30001, 36567, 1645, 6144, 39183, 14296, 24977, 23609, 22289, 1775, 40850, 21953, 4784, 2075, 39016, 9856, 1786, 4572, 26903, 2366, 4925, 2495, 30140, 41502, 30959, 41095, 24365, 26957, 38023, 37840, 28313, 1724, 6374, 1376, 31124, 2016, 24255, 27612, 41209, 14883, 11349, 2336, 7630, 41552, 4169, 2146, 16351, 30004, 38778, 3592, 31771, 21520, 31561, 1511, 13311, 7651, 7041, 41003, 40866, 41464, 39557, 22965, 12236, 22507, 21163, 17731, 10098, 23822, 35860, 34727, 7937, 11836, 34904, 34773, 34869, 34856, 18577, 29371, 35823, 17751, 20522, 10184, 17755, 10187, 17758, 20788, 17539, 3144, 3922, 8168, 25310, 23430, 25305, 39079, 3919, 19081, 39151, 39155, 25302, 39154, 39084, 8277, 8185, 39158, 8280, 23445, 13967, 19095, 41136, 41279, 41233, 40517, 31730, 41141, 41237, 40458, 8206, 41145, 41288, 41242, 38021, 41558, 32759, 41560, 37060, 30967, 6937, 30069, 35869, 35857, 12731, 10887, 41531, 8882, 37494, 17705, 24022, 23689, 9065, 17870, 12822, 20890, 6384, 2032, 9751, 37597, 35865, 17721, 12978, 23328, 35879, 24525, 3446, 6413, 23427, 41620, 39161, 39091, 8173, 39081, 19077, 8270, 39083, 23434, 23436, 8276, 8272, 23443, 41635, 22270, 41637, 41184, 40451, 41640, 41283, 41234, 41643, 41280, 22594, 41285, 41647, 41287, 19098, 39110, 41523, 41097, 40922, 41069, 41561, 37061, 17820, 27482, 22538, 39598, 7939, 6067, 25227, 27103, 25229, 22312, 1935, 26890, 1640, 14325, 13007, 12445, 21396, 19902, 2218, 34580, 34535, 25241, 4444, 23247, 41320, 34673, 19015, 41381, 18404, 9918, 23388, 33578, 36486, 33548, 41388, 16170, 35607, 41391, 25259, 41335, 41451, 25681, 23513, 41340, 41399, 23650, 41401, 23652, 41403, 29617, 23162, 29619, 25676, 41462, 41409, 10861, 33064, 86, 328, 101, 111, 32, 80, 108, 97, 121, 37449, 37913, 826, 33079, 39048, 41244, 31817, 41246, 25104, 13393, 23600, 11375, 2781, 12699, 2332, 27908, 31562, 23112, 2361, 20708, 30828, 31562, 6371, 23611, 5575, 3806, 28303, 1698, 4672, 12501, 23618, 12054, 7968, 2781, 22585, 33407, 8262, 41621, 39094, 19088, 23433, 41626, 39083, 41693, 19081, 41695, 19084, 39157, 3935, 3915, 41636, 22538, 41702, 40577, 41704, 40516, 8290, 41189, 41644, 41191, 41238, 41286, 41194, 40525, 41196, 41410, 41559, 36770, 41070, 29446, 5378, 31155, 7580, 7798, 7015, 40230, 3244, 3256, 6998, 1090, 34000, 1203, 5544, 11723, 29469, 9067, 8174, 2823, 8605, 34538, 26456, 40630, 7288, 9642, 22050, 7406, 41740, 2153, 4032, 5806, 4471, 8174, 39416, 11804, 17112, 8240, 41860, 4198, 3668, 11818, 8027, 40230, 41867, 9736, 33009, 5628, 41871, 11157, 920, 881, 8615, 41897, 41866, 30828, 10464, 41901, 33009, 41669, 4002, 20938, 41875, 40704, 40547, 37682, 15953, 41880, 37649, 39602, 2215, 41885, 15133, 25942, 8174, 5653, 41870, 41859, 9994, 41894, 1349, 41913, 2260, 31236, 12017, 41651, 28721, 41853, 37059, 29202, 3300, 21529, 40349, 10186, 41933, 14819, 5395, 41864, 2140, 41898, 41910, 41869, 41902, 36907, 41915, 41906, 41723, 2682, 333, 41899, 41911, 15159, 8615, 39203, 39263, 41912, 8615, 4922, 41893, 41950, 41960, 22215, 11483, 41131, 41590, 39278, 14068, 11801, 1118, 8846, 333, 3935, 2181, 5983, 21327, 860, 5960, 1057, 13463, 39660, 4413, 41992, 28275, 1215, 7746, 41986, 32875, 15728, 20524, 3196, 26137, 41979, 40979, 19453, 4014, 10894, 34574, 19529, 22406, 41922, 34553, 12683, 34556, 3623, 17961, 41880, 41918, 42012, 34598, 15937, 21521, 42016, 34641, 38916, 33395, 31518, 42020, 34644, 15951, 42023, 42014, 34577, 25083, 34555, 42027, 42006, 41041, 854, 1634, 6491, 9762, 7524, 25752, 7732, 1040, 5383, 4145, 24883, 1040, 18830, 3315, 33009, 5705, 887, 14893, 13877, 25845, 41907, 4914, 39902, 25752, 41930, 42057, 39623, 25118, 10785, 41902, 42067, 7300, 42047, 3815, 18637, 41913, 15134, 30347, 41939, 39625, 37367, 41717, 41150, 41527, 15824, 6871, 42045, 23366, 13925, 42048, 26131, 41994, 6091, 41963, 42065, 42056, 41913, 42059, 3926, 1350, 42062, 42052, 42095, 13925, 42066, 42098, 14903, 42100, 1395, 34638, 16184, 41924, 2273, 42031, 41724, 41919, 39225, 5055, 41926, 42078, 24136, 26219, 3328, 42077, 7548, 42074, 28244, 2262, 42077, 12743, 42060, 38852, 1263, 42044, 37643, 42089, 2462, 42091, 5418, 42051, 3354, 42053, 42096, 42124, 8615, 42099, 894, 2839, 41875, 41923, 41882, 34650, 2297, 42115, 40608, 39615, 34636, 7409, 42120, 42131, 3926, 38852, 31155, 4606, 27011, 41966, 24469, 39583, 39547, 42145, 24469, 34975, 41909, 25752, 36204, 2270, 41973, 6003, 8258, 5166, 42134, 25078, 34483, 29427, 34609, 15937, 19146, 29408, 22433, 38916, 1475, 35923, 40753, 40842, 1364, 34107, 9692, 23291, 42068, 27623, 15855, 37680, 12707, 36440, 37648, 40745, 8242, 40637, 36725, 34209, 4323, 40794, 40768, 36137, 13876, 19279, 40866, 4029, 25991, 9931, 40607, 22433, 6294, 40665, 40665, 42196, 5982, 30814, 31291, 20884, 27225, 24173, 40823, 41028, 4117, 42196, 1402, 11576, 40600, 40725, 25180, 10796, 12713, 2388, 42039, 41852, 41653, 41854, 41719, 16859, 18606, 29301, 39597, 29409, 42224, 11315, 11329, 1353, 12610, 40899, 41079, 21949, 42232, 12670, 40851, 42235, 4964, 42211, 38380, 40666, 41968, 40693, 37650, 16315, 1728, 36120, 34768, 40773, 42259, 42198, 40643, 39252, 35136, 42203, 39224, 39616, 7409, 40651, 42036, 12033, 40615, 11938, 42237, 42196, 41515, 40889, 10222, 7084, 41035, 40681, 40594, 6578, 40619, 42304, 40596, 23276, 40622, 33475, 40603, 20995, 14250, 20997, 42222, 34623, 40629, 23269, 5671, 13003, 34264, 40614, 42225, 23368, 40641, 42305, 40599, 40643, 36433, 13017, 40626, 12989, 11963, 29273, 42205, 9060, 36442, 15492, 23297, 27745, 7258, 40660, 40598, 40618, 40639, 40642, 40622, 39606, 22294, 34204, 14340, 5199, 5671, 4397, 34517, 34507, 40653, 15491, 15255, 20936, 36858, 20939, 42209, 40620, 42325, 40664, 42257, 14798, 8349, 4230, 27745, 42351, 21749, 11963, 40673, 22431, 40675, 6289, 39925, 40678, 5079, 10377, 42191, 7221, 14422, 2033, 7910, 14426, 41649, 39107, 6667, 40389, 40579, 41642, 19103, 41708, 31733, 7828, 4972, 857, 5851, 23724, 20711, 2712, 14116, 41800, 17260, 11537, 1408, 12768, 12054, 41803, 18439, 31070, 41811, 13827, 14822, 877, 11525, 24646, 42080, 40975, 41716, 40977, 41654, 41944, 4895, 11234, 31105, 4072, 23420, 3055, 1697, 9039, 1406, 9734, 8487, 25720, 1962, 5351, 16555, 11933, 6374, 42416, 38953, 20434, 17651, 6225, 42431, 16587, 21103, 4072, 31662, 36136, 2772, 19496, 19968, 2849, 1454, 4982, 13075, 23098, 4658, 17448, 3783, 31537, 17200, 11127, 3331, 2469, 11701, 38280, 38991, 30742, 1673, 33939, 19505, 3199, 9466, 8441, 42458, 7153, 31954, 9214, 539, 22540, 31064, 17552, 10259, 16764, 25940, 14608, 7015, 7222, 2224, 15046, 30058, 1633, 19724, 15603, 17930, 28771, 14197, 2594, 13619, 4921, 1996, 39986, 42480, 33832, 33867, 2772, 33063, 368, 70, 295, 32170, 67, 820, 116, 114, 111, 39044, 33076, 41789, 37454, 41792, 31348, 41293, 25865, 468, 10661, 7142, 37350, 41761, 12729, 13659, 23005, 25265, 15896, 22811, 12617, 23587, 12620, 29618, 7163, 5858, 15253, 11628, 7649, 6870, 6497, 8325, 6874, 34399, 40873, 8762, 12427, 36759, 7181, 6881, 30930, 25484, 35527, 7189, 25487, 27398, 7193, 1547, 25491, 37763, 27527, 18849, 7200, 18505, 14313, 22297, 41515, 16550, 37485, 14820, 7212, 2495, 3790, 9059, 35081, 24556, 7220, 2963, 10342, 31581, 7226, 1756, 5780, 7228, 38292, 7222, 11706, 13139, 35240, 14130, 35789, 7242, 7255, 7245, 8680, 7248, 1695, 18916, 9512, 7241, 7254, 13059, 42604, 21635, 8615, 7221, 7262, 7234, 28859, 40335, 41940, 32758, 37839, 42249, 41655, 9194, 25798, 42561, 12460, 25485, 42564, 19310, 25488, 22128, 25490, 18983, 13405, 42571, 25135, 22982, 9019, 25481, 9956, 23424, 13415, 23000, 25680, 42535, 22805, 25741, 23006, 25685, 23585, 42541, 29616, 42543, 41771, 25511, 23402, 13437, 25514, 42081, 38022, 42248, 41943, 31442, 9241, 18767, 25261, 23390, 41397, 23648, 41765, 42652, 41457, 22813, 41769, 42656, 22817, 23590, 23391, 23404, 2078, 42040, 41100, 7620, 18732, 40342, 2174, 40344, 29972, 9898, 14038, 39909, 18741, 7333, 25067, 24533, 2186, 18746, 34586, 18743, 42698, 22935, 2347, 15526, 928, 4171, 30271, 4924, 10781, 30584, 7409, 7869, 18763, 2350, 18760, 12941, 35770, 2172, 42669, 23645, 41338, 23392, 23514, 41341, 41456, 41767, 41344, 23520, 41405, 41347, 42681, 25275, 41290, 31087, 42527, 40401, 17767, 2230, 19073, 39078, 19075, 41690, 25300, 39152, 41694, 25301, 39088, 39093, 4034, 41688, 41625, 19090, 23441, 39163, 41277, 23449, 19459, 41842, 3936, 41282, 23451, 41709, 7684, 41848, 19986, 41713, 40588, 42621, 30093, 42664, 38056, 38404, 36379, 39183, 41839, 41231, 39173, 41641, 41843, 41235, 41190, 19855, 41143, 41711, 41849, 41241, 41851, 42735, 31816, 42737, 40717, 26449, 40341, 28401, 18942, 40546, 16370, 40425, 30579, 40427, 42705, 926, 34544, 42716, 7472, 42718, 22942, 42721, 41337, 25263, 41398, 12612, 41342, 42728, 41458, 42730, 29618, 42680, 23017, 42682, 13439, 42790, 34665, 41718, 42625, 25448, 2632, 36586, 30071, 24074, 38005, 38017, 37989, 34543, 12089, 25476, 27015, 25478, 2310, 27393, 36322, 2420, 25483, 42629, 42563, 1558, 22991, 7192, 22993, 42636, 22995, 42638, 34383, 4786, 25496, 13417, 41395, 29609, 41453, 42537, 41455, 25266, 18779, 23010, 42676, 41459, 25510, 12089, 41773, 42660, 41463, 42247, 42623, 42665, 33084, 23119, 23726, 2057, 2005, 23123, 41253, 25118, 41115, 41203, 39261, 10838, 41259, 7172, 4365, 433, 5830, 17035, 41264, 23139, 23131, 41267, 23143, 41216, 8424, 14024, 1008, 40748, 10575, 35140, 22151, 35903, 1139, 41760, 23511, 42723, 41454, 42726, 42864, 22811, 41402, 42868, 42819, 23522, 25512, 42872, 41775, 42770, 34228, 30964, 38633, 36898, 37459, 22507, 18076, 16138, 3297, 22511, 25288, 22513, 25290, 22421, 6200, 5311, 6366, 31149, 6001, 42743, 23434, 41627, 39084, 39153, 8274, 41631, 41697, 39090, 41623, 8265, 41687, 25312, 18356, 39097, 8192, 41185, 42391, 41138, 41706, 42394, 40456, 42764, 7918, 17589, 40460, 42768, 41289, 42924, 37838, 27357, 42876, 35885, 42828, 38013, 30002, 25453, 17883, 29303, 30877, 42833, 39128, 41601, 25462, 27490, 36580, 30941, 29371, 29312, 41488, 25471, 23708, 25460, 25475, 29763, 22518, 12496, 25507, 42842, 27365, 2405, 3685, 12632, 22989, 25486, 42632, 42566, 42851, 6897, 42637, 27554, 25588, 4168, 15399, 42646, 42859, 41452, 42536, 13423, 42914, 42539, 25506, 42654, 42677, 6861, 42869, 1424, 42871, 23592, 42661, 8410, 33064, 67, 259, 114, 349, 39045, 37914, 41790, 35707, 41291, 41793, 42528, 17252, 21101, 11533, 17954, 10882, 17954, 23416, 36845, 23988, 34046, 26597, 10780, 13799, 10370, 21493, 19244, 31764, 30279, 31766, 31699, 10896, 26973, 2081, 3674, 10900, 10882, 25828, 7582, 34511, 36356, 26386, 10907, 10884, 42684, 41413, 537, 31761, 22101, 43062, 23761, 28446, 10894, 31768, 31701, 1603, 31703, 16201, 25838, 31707, 13007, 31710, 31343, 36892, 41066, 39626, 41098, 41526, 41855, 702, 31714, 873, 31716, 3320, 35719, 11290, 30056, 23225, 31724, 8653, 31726, 14440, 31729, 42964, 41283, 42966, 19468, 1088, 31735, 18166, 1478, 31739, 12332, 5000, 10218, 3034, 5960, 31745, 2875, 32529, 32844, 18917, 31751, 42385, 8732, 41195, 19989, 42972, 40337, 42926, 38733, 31760, 1975, 31693, 31763, 43086, 37985, 43088, 31700, 40246, 31771, 31811, 25152, 26108, 11738, 21382, 37235, 4388, 31804, 933, 35497, 31783, 41078, 41018, 31787, 13495, 31789, 3905, 31791, 13289, 31793, 9631, 41060, 42214, 25113, 24630, 6999, 31801, 31801, 2002, 9283, 22031, 23931, 35808, 26043, 34418, 31811, 41555, 42512, 34, 66, 114, 97, 110, 100, 41788, 37453, 37916, 43044, 42792, 41198, 13025, 34752, 28810, 36753, 35069, 30998, 15581, 24732, 16489, 40060, 4457, 22583, 26997, 10749, 23606, 1999, 15076, 8378, 2090, 14106, 29652, 31773, 13333, 12123, 4780, 7226, 5691, 14679, 6734, 13839, 21007, 17435, 19280, 3843, 21711, 31526, 11377, 2335, 2643, 15808, 14059, 12858, 30743, 6630, 16486, 3356, 6643, 15092, 1457, 25400, 7035, 27202, 14550, 12409, 37729, 9742, 3487, 1731, 28987, 2182, 6603, 25041, 24241, 39760, 24241, 20726, 3510, 9051, 13118, 1627, 13086, 38701, 6220, 4123, 5550, 7098, 2981, 14953, 36865, 2150, 31225, 36827, 9149, 5476, 42810, 41396, 42861, 42813, 15902, 25505, 23246, 42917, 42818, 41771, 42820, 23524, 22961, 43080, 42085, 29203, 15919, 7706, 42533, 42911, 25263, 20092, 5929, 32939, 42236, 29851, 23738, 5457, 13917, 27933, 9179, 6916, 5730, 21846, 37894, 8627, 13714, 9067, 27740, 35177, 20682, 13871, 7153, 27271, 6331, 18179, 17774, 2694, 2679, 43313, 18826, 23341, 42814, 42727, 42865, 25268, 43027, 23168, 5874, 43301, 29621, 6969, 15886, 38852, 15479, 8072, 21926, 11478, 17190, 23738, 1436, 17190, 3790, 17390, 5957, 11235, 1354, 1021, 30364, 1046, 16420, 36123, 15795, 3554, 12154, 17834, 16419, 13613, 31035, 37738, 3446, 27655, 37232, 12065, 6730, 3317, 1233, 3474, 11478, 27906, 2672, 3406, 43171, 2245, 15843, 2833, 4381, 32748, 1547, 5392, 1475, 43360, 3638, 2424, 43359, 7214, 4912, 1561, 1231, 10252, 14734, 6537, 29573, 1482, 5144, 1438, 4427, 6445, 10660, 5555, 12816, 37800, 1627, 2971, 42910, 25262, 42671, 42725, 42673, 42815, 43345, 43298, 25509, 42919, 41406, 42733, 43033, 43100, 42082, 42423, 42624, 29202, 12793, 25041, 33733, 10099, 14489, 27556, 29102, 3398, 35954, 8094, 15069, 894, 21151, 5691, 24669, 6339, 7144, 9709, 8471, 29657, 26009, 27809, 1478, 36683, 1044, 14681, 3439, 7069, 13583, 41737, 15134, 40307, 24481, 14758, 3156, 16839, 27823, 15160, 34117, 14464, 20538, 14633, 1484, 7719, 15045, 20210, 15811, 7005, 24865, 11083, 43460, 24892, 10150, 22393, 14058, 10607, 20224, 39796, 18769, 19035, 20536, 17203, 11297, 25942, 3389, 20960, 13213, 1011, 1879, 3347, 34105, 3176, 27100, 29507, 10221, 1947, 26040, 976, 8364, 27168, 3694, 20183, 41450, 43310, 29610, 20346, 3364, 1217, 24585, 14597, 8115, 1290, 16939, 1437, 26901, 9490, 11235, 17678, 43129, 8314, 15088, 3454, 9531, 4535, 3513, 4430, 9274, 33046, 16176, 9264, 19366, 30838, 16521, 23040, 22271, 3202, 3299, 3288, 23624, 27055, 24557, 8904, 2376, 18066, 2245, 5843, 43187, 34219, 1503, 1020, 27652, 3640, 38279, 33903, 2419, 36948, 19372, 35223, 29128, 9753, 39985, 42454, 7778, 24353, 39949, 1370, 43269, 3337, 7987, 11122, 35269, 30767, 4990, 18743, 3514, 14651, 11135, 8441, 1623, 29578, 30685, 9908, 12060, 38245, 28839, 5164, 24168, 23038, 17125, 15134, 25705, 14561, 8094, 3726, 13355, 13243, 31482, 33134, 19397, 16734, 37488, 14819, 27015, 34334, 11792, 13309, 6241, 1521, 13572, 11389, 868, 42440, 36878, 11713, 1687, 14453, 15890, 13925, 19374, 1220, 25170, 42651, 43430, 42916, 41768, 42918, 43300, 42920, 42659, 43032, 42873, 42824, 36336, 42084, 43104, 4734, 12028, 11022, 4365, 8185, 17933, 22224, 14561, 21755, 4772, 27133, 11840, 16490, 7743, 7083, 7145, 1774, 15326, 8098, 7054, 21607, 13839, 4771, 5533, 34343, 1008, 11620, 11777, 1296, 30212, 16227, 9443, 38276, 31873, 8040, 3390, 11279, 40211, 8400, 9070, 39894, 25930, 3442, 3508, 7484, 13065, 9053, 9002, 7780, 43633, 30526, 27892, 4215, 2399, 35733, 6249, 35574, 8664, 29531, 13136, 30176, 15616, 30382, 2552, 8459, 19752, 15695, 8408, 14543, 1365, 19907, 10484, 7100, 1431, 17044, 34427, 12823, 9350, 3152, 26619, 34263, 14790, 20560, 4795, 17484, 4667, 12213, 43214, 9253, 12255, 41495, 25910, 5316, 11784, 9653, 35074, 7186, 1484, 22728, 398, 24280, 25429, 18617, 20835, 2497, 23768, 1240, 26971, 28286, 1850, 1350, 35766, 6987, 35402, 9850, 1263, 1437, 37402, 4468, 27439, 6920, 8056, 30445, 16673, 11621, 28389, 42028, 42775, 7476, 6762, 20444, 892, 5765, 22784, 10116, 23621, 21327, 6912, 14993, 28544, 23136, 19498, 15292, 43743, 43541, 11152, 16000, 12294, 34289, 31116, 2064, 24180, 43550, 11843, 9283, 43553, 30696, 43555, 4027, 43557, 40130, 2059, 26874, 36789, 34370, 43564, 2265, 43566, 4670, 16537, 28196, 26943, 24344, 43573, 10713, 14665, 10561, 21128, 19953, 2752, 43580, 841, 43582, 39026, 20161, 43585, 9274, 43587, 43661, 33477, 17419, 3298, 43592, 34440, 8293, 43595, 31361, 7225, 4985, 43599, 26908, 29600, 43603, 25808, 26890, 22036, 39016, 43608, 23037, 24910, 13054, 11886, 24626, 22789, 4339, 1521, 38030, 24706, 6666, 19758, 35150, 8160, 4437, 15711, 1996, 1651, 12218, 21314, 1895, 1623, 14583, 3170, 4974, 1231, 9300, 12425, 11794, 40362, 11864, 4178, 15186, 6996, 22899, 9471, 39932, 4496, 18668, 30650, 9517, 19464, 42387, 41192, 41239, 42787, 42388, 43142, 42662, 41652, 42875, 42773, 37920, 39312, 42776, 42959, 41703, 41232, 7675, 9742, 17387, 12053, 21735, 15351, 9380, 4371, 11597, 7029, 5241, 28701, 5198, 1695, 8805, 36084, 3457, 36721, 2629, 13043, 5649, 1564, 7970, 41368, 13667, 27803, 11667, 17414, 31118, 36176, 29536, 24180, 16033, 2497, 8439, 28163, 3394, 35460, 31656, 3498, 34988, 15814, 6203, 3019, 1699, 22232, 1576, 30164, 42579, 23829, 1799, 29088, 1809, 16016, 16737, 9561, 941, 10153, 3511, 35207, 34174, 24244, 9759, 8056, 15623, 13364, 8483, 1075, 17834, 4327, 43673, 12332, 9033, 8464, 30974, 3993, 2100, 4849, 36978, 25934, 2637, 5783, 1751, 12147, 12426, 29452, 11498, 3970, 10412, 16877, 9946, 7526, 14112, 36125, 5745, 24147, 24353, 42618, 15163, 15466, 6634, 9224, 38396, 1953, 12987, 14367, 42087, 34009, 15294, 6015, 11206, 30795, 40469, 43906, 7490, 43908, 41847, 42786, 42767, 7499, 41650, 43914, 41941, 42772, 38403, 37920, 22463, 7325, 43031, 41349, 43352, 43291, 42860, 42536, 15861, 5832, 4318, 7985, 31320, 20499, 19547, 1926, 7791, 35966, 2065, 9429, 10980, 24561, 41493, 33796, 43938, 39389, 26941, 9896, 12824, 2739, 1197, 14125, 8656, 27603, 29165, 13541, 16897, 2004, 10271, 4751, 13306, 1375, 14509, 13507, 1212, 20158, 1201, 33714, 5650, 16956, 12013, 1566, 17480, 1739, 14799, 13950, 9072, 21544, 8133, 10561, 24588, 8790, 13090, 36653, 4316, 3410, 2776, 14605, 398, 2047, 25552, 13300, 5908, 16673, 6325, 33998, 3013, 17854, 25343, 4738, 6921, 10271, 20458, 15313, 1238, 13057, 1852, 28587, 31786, 5077, 16436, 44008, 2843, 6659, 11376, 3820, 17520, 16567, 36881, 30391, 25146, 7006, 4657, 6179, 18995, 19312, 24431, 35033, 7263, 2002, 6932, 25031, 3769, 39789, 15253, 7004, 8260, 43342, 43295, 25686, 22952, 42817, 43433, 43649, 33388, 41006, 41524, 41411, 40978, 42041, 8727, 22481, 28277, 4975, 12861, 37544, 22767, 9361, 13272, 24658, 12977, 3858, 35794, 24336, 37259, 35179, 7112, 7345, 8447, 27468, 37784, 20426, 28467, 3455, 3517, 19636, 15118, 3788, 7177, 25206, 2366, 22170, 19723, 15257, 3073, 4335, 2218, 1909, 1373, 30763, 6247, 38381, 2398, 21644, 8408, 26874, 24431, 39767, 19517, 13252, 9207, 17442, 5908, 1777, 12000, 10560, 1667, 1144, 1819, 38719, 24846, 16178, 20432, 20649, 3380, 5613, 17103, 1138, 2466, 23774, 28483, 12065, 14718, 12000, 24978, 2651, 43253, 1282, 4644, 17455, 14265, 8073, 43224, 12405, 1499, 10411, 5090, 5189, 10278, 43967, 28948, 4539, 9739, 43285, 21129, 30362, 5019, 3164, 7990, 16095, 24706, 24381, 25351, 19962, 11992, 5658, 9201, 20717, 11992, 13623, 19738, 8910, 3825, 5152, 13456, 6511, 13620, 5554, 7112, 15869, 15611, 24601, 4840, 4712, 19877, 3464, 33792, 20874, 18023, 30464, 10613, 15284, 12185, 8968, 15361, 24179, 35512, 2835, 11277, 39394, 1420, 1139, 3790, 5534, 31598, 5341, 25528, 28401, 18000, 32852, 42829, 31766, 15531, 7848, 26160, 30021, 10890, 44055, 43020, 42649, 29611, 43023, 23163, 42816, 42867, 43299, 42679, 43650, 25273, 42922, 43303, 42874, 42974, 43917, 30160, 1006, 26809, 43890, 1484, 14395, 2037, 2023, 6532, 1659, 30365, 11423, 41801, 5117, 4804, 1609, 2134, 28457, 1639, 11790, 21711, 16865, 21652, 10116, 4573, 9618, 9660, 5075, 28965, 8105, 37344, 14042, 17423, 28570, 11120, 9568, 2913, 16497, 1525, 6988, 20401, 1474, 10168, 11845, 16930, 11908, 16676, 4794, 10703, 14021, 31529, 11460, 2547, 9061, 33734, 19886, 21312, 19314, 27995, 21303, 13094, 22520, 1667, 11157, 5856, 3808, 32932, 2835, 31229, 21424, 5563, 15988, 1231, 30278, 38843, 23208, 13621, 13925, 17580, 14025, 4603, 18647, 1671, 12886, 10032, 33005, 36969, 8713, 22188, 9153, 41375, 28481, 11163, 31680, 15707, 25406, 2399, 5077, 11912, 1521, 13076, 15301, 9764, 9411, 35747, 19883, 12166, 3942, 1525, 24696, 3054, 13484, 5025, 2667, 8936, 5995, 37214, 42372, 8017, 32809, 9507, 8612, 43877, 8298, 1473, 26827, 6746, 16881, 2071, 3790, 8490, 1819, 10491, 14762, 12822, 17371, 25305, 1292, 31836, 2139, 14606, 35761, 17440, 22228, 24696, 13530, 5838, 35782, 27683, 37885, 1808, 8476, 37885, 20323, 29120, 34008, 12179, 24353, 17398, 17598, 4645, 10732, 1053, 12393, 4714, 11423, 11155, 13127, 7514, 2014, 13849, 6770, 6974, 10561, 9229, 15314, 41181, 27901, 9850, 26265, 964, 1381, 1558, 4699, 17811, 12705, 12995, 26399, 44534, 8339, 43774, 6442, 1118, 2643, 973, 38852, 35468, 3293, 23154, 5243, 3660, 43797, 1877, 23047, 1748, 8163, 20635, 1894, 12074, 11854, 8474, 4998, 1134, 35841, 15047, 934, 44495, 13242, 24287, 22583, 9184, 6119, 16429, 2046, 33719, 10711, 8340, 6808, 1664, 41552, 6625, 5391, 40543, 7230, 21525, 31831, 25024, 17448, 4840, 8972, 31099, 1063, 14815, 18049, 6171, 11959, 8370, 5769, 1436, 1263, 5292, 1846, 14855, 32301, 9164, 17398, 1511, 14715, 4663, 927, 1068, 9194, 16467, 41673, 1953, 28372, 17105, 1473, 9383, 37406, 12862, 14863, 1947, 4771, 1292, 32886, 5568, 42210, 39590, 42422, 41525, 44178, 42685, 854, 10515, 40703, 14340, 4294, 9029, 24408, 13147, 27312, 1102, 941, 35335, 25883, 13085, 15579, 938, 1660, 13099, 4420, 44644, 36015, 13381, 2109, 25862, 30244, 13967, 44640, 4292, 44642, 4975, 44656, 27206, 37041, 44652, 11654, 44649, 10976, 2982, 44670, 34216, 20596, 44676, 26282, 969, 11129, 44641, 37120, 8755, 4866, 9388, 16676, 29812, 21624, 35985, 13835, 25910, 36032, 43819, 30418, 25347, 26937, 8974, 1676, 37429, 6212, 21415, 10111, 1171, 3677, 41819, 22442, 2994, 13293, 8094, 26741, 37352, 22368, 30382, 6442, 1411, 29701, 11582, 9429, 8862, 13619, 12303, 15602, 7438, 6734, 9605, 22315, 12010, 1331, 33637, 5982, 37576, 31663, 44595, 1207, 6425, 8259, 7735, 1546, 8991, 2103, 9766, 34249, 38280, 4838, 20981, 32823, 13253, 2261, 8476, 8988, 19389, 13606, 4025, 3389, 21653, 9664, 3792, 34209, 17387, 37654, 10708, 10062, 21950, 27942, 10213, 15110, 3826, 21015, 36411, 16745, 40364, 1255, 29483, 31574, 13615, 21428, 32907, 1152, 10097, 12601, 15579, 30440, 30352, 40491, 40220, 40404, 19956, 26804, 28613, 8929, 11076, 10447, 13492, 36463, 43304, 43657, 13932, 2069, 1475, 21437, 40137, 44604, 9639, 11802, 10729, 13499, 8624, 30754, 11434, 36718, 1402, 6394, 34807, 5505, 32590, 44554, 36132, 3162, 1070, 6924, 26678, 44815, 44820, 36649, 17221, 44819, 27834, 1040, 6473, 40141, 13199, 22399, 29242, 30056, 26855, 17621, 21270, 5379, 3479, 1065, 37057, 44351, 27634, 44048, 36898, 10279, 15861, 10446, 13262, 3684, 26243, 2400, 23288, 3593, 15866, 6494, 3371, 17011, 8174, 14392, 4002, 42332, 3993, 18674, 8075, 22551, 322, 3650, 1559, 6831, 1447, 43237, 5070, 5315, 36915, 16142, 8603, 19652, 42593, 1407, 34554, 15988, 20429, 4321, 10119, 2024, 10969, 29116, 43354, 7497, 6810, 1287, 8715, 8642, 5049, 4493, 36947, 1355, 4373, 10329, 9247, 9850, 27170, 17435, 9676, 6495, 24643, 30826, 2582, 4110, 23741, 43107, 7026, 6473, 1078, 7121, 26837, 44912, 39243, 11094, 1411, 7664, 9994, 15603, 2286, 17600, 3993, 6662, 2277, 9413, 9708, 28892, 13088, 18049, 9414, 31368, 8940, 12330, 20593, 24166, 2919, 6059, 13776, 43764, 1790, 9382, 10213, 6482, 6059, 36925, 44945, 6987, 25120, 4072, 10742, 12369, 10742, 31301, 17754, 29753, 25561, 24246, 12340, 1366, 3996, 1376, 2421, 7006, 9214, 2175, 6926, 20857, 6068, 22869, 5330, 24697, 25013, 1813, 11410, 2423, 3182, 1852, 37894, 3695, 8019, 2643, 9512, 28910, 44372, 913, 1437, 892, 11002, 27075, 3907, 37776, 44712, 20515, 16976, 32103, 5019, 37095, 2100, 19683, 4652, 3320, 37229, 44808, 1931, 11026, 32784, 31428, 37044, 21403, 30635, 3202, 8851, 32129, 975, 13254, 321, 3159, 4458, 31189, 34355, 11841, 14800, 11914, 36882, 1391, 23484, 19826, 33796, 44739, 1676, 27288, 12062, 26041, 4205, 31648, 6247, 6006, 3588, 6599, 1444, 4648, 12881, 16930, 2575, 9081, 10005, 11925, 25168, 16475, 21645, 1460, 2660, 41173, 21910, 1488, 7802, 26111, 1272, 13361, 6150, 10975, 40213, 22365, 1404, 3632, 11434, 44278, 1366, 40750, 4539, 35338, 10256, 44014, 15723, 8436, 25550, 12208, 17893, 7751, 8487, 24936, 24920, 9677, 2284, 27052, 1267, 3593, 24895, 20667, 12083, 31901, 19374, 23869, 38715, 2846, 14599, 10632, 5352, 5267, 13454, 35960, 3996, 30114, 942, 12438, 1496, 333, 24996, 5209, 24870, 36776, 38468, 36704, 4406, 6134, 4846, 2149, 35991, 18027, 35770, 35402, 5318, 3190, 2988, 1303, 1470, 2299, 11628, 33030, 11271, 20981, 37894, 27537, 4032, 4442, 11376, 5404, 44182, 6804, 10329, 13264, 2054, 5541, 20981, 9298, 30376, 1436, 15872, 45118, 4807, 28179, 30684, 44569, 39807, 7903, 31424, 8443, 10450, 1740, 8983, 40448, 3498, 3219, 1303, 23758, 40154, 14457, 4547, 29270, 26788, 5558, 13484, 37576, 3418, 29152, 44754, 30089, 9946, 29128, 1085, 4997, 11308, 14219, 13185, 2224, 21001, 1769, 1021, 1410, 9131, 24220, 17365, 16839, 19956, 30135, 4240, 15001, 30864, 13573, 43774, 2686, 27993, 35903, 29399, 18692, 28809, 14407, 41867, 23869, 33451, 30609, 20711, 4327, 17153, 12825, 11428, 5705, 31093, 10592, 10426, 17418, 5162, 44652, 9588, 29869, 21589, 2579, 10422, 14858, 6783, 2149, 25942, 13547, 39950, 44596, 30735, 44276, 14096, 10149, 34062, 36992, 14750, 2018, 13209, 21676, 9225, 30948, 6715, 6988, 14254, 1953, 6602, 1133, 20145, 16682, 11680, 19521, 16162, 25405, 1959, 22382, 11730, 30840, 6247, 8345, 30306, 29787, 13946, 4037, 7518, 6244, 21154, 8174, 2830, 33684, 18675, 38199, 4212, 12080, 3970, 7565, 10661, 299, 3659, 2000, 1437, 13651, 3573, 13459, 38462, 44587, 45054, 8317, 5096, 3909, 19898, 12157, 45190, 24341, 15731, 8490, 2396, 5661, 7033, 8490, 17606, 43409, 21268, 12224, 44448, 35922, 5877, 13606, 5429, 7520, 13891, 40173, 3407, 37190, 9809, 27830, 36144, 26142, 15365, 30651, 22163, 14599, 24689, 24786, 21764, 30346, 2932, 1479, 3994, 17606, 5883, 4418, 36142, 8482, 3849, 4028, 26154, 1405, 42720, 29607, 43526, 43293, 42672, 43343, 42915, 25506, 43432, 23314, 41460, 44052, 41408, 44350, 43654, 41068, 43656, 42250, 10562, 4409, 15417, 25347, 1538, 13004, 28272, 8031, 21026, 38973, 13648, 8226, 3049, 14250, 21637, 45140, 3241, 3327, 24776, 3673, 5354, 30986, 4374, 7183, 22866, 33171, 13714, 14013, 8689, 5411, 3231, 5308, 33483, 25197, 1063, 2247, 44881, 322, 1069, 9573, 45294, 28302, 40694, 37413, 5308, 17373, 21014, 31584, 6500, 5184, 1698, 40115, 1744, 11669, 35832, 6579, 3684, 29880, 17004, 21080, 14942, 43452, 23100, 2932, 7761, 8237, 21894, 31386, 12537, 4851, 3142, 8684, 12897, 3336, 14646, 37857, 19408, 30308, 5129, 2202, 21820, 45424, 2823, 22429, 17373, 4663, 21086, 14103, 15351, 11981, 13098, 4684, 10099, 14713, 322, 8008, 3347, 2413, 3673, 9440, 13248, 9391, 4418, 23612, 8674, 5132, 1355, 6217, 6442, 26697, 1088, 17540, 21414, 32065, 5234, 35298, 9066, 26820, 8918, 13248, 23028, 1987, 30289, 37375, 3721, 4655, 42312, 13293, 4341, 1740, 10656, 1514, 7935, 9761, 13835, 8440, 3222, 1673, 19346, 15303, 7199, 42062, 5215, 17417, 7286, 1695, 15353, 41907, 14377, 44680, 1234, 44652, 4028, 15825, 32173, 1303, 5005, 3906, 3176, 10059, 4194, 32968, 5650, 31718, 20293, 4684, 4685, 12369, 1676, 25166, 11344, 11869, 11073, 4630, 7939, 3389, 26099, 39145, 3138, 4073, 41540, 3555, 42181, 43423, 5701, 6441, 13009, 4847, 2781, 19813, 3723, 36916, 12574, 3504, 43803, 2426, 26201, 20415, 18801, 2218, 39145, 6915, 8185, 29026, 10851, 43163, 1307, 14163, 5486, 45405, 2091, 42477, 5144, 8379, 4991, 3394, 3792, 3291, 44545, 1796, 7740, 26311, 3241, 13127, 35754, 3993, 21618, 2558, 22041, 3712, 35298, 5853, 39715, 10127, 45487, 3091, 3371, 856, 1559, 37191, 19251, 45604, 12094, 16958, 45601, 4856, 19326, 36141, 2705, 44927, 44548, 45384, 12824, 3849, 1877, 45466, 1069, 22905, 1695, 3307, 45626, 36837, 21628, 26184, 8784, 3290, 3174, 25197, 6471, 949, 4033, 8487, 43683, 23364, 7035, 6494, 6492, 14009, 14037, 2067, 6811, 39517, 43438, 42663, 43916, 44845, 21220, 5243, 10329, 29097, 8149, 6698, 17466, 38284, 4070, 8924, 433, 23738, 7939, 2003, 27001, 29657, 37013, 22277, 23546, 668, 25904, 8035, 4788, 14362, 6482, 5680, 14125, 11350, 23740, 26846, 33292, 1563, 2168, 4493, 36849, 43030, 9508, 3488, 29151, 1655, 38533, 36677, 2057, 27870, 1742, 5624, 8149, 5842, 1297, 45665, 44464, 13409, 10826, 4110, 1855, 6336, 8002, 39293, 1995, 17200, 905, 2967, 44993, 29547, 12190, 20541, 28605, 44796, 42250, 32318, 1083, 31093, 3388, 1458, 11790, 1046, 16103, 44165, 2001, 33734, 13307, 11400, 44207, 29123, 2774, 30289, 16093, 1484, 9661, 43870, 14252, 2043, 44158, 11895, 9631, 28570, 30972, 6815, 1613, 6008, 17400, 11337, 27864, 10874, 22327, 31584, 7088, 20481, 1949, 45497, 4506, 38201, 1647, 16733, 28701, 29238, 41358, 37513, 26804, 5008, 14654, 21706, 2551, 19311, 28170, 25904, 1149, 1448, 11420, 14566, 2540, 3938, 8244, 2136, 44337, 41762, 23647, 43428, 45355, 43024, 43297, 43647, 44345, 23169, 44347, 41407, 23018, 43653, 43143, 40590, 39050, 43046, 18604, 42426, 24827, 42428, 5145, 42430, 42406, 12738, 42478, 43641, 42437, 42412, 3757, 10246, 38573, 6509, 9726, 16896, 9320, 31293, 6731, 3160, 37337, 11607, 31386, 19926, 9169, 9174, 20161, 14696, 20058, 40315, 44377, 42460, 27745, 20833, 7242, 42465, 17642, 7740, 18049, 42470, 27242, 34124, 14451, 4174, 5751, 11420, 42369, 34987, 11476, 14491, 42482, 25032, 38167, 2776, 42486, 17089, 42480, 42489, 45513, 16434, 30657, 1673, 1678, 9739, 1370, 42497, 11792, 42499, 39696, 19399, 29539, 10151, 1671, 42505, 9674, 15646, 10733, 22572, 1212, 42511, 45721, 41655, 23025, 1227, 40727, 2496, 1748, 20596, 21355, 9338, 1917, 43521, 13247, 43773, 1535, 5664, 4697, 5386, 15082, 27818, 38462, 3652, 36496, 26232, 2485, 2400, 35332, 22228, 3762, 11418, 13210, 21708, 4918, 5883, 28368, 1139, 12669, 16607, 14344, 2708, 19913, 4434, 20692, 9761, 4028, 23714, 12390, 1308, 1364, 4489, 7215, 23690, 10725, 2454, 16007, 14324, 7216, 839, 45939, 45936, 3075, 19780, 45349, 38916, 11146, 16886, 44614, 20879, 4231, 1541, 10891, 6572, 29547, 1016, 45103, 28991, 1008, 2154, 25587, 13486, 14348, 1453, 18187, 28678, 43361, 37399, 35592, 22845, 28298, 28761, 11308, 873, 5265, 15717, 29565, 4231, 8907, 6517, 1196, 4777, 28301, 29174, 4673, 883, 15620, 12808, 10006, 29109, 9991, 977, 11795, 12833, 9991, 29467, 9437, 16772, 10423, 21652, 9254, 9111, 7048, 3829, 9525, 892, 11317, 3489, 1769, 1407, 23849, 44217, 43812, 46015, 40164, 28603, 44945, 12986, 13838, 9319, 26122, 2646, 13199, 36971, 3350, 12847, 33873, 13298, 4205, 4908, 32393, 24964, 3439, 24427, 2453, 13128, 12251, 13889, 1213, 1548, 43361, 39597, 33033, 35740, 4873, 10717, 18620, 37438, 27382, 31407, 9605, 2454, 23289, 31093, 1614, 31376, 14014, 13211, 27588, 8479, 3802, 9158, 5739, 4749, 17000, 30477, 46070, 15324, 4292, 32906, 25832, 31370, 14120, 1429, 30681, 14022, 13112, 22006, 6107, 5084, 22383, 19810, 22437, 4006, 6581, 3356, 7088, 37037, 4691, 3451, 6298, 43228, 37208, 27610, 29128, 18919, 40601, 891, 9388, 9348, 45089, 31209, 9470, 21996, 15466, 35285, 2043, 30984, 14109, 25587, 6488, 3292, 11703, 42474, 25168, 22767, 24198, 20713, 35547, 35540, 37308, 1654, 12200, 2892, 46117, 14380, 10750, 26245, 15493, 45888, 41944, 44050, 25675, 42921, 43652, 23525, 43425, 42670, 45353, 45791, 44168, 29614, 45795, 44172, 44346, 38152, 487, 27006, 31873, 15791, 20162, 17548, 4466, 10158, 6609, 22543, 30172, 46161, 13360, 20166, 1879, 17608, 7728, 29532, 44390, 22044, 20166, 39745, 46161, 17554, 22552, 46158, 17828, 1647, 46165, 46135, 31442, 2230, 24133, 17221, 8370, 37096, 1376, 9437, 2064, 5887, 7227, 35944, 6466, 30796, 9365, 3659, 25175, 27439, 17991, 1009, 19331, 7594, 29422, 42777, 41278, 43923, 42760, 19462, 7822, 42965, 42396, 44041, 20075, 41850, 43913, 42421, 43101, 42083, 43103, 45367, 14379, 2971, 41469, 5389, 29583, 21381, 25604, 4876, 5232, 14646, 1262, 2600, 44649, 10968, 4701, 40138, 44676, 24928, 18676, 2787, 21394, 4639, 36783, 42477, 15647, 17659, 45010, 44083, 28666, 26122, 3347, 1749, 7988, 16952, 43963, 17224, 12106, 9201, 11259, 25383, 24490, 6466, 5879, 35190, 18125, 14113, 42583, 21669, 34032, 41731, 1760, 13054, 25950, 10339, 2101, 14108, 45043, 6371, 12252, 44680, 10635, 5994, 14129, 3519, 5851, 14252, 45121, 2037, 30319, 33977, 10500, 31223, 11736, 20181, 31360, 11308, 45852, 22173, 43964, 10217, 15704, 6662, 33967, 2140, 13320, 13562, 35128, 13324, 9031, 28302, 17056, 1732, 2009, 5573, 5954, 20534, 45289, 24520, 8665, 38762, 43543, 23348, 1935, 2008, 15735, 11450, 21771, 1446, 31339, 1511, 7203, 19035, 16949, 39924, 25296, 423, 1212, 9693, 35144, 10009, 45191, 27854, 3350, 24571, 1393, 1315, 18166, 6465, 11327, 34060, 3658, 26152, 1274, 23759, 1794, 1555, 24838, 35715, 1489, 1787, 1912, 4656, 6143, 19816, 1935, 1122, 2460, 14125, 5001, 11855, 5190, 12896, 19622, 11597, 35768, 15244, 5838, 9065, 1272, 13571, 8102, 3353, 30420, 10009, 16966, 1397, 14469, 2346, 24594, 25786, 30534, 9998, 8836, 2849, 12123, 13364, 12268, 22834, 25666, 1315, 21692, 26677, 43247, 1956, 13605, 21640, 44907, 45698, 1210, 1225, 28838, 3320, 40750, 44815, 15990, 27581, 43710, 15189, 2417, 8865, 11399, 5116, 10067, 37406, 9104, 27349, 3183, 4535, 9420, 3285, 12825, 36189, 11600, 18043, 16300, 5693, 18207, 6842, 40627, 35292, 15240, 10430, 31331, 30948, 1427, 2633, 6598, 12817, 16225, 3529, 2108, 28399, 17541, 40353, 24278, 39295, 5873, 3014, 5881, 3042, 9243, 6844, 26718, 2149, 17439, 26852, 13054, 31118, 37039, 39440, 2697, 31478, 19893, 10068, 16651, 9670, 13364, 16018, 19228, 1398, 42441, 11541, 3479, 15163, 5196, 1205, 19400, 3795, 6115, 14687, 46372, 12111, 30828, 6590, 37635, 9249, 1663, 1110, 29058, 11344, 14715, 22027, 7514, 4716, 22741, 1900, 25343, 17601, 19838, 4273, 3000, 4031, 2034, 6643, 2929, 2343, 36100, 34713, 6653, 9185, 6572, 4816, 32713, 15108, 14669, 3781, 29678, 36790, 44809, 21377, 12007, 1881, 2474, 12542, 12203, 8709, 3086, 14766, 33795, 12634, 5005, 32981, 28909, 13707, 7059, 17989, 9086, 20047, 8157, 23555, 1489, 3715, 27285, 11538, 9171, 26076, 43844, 33467, 589, 9720, 22980, 1406, 29139, 41962, 9587, 4571, 17435, 16742, 2989, 44900, 19167, 7062, 3790, 24602, 25260, 45351, 43426, 46144, 41764, 45792, 44342, 43431, 46148, 45359, 42731, 41461, 44349, 23405, 46181, 31090, 25611, 2537, 1072, 35981, 17450, 7169, 20574, 10658, 17097, 38040, 10560, 7069, 16968, 19169, 45265, 44819, 13698, 7730, 9292, 5636, 2308, 44874, 14113, 43774, 14712, 18066, 28575, 21282, 29718, 44964, 44098, 3162, 11529, 4837, 5820, 18669, 1393, 2037, 13551, 4021, 2172, 6007, 4084, 21193, 17784, 36724, 2321, 35517, 1538, 19000, 13790, 7778, 37287, 21276, 39805, 863, 9152, 35909, 42582, 46590, 35885, 38180, 8941, 22296, 7969, 5745, 12195, 6668, 12215, 2157, 17548, 12077, 24595, 19520, 29249, 15162, 6313, 27906, 36943, 3142, 23774, 10078, 9277, 30185, 35083, 2745, 12774, 6713, 17430, 17835, 9531, 11142, 6997, 12892, 37377, 26310, 19639, 28544, 20565, 1080, 27250, 2100, 8935, 3994, 5209, 2026, 3950, 37900, 39687, 6692, 42456, 2994, 14505, 4028, 30171, 10560, 2186, 45788, 42648, 25682, 45354, 46146, 42675, 25508, 46585, 43434, 42732, 42821, 42734, 45802, 40698, 43045, 42738, 18604, 19541, 15814, 16449, 1255, 19505, 3331, 4505, 16036, 17050, 16036, 1761, 3144, 4682, 31553, 7798, 45212, 26995, 31139, 6583, 9270, 2460, 14461, 6805, 33909, 42497, 5672, 17626, 9428, 3066, 2834, 2286, 2736, 5146, 42239, 1469, 40642, 30148, 36094, 26096, 26992, 2646, 14319, 4164, 29677, 6027, 12266, 9308, 2008, 9308, 15905, 30928, 45769, 27862, 494, 19372, 26205, 13876, 2466, 24188, 27186, 8095, 11518, 12223, 3791, 17973, 9646, 4209, 12677, 5154, 2398, 10121, 2486, 36007, 29461, 16245, 16820, 25367, 2041, 40301, 34206, 17173, 35360, 1761, 9152, 5407, 9544, 8918, 37663, 25296, 13303, 10989, 19501, 3994, 12422, 1055, 12425, 319, 38852, 4417, 9090, 9125, 45955, 15288, 3061, 45624, 28205, 30255, 3820, 45197, 3581, 857, 45406, 12477, 11186, 869, 881, 29508, 22896, 9411, 2839, 28048, 22872, 2200, 4417, 16394, 25197, 2888, 35811, 13018, 44843, 40338, 38582, 38634, 30928, 35464, 7648, 31033, 10412, 17422, 46863, 4707, 6590, 2031, 25759, 5880, 44528, 10251, 1492, 10500, 16731, 3343, 20316, 25230, 12388, 25737, 3387, 17422, 46878, 1503, 16121, 13338, 46871, 4650, 34978, 31040, 5348, 2067, 14906, 4204, 9976, 12532, 1234, 36007, 3882, 44587, 13865, 22368, 9469, 44644, 30400, 21023, 24192, 3701, 42594, 18088, 24192, 4327, 46773, 17586, 1850, 1065, 45450, 3554, 25713, 20513, 17617, 1090, 45275, 3309, 4033, 2749, 19381, 30311, 11607, 46913, 21023, 1261, 2661, 22404, 954, 46924, 2452, 23736, 39080, 1800, 7230, 42317, 23671, 34402, 46907, 15082, 24701, 35960, 31579, 4795, 11454, 35179, 46845, 20289, 856, 5311, 45159, 30405, 43630, 28935, 22400, 8935, 13625, 6234, 3435, 3842, 27570, 6700, 9084, 44725, 8622, 46275, 24959, 43469, 9002, 6091, 45248, 45587, 30395, 26203, 23269, 45289, 1853, 6142, 6010, 3726, 25702, 33433, 28850, 15237, 43886, 841, 6928, 27813, 6925, 46909, 13865, 36007, 40118, 4302, 45704, 46943, 18226, 30400, 15871, 15550, 4302, 44668, 22173, 17088, 37327, 30402, 43160, 46898, 44632, 46218, 43440, 42975, 31350, 5243, 9722, 4480, 10042, 21380, 22014, 2829, 26029, 14495, 15220, 31538, 23740, 46822, 22151, 8244, 17213, 16152, 13562, 15733, 24446, 17578, 20741, 1695, 14530, 9863, 6010, 1396, 12768, 1484, 1555, 34306, 14862, 12476, 8791, 5745, 17429, 5209, 14777, 10976, 9429, 7951, 5762, 1944, 6912, 5691, 34417, 45061, 904, 3174, 46946, 34203, 46432, 31167, 9610, 6643, 34407, 10455, 46866, 13044, 1363, 30824, 4620, 13051, 37250, 9997, 28836, 28068, 39015, 1675, 8117, 16324, 45583, 11700, 1799, 11505, 11730, 21754, 35110, 8017, 6487, 8075, 4011, 40627, 27872, 5724, 11871, 27210, 15182, 26181, 30181, 34288, 20588, 13507, 2272, 18668, 44291, 1387, 34985, 15191, 31483, 42369, 35034, 1088, 1266, 25534, 13974, 6599, 3035, 36835, 4856, 12374, 17126, 9338, 12895, 19497, 15084, 44389, 37396, 18227, 30677, 14527, 3722, 43253, 977, 36834, 31105, 35253, 45518, 12390, 17406, 23758, 1675, 11509, 3457, 960, 42094, 24895, 25125, 40668, 1262, 40259, 39849, 10343, 13590, 8471, 40278, 4432, 1051, 37690, 39675, 26031, 17870, 14498, 2712, 36078, 44625, 14660, 3511, 43480, 8630, 9998, 3769, 9713, 25022, 8610, 46410, 14818, 11628, 9276, 9429, 11972, 10606, 12476, 8133, 21432, 35164, 3202, 26184, 13140, 33796, 33558, 26070, 14953, 30432, 12880, 9296, 4429, 5112, 4708, 32980, 34460, 4669, 6495, 1199, 4782, 1674, 31453, 29105, 13352, 46276, 24136, 3010, 36155, 8452, 23984, 5977, 34422, 6807, 25030, 16546, 4998, 9168, 8245, 37736, 22195, 27927, 3916, 16613, 25540, 1481, 1441, 27213, 2742, 36858, 30711, 31182, 38457, 7076, 14738, 29451, 45244, 11058, 10565, 24844, 31377, 12359, 22393, 7787, 5080, 9557, 20763, 3222, 14890, 10087, 2774, 43937, 15257, 2417, 47143, 4336, 8115, 33966, 17430, 45828, 9193, 11422, 34413, 30065, 45371, 7069, 43611, 3783, 14610, 15232, 4985, 1690, 12454, 9884, 15228, 2545, 21890, 37338, 18185, 15629, 16931, 13240, 15146, 27008, 6480, 9039, 3049, 5850, 37195, 7752, 9446, 2637, 32981, 2767, 29550, 11886, 19648, 26039, 29558, 10326, 45021, 9381, 27886, 16662, 9365, 46412, 27234, 28828, 11585, 18636, 36981, 24878, 21363, 7002, 1822, 7306, 40568, 5939, 11756, 1022, 3497, 39269, 23361, 2774, 17989, 11730, 9319, 8111, 5865, 30995, 9342, 14058, 21640, 21804, 32823, 13865, 21794, 45782, 11628, 3356, 25160, 1155, 3515, 37612, 17224, 13081, 3644, 16717, 10215, 32996, 13569, 17494, 14469, 1207, 2657, 24278, 16640, 1479, 15801, 46554, 47126, 35919, 43222, 25879, 2854, 14753, 3329, 9507, 9740, 32856, 26746, 9751, 1484, 28600, 10421, 5782, 4166, 3455, 47189, 5514, 14855, 5922, 25787, 23733, 1446, 6709, 25623, 1947, 9673, 13290, 21645, 32432, 1274, 46445, 47238, 12212, 18437, 1613, 24215, 31631, 28197, 5785, 14698, 2903, 9065, 23365, 14875, 8455, 9507, 11270, 3711, 7211, 28701, 6252, 948, 23188, 4155, 27541, 14503, 43703, 13499, 17440, 5158, 12762, 3057, 11700, 12763, 11672, 5227, 6008, 16592, 32889, 36057, 28587, 5537, 6758, 13210, 17656, 22213, 9002, 2258, 9152, 37244, 14323, 34465, 25930, 2835, 11662, 27888, 6503, 4118, 11510, 35164, 6869, 45749, 12472, 913, 1879, 23376, 8061, 4291, 1274, 10408, 2668, 3697, 13539, 9006, 36402, 40200, 8610, 6091, 47050, 4016, 2005, 3633, 2469, 13469, 14690, 11517, 12472, 317, 34051, 46624, 4506, 4369, 2086, 10751, 15024, 5429, 20970, 15814, 6032, 42579, 20047, 14877, 7241, 17552, 2782, 12773, 6028, 26096, 46664, 3027, 1098, 16565, 5021, 16449, 14089, 3962, 19175, 30043, 22311, 46460, 8273, 3420, 13144, 15329, 3253, 9587, 31136, 17205, 6482, 16742, 3656, 37163, 27936, 11334, 6308, 5728, 46273, 35328, 43576, 19366, 1282, 3014, 26086, 24610, 1152, 5749, 15005, 31549, 7058, 10683, 32823, 16685, 7305, 15387, 11336, 16470, 43794, 3948, 32999, 13554, 47254, 30348, 44419, 8838, 46470, 15091, 1361, 1766, 25903, 25405, 10245, 2072, 1503, 14946, 12028, 23849, 2584, 1305, 42449, 7799, 5009, 1652, 1366, 12966, 46773, 15803, 8002, 22382, 1472, 1046, 16683, 17577, 39858, 16415, 13632, 33029, 4026, 3012, 15228, 43509, 1285, 2957, 23272, 2214, 19778, 26090, 2798, 15000, 16550, 24345, 13222, 33441, 47094, 16550, 36701, 43993, 2088, 20419, 33737, 17417, 35805, 5805, 3591, 13273, 24336, 3044, 11235, 6384, 37635, 8974, 4494, 10258, 5691, 19746, 12756, 14626, 46369, 3711, 23675, 46538, 43238, 25232, 1614, 8245, 1400, 35737, 14790, 21421, 12805, 2674, 13185, 12313, 23298, 3613, 7073, 29861, 36162, 9547, 34207, 1128, 2264, 8631, 47480, 12388, 13294, 29220, 3434, 43595, 6700, 4430, 33648, 9223, 3529, 1811, 9080, 16416, 19395, 13349, 3025, 42488, 14972, 13615, 3510, 32824, 1545, 11316, 3510, 30624, 15729, 17533, 3714, 8968, 17004, 4219, 13333, 21805, 12028, 13257, 47607, 8134, 47512, 4789, 12335, 31838, 12875, 4414, 45732, 4001, 1202, 41746, 16153, 16667, 26006, 40107, 7341, 6718, 1230, 24696, 34445, 2558, 46808, 12835, 9319, 3727, 894, 16455, 36868, 2040, 11424, 13494, 24103, 5102, 12122, 17367, 1669, 15342, 5152, 12061, 15620, 31663, 30421, 46063, 25880, 5805, 37341, 37832, 24597, 34118, 16742, 2961, 12316, 44307, 13254, 14849, 38953, 21410, 8337, 9228, 9228, 8464, 13308, 15646, 9397, 2829, 45951, 17562, 47411, 30753, 45960, 963, 5533, 8785, 27820, 31805, 14549, 47769, 30332, 1950, 8156, 33802, 24157, 33732, 11405, 15988, 2097, 13009, 10421, 25426, 5879, 37323, 4421, 21020, 2258, 22223, 43326, 29157, 40025, 25604, 32460, 24732, 4032, 2069, 36050, 47267, 36721, 13135, 37499, 10714, 7221, 13927, 18087, 47167, 47162, 37610, 3490, 37793, 33897, 7809, 6753, 27128, 4463, 14393, 9174, 39830, 17233, 14994, 5285, 5830, 30190, 11281, 15009, 12798, 4457, 2455, 6468, 27154, 17448, 4489, 32808, 9976, 35480, 8447, 6517, 31624, 45666, 10699, 1766, 36496, 45311, 32533, 12349, 32438, 6963, 16137, 3291, 8677, 5206, 26087, 4493, 7099, 7556, 2665, 45918, 4870, 901, 20844, 3193, 15329, 25012, 869, 27119, 5736, 31134, 5066, 14092, 5020, 3433, 15287, 40013, 46523, 11244, 45052, 24811, 21105, 15733, 29603, 11415, 24998, 13495, 11576, 1808, 8104, 34167, 34372, 7566, 25003, 24838, 37568, 10720, 30192, 2499, 6263, 5633, 19760, 45149, 1186, 1463, 16550, 1212, 3453, 8452, 9168, 4199, 18127, 3294, 13101, 1276, 36445, 25749, 40238, 16594, 16743, 44187, 14934, 1284, 19683, 16872, 4033, 41638, 42960, 41137, 19105, 29356, 41844, 42395, 40584, 46213, 22598, 42788, 46216, 45650, 43915, 44352, 45653, 23260, 12537, 5868, 10264, 1270, 12293, 24312, 8397, 25350, 15480, 32079, 37041, 33977, 17867, 43777, 14798, 3395, 11315, 12077, 15229, 12062, 18927, 11667, 20604, 34437, 45998, 40665, 27813, 2698, 26073, 4327, 27933, 12114, 14102, 8586, 12144, 33034, 6492, 45263, 12805, 25350, 8684, 16211, 37001, 10693, 5691, 6590, 28910, 44018, 10406, 6602, 3367, 10613, 10257, 10149, 14102, 1532, 2924, 32107, 26288, 3405, 1664, 17834, 6285, 6674, 4044, 8097, 2463, 18116, 11376, 13094, 1090, 28701, 44711, 20677, 46034, 8040, 43549, 47436, 36978, 18056, 2469, 37249, 1802, 18668, 32784, 9337, 34268, 39866, 6067, 30043, 34402, 46371, 39423, 9993, 44372, 27518, 5817, 5378, 11139, 35796, 47776, 24386, 10562, 47552, 6132, 29476, 36177, 2861, 9437, 22000, 9625, 15765, 28977, 22523, 10986, 31949, 45546, 19881, 26073, 8624, 20308, 17918, 3915, 13256, 5125, 29689, 29856, 29691, 2909, 2010, 1992, 48071, 19881, 27439, 14771, 10698, 37431, 10990, 15767, 22533, 2096, 31912, 3152, 1736, 31611, 6807, 1270, 14883, 4040, 29693, 4500, 6867, 30172, 2786, 2923, 6993, 3919, 10660, 6359, 4120, 19761, 32207, 38916, 3125, 32059, 1309, 22312, 5697, 12522, 35950, 41423, 4037, 16861, 37225, 8023, 17398, 6715, 24194, 5551, 14560, 2157, 2586, 9247, 1497, 24212, 1403, 2014, 47630, 6986, 4085, 28477, 23849, 47570, 11738, 35789, 16895, 4463, 5534, 37543, 7792, 18226, 1114, 9732, 2557, 46091, 14359, 7964, 28014, 32815, 18237, 3453, 46396, 1380, 1049, 15998, 27876, 25141, 27175, 5180, 29152, 19490, 44276, 12374, 2018, 1195, 18057, 6832, 25195, 13056, 5808, 1048, 15831, 16957, 9153, 4965, 47766, 25919, 38470, 28834, 9916, 12774, 3797, 1362, 16412, 18272, 7117, 43997, 12125, 14580, 21900, 6480, 12289, 6071, 32403, 9946, 4647, 17426, 1652, 4710, 7162, 34815, 12857, 23621, 8120, 7106, 26477, 14008, 2051, 7530, 7085, 20648, 30310, 8446, 45545, 10341, 4871, 47015, 43439, 44634, 42424, 29527, 11202, 37097, 37460, 41440, 23267, 36277, 36245, 41594, 26531, 3774, 36227, 12530, 24044, 2354, 24395, 26388, 7712, 42741, 38099, 40869, 26421, 48242, 37129, 23043, 5273, 42155, 34605, 22106, 42013, 22712, 41923, 25084, 41883, 34613, 44045, 42622, 47949, 40339, 37920, 1376, 24626, 23193, 39145, 1540, 4921, 7637, 26041, 26899, 6511, 24588, 8804, 28186, 3344, 37540, 25370, 46050, 1274, 8337, 47332, 4172, 21581, 12989, 1242, 3035, 9765, 6643, 7104, 35488, 40020, 12613, 12298, 8644, 10705, 30426, 47489, 5123, 14197, 32936, 24233, 37875, 47935, 43922, 42779, 41705, 42393, 19463, 41845, 42784, 40395, 43910, 44042, 7606, 42971, 48267, 42771, 45652, 48270, 36898, 2971, 17377, 2224, 42607, 22540, 39507, 41801, 36844, 38579, 46779, 19870, 20536, 23273, 3299, 27250, 15659, 857, 962, 34292, 13210, 38201, 3070, 11483, 29819, 29033, 14799, 44094, 2037, 12426, 5873, 4324, 17422, 13873, 4044, 7282, 44162, 14627, 1928, 41304, 6004, 9292, 9035, 3418, 9033, 9155, 47991, 8381, 25168, 21751, 5158, 14617, 2854, 12896, 33692, 12330, 11738, 37176, 5691, 8609, 8462, 34983, 44491, 47397, 14878, 27212, 15329, 27190, 1285, 34606, 39852, 9061, 11653, 15333, 2028, 6656, 1539, 13300, 30718, 1934, 10139, 21953, 10542, 5786, 28965, 20845, 13294, 12383, 4668, 34206, 29104, 4177, 45125, 24104, 9716, 2005, 15158, 1821, 22312, 1813, 43415, 10082, 17453, 33947, 45821, 21072, 860, 47345, 46549, 26464, 20813, 11183, 15667, 45259, 15602, 30197, 2497, 5889, 12212, 41563, 31683, 8378, 11192, 19894, 5873, 25761, 10252, 39019, 14627, 47588, 6495, 12043, 2683, 46117, 1443, 14494, 2453, 8357, 40101, 433, 1693, 38188, 11472, 35071, 13841, 9645, 1387, 17408, 1861, 10340, 24212, 36655, 9111, 13347, 12080, 14820, 34457, 14899, 33031, 23382, 1745, 1353, 12859, 11754, 8345, 18211, 37248, 45001, 43501, 6010, 12770, 39895, 37206, 3020, 2721, 44214, 7743, 29585, 25758, 970, 36963, 26095, 14197, 47996, 2582, 34087, 1116, 17418, 2075, 5900, 14581, 29779, 15221, 46805, 34099, 12427, 14997, 47367, 9273, 10742, 1152, 2505, 27349, 23469, 1145, 25376, 9627, 41715, 47016, 48230, 43441, 29527, 39417, 9381, 1497, 11867, 14792, 17392, 29573, 42432, 16603, 3919, 32995, 8709, 1911, 4995, 30928, 46484, 13926, 18093, 34456, 40180, 10259, 5398, 43186, 7028, 2047, 47037, 46319, 4230, 47750, 7815, 2092, 14240, 6343, 11483, 7293, 14830, 4780, 5810, 15085, 1531, 33873, 43326, 43286, 6734, 47795, 2762, 9110, 3662, 12159, 42480, 22039, 8935, 21823, 16640, 3656, 1472, 9049, 4698, 8806, 4506, 15045, 11529, 14114, 16900, 6588, 20142, 12468, 7053, 1447, 6511, 3657, 8102, 2073, 7938, 10312, 14480, 24835, 7064, 949, 47685, 5075, 33998, 13271, 1116, 36090, 16759, 17622, 25114, 3029, 1292, 3631, 6032, 5006, 25592, 28276, 38196, 1620, 19683, 32021, 14701, 39807, 37654, 14731, 7115, 15160, 26951, 22374, 6756, 2988, 2725, 8247, 22045, 17913, 25208, 956, 15840, 39334, 32246, 46966, 40227, 9089, 39204, 13596, 3431, 25708, 32439, 30420, 21417, 20444, 37704, 10332, 24278, 11782, 10221, 27773, 42124, 33692, 48487, 15093, 11515, 11879, 5197, 3000, 24605, 10751, 1695, 5831, 45714, 5646, 46648, 1567, 15655, 19393, 1671, 30663, 27570, 13103, 14935, 45286, 39804, 3855, 2721, 5146, 9287, 3820, 1855, 46894, 6892, 8074, 15663, 38956, 25424, 46304, 11484, 46458, 33847, 14701, 3561, 22412, 43160, 47442, 1751, 4866, 15009, 25604, 21423, 32970, 28859, 2267, 31242, 5761, 24899, 29147, 25160, 45070, 1776, 16027, 13621, 1821, 5568, 26152, 4639, 7554, 19648, 10109, 9160, 18196, 5185, 10492, 29547, 13557, 6994, 30215, 28628, 11766, 45729, 34294, 7884, 17801, 1986, 34212, 46387, 3819, 39929, 43276, 12896, 5122, 6718, 2455, 11235, 14546, 7229, 2829, 44200, 15735, 48145, 27887, 10207, 43834, 6319, 2043, 44842, 45364, 43102, 44635, 43081, 21013, 17669, 26976, 2751, 22723, 1930, 1655, 5992, 41805, 4857, 5485, 43727, 6709, 47307, 4859, 1202, 1359, 14624, 31226, 48623, 2482, 12820, 34237, 21151, 12892, 1362, 29301, 11253, 3331, 9664, 1373, 43669, 1364, 13882, 37635, 15721, 8164, 46429, 31138, 22327, 22369, 33409, 26807, 1620, 9028, 1191, 5429, 32310, 3293, 7585, 21761, 3292, 1134, 31955, 13558, 48820, 5785, 13562, 5553, 30796, 29166, 43177, 24769, 10097, 1207, 11706, 22368, 31155, 25756, 5873, 26955, 46721, 42526, 34569, 41352, 13231, 13830, 15197, 8361, 30238, 16245, 20695, 48056, 1446, 4031, 30736, 2074, 44230, 14538, 5920, 16912, 1788, 1391, 16123, 8846, 34172, 14030, 3016, 5216, 11872, 14546, 24345, 25381, 3319, 46738, 16398, 6003, 42094, 2721, 24587, 4213, 36050, 39760, 44091, 13872, 24625, 3007, 37724, 32800, 3671, 9377, 3351, 20861, 15969, 43733, 35265, 6183, 10129, 31131, 31867, 30049, 47689, 2831, 28913, 14871, 45877, 13980, 7970, 6997, 10072, 4304, 35213, 1740, 36496, 27911, 17215, 10000, 4799, 40296, 34346, 21941, 9046, 31154, 5122, 15284, 30786, 9466, 32897, 33767, 37313, 2742, 30328, 2043, 22372, 10714, 7973, 2821, 13309, 29693, 21340, 8400, 2999, 26122, 5848, 45085, 8650, 8403, 1143, 11546, 9547, 11142, 2466, 40108, 34035, 27081, 29564, 21592, 30315, 22413, 17376, 13088, 29636, 14287, 9337, 26196, 13369, 9229, 24992, 6329, 37900, 1383, 5123, 46253, 921, 31494, 47240, 34359, 9710, 17203, 7745, 11400, 11741, 34296, 16176, 1544, 16873, 15023, 47055, 19752, 13258, 48558, 30759, 11547, 1291, 13851, 33470, 9547, 21620, 33892, 11564, 47455, 17001, 13054, 398, 7101, 37025, 48938, 4152, 12166, 31228, 5942, 40292, 6006, 9660, 11258, 1881, 21055, 9317, 6634, 21408, 11400, 7646, 40297, 6031, 9161, 7778, 9339, 17667, 19508, 3314, 12819, 2029, 10066, 26878, 46651, 37920, 1931, 5983, 6216, 20447, 31793, 8452, 27205, 37270, 21385, 21115, 8641, 2189, 28296, 44881, 8685, 4391, 48463, 49061, 34403, 7225, 10009, 21826, 18179, 32645, 31517, 45129, 38561, 16434, 21364, 38561, 49077, 16316, 23415, 49080, 32645, 7383, 35664, 28795, 2373, 963, 41874, 2146, 46935, 1395, 7728, 7254, 12287, 6119, 10049, 2640, 2171, 911, 46130, 49061, 36873, 7256, 4977, 42823, 48859, 43204, 48861, 41465, 8819, 1225, 12014, 43518, 31529, 19741, 23182, 9466, 30440, 925, 1316, 17939, 2649, 26201, 37044, 8337, 49102, 1659, 44306, 31016, 29585, 38370, 9183, 2966, 26110, 2639, 13535, 14205, 6945, 27697, 12559, 28878, 28089, 48337, 9464, 23376, 7232, 5597, 5692, 2236, 24715, 35094, 48974, 13839, 13264, 46375, 2976, 45582, 39847, 17392, 29535, 21359, 20679, 19482, 7117, 48337, 20057, 1850, 17448, 37727, 881, 14058, 5977, 2071, 30865, 21546, 13303, 32897, 3479, 37419, 11731, 2721, 6168, 14935, 9501, 3641, 48501, 2109, 10001, 33991, 3071, 45500, 45343, 8097, 5728, 10732, 2991, 18062, 7779, 21681, 8361, 34415, 8703, 19893, 47153, 8928, 46731, 945, 44365, 17101, 1986, 9094, 1416, 9565, 29480, 19042, 5811, 1436, 46709, 23646, 41339, 44167, 23244, 46147, 42729, 46149, 45797, 43435, 46719, 43437, 40920, 44633, 44177, 48231, 38057, 22842, 12439, 12385, 6662, 31840, 45259, 16248, 2924, 1852, 30053, 25946, 1986, 15729, 42442, 4410, 7035, 37765, 4253, 34065, 1376, 8152, 2068, 44470, 10039, 43571, 12374, 16768, 8425, 3392, 1199, 16263, 24545, 18147, 7263, 36093, 49258, 17667, 49260, 19321, 46657, 32920, 1788, 3014, 49267, 13559, 9438, 5541, 11303, 3356, 9718, 23054, 44152, 48151, 11168, 30649, 7112, 8070, 3640, 8703, 26253, 4117, 29206, 11914, 20560, 28126, 25007, 14157, 914, 13483, 4852, 30646, 31962, 3411, 14093, 12767, 49297, 11988, 3715, 49300, 6944, 37696, 12051, 47320, 14672, 6887, 16030, 19322, 29785, 1400, 48595, 39894, 1292, 10327, 3619, 34075, 6386, 20532, 43689, 25367, 13715, 2505, 24150, 2400, 42331, 5201, 33430, 17546, 2930, 49343, 10280, 46889, 37356, 46315, 6243, 9397, 9699, 14116, 31477, 9100, 1924, 11407, 45562, 10586, 5116, 3045, 42716, 11362, 19628, 44573, 25147, 4713, 12601, 4574, 2976, 5978, 14462, 21724, 6247, 2587, 4963, 49337, 10127, 26047, 3711, 8150, 42620, 48326, 42925, 31923, 40592, 31760, 27890, 31822, 7249, 1881, 3315, 45637, 494, 13541, 17241, 1199, 5805, 6559, 2141, 43510, 10551, 16230, 1412, 5802, 25543, 39880, 19886, 13338, 11315, 5848, 14709, 29539, 1073, 16680, 1260, 24215, 5726, 1508, 6132, 15179, 47150, 40138, 2637, 1193, 11102, 12766, 4045, 1110, 3655, 13911, 30969, 37559, 14953, 1749, 7972, 1282, 34460, 22365, 3486, 20852, 1018, 1138, 22392, 10030, 3353, 4341, 22560, 9520, 25730, 49423, 28540, 41499, 3758, 13902, 49429, 34427, 38479, 30981, 41967, 11468, 940, 21337, 8917, 3392, 1288, 16904, 2014, 45637, 48057, 3070, 11621, 43587, 11325, 24279, 4977, 2292, 1697, 1956, 10649, 24576, 11026, 24141, 35060, 38201, 31683, 15644, 3530, 10090, 47056, 42457, 28772, 14930, 44158, 3350, 2423, 8762, 27264, 6733, 27801, 18097, 1850, 33636, 5651, 3710, 16550, 14924, 10025, 21298, 46679, 20726, 13172, 39906, 5430, 16452, 48018, 3501, 47912, 977, 14888, 6646, 15684, 41840, 8075, 8660, 24105, 8605, 10971, 30999, 21414, 4069, 14513, 39815, 28922, 12845, 3710, 29701, 29014, 28871, 29826, 28873, 29820, 28877, 29821, 29010, 37552, 29818, 28884, 29828, 21631, 29017, 17032, 29019, 45443, 49542, 49552, 49557, 28881, 28899, 29840, 30067, 3993, 17799, 35796, 39732, 7078, 8733, 28818, 3012, 15694, 29665, 1402, 15242, 25720, 3052, 49574, 39092, 49219, 49569, 45391, 49576, 11713, 39079, 3853, 15088, 2106, 40047, 44731, 11713, 49592, 3298, 49590, 8179, 24579, 49583, 23067, 49387, 42973, 44844, 48329, 37458, 15067, 38529, 5731, 10175, 1911, 46086, 15625, 16999, 48911, 48614, 15647, 4053, 13169, 12696, 9188, 27516, 8246, 24187, 24483, 16232, 24280, 25403, 6343, 12147, 1212, 45834, 44186, 13879, 16871, 6945, 8074, 9539, 971, 8023, 15953, 22006, 5388, 30999, 857, 48117, 37865, 8685, 2097, 6877, 4475, 22362, 1448, 2540, 1242, 7051, 38065, 6997, 43182, 3299, 2846, 40750, 21640, 964, 29263, 5111, 1396, 6606, 19514, 34118, 44152, 10445, 21128, 48583, 9477, 14113, 9094, 48571, 16167, 5550, 15721, 5898, 26245, 2049, 39863, 7164, 31481, 29595, 41928, 25209, 19764, 4877, 37900, 49107, 25165, 5632, 13293, 6754, 43938, 6590, 11267, 31225, 11129, 12171, 15621, 10126, 48518, 4093, 30625, 27225, 22271, 5138, 9218, 9334, 14227, 10049, 29451, 43851, 23089, 13605, 4666, 9271, 2057, 44174, 41037, 44176, 41942, 44353, 39052, 36868, 42892, 44493, 14752, 47610, 33704, 30795, 24625, 20601, 48037, 20593, 44503, 12901, 46906, 2987, 44507, 3056, 34010, 19506, 28163, 21423, 44514, 23133, 43943, 47920, 5877, 44734, 1080, 15726, 19330, 2584, 40277, 3634, 1521, 586, 12076, 14111, 9080, 44486, 9049, 44416, 9531, 44490, 46864, 36827, 24828, 1725, 1561, 10971, 5094, 7421, 43230, 6301, 44461, 2097, 44463, 46942, 24579, 11948, 43807, 11626, 14733, 42372, 30046, 11601, 3330, 44475, 9502, 3970, 44478, 9225, 30058, 21284, 35319, 27640, 21626, 1132, 11135, 10694, 6237, 11079, 11914, 23299, 39837, 16733, 5563, 8096, 1314, 44427, 4770, 35499, 47691, 4081, 3467, 3757, 4604, 9153, 25755, 3514, 9542, 44439, 24747, 29271, 44442, 16166, 27090, 44358, 47357, 3715, 28568, 16781, 2771, 46259, 26992, 9692, 2734, 46194, 21005, 28878, 35199, 4800, 4335, 44375, 26765, 5128, 17704, 20663, 4978, 10227, 28465, 37344, 24605, 6690, 12071, 28278, 17663, 20171, 8820, 44392, 2697, 44394, 27063, 10129, 44569, 45043, 47396, 34126, 34273, 17520, 25152, 45927, 1563, 44406, 19074, 44409, 13562, 17546, 10277, 44413, 47143, 9386, 49769, 44428, 1053, 44420, 3008, 4019, 20709, 46823, 29595, 1078, 2734, 2500, 15832, 910, 1235, 1373, 49482, 30389, 15581, 24138, 20248, 27157, 10314, 1153, 12373, 3520, 1373, 38242, 44255, 37800, 6226, 11911, 25642, 49916, 10068, 44255, 49756, 20955, 49903, 33701, 20958, 5902, 11844, 48121, 4215, 20378, 15459, 24142, 15591, 10422, 26119, 6806, 24135, 47787, 43572, 20426, 21043, 48356, 46028, 15306, 8459, 13166, 8678, 27679, 9297, 44201, 1146, 31435, 1747, 44565, 15176, 26779, 37017, 13915, 4384, 48914, 46371, 3342, 49781, 32393, 3044, 2402, 13298, 40032, 11690, 15724, 14359, 14299, 7096, 47305, 19141, 9208, 27930, 2394, 33613, 1562, 5832, 5646, 32926, 43671, 19588, 2085, 9766, 7258, 11352, 11420, 17225, 12836, 36453, 15226, 2793, 33788, 13648, 4466, 14538, 4859, 43848, 1128, 26763, 12191, 19397, 21742, 21620, 26253, 49015, 6263, 1803, 26749, 17819, 30315, 12369, 1529, 23818, 7099, 32065, 977, 20527, 33975, 1962, 1466, 35412, 25341, 45943, 24241, 1466, 6422, 19612, 25692, 12984, 30400, 47046, 9298, 49657, 46951, 1727, 48022, 6997, 50042, 47746, 18612, 5746, 11845, 35454, 49517, 1397, 45146, 4033, 5614, 15154, 47784, 14092, 48086, 9343, 1934, 28910, 13328, 3445, 12096, 9588, 44623, 1118, 31957, 10132, 13218, 36251, 6871, 18056, 11091, 19271, 43949, 2144, 9468, 18056, 44599, 22495, 889, 26006, 33880, 14722, 19135, 8993, 31886, 50085, 46693, 21633, 11894, 48656, 3027, 7421, 47698, 1278, 3030, 1604, 15341, 31867, 48012, 2018, 14683, 11989, 10492, 15832, 50090, 31849, 50092, 2097, 40245, 5246, 3066, 12574, 28087, 23484, 5647, 44114, 15735, 44734, 8152, 4665, 34221, 34003, 38295, 12071, 24353, 36872, 38235, 5348, 49991, 27172, 37667, 10251, 33045, 10449, 15045, 46867, 48392, 8434, 10032, 11482, 50145, 24340, 1638, 45898, 45441, 34206, 17217, 9189, 34051, 9229, 46878, 17606, 25347, 50046, 17624, 10115, 38450, 4802, 2189, 6595, 45951, 30968, 3341, 35167, 19508, 9429, 1493, 10329, 13171, 7649, 7006, 10167, 9470, 30283, 21704, 2757, 9406, 37423, 3909, 10215, 4026, 27222, 50170, 14478, 21752, 35724, 6244, 6922, 31947, 34386, 10656, 12074, 25293, 9557, 12603, 45070, 35412, 9651, 6994, 9663, 17626, 36962, 33004, 31360, 4122, 38156, 50211, 47471, 16683, 20661, 15301, 11281, 27383, 2538, 16014, 45502, 31508, 11281, 16587, 628, 10558, 28830, 24253, 24920, 1769, 45834, 19827, 45959, 1775, 11179, 20522, 21862, 3454, 1285, 23746, 2451, 40083, 21847, 11644, 21862, 45424, 35820, 17704, 21977, 3339, 5213, 20377, 7201, 2069, 18272, 48853, 6747, 961, 26446, 15605, 6744, 4810, 29087, 14009, 48102, 47400, 12883, 6690, 33977, 25142, 13038, 7006, 30308, 11838, 3051, 3438, 1793, 50114, 1138, 27265, 43839, 31232, 13241, 12221, 31494, 22960, 13860, 24102, 1100, 4992, 43367, 5004, 6511, 50294, 34275, 5670, 3686, 37037, 16437, 14583, 5213, 5145, 47418, 17430, 12847, 12830, 25409, 13615, 4954, 19072, 9395, 2419, 35269, 22361, 43980, 24658, 4418, 1747, 27571, 6993, 29264, 5987, 8657, 5741, 14117, 4645, 49371, 16015, 12225, 13878, 46984, 44096, 49528, 39895, 21716, 18193, 46390, 6861, 14115, 8983, 3287, 4989, 3808, 5145, 9863, 3284, 2931, 33010, 14894, 50211, 22028, 30947, 50205, 34277, 46029, 3448, 7249, 15716, 40750, 4065, 9450, 1243, 20631, 7623, 43553, 37419, 24550, 21629, 16227, 39881, 25341, 19697, 45326, 18113, 9309, 37284, 5983, 25146, 47717, 22372, 6313, 36354, 3051, 2187, 19403, 22837, 1201, 8079, 16956, 17197, 49106, 48037, 6151, 31428, 17549, 6926, 8755, 7115, 11170, 32987, 11476, 33615, 16462, 31533, 10492, 35754, 31386, 4919, 47731, 2137, 44951, 5280, 7585, 10484, 34425, 47173, 48487, 48891, 39315, 31451, 16153, 35754, 16434, 7545, 50357, 2540, 2187, 26773, 12340, 8108, 35541, 33660, 50393, 5528, 9356, 8008, 36399, 42757, 41186, 42780, 42761, 47940, 46211, 47942, 42968, 40586, 43912, 20078, 48784, 46219, 48786, 43305, 2087, 27806, 9944, 43775, 20981, 6818, 47092, 46931, 11507, 14384, 880, 32077, 10203, 11991, 35399, 11557, 15586, 2751, 12262, 6175, 9411, 15174, 26754, 37546, 19709, 23415, 20647, 2794, 35033, 2037, 29096, 9163, 17088, 46929, 18446, 36623, 25910, 5553, 24922, 9552, 19386, 49567, 33751, 8253, 11759, 10025, 39497, 34291, 11726, 12390, 25893, 14773, 17229, 20998, 3577, 17145, 6715, 12606, 1748, 24848, 11959, 26882, 1405, 13264, 8040, 28791, 22047, 4488, 33685, 8400, 36162, 45288, 27646, 21755, 36007, 15639, 50484, 25033, 50486, 24192, 18711, 6783, 42028, 1987, 36219, 14005, 18180, 12752, 6514, 23268, 30761, 30694, 8934, 48032, 26722, 3849, 27537, 19584, 6393, 3774, 27455, 24818, 24733, 44199, 26730, 25087, 41449, 43309, 46578, 42536, 43294, 49228, 46714, 23313, 23013, 46586, 45361, 45800, 42923, 49601, 43144, 49389, 40700, 22059, 41985, 1953, 9903, 14155, 2971, 5292, 1070, 2262, 46015, 50506, 9018, 26477, 2067, 23881, 49067, 24303, 48620, 24219, 19042, 14392, 24220, 1628, 32939, 24611, 50599, 16484, 16442, 45194, 838, 50600, 45292, 23774, 35813, 45294, 13321, 4528, 35754, 45712, 18844, 50423, 19654, 41985, 21296, 5391, 2308, 46019, 7474, 4341, 50423, 50594, 16434, 7781, 15488, 8281, 9383, 11428, 6235, 35610, 1362, 50616, 5392, 22429, 38535, 48347, 44829, 2839, 1628, 25693, 44453, 14037, 50592, 39072, 45404, 41065, 49236, 48538, 49238, 48540, 31090, 22240, 25391, 2217, 4624, 2040, 3607, 37870, 46421, 14320, 40214, 1260, 2502, 8470, 14367, 44453, 39463, 21677, 37572, 15817, 9855, 27697, 27731, 3217, 31978, 48869, 37209, 15786, 14287, 12705, 15167, 3371, 19725, 37176, 39409, 2220, 50674, 46166, 10064, 49973, 8969, 17061, 41537, 31400, 29097, 25226, 1048, 26032, 45301, 13824, 48746, 1676, 21877, 2823, 45670, 4003, 36617, 29857, 16425, 13348, 14788, 9411, 8329, 4814, 35385, 1689, 29181, 19517, 8684, 50696, 12560, 4789, 14722, 29097, 35279, 38716, 15872, 3429, 6889, 37182, 23135, 50712, 25971, 14051, 13348, 2366, 50717, 4024, 21651, 2994, 50726, 29841, 11373, 46576, 43525, 50562, 44339, 50564, 41400, 46583, 49230, 46716, 44173, 46718, 43302, 46589, 46855, 43145, 49390, 25104, 24701, 12601, 4410, 15111, 10715, 15261, 13200, 24566, 22723, 6186, 46511, 30043, 33950, 37179, 12967, 9221, 25644, 48013, 2651, 4700, 13272, 16058, 33965, 16472, 9180, 8619, 22323, 47686, 11329, 8471, 2260, 2177, 19224, 10245, 15620, 13258, 31118, 25350, 16671, 13264, 37319, 16746, 17076, 14701, 28160, 17024, 9494, 2607, 8460, 2782, 34971, 38221, 48503, 1650, 14686, 9229, 39360, 17124, 10001, 31397, 1989, 21529, 25770, 50789, 20604, 14308, 23345, 7083, 19397, 16449, 15208, 13603, 2836, 2040, 37344, 11101, 9782, 47667, 23805, 49343, 12815, 20561, 9994, 46487, 10422, 34389, 29271, 5553, 14198, 9765, 1523, 1614, 6368, 9561, 25705, 5933, 19967, 9649, 37394, 44275, 933, 35262, 9356, 6230, 33701, 44969, 14650, 21023, 14010, 2110, 1366, 44430, 21360, 3653, 17448, 36834, 14605, 30038, 47151, 5203, 5652, 15477, 10134, 28820, 24150, 8465, 3953, 47917, 40200, 28059, 43889, 16634, 25750, 45833, 37235, 15057, 7183, 5108, 14252, 4570, 6719, 48277, 6521, 1986, 7030, 11621, 3025, 4859, 2088, 3017, 46628, 7118, 8466, 2074, 38958, 14340, 14192, 27927, 13456, 2108, 11387, 26022, 1677, 49349, 22802, 27991, 9664, 13505, 13906, 2028, 31570, 16154, 9037, 13973, 9425, 14667, 19682, 15286, 34990, 27697, 36015, 5554, 5167, 47028, 11308, 25412, 42225, 13138, 36142, 2092, 4492, 14932, 14397, 48750, 19486, 44307, 33966, 13213, 21606, 37092, 12265, 1790, 14702, 8862, 3682, 45242, 13835, 46034, 13573, 12544, 5388, 20493, 14707, 1191, 47115, 50880, 14913, 8806, 16669, 25658, 35992, 14534, 9198, 14495, 33851, 38280, 10411, 14451, 21537, 34353, 44958, 17628, 34030, 11281, 4214, 21432, 17941, 1795, 21070, 50486, 11135, 5796, 1663, 14230, 24403, 46326, 19726, 23066, 2705, 16973, 13094, 12114, 3428, 1856, 1410, 44865, 6032, 1556, 19690, 46275, 18116, 23900, 6603, 27610, 15175, 4636, 23480, 2497, 31650, 50857, 47507, 39460, 47377, 6994, 50964, 12327, 9379, 10240, 11462, 5508, 24644, 9514, 25369, 30981, 11784, 11557, 14883, 3363, 19517, 26191, 26094, 26179, 14706, 3926, 44212, 433, 30865, 50940, 14792, 1363, 9825, 29033, 1006, 30164, 47885, 13907, 8805, 20663, 2048, 10188, 18353, 5892, 16732, 4862, 14059, 16860, 49497, 4746, 15616, 21697, 1148, 44110, 1305, 2097, 46956, 42408, 1072, 43230, 15665, 23799, 3932, 37969, 423, 13241, 3654, 39858, 41521, 10169, 17430, 33846, 7565, 7661, 25551, 30365, 47517, 34029, 38256, 31477, 26741, 15232, 47009, 7208, 1921, 8800, 22067, 916, 3808, 25796, 50847, 1406, 956, 8142, 16957, 4336, 7101, 50403, 45285, 23623, 9644, 31877, 43622, 3678, 5209, 14156, 22868, 24542, 9944, 321, 48217, 36066, 1280, 14576, 47428, 30067, 3460, 47871, 49052, 44846, 7177, 5655, 14707, 10426, 28194, 11453, 1099, 5707, 15776, 31422, 36029, 8484, 47960, 13049, 20858, 17387, 8710, 6489, 3285, 3027, 15114, 6844, 11372, 48022, 46291, 51061, 45562, 8611, 28077, 17224, 11862, 7154, 9054, 45038, 34427, 10712, 48965, 14757, 1511, 4209, 23868, 47559, 4233, 26997, 11302, 5161, 14471, 25939, 15145, 4389, 35179, 6364, 48779, 15251, 5981, 40295, 46627, 43877, 12742, 46388, 3633, 13567, 30823, 9221, 11400, 17633, 44650, 2919, 33693, 5948, 25769, 6032, 7657, 38454, 13344, 49497, 48750, 21964, 20626, 15655, 13167, 27437, 11410, 9312, 9819, 49402, 37859, 15162, 8040, 9660, 37041, 19951, 6020, 5688, 29474, 10732, 5075, 43252, 15623, 6010, 12548, 35536, 24513, 5072, 11068, 44193, 10129, 3374, 34206, 47022, 45020, 46036, 8038, 6854, 25913, 38385, 47933, 36460, 11736, 7769, 50914, 21757, 14932, 48698, 37323, 39315, 4198, 8984, 15609, 12968, 20768, 6032, 14737, 40060, 15639, 7097, 49838, 11504, 39881, 38040, 20509, 12872, 13568, 43601, 5794, 26104, 34158, 5634, 28588, 10134, 23385, 6065, 1466, 2005, 11507, 51242, 15726, 13081, 40315, 22768, 49439, 39430, 26751, 1387, 6590, 20679, 13300, 48751, 32914, 40494, 47167, 6754, 1416, 3374, 21794, 44121, 22365, 8057, 2496, 9087, 5987, 7104, 10135, 15022, 14946, 45496, 13594, 10165, 5788, 2039, 4477, 26248, 1686, 3473, 20948, 10067, 33473, 16432, 14919, 12148, 894, 2404, 2556, 17849, 13160, 3356, 4609, 25762, 9077, 8935, 11731, 12204, 1664, 25746, 24099, 45840, 27094, 25041, 49445, 23799, 48228, 45651, 48269, 46857, 36898, 16981, 10616, 28991, 33027, 6752, 2261, 16065, 50177, 10337, 19398, 46681, 10120, 14524, 6582, 3708, 12932, 15217, 15811, 7772, 15773, 10214, 32922, 17445, 37209, 6818, 49864, 2468, 49138, 16768, 25949, 46661, 5154, 50720, 2261, 8922, 14476, 6244, 9740, 15154, 8016, 5669, 49816, 38721, 5617, 22915, 29675, 39804, 9341, 29885, 37230, 25032, 5834, 4428, 50037, 1016, 15306, 11418, 12542, 23181, 28128, 22890, 1404, 27378, 24344, 5622, 51420, 5521, 39871, 2586, 14398, 49635, 13985, 6387, 51383, 9740, 8018, 16027, 6762, 16103, 16014, 7006, 6921, 3090, 33020, 3723, 40080, 38280, 14605, 16261, 5628, 2238, 11786, 10039, 7000, 44941, 2015, 24577, 33865, 6196, 47984, 895, 13108, 45782, 19813, 15352, 37269, 37287, 33977, 6837, 11423, 13162, 31450, 10447, 39551, 2537, 47905, 40111, 11071, 45043, 11700, 7058, 35083, 9688, 51464, 878, 5960, 10314, 8104, 17214, 51456, 1912, 14559, 30165, 17369, 51425, 5680, 51440, 9341, 1047, 1887, 16014, 26937, 51384, 37310, 30199, 23228, 6387, 51525, 23181, 11736, 7230, 25709, 1736, 8452, 49001, 5025, 10985, 13340, 35347, 11992, 49184, 26892, 45005, 6806, 19455, 31199, 11483, 11847, 29279, 4716, 4745, 22324, 19796, 24818, 4388, 14738, 51508, 14738, 4810, 23053, 51515, 45011, 23765, 5684, 51512, 51518, 11903, 51449, 2394, 51451, 51521, 6945, 51454, 2084, 51524, 4997, 18856, 36829, 29863, 13078, 36872, 29483, 10954, 11649, 12067, 39898, 19837, 44059, 17878, 33018, 9054, 47873, 51374, 47948, 49603, 51377, 30618, 19029, 8709, 18974, 1225, 5404, 2662, 51599, 41486, 42940, 10064, 7638, 28904, 49199, 29577, 49843, 31810, 5957, 19748, 1926, 22282, 17538, 12390, 48516, 35113, 3055, 27774, 1999, 2695, 14488, 11781, 9041, 1316, 11984, 32945, 19682, 9076, 21362, 5835, 9512, 9406, 2043, 2984, 11989, 19951, 44383, 6988, 12214, 15832, 13160, 7935, 6116, 19486, 3017, 3823, 14031, 1516, 7143, 31195, 4335, 12388, 43547, 1109, 20437, 21104, 9903, 16356, 40142, 30404, 36178, 24906, 8356, 24879, 28093, 880, 14085, 5334, 23030, 16969, 6755, 28591, 41992, 24383, 12821, 49618, 5992, 3144, 44249, 30149, 1995, 23207, 16465, 23744, 2451, 10109, 2084, 2074, 37275, 38814, 16081, 9332, 5870, 8359, 7554, 6922, 7247, 25391, 48022, 49252, 43713, 18680, 19262, 3286, 49825, 30421, 10635, 6175, 8399, 46275, 21098, 9994, 6930, 4831, 44977, 4608, 49723, 41096, 50653, 49726, 47950, 17510, 46137, 31867, 46139, 44053, 23009, 49224, 42912, 44340, 43429, 43344, 43646, 50756, 50568, 43434, 44220, 1048, 36776, 12816, 46841, 3729, 4304, 50121, 894, 10252, 14927, 8436, 43811, 19592, 9465, 387, 3325, 16461, 46246, 17608, 27101, 12293, 13970, 24592, 48283, 17088, 43538, 19779, 3627, 7142, 12141, 13463, 3767, 1348, 41347, 6974, 5682, 17102, 17842, 51684, 5467, 5982, 13776, 23387, 13172, 962, 9452, 21636, 36086, 1545, 49021, 38644, 36682, 5430, 6735, 1550, 13602, 9062, 49861, 24718, 21000, 15091, 38167, 31899, 21846, 14228, 1304, 22804, 46625, 13541, 25807, 46508, 43368, 25132, 6090, 14379, 3721, 9658, 15813, 4304, 24187, 8976, 22312, 45576, 38967, 4995, 21606, 1240, 30436, 6844, 5285, 1930, 31867, 35113, 9110, 7937, 42573, 21416, 17372, 3214, 12083, 13763, 18066, 9836, 35816, 1875, 5400, 25845, 49386, 46217, 48229, 50654, 47018, 39311, 42171, 6203, 10044, 4335, 46031, 34303, 8991, 46521, 49158, 24351, 34150, 11698, 51534, 51861, 3501, 51859, 49353, 4469, 18565, 1875, 10169, 20713, 27439, 25188, 17398, 30751, 12541, 5747, 3724, 31325, 2034, 50008, 14092, 33422, 1850, 3023, 1282, 14564, 20933, 15972, 3072, 34176, 7737, 38991, 38183, 16752, 2973, 5782, 44711, 40436, 10714, 51002, 8917, 12012, 51879, 31197, 23799, 22350, 26902, 13525, 14015, 2837, 20860, 20573, 13068, 51809, 11468, 2719, 15611, 22399, 51917, 35060, 8324, 1650, 21417, 51921, 23723, 34091, 15361, 17368, 51915, 12348, 12129, 25373, 11157, 9276, 12308, 13524, 2046, 42592, 11288, 4480, 11798, 9533, 31370, 2762, 17367, 3342, 43926, 47878, 5693, 3913, 48370, 16012, 12518, 23326, 17669, 17197, 15358, 44370, 20953, 11880, 1463, 34813, 11766, 2502, 48827, 51584, 23689, 13628, 1441, 6336, 31189, 47768, 5247, 14102, 51941, 48537, 51850, 51723, 49604, 47951, 39158, 45607, 19881, 20679, 51709, 44751, 22567, 24552, 19439, 21309, 31590, 19829, 31929, 35777, 8140, 10072, 51989, 48705, 49722, 12390, 35670, 3688, 36200, 10693, 33616, 12156, 6430, 7594, 24780, 40257, 33150, 41529, 19635, 47409, 16971, 14977, 18091, 12315, 35789, 16027, 13165, 1372, 6230, 7217, 34209, 50002, 45148, 20426, 17878, 52010, 13196, 18866, 2875, 1233, 36031, 29606, 50750, 46143, 50563, 46712, 50565, 25267, 1988, 8793, 1864, 4111, 48045, 29456, 2261, 5919, 32973, 12011, 17843, 27126, 9464, 21875, 16414, 9738, 14525, 991, 7730, 50070, 22335, 2767, 8054, 43391, 21525, 17631, 7815, 52066, 11959, 42943, 17020, 48027, 15253, 48364, 1296, 39760, 24908, 2480, 51581, 10484, 2797, 8231, 3658, 40650, 24710, 50567, 25690, 46717, 46587, 46140, 22961, 9148, 8245, 1989, 495, 49847, 13236, 48656, 47357, 20973, 18225, 52108, 22046, 49133, 44740, 37602, 21592, 1117, 13199, 15695, 13236, 12968, 51390, 51981, 51375, 51593, 42927, 39052, 48908, 12378, 18636, 14312, 1471, 51467, 15976, 51467, 47692, 2540, 1685, 23269, 24590, 38692, 17254, 45241, 12078, 17084, 6252, 15260, 33445, 7257, 3936, 21864, 6252, 25134, 44011, 36935, 8487, 13308, 22237, 47678, 16606, 52038, 14013, 12767, 9051, 51197, 38550, 3511, 12123, 14322, 12179, 50512, 2054, 34960, 15648, 36022, 2783, 1504, 51326, 51534, 33865, 52144, 15179, 12215, 11740, 12083, 3963, 891, 35133, 42616, 37297, 45745, 29639, 25405, 48522, 15733, 44580, 9719, 37648, 17637, 50665, 8847, 3910, 15969, 23355, 2712, 2749, 43792, 44086, 1784, 9670, 3165, 35743, 36081, 13552, 2039, 2924, 17942, 49439, 47981, 34973, 28770, 8576, 48950, 51514, 11984, 29264, 5235, 4434, 3965, 4115, 11648, 16095, 5085, 25726, 11538, 35728, 25542, 40309, 6764, 24996, 11530, 50439, 42961, 47938, 39169, 42782, 48319, 40394, 43909, 42766, 46214, 47945, 50449, 49112, 42736, 49114, 41591, 9686, 9757, 1142, 15793, 33426, 1527, 10527, 46095, 9411, 32838, 15581, 44255, 2739, 33413, 35658, 23148, 33728, 36412, 49294, 12321, 6411, 15326, 11837, 31854, 43131, 36412, 2194, 1654, 6517, 9359, 23782, 52277, 14352, 44369, 35747, 23806, 52264, 2545, 44369, 27773, 4743, 27730, 23148, 14285, 6285, 45027, 23934, 52277, 25832, 11145, 25360, 44369, 15859, 36108, 28206, 35854, 2735, 17574, 45621, 9151, 15152, 38986, 4646, 46491, 36821, 1238, 13140, 14954, 3514, 10745, 4621, 8224, 32434, 11726, 15787, 939, 34155, 9174, 47474, 47588, 37569, 6598, 11507, 2047, 13349, 21098, 48099, 11717, 3517, 37505, 47931, 9164, 17149, 1726, 21038, 44983, 15990, 47804, 7226, 1466, 6192, 3688, 4458, 13104, 23345, 3405, 47050, 3849, 2147, 27738, 36193, 47633, 9209, 6908, 4318, 3316, 15002, 45981, 23774, 9705, 14267, 29778, 17153, 12376, 2646, 8753, 12339, 24203, 3953, 12001, 52323, 52282, 28394, 13170, 1233, 36277, 15716, 14994, 40101, 51074, 9765, 44011, 18043, 1118, 8922, 8981, 51720, 41557, 44046, 48328, 51594, 22059, 1516, 48109, 3460, 13081, 51431, 8685, 20771, 3822, 14629, 16151, 34288, 14718, 871, 15262, 28982, 3137, 6477, 25761, 1806, 17123, 30808, 26193, 25161, 11755, 45718, 25619, 8281, 43322, 30797, 23136, 5001, 1654, 20326, 5952, 24150, 23698, 16663, 26024, 1413, 7028, 23688, 47129, 4983, 18213, 13210, 30213, 11014, 6203, 36161, 5577, 15073, 31180, 11401, 1672, 17733, 14713, 9818, 10352, 47180, 25113, 35392, 14726, 25806, 16097, 7861, 28552, 5094, 38834, 2162, 12529, 3239, 8364, 29020, 7359, 34997, 2148, 31308, 15024, 3382, 3131, 29783, 21949, 5006, 25339, 4847, 8684, 17733, 14783, 13209, 26845, 26788, 32812, 14358, 5619, 7338, 29210, 47264, 9625, 37304, 25901, 8780, 1011, 4282, 49213, 23725, 5194, 9664, 51556, 14853, 31038, 30250, 13184, 4320, 48816, 4996, 12701, 43640, 33047, 26230, 25989, 52510, 10277, 23725, 17776, 41988, 14615, 17878, 2462, 5398, 17237, 14790, 5005, 20047, 12242, 22287, 21377, 3445, 39831, 39833, 8330, 4045, 8386, 11399, 32207, 1777, 16577, 15124, 1774, 33652, 12012, 10660, 3187, 10928, 15668, 22798, 41497, 44979, 1237, 11281, 48684, 4603, 15134, 12847, 3810, 42459, 6212, 47330, 25158, 13920, 21968, 39019, 12358, 976, 52359, 46491, 14895, 2101, 48563, 27197, 4031, 4079, 10277, 33776, 21650, 21111, 46491, 44954, 5159, 7535, 6704, 11406, 1940, 2224, 8973, 8484, 4063, 14886, 14978, 28852, 9223, 3666, 15581, 3522, 585, 46237, 10219, 11564, 25154, 28469, 6851, 3826, 21437, 4861, 5881, 46337, 19498, 11755, 16651, 51302, 9168, 6148, 11753, 8703, 10606, 38247, 3795, 37073, 19077, 48469, 5904, 3441, 11739, 15743, 50830, 21627, 21752, 13554, 26184, 8792, 35932, 33403, 1366, 13667, 15112, 40539, 50171, 33033, 10329, 3012, 3666, 4155, 8146, 6875, 38905, 1910, 22795, 35515, 5998, 18107, 9067, 14301, 14616, 51170, 5535, 15091, 30432, 12424, 43459, 22365, 11308, 2061, 8163, 10064, 6382, 3137, 17929, 17383, 37334, 16566, 6480, 29740, 26133, 25167, 35263, 1765, 26967, 23729, 27838, 43700, 3145, 14943, 6489, 10491, 8455, 24556, 13612, 12348, 12899, 10087, 35444, 11087, 16865, 320, 9565, 4037, 15983, 11584, 21726, 43560, 35994, 35829, 37888, 3359, 12472, 44677, 6222, 13506, 21910, 3327, 6254, 49336, 21744, 9479, 11376, 39940, 51747, 51755, 9219, 3523, 13651, 51152, 30618, 1728, 4775, 2364, 52352, 33770, 3508, 4805, 45584, 13824, 3391, 10983, 6207, 1650, 52384, 2040, 16657, 52498, 34365, 31141, 13570, 49007, 3420, 13263, 13909, 36113, 48901, 9190, 9443, 9089, 3162, 2729, 3455, 10309, 9903, 30285, 29519, 14377, 27906, 44630, 29068, 30358, 8459, 3950, 15070, 43518, 14973, 7027, 42351, 8115, 1799, 5811, 25896, 22034, 12083, 31093, 36379, 1253, 29025, 45091, 5812, 39939, 8179, 52067, 1667, 1481, 21680, 15686, 35957, 3358, 11067, 1215, 11562, 16887, 15149, 33928, 46704, 47751, 29266, 7438, 13246, 2887, 28613, 11157, 4660, 15358, 45625, 13484, 39972, 42403, 52037, 16871, 11660, 43549, 29452, 9539, 3325, 2056, 21791, 4686, 39658, 44527, 27170, 31313, 32003, 17775, 42303, 5005, 29945, 6606, 8776, 52130, 38791, 52201, 41552, 15326, 14202, 1821, 48469, 31313, 6335, 1731, 13278, 16772, 5200, 3586, 32727, 15859, 5533, 19674, 9782, 28910, 52869, 12550, 14906, 25603, 21000, 8247, 4964, 18272, 14037, 28028, 1044, 2404, 46188, 5467, 11141, 49301, 30053, 41574, 52854, 5907, 3098, 19674, 6692, 9520, 52858, 27595, 25473, 8364, 28030, 24879, 28545, 46918, 48545, 29141, 50590, 43109, 24168, 1567, 5983, 46357, 41868, 2025, 21669, 9655, 20966, 6908, 6123, 8861, 16839, 2653, 1138, 26898, 8116, 19741, 26053, 5115, 5983, 52921, 52856, 30992, 6870, 18614, 39470, 7546, 6168, 17239, 33895, 2074, 2761, 11711, 12589, 8462, 4626, 2465, 22276, 14267, 13630, 22159, 10412, 15210, 50996, 2002, 20567, 21953, 12344, 46371, 51954, 27650, 13169, 4983, 13431, 2015, 23849, 3381, 6289, 5001, 17602, 16261, 44201, 35446, 51666, 3053, 31138, 51871, 24633, 6561, 8440, 25553, 9693, 9277, 1034, 3613, 2424, 13870, 39949, 1417, 34973, 15327, 49187, 9440, 1043, 23681, 48529, 46955, 52890, 26464, 20447, 39963, 14884, 3208, 46803, 38272, 11621, 48466, 37515, 13919, 1629, 27238, 1290, 6702, 4365, 15717, 26916, 24403, 27748, 34414, 40039, 46064, 39486, 48037, 17835, 13851, 9425, 34080, 43673, 13101, 14103, 31366, 40227, 52033, 50046, 17427, 24545, 48385, 17799, 43941, 25358, 15767, 47108, 2740, 43552, 27052, 1006, 34322, 30414, 50182, 15780, 12835, 14561, 17120, 27725, 47237, 28604, 11585, 22120, 10128, 5797, 25699, 19060, 34107, 10068, 3006, 46691, 45679, 2090, 45893, 3007, 48073, 49219, 28067, 4604, 45271, 4794, 7183, 3057, 40257, 48943, 1059, 9081, 46063, 4715, 11546, 50183, 49836, 44251, 1993, 52121, 51592, 46856, 52124, 47951, 11423, 12365, 5770, 32546, 1766, 7764, 49304, 37399, 16871, 47301, 12322, 2705, 9588, 1473, 34359, 10447, 52555, 21620, 45034, 29596, 23296, 48047, 27573, 2919, 5697, 48440, 5650, 46619, 50818, 48661, 37832, 31454, 48016, 38291, 5165, 39249, 32387, 48593, 44060, 47973, 49616, 38545, 8104, 2553, 29628, 12062, 40122, 52910, 4215, 48776, 3948, 25123, 3792, 19263, 6249, 46427, 4429, 36993, 47981, 27350, 9755, 34076, 7215, 39850, 12606, 19135, 33977, 52548, 14092, 8018, 9377, 10447, 7539, 43182, 21020, 19330, 35695, 2740, 27212, 25922, 47723, 34334, 47008, 34361, 15841, 50687, 8298, 53146, 47255, 35071, 13325, 16037, 8846, 8325, 25697, 49901, 48950, 3858, 37602, 33660, 6117, 29138, 4164, 9201, 32922, 3317, 46306, 13594, 34448, 34414, 44979, 27952, 4850, 5541, 1059, 43713, 40044, 15646, 1305, 3052, 37429, 17423, 17598, 13593, 25639, 12316, 27683, 10259, 21703, 3654, 23199, 3916, 41868, 35921, 34308, 6748, 1507, 31418, 4466, 42464, 51295, 9674, 1291, 27813, 17834, 45314, 20075, 15313, 11423, 19829, 3638, 9758, 33871, 32208, 9257, 18612, 6006, 6374, 14971, 17906, 866, 3803, 20495, 53039, 7646, 51315, 26248, 8093, 42191, 8253, 882, 18391, 12242, 19347, 27682, 31988, 4181, 3936, 4776, 20480, 46102, 46808, 2069, 22844, 16463, 20641, 44839, 27172, 6733, 10591, 1052, 2423, 23361, 43719, 10724, 2085, 46515, 5532, 3523, 42494, 12212, 16931, 15866, 21105, 5745, 8185, 27740, 8839, 9885, 53299, 3780, 13548, 10340, 43851, 11514, 2982, 2147, 45285, 9051, 6733, 569, 51741, 49503, 2392, 6945, 8921, 14101, 11333, 9781, 21363, 16888, 16740, 31884, 46845, 1960, 2175, 30358, 52911, 33917, 2488, 13919, 37066, 5770, 7203, 16415, 19677, 46152, 20486, 27523, 4684, 18616, 6999, 13780, 11250, 4093, 1725, 47348, 21016, 32960, 23268, 5724, 5212, 8175, 42361, 33826, 35933, 1478, 52963, 35106, 2810, 52426, 51757, 5897, 21947, 8185, 41062, 49341, 24589, 2707, 3255, 12065, 37477, 8360, 7006, 8471, 3656, 3353, 7359, 20708, 36232, 24151, 35071, 9322, 36648, 10208, 13647, 4951, 15351, 13558, 13105, 3522, 2966, 19325, 2547, 9317, 29508, 11145, 3084, 47968, 3450, 21960, 35550, 3652, 3000, 42058, 40565, 1468, 27197, 53356, 7018, 1660, 32622, 19378, 45348, 49054, 45450, 51386, 40288, 37476, 15720, 12242, 4691, 2477, 7033, 39371, 35736, 21579, 1799, 2069, 932, 16438, 30721, 4425, 21355, 12550, 11989, 9254, 12110, 22350, 22281, 14248, 12321, 3968, 8425, 1881, 5794, 15292, 23059, 11514, 27321, 2138, 2579, 6647, 14013, 15047, 4991, 1676, 4339, 28928, 7305, 49901, 17900, 35722, 1989, 8175, 27705, 21268, 16007, 13919, 40871, 29189, 31567, 13821, 12897, 1612, 13960, 4459, 21273, 48793, 23136, 15138, 15983, 30138, 43812, 25135, 51360, 2017, 21565, 31884, 2483, 32559, 40245, 30176, 13454, 11174, 3792, 10542, 42003, 13878, 15867, 53501, 53500, 39732, 40292, 39732, 40178, 36924, 3296, 15088, 10984, 47996, 9499, 4856, 51031, 10953, 1492, 32559, 14906, 9284, 53514, 53513, 33761, 1292, 7969, 48572, 46868, 11604, 11170, 6572, 12220, 25373, 34138, 16849, 37847, 29825, 49551, 49559, 28900, 37853, 16838, 28890, 29833, 49552, 29835, 49561, 29830, 49547, 16841, 16848, 37849, 48354, 37580, 16841, 46823, 12219, 25725, 1539, 17455, 11344, 13140, 11984, 31099, 43931, 44248, 8314, 569, 1864, 10958, 35269, 49057, 7099, 24103, 50515, 13274, 2887, 1236, 10592, 28939, 628, 52211, 10322, 3037, 17538, 10946, 2137, 44744, 37376, 23558, 9718, 20455, 27999, 17057, 11846, 7264, 29271, 1258, 1080, 4697, 49758, 2771, 23895, 47520, 23197, 11852, 628, 2404, 22021, 3159, 9742, 4629, 14030, 36804, 10385, 14286, 49184, 31940, 51699, 17834, 2026, 1678, 3212, 19634, 1792, 4857, 11353, 34013, 1795, 3409, 19837, 52235, 20862, 21112, 7112, 16407, 16461, 45225, 9224, 27126, 925, 50940, 9735, 45177, 5538, 53449, 36239, 1811, 28560, 23674, 29152, 5224, 4912, 35835, 12252, 50592, 9025, 42002, 5705, 3159, 8519, 43267, 30366, 35712, 20286, 11896, 11294, 15306, 45502, 16469, 5122, 30142, 2845, 17793, 8976, 14841, 15662, 24198, 22404, 35011, 15579, 5783, 36925, 53399, 7263, 4499, 3849, 18974, 16181, 16763, 2475, 51419, 10497, 31038, 14877, 9876, 1381, 44547, 45638, 3859, 25749, 3480, 37833, 9153, 7105, 37406, 40981, 8710, 44981, 569, 49341, 9863, 6392, 4559, 11978, 933, 16752, 34982, 7807, 6994, 44443, 44357, 17607, 1416, 24475, 34391, 3643, 3060, 22554, 5430, 4283, 45787, 46577, 52043, 50752, 52045, 50754, 51736, 44171, 50757, 46150, 50759, 43351, 50761, 50450, 47017, 49727, 32884, 44208, 51875, 9182, 15717, 9182, 15339, 19588, 39811, 44242, 21992, 6776, 13199, 6762, 50610, 13002, 42276, 44233, 40668, 49278, 27083, 25365, 22380, 6877, 31179, 18032, 15643, 12779, 9073, 1071, 46574, 31562, 27075, 40424, 2543, 1799, 3073, 9508, 46485, 38157, 12380, 8177, 13842, 27603, 7971, 11122, 6643, 7908, 24585, 47148, 45719, 36009, 14684, 41819, 12588, 8361, 7345, 4797, 20139, 10756, 5200, 52267, 50321, 30027, 16690, 6193, 11935, 12900, 44185, 6526, 8317, 25883, 50420, 17424, 3842, 47733, 5811, 3773, 53375, 3411, 27941, 52012, 1356, 25989, 24201, 3655, 45756, 20859, 2073, 40029, 49269, 13169, 15308, 6468, 32904, 11788, 14887, 6196, 28942, 5577, 12214, 31407, 11719, 29472, 45647, 45727, 15133, 15850, 9457, 10415, 6026, 2554, 13794, 37583, 14717, 23367, 1682, 2823, 35443, 8327, 6930, 22067, 1023, 4049, 24058, 6708, 29064, 25781, 49711, 24321, 11360, 21313, 17650, 47656, 49039, 11788, 6703, 9584, 53252, 16213, 43633, 14804, 3427, 4534, 11928, 43866, 5166, 13463, 1233, 10489, 22048, 9946, 17439, 43759, 37541, 38237, 43484, 34831, 5404, 29778, 9298, 48776, 45242, 913, 3684, 42699, 28483, 46027, 45311, 12071, 26864, 4792, 53286, 1665, 32728, 1080, 16244, 18022, 49904, 31482, 22411, 2745, 44003, 2177, 19513, 2010, 42337, 2013, 34336, 17093, 52259, 1373, 3003, 37285, 43848, 42191, 43559, 28982, 1246, 1673, 5330, 6825, 11940, 27442, 13221, 16752, 11657, 11856, 4366, 24592, 5266, 11835, 47295, 40690, 17420, 23476, 44734, 35475, 53882, 46802, 7104, 1447, 44944, 17754, 3165, 1654, 40606, 866, 9142, 2202, 15874, 5303, 14323, 46932, 51731, 42812, 53735, 41766, 50755, 53738, 51738, 50758, 52096, 51729, 42683, 50762, 50575, 41794, 25335, 914, 28405, 3677, 3096, 3326, 13562, 11072, 13056, 44766, 9247, 46164, 3658, 2074, 13081, 2797, 12738, 49206, 1251, 10223, 13613, 45047, 38836, 1998, 13839, 41726, 50979, 4979, 53446, 16602, 45726, 2047, 10733, 48386, 25609, 25367, 9314, 14125, 13320, 11785, 48516, 28936, 43324, 15717, 7803, 22446, 32920, 31485, 29329, 24983, 13959, 24986, 52001, 31060, 9929, 51417, 10666, 13187, 50492, 15787, 1650, 33933, 9225, 44134, 37159, 4686, 13540, 50420, 29105, 5835, 10058, 4059, 25879, 16973, 1448, 9080, 48575, 33871, 2673, 13104, 50290, 10652, 53681, 47233, 15302, 3470, 3091, 30683, 30660, 49810, 53681, 54080, 3440, 1737, 6716, 8762, 37735, 1988, 46538, 14361, 1572, 3783, 3526, 30662, 6719, 3032, 12163, 13615, 41989, 23736, 14590, 10046, 27887, 17495, 16501, 13661, 51073, 23475, 42473, 14402, 30683, 35330, 53628, 35465, 24922, 4797, 4019, 28772, 54057, 24933, 51591, 52404, 51376, 53090, 16340, 27906, 4813, 3821, 7144, 22107, 3314, 6006, 4698, 21738, 4105, 3627, 22219, 18367, 13917, 40057, 4668, 7988, 21820, 4791, 1512, 37308, 1551, 25002, 10635, 33611, 8716, 46405, 44066, 9216, 11803, 13241, 45339, 13707, 12073, 41801, 13421, 12298, 39871, 3505, 37616, 13355, 1956, 30162, 9227, 17878, 3131, 48121, 1861, 1412, 34421, 49472, 17131, 5077, 26073, 15067, 13629, 24615, 27239, 25040, 33790, 13175, 50020, 53336, 52487, 11342, 20604, 5134, 19508, 45226, 23675, 1197, 1620, 9067, 44377, 47714, 45674, 1517, 30645, 8019, 29886, 39924, 48673, 34334, 11734, 10151, 35798, 12091, 44250, 10064, 24865, 15189, 40022, 43931, 27947, 2991, 37696, 1552, 12977, 1235, 22383, 33874, 12062, 16962, 24899, 53223, 3432, 32784, 25003, 1189, 44188, 2281, 48984, 16663, 13335, 37290, 49674, 53065, 34270, 6751, 30423, 7104, 4682, 21731, 22647, 11917, 1482, 53140, 13364, 1633, 31976, 5115, 45852, 34101, 3130, 27107, 27107, 18616, 47461, 12123, 11377, 3347, 48287, 33451, 28808, 54267, 11463, 11399, 7799, 52165, 48559, 2007, 16797, 1453, 14717, 51125, 31557, 15152, 16468, 6506, 8103, 31211, 11804, 6804, 20753, 42133, 21304, 13476, 27788, 15724, 19702, 17525, 48073, 8878, 49958, 13546, 7767, 24671, 5692, 54302, 51183, 4206, 13081, 13872, 24733, 5303, 12108, 8627, 14352, 46704, 50547, 3049, 24511, 22036, 34837, 37317, 37819, 23345, 14551, 12448, 8553, 16581, 35048, 19837, 46956, 12255, 35835, 51900, 54298, 26727, 54300, 1259, 54308, 7076, 1695, 11155, 5537, 42607, 40145, 48303, 36153, 43599, 27726, 7101, 40245, 876, 1816, 8684, 2489, 12255, 48032, 14475, 20924, 34722, 54324, 40133, 35807, 2192, 12448, 30706, 47907, 22777, 21061, 5311, 25144, 31543, 15035, 4490, 21273, 17216, 22021, 2762, 54187, 44148, 21264, 26887, 49492, 51384, 20509, 2547, 24212, 40849, 52021, 10054, 9660, 3455, 46470, 8477, 12170, 11301, 7935, 33449, 23801, 14108, 41399, 38491, 5533, 10213, 29113, 10542, 10164, 17160, 30758, 977, 6182, 52336, 33751, 33998, 12197, 17933, 49786, 20052, 51657, 1224, 13289, 9431, 35444, 52940, 29105, 1190, 6588, 14583, 27890, 7554, 53390, 7983, 22540, 45070, 27296, 54377, 1917, 16884, 5125, 1635, 13851, 33920, 17675, 2031, 5909, 47162, 44524, 26161, 50267, 11780, 4434, 6630, 5202, 44528, 29470, 7763, 49111, 50573, 45803, 41292, 46724, 26449, 29447, 6250, 54154, 25210, 44523, 29454, 48057, 29502, 54468, 22374, 48057, 27712, 29494, 30393, 8775, 22850, 29468, 8434, 53802, 43331, 29473, 2834, 29496, 3332, 29478, 25875, 54474, 29481, 49474, 29484, 47693, 1052, 16689, 54481, 21108, 8775, 11071, 47808, 54491, 31333, 29461, 29497, 54490, 54507, 29500, 29456, 29494, 29480, 29504, 50998, 23672, 29508, 29516, 31107, 5912, 15143, 20495, 1105, 54497, 29517, 24216, 31370, 1042, 40681, 29529, 8061, 46154, 29562, 20162, 29564, 29537, 15076, 49417, 15780, 4693, 39019, 12252, 4829, 29546, 29541, 8927, 33654, 29552, 50164, 2772, 29564, 29556, 29562, 47312, 2913, 29560, 54553, 4855, 40180, 29595, 43551, 11270, 17453, 3998, 29590, 29571, 27115, 16463, 20686, 44117, 29580, 18049, 5025, 31112, 54572, 29582, 29576, 29585, 49987, 16463, 29589, 29570, 14470, 26040, 13467, 4802, 54559, 6750, 6777, 29581, 36974, 40180, 53111, 13652, 24688, 53981, 43427, 46580, 46713, 44343, 46715, 53987, 53740, 53989, 45362, 53743, 52252, 42791, 52254, 41980, 14420, 23465, 26287, 36867, 13150, 12847, 7778, 16234, 6020, 8667, 9657, 27584, 40167, 15833, 2898, 10751, 1444, 11529, 23345, 53829, 49110, 1879, 20614, 3677, 3792, 11405, 54615, 5129, 19891, 18021, 54618, 44467, 32999, 24179, 4567, 54620, 31111, 54626, 28985, 19610, 54637, 26867, 1258, 3938, 34299, 46845, 8684, 9383, 13182, 30927, 36981, 4006, 43490, 26832, 22534, 9408, 44713, 21854, 47807, 37327, 41072, 33413, 46451, 2513, 7571, 21573, 14853, 25645, 51295, 35777, 11462, 44389, 6897, 46481, 3068, 7749, 44474, 11737, 24544, 11094, 5668, 22041, 16879, 6252, 16553, 2192, 14850, 29708, 47676, 32897, 16166, 4025, 15631, 30384, 22312, 46242, 3643, 17541, 47932, 46225, 51951, 11481, 1793, 24190, 38157, 49956, 3196, 32208, 10635, 7072, 9377, 12123, 49842, 38997, 5160, 1781, 20401, 44978, 47714, 21854, 53891, 34008, 53727, 50918, 29092, 5244, 26082, 20697, 53162, 5736, 1690, 13888, 47595, 16489, 2579, 33802, 12170, 3291, 35530, 20579, 44946, 7914, 49824, 9244, 26936, 30947, 47583, 27341, 14576, 1740, 1566, 27884, 1355, 9191, 27094, 45867, 20697, 31947, 9411, 4486, 15101, 22583, 18858, 26518, 25175, 1744, 39490, 5877, 16027, 1555, 10073, 42382, 27807, 46899, 7004, 15476, 1049, 1421, 26801, 943, 25724, 54784, 3773, 54786, 2537, 27667, 1023, 7338, 31434, 8823, 1656, 28295, 28261, 44566, 9277, 53697, 44979, 5830, 3729, 36463, 3241, 8185, 8872, 4944, 9736, 29187, 4375, 5391, 26678, 7165, 4330, 13172, 44544, 3660, 43424, 16261, 27497, 5218, 15943, 44321, 52738, 30727, 4389, 15976, 2187, 3381, 24933, 38171, 31225, 50049, 27900, 24960, 50342, 31503, 29116, 34349, 4002, 11698, 49861, 15251, 34398, 35738, 30049, 24356, 13999, 29646, 4231, 14950, 10186, 2837, 24615, 3965, 40237, 35921, 23812, 37335, 37073, 7800, 39373, 45065, 14395, 31184, 26748, 45236, 17061, 29470, 13261, 3806, 19647, 46370, 54847, 38336, 35846, 6523, 25651, 1645, 19000, 19284, 2848, 1817, 50046, 4697, 38574, 35413, 7041, 2591, 11932, 4998, 16458, 49413, 17109, 10207, 45754, 13071, 44524, 2535, 7732, 5092, 31543, 16168, 5389, 23849, 8781, 22271, 27095, 53376, 42477, 3817, 48880, 13473, 16928, 27223, 969, 37540, 14737, 15154, 42358, 36644, 1551, 10219, 10026, 1527, 14943, 3517, 25963, 36021, 10958, 24044, 879, 9702, 8237, 21743, 3806, 35842, 20697, 2107, 1887, 13180, 52352, 44007, 30829, 14295, 50856, 53214, 13078, 2644, 12085, 14405, 45427, 10065, 38221, 11507, 33469, 46401, 2875, 37372, 35301, 5138, 3518, 45680, 7178, 43252, 1053, 14254, 5668, 26163, 21704, 3165, 1795, 868, 45011, 4836, 42593, 32920, 6835, 42933, 12002, 1286, 25910, 18096, 9420, 2895, 31194, 1356, 51146, 2810, 8094, 15727, 11185, 9699, 21924, 41556, 32757, 48327, 54127, 43146, 50765, 5727, 3786, 14605, 3207, 11980, 2179, 5678, 10038, 34403, 15263, 9295, 40235, 1693, 3923, 52541, 51146, 12090, 13350, 5707, 40243, 21399, 8322, 11935, 53957, 28837, 10972, 8259, 54413, 39854, 48592, 50976, 28670, 2156, 10260, 46514, 27244, 9698, 32814, 9698, 51717, 7948, 23270, 55016, 1082, 19630, 46940, 5630, 37095, 20955, 24992, 48878, 12298, 44535, 16449, 2003, 9479, 8102, 5208, 19133, 46976, 28045, 30164, 3182, 17495, 49472, 15708, 5571, 23480, 49105, 19374, 5597, 7234, 8392, 961, 31260, 51776, 1023, 15160, 25360, 11096, 8315, 11952, 19940, 16518, 6518, 14906, 13494, 16007, 13275, 48815, 54410, 51714, 5770, 4378, 3403, 11410, 28048, 43467, 55014, 8713, 51940, 14197, 41911, 41373, 33967, 35269, 12304, 18049, 9515, 4052, 51247, 55061, 4329, 16865, 37790, 21303, 26019, 17754, 9182, 1748, 5831, 11658, 39795, 43883, 2837, 8943, 1686, 31026, 47931, 48209, 1282, 26744, 47688, 1092, 31395, 50173, 16407, 3960, 16119, 19210, 54830, 16340, 32053, 5705, 39586, 21451, 8456, 11907, 26794, 10009, 29863, 17933, 7772, 44753, 24350, 5443, 1235, 52384, 3656, 1447, 22221, 10049, 53498, 34990, 3819, 7066, 16232, 44106, 36113, 12152, 9205, 19763, 14930, 2697, 11308, 4689, 2134, 11719, 1268, 18681, 28770, 2774, 51364, 6605, 1055, 11731, 54574, 15369, 49850, 26111, 49623, 40236, 6844, 6659, 40197, 14240, 11094, 9994, 2051, 54877, 53928, 4228, 14009, 54245, 1078, 21368, 1684, 12210, 44251, 54432, 47831, 32363, 30828, 39949, 20588, 26711, 34294, 8850, 48768, 40113, 11185, 31331, 11920, 48221, 6561, 49257, 48870, 42468, 3042, 45407, 13524, 4412, 4480, 44472, 32800, 54450, 6827, 10705, 15009, 44197, 46107, 9343, 6745, 24182, 24878, 26771, 10222, 18116, 15117, 7034, 52224, 48112, 12016, 15039, 1422, 30327, 51160, 23905, 14789, 24838, 54255, 53239, 54365, 43744, 25701, 5848, 2018, 29194, 4434, 20533, 17673, 14834, 41437, 3686, 23374, 4781, 38214, 36692, 12796, 27178, 6465, 5201, 45518, 4843, 26045, 34030, 50363, 50789, 5597, 26846, 47083, 14722, 15627, 55220, 48037, 49071, 30978, 11354, 5004, 16486, 4811, 25941, 1441, 17853, 16868, 3062, 38824, 12738, 45315, 35803, 12298, 10659, 52111, 53087, 54126, 52123, 55005, 13684, 32170, 3993, 32111, 1118, 32267, 7238, 32444, 32885, 32481, 36115, 29039, 898, 32272, 32004, 3300, 32026, 1377, 50590, 11776, 32508, 1141, 32136, 3689, 32602, 3927, 32715, 32125, 9991, 32158, 32080, 45894, 32722, 1028, 32619, 3022, 4417, 300, 13456, 32433, 32424, 3824, 32807, 5859, 32512, 1267, 32136, 1388, 3128, 1740, 55354, 32681, 32342, 41497, 893, 32264, 1024, 11009, 32164, 1374, 32885, 870, 32140, 485, 7062, 32091, 17190, 32530, 842, 32628, 2998, 2036, 15456, 973, 44, 872, 32195, 47503, 32525, 21000, 32057, 28026, 55398, 3629, 8941, 10186, 1275, 32393, 32145, 2000, 1024, 55408, 898, 32644, 8807, 3756, 3627, 32454, 1214, 26220, 32094, 32360, 33871, 32008, 6783, 32130, 1654, 882, 55398, 1024, 5411, 10397, 9010, 20579, 858, 32210, 3031, 1027, 20837, 55386, 10073, 1214, 10679, 32209, 55413, 32091, 30163, 12144, 3022, 11146, 2085, 32094, 7801, 32667, 32188, 32468, 32342, 1605, 32435, 8021, 55446, 32722, 8757, 55366, 32562, 22185, 32396, 969, 30362, 1122, 5976, 32230, 32440, 6129, 32394, 4334, 4919, 1049, 32033, 1377, 35494, 1369, 32387, 55411, 32380, 17033, 55378, 5868, 32186, 3784, 32281, 55479, 2135, 859, 32150, 1275, 46536, 32575, 5127, 10920, 55447, 55407, 55450, 55333, 33471, 1545, 32377, 32288, 32043, 32032, 1131, 1430, 892, 5855, 32481, 42458, 10219, 15351, 32189, 16417, 11146, 32668, 55514, 32039, 3553, 1129, 32634, 9107, 28030, 10109, 55443, 1258, 950, 55516, 32267, 1728, 1388, 39145, 32046, 32009, 7102, 6189, 32556, 3824, 1995, 5243, 893, 30755, 2962, 55375, 55548, 3509, 19141, 27376, 32256, 11802, 32177, 32255, 55479, 4919, 32233, 1997, 3429, 32068, 55562, 50409, 25623, 55434, 32209, 39898, 32434, 3317, 45, 1024, 32545, 32042, 32581, 2000, 26245, 55456, 8941, 31997, 7795, 45936, 3927, 5073, 4643, 32338, 32039, 42192, 26884, 12537, 32068, 4337, 45637, 47769, 19673, 32164, 1526, 910, 4414, 950, 55600, 32293, 1488, 4807, 1916, 32210, 950, 49722, 32078, 1649, 55613, 32281, 55577, 32476, 32009, 55615, 5551, 32490, 32091, 51068, 55543, 32532, 1027, 32068, 1772, 55372, 32009, 5737, 4382, 32068, 32014, 37270, 1071, 1146, 32051, 32118, 32937, 32, 55421, 32354, 1362, 32019, 31994, 45101, 55620, 32581, 1475, 964, 31997, 32052, 6025, 32722, 8909, 876, 19029, 32293, 55414, 30163, 13624, 32388, 53287, 55661, 55449, 43559, 1264, 20532, 32082, 55577, 32441, 17680, 1995, 32041, 11906, 55480, 15613, 876, 32033, 32682, 36644, 3456, 27042, 55370, 55445, 27723, 32542, 12803, 1376, 3632, 54885, 12013, 32674, 8024, 4110, 9274, 24443, 20579, 55488, 1464, 49566, 55564, 32662, 55423, 2880, 7200, 1306, 11342, 9381, 55346, 55460, 1233, 32290, 5841, 55712, 22012, 3407, 41497, 317, 32136, 55645, 15117, 32016, 32361, 10243, 36774, 3526, 55726, 1194, 55370, 32406, 52349, 1386, 55481, 1919, 54354, 20740, 32554, 55488, 55673, 11423, 1430, 2971, 1021, 32260, 55560, 2067, 55490, 8475, 45894, 32164, 957, 1078, 32466, 32376, 32, 32170, 16450, 32057, 32602, 55733, 25856, 898, 582, 2403, 32465, 859, 32047, 13285, 1516, 1240, 32256, 8618, 13105, 32209, 9107, 32310, 5724, 32454, 46077, 55545, 32224, 2048, 2085, 32149, 8072, 32512, 5137, 32189, 1192, 842, 32510, 43384, 2261, 890, 32150, 55502, 29167, 32722, 32326, 866, 31997, 55645, 47275, 55413, 32164, 2027, 55797, 55518, 13038, 55746, 55758, 485, 838, 32469, 45894, 55494, 950, 1209, 1231, 32639, 9386, 32461, 45933, 32382, 1528, 1252, 32055, 2044, 55720, 32060, 3946, 1139, 55699, 55832, 32807, 32293, 32172, 32807, 55632, 32306, 1866, 55840, 32016, 55842, 55417, 32539, 32807, 1007, 32047, 55829, 55520, 32706, 47546, 55836, 27802, 32026, 55841, 1647, 32525, 32347, 55554, 32082, 1348, 957, 4493, 3721, 55389, 55865, 55585, 5778, 45991, 890, 32639, 8842, 32512, 1348, 840, 32382, 35475, 13452, 19367, 55847, 41497, 55646, 55857, 55753, 6766, 55833, 1271, 55860, 55886, 20717, 55844, 1435, 32732, 55861, 1769, 32644, 4807, 1377, 18617, 55770, 32707, 1252, 55635, 54930, 55836, 32242, 55838, 55721, 55913, 32060, 55915, 34107, 55895, 55398, 55897, 1681, 38301, 32170, 2085, 32444, 1798, 55866, 10920, 32130, 18657, 55767, 8330, 20532, 55906, 5894, 38787, 55438, 32014, 3692, 55937, 32267, 7801, 2331, 3343, 55805, 32072, 3379, 32062, 1518, 32060, 55717, 3379, 32711, 1605, 32404, 10183, 32300, 45696, 32165, 32512, 1435, 1414, 1728, 3407, 32630, 32515, 55962, 1033, 11009, 55677, 19697, 55903, 55758, 55760, 1502, 45637, 1634, 32026, 55445, 43270, 582, 7795, 32325, 5137, 118, 55620, 55351, 32227, 317, 32130, 4417, 32026, 32508, 943, 32039, 14143, 32033, 32016, 55773, 32009, 32581, 55997, 14807, 21820, 890, 55576, 55991, 32596, 950, 4800, 32284, 56002, 55804, 14963, 44556, 55550, 55422, 32145, 14473, 55756, 32070, 55790, 10920, 55993, 3018, 56006, 293, 56016, 32674, 32539, 55773, 32506, 55988, 55364, 56034, 32078, 55612, 1009, 55774, 32285, 39145, 55831, 32692, 2261, 32136, 32672, 41295, 1060, 387, 1131, 56046, 26220, 13603, 20862, 23714, 55732, 32014, 1192, 55903, 1632, 55846, 55892, 55974, 1546, 3022, 50582, 32404, 56059, 55981, 32070, 55380, 27084, 55853, 1386, 55590, 55939, 56075, 55681, 55943, 2171, 55945, 55952, 21711, 32186, 32397, 56083, 9498, 5411, 32315, 55957, 23714, 32725, 55752, 55962, 55648, 2107, 55960, 55890, 55969, 6009, 32180, 951, 55973, 32219, 5124, 1656, 32619, 55365, 55721, 55882, 55597, 55477, 55620, 55612, 1385, 32026, 55821, 56113, 13857, 55606, 32518, 32039, 26740, 31997, 55949, 300, 32394, 56100, 55629, 56126, 32078, 56129, 55494, 32177, 1071, 967, 32293, 32044, 7660, 10608, 56056, 56138, 32479, 15163, 56126, 32517, 47551, 857, 1875, 32136, 56146, 10498, 964, 55431, 12165, 55413, 11376, 32357, 56155, 55854, 32218, 32141, 2034, 32133, 39760, 55579, 3022, 55941, 32481, 55776, 55390, 55643, 32302, 1430, 1376, 13741, 32268, 1377, 55473, 969, 55767, 7080, 6129, 877, 32715, 32504, 2171, 32664, 24182, 55749, 2017, 29558, 1628, 32145, 55559, 6920, 2017, 55767, 55972, 43270, 32454, 55357, 4493, 56093, 8618, 1518, 2041, 5809, 8941, 55951, 56206, 55652, 840, 56182, 55755, 24541, 56173, 7077, 56176, 1256, 32681, 56179, 56107, 55788, 3456, 2171, 2000, 890, 32264, 56047, 56086, 9568, 50590, 55385, 55759, 17179, 32039, 55830, 32042, 1388, 55715, 1734, 32382, 55670, 3627, 15093, 55419, 56143, 55709, 32070, 55371, 6284, 32032, 11955, 4417, 56006, 1526, 56089, 55601, 26783, 7214, 55798, 32009, 55940, 29136, 56229, 55990, 55578, 55711, 1900, 32154, 56146, 32390, 31999, 30669, 32009, 3011, 1487, 879, 32478, 55851, 55650, 55592, 1542, 32592, 32682, 1613, 1423, 55764, 55625, 3419, 32085, 32012, 1919, 55631, 56292, 45696, 32674, 1485, 7200, 56137, 16952, 55973, 56109, 20573, 55682, 55351, 5245, 56275, 56306, 6022, 5411, 6211, 5570, 32173, 32223, 56312, 55720, 8647, 20565, 55653, 1331, 56284, 1184, 32013, 56008, 55722, 14807, 28026, 55990, 27670, 32562, 32440, 55332, 56013, 1225, 32051, 32177, 4364, 56268, 55360, 32435, 56028, 5243, 2211, 55996, 56014, 56018, 1241, 56347, 32562, 1377, 56330, 32542, 8807, 55808, 32302, 55980, 55369, 56156, 56048, 11855, 55396, 32242, 32014, 55568, 1364, 32083, 55363, 55610, 56247, 55869, 9629, 4800, 842, 32611, 56078, 42259, 55895, 32435, 56096, 6211, 8608, 12537, 1071, 55647, 32016, 2846, 56314, 1264, 55659, 55646, 37692, 32406, 56081, 32224, 56241, 10679, 840, 32377, 7733, 55638, 32255, 31547, 56279, 2461, 56020, 1187, 32068, 5742, 55437, 55881, 32070, 55724, 55702, 56036, 32302, 56118, 15456, 56338, 28026, 1817, 8757, 55554, 56365, 55620, 56028, 5619, 32242, 56258, 55461, 55722, 55755, 35332, 56044, 1070, 31997, 56072, 1900, 56344, 1988, 32293, 55994, 12455, 56313, 32248, 56096, 1746, 55419, 32380, 1200, 55600, 56449, 56204, 32380, 1630, 1304, 1241, 44, 3028, 8517, 32233, 56171, 55548, 56460, 55706, 5857, 56209, 1654, 32060, 56366, 32261, 55701, 55998, 39760, 56371, 56349, 56374, 55470, 32611, 293, 55437, 5946, 56364, 55398, 32388, 45685, 56135, 1423, 32032, 56434, 9688, 32512, 56188, 55672, 47551, 2331, 56189, 56452, 39578, 32542, 56010, 56192, 56441, 56437, 56049, 55361, 32302, 56436, 32725, 56505, 56414, 55460, 55839, 11666, 56154, 55550, 7733, 48543, 32556, 56356, 27619, 11834, 56520, 55482, 55790, 10698, 32121, 293, 8517, 43409, 1488, 964, 32651, 53715, 56531, 19892, 32125, 5551, 32411, 11184, 55541, 32082, 56203, 1817, 32219, 8021, 55503, 32069, 582, 1379, 56056, 56267, 11670, 56375, 56410, 950, 55830, 55333, 56363, 56262, 55465, 56349, 1376, 55585, 55714, 6211, 14743, 882, 1263, 55596, 32317, 42043, 56027, 56436, 32380, 10691, 25186, 56006, 56503, 52039, 55607, 32437, 8326, 56004, 49566, 31997, 55967, 1681, 56586, 32173, 56566, 55603, 55610, 55630, 55625, 56500, 861, 55623, 55631, 56492, 32259, 37340, 55765, 56052, 5857, 32454, 56602, 56410, 55826, 1066, 32154, 56168, 2089, 32060, 56581, 32284, 1136, 56450, 56460, 32177, 1078, 56618, 3022, 56525, 56058, 55745, 2261, 56333, 56611, 56302, 56129, 55373, 55756, 56376, 10123, 56184, 10568, 56422, 56205, 56085, 11724, 32091, 56316, 32136, 11738, 56176, 1017, 582, 55383, 19673, 1007, 32377, 18060, 55366, 32032, 56315, 27802, 890, 32382, 10691, 1518, 32284, 56617, 32281, 56558, 54929, 55767, 3031, 55516, 2959, 32486, 56036, 55946, 27802, 8361, 55363, 1850, 55439, 32177, 55642, 55933, 3380, 32299, 55964, 5244, 56380, 56685, 55649, 55621, 32555, 32069, 56278, 20579, 56521, 55338, 3292, 56608, 55354, 55382, 55868, 50582, 55465, 56691, 55754, 56487, 32284, 16176, 49991, 32082, 56492, 32284, 3058, 50085, 55774, 32014, 56714, 55773, 32556, 56718, 5328, 32611, 32221, 19673, 10608, 9549, 32193, 25583, 1277, 32943, 32512, 1006, 32502, 19899, 32385, 1478, 32461, 16453, 32128, 1192, 56736, 46487, 55794, 55397, 21080, 32177, 18681, 55329, 56614, 56682, 56625, 1139, 56749, 32125, 56615, 14801, 5723, 32267, 56183, 15456, 890, 55510, 32682, 32043, 32121, 56391, 2331, 56660, 32070, 1220, 56599, 56662, 42192, 32600, 55724, 56397, 32692, 15874, 56513, 27802, 32435, 56478, 1619, 21316, 32275, 32532, 1536, 32284, 32133, 32449, 56305, 55614, 32203, 56592, 49138, 49397, 56182, 1430, 56638, 55350, 55405, 3419, 20565, 32722, 56083, 32230, 55670, 33871, 56561, 333, 56151, 978, 9381, 56263, 5105, 42043, 32714, 55987, 28026, 32390, 55641, 6974, 55337, 56238, 2067, 32136, 56750, 31237, 56539, 55992, 5824, 10516, 22224, 1024, 56050, 55353, 1070, 1656, 36081, 3955, 32668, 56505, 56653, 56163, 11316, 32082, 32484, 32130, 50582, 1129, 56699, 56850, 32224, 1037, 55787, 55852, 55620, 32440, 28990, 56646, 56825, 56208, 1505, 55541, 56861, 56321, 840, 56784, 56124, 55939, 1264, 56817, 32210, 55540, 56733, 56017, 56146, 56874, 56732, 55693, 56522, 32397, 29578, 4110, 55722, 56691, 56158, 32535, 55778, 56631, 10498, 32535, 56430, 55954, 29839, 56584, 55866, 56895, 7570, 56755, 56097, 26953, 3553, 56093, 56771, 11367, 32454, 55359, 32267, 56367, 56704, 56859, 32248, 56712, 56264, 55540, 26154, 56486, 55756, 56618, 56628, 56437, 32014, 3028, 30425, 32128, 5818, 32054, 32506, 1028, 55328, 32061, 32342, 30748, 56427, 951, 56932, 9053, 39939, 32121, 1377, 32396, 5575, 32261, 56269, 18022, 41497, 4683, 32544, 56831, 7077, 1422, 44928, 10008, 2535, 56343, 55515, 24193, 13067, 55366, 56693, 55371, 55434, 55424, 39248, 2041, 32377, 5742, 55390, 32083, 32221, 39281, 55336, 55722, 55602, 56330, 56372, 56249, 6486, 56770, 55425, 55754, 55433, 1261, 56017, 56899, 56438, 56835, 25886, 56182, 55618, 3165, 32189, 55743, 55723, 55947, 55989, 56361, 32397, 56792, 56277, 56179, 4919, 56281, 56276, 11664, 56663, 32592, 55341, 3128, 56290, 1769, 56803, 55339, 56295, 56291, 2098, 20565, 56343, 56139, 17918, 56102, 56856, 2689, 22845, 32596, 1630, 34072, 12306, 56830, 32697, 56175, 56319, 5570, 18104, 32128, 5767, 56446, 8832, 55753, 32175, 55651, 1011, 56326, 32545, 14868, 55707, 56617, 57047, 56019, 56683, 56477, 56152, 19899, 56060, 56151, 56642, 55620, 32539, 22725, 32256, 56367, 56369, 56342, 56328, 56545, 52655, 55756, 56377, 951, 4643, 55918, 55833, 56387, 55964, 56383, 55515, 2552, 57075, 56389, 35412, 56388, 862, 32069, 56658, 57084, 55983, 56399, 56064, 50474, 5527, 56030, 57003, 10686, 56563, 56697, 32390, 56787, 32720, 32070, 56828, 56777, 55984, 56006, 56773, 57044, 14514, 26220, 55620, 32133, 5396, 55591, 56663, 55632, 32360, 1656, 32210, 56794, 1473, 2650, 22845, 56430, 1772, 13454, 55497, 56264, 56799, 15456, 56173, 56353, 32179, 57014, 56413, 56598, 56381, 55904, 15477, 56484, 7214, 56812, 56997, 56815, 56667, 969, 32382, 56382, 56575, 55474, 9093, 2089, 7059, 55961, 56337, 5107, 56288, 11538, 56931, 2846, 32051, 56558, 55457, 1093, 56836, 20604, 55473, 48506, 56727, 55993, 56016, 56844, 55325, 11855, 57092, 57070, 56904, 57126, 56760, 56993, 32302, 56625, 1806, 32275, 32166, 56224, 55333, 9107, 56774, 57130, 55988, 32691, 56453, 32486, 57043, 32390, 57043, 32078, 56161, 56577, 57196, 57110, 56123, 56289, 55939, 56028, 1850, 32674, 2036, 6920, 56132, 55536, 57069, 2055, 6920, 32499, 57211, 32050, 13975, 931, 56302, 57187, 18911, 56875, 55438, 9205, 32466, 36916, 57223, 56842, 55608, 43270, 32225, 8820, 57023, 56060, 44491, 56785, 32069, 57221, 56325, 56810, 6509, 55534, 55836, 55749, 56260, 1306, 55882, 1218, 29026, 4567, 32129, 57036, 32051, 4875, 56629, 55564, 55540, 56089, 32230, 55577, 56686, 32482, 56391, 2089, 56151, 57264, 55642, 46228, 10085, 32725, 57086, 1900, 4861, 56103, 32668, 57272, 57215, 1037, 16733, 32256, 28203, 32057, 22285, 32042, 974, 55833, 5113, 33745, 55329, 17419, 56266, 2919, 32461, 872, 32710, 55445, 56021, 56182, 56917, 3970, 32525, 2087, 1264, 8820, 32242, 55964, 56849, 28855, 10872, 56460, 3513, 55977, 2821, 55341, 32720, 57306, 13285, 55780, 14270, 56530, 39248, 55809, 2738, 55554, 32001, 1227, 32730, 16866, 32525, 46849, 55425, 32041, 39567, 57283, 4065, 5778, 12013, 1605, 56460, 56219, 57166, 30640, 32016, 56242, 56397, 32261, 38787, 54454, 56835, 55595, 57346, 32039, 57348, 56563, 1192, 57250, 55909, 57274, 2085, 35468, 56460, 1388, 56316, 1129, 32525, 48165, 55368, 931, 56460, 3516, 1628, 44928, 5124, 1475, 56194, 55398, 10008, 56227, 46406, 32062, 57305, 32083, 16417, 56364, 46073, 55574, 56430, 2230, 32382, 57249, 1074, 57035, 56259, 56874, 32203, 56039, 35805, 57036, 55601, 1033, 19543, 6491, 57267, 32442, 43999, 56288, 45142, 55879, 51068, 57362, 57083, 2963, 1386, 1187, 32209, 57272, 6387, 55994, 56565, 25344, 57283, 32885, 55647, 57286, 56568, 44122, 6817, 883, 55647, 3022, 55537, 56251, 55821, 12342, 55702, 17542, 55777, 32481, 56864, 55927, 32, 32525, 1006, 55745, 55423, 4390, 957, 55411, 57310, 1636, 57347, 6999, 32198, 32111, 12203, 32249, 32177, 52408, 24335, 13741, 56927, 51888, 56638, 56650, 57300, 56857, 4649, 55549, 55951, 32294, 13200, 35005, 32512, 12342, 32268, 55371, 32200, 5862, 56494, 2971, 57285, 57071, 6211, 57282, 55512, 57482, 57081, 6265, 57250, 32175, 5073, 57217, 57417, 15635, 57270, 32121, 57363, 32585, 16927, 56901, 56782, 8437, 57407, 57398, 57259, 14130, 32433, 16892, 57258, 57339, 57274, 56629, 55815, 1171, 55818, 32259, 55878, 55822, 840, 55824, 21873, 32125, 55827, 55722, 57198, 32302, 55900, 55920, 32300, 55837, 57528, 55915, 55843, 57530, 32718, 55900, 32656, 7775, 56063, 55853, 57144, 6025, 55775, 55921, 56636, 57533, 55863, 55871, 5619, 55572, 22870, 32130, 56089, 10568, 13105, 57550, 55873, 55826, 2461, 55877, 4752, 57519, 32722, 32542, 56161, 11585, 55900, 2537, 32158, 55921, 55891, 55467, 55894, 55833, 1958, 57545, 55899, 55895, 1007, 55902, 12155, 18617, 56413, 57198, 32069, 55835, 55819, 55917, 57572, 32248, 55915, 56687, 57074, 57587, 9274, 4126, 32755, 55002, 49388, 35709, 50576, 15823, 32170, 6673, 56204, 32025, 5243, 57431, 55701, 57564, 56134, 42043, 3356, 57055, 56166, 2052, 56534, 32506, 57060, 1477, 57005, 57013, 55463, 14143, 56274, 55376, 55901, 22400, 57379, 55876, 20426, 57261, 55649, 55498, 56567, 56974, 7795, 3380, 55804, 15707, 32057, 57625, 32478, 57325, 46487, 57056, 5818, 21316, 48574, 57335, 55834, 293, 55887, 859, 57243, 55410, 4385, 32083, 1054, 55955, 9160, 55828, 57542, 32290, 4752, 931, 56557, 32091, 55520, 55507, 55605, 39578, 55986, 25625, 55430, 5407, 32150, 56152, 32008, 1275, 56788, 55909, 57681, 7218, 32281, 56482, 879, 56400, 56163, 4110, 56135, 55552, 57608, 55996, 31782, 57611, 8916, 56392, 57197, 57466, 55696, 51888, 1536, 56804, 21673, 55541, 32128, 3692, 2965, 6997, 22189, 32212, 56136, 32611, 32532, 57432, 32002, 1031, 55765, 306, 2497, 55670, 56490, 32214, 6180, 56715, 32467, 55658, 55944, 32362, 52067, 9654, 32596, 57533, 56457, 55784, 5013, 56817, 19547, 56747, 55628, 32230, 1028, 45637, 57655, 56236, 56705, 55329, 9107, 55520, 57126, 55772, 44603, 859, 32639, 51873, 55879, 55659, 55333, 57753, 56935, 55986, 2495, 57723, 26679, 56105, 2995, 56495, 32435, 56255, 55517, 56111, 32586, 57606, 57101, 32091, 56092, 32033, 56398, 14143, 57442, 4869, 32515, 55880, 55579, 1220, 57235, 31122, 57332, 32267, 1536, 57321, 26161, 2735, 55359, 57394, 46824, 55354, 36017, 9093, 19913, 55804, 1021, 55935, 1430, 8993, 56051, 14473, 56067, 55550, 57806, 6149, 32668, 57106, 1425, 57012, 32748, 55762, 32099, 55375, 423, 47503, 2060, 56889, 32596, 57812, 866, 28802, 32125, 6798, 32128, 57827, 36753, 32695, 57621, 968, 56216, 57240, 56428, 55549, 56218, 55662, 50590, 32026, 56175, 4382, 893, 32525, 31313, 951, 56856, 55398, 8909, 56788, 6368, 56437, 56570, 55991, 2509, 32047, 56219, 57847, 32256, 57729, 56396, 1379, 56727, 55550, 57748, 56879, 56727, 57105, 56115, 1475, 56910, 32306, 2135, 943, 32293, 1214, 55794, 48001, 56594, 32281, 32118, 57209, 9498, 56594, 55601, 56752, 28990, 13951, 57219, 32267, 32166, 55964, 13544, 55342, 56965, 55671, 27288, 57469, 57551, 55429, 57794, 57135, 56260, 32125, 6817, 8017, 57905, 57044, 5836, 55415, 56975, 56273, 32070, 56697, 55653, 9093, 5655, 8867, 57133, 55653, 57824, 56228, 56358, 57651, 57400, 57819, 56006, 55589, 56288, 57864, 56467, 32732, 57846, 56149, 56173, 55708, 6486, 32380, 56619, 56204, 55906, 57862, 56177, 57666, 45991, 43542, 39281, 32502, 57949, 1369, 56816, 56403, 57586, 57653, 9413, 32596, 56928, 56935, 56080, 20565, 56933, 32054, 56493, 56498, 32674, 9104, 13105, 32168, 57747, 9649, 57402, 57529, 55858, 1129, 57674, 1670, 8363, 57145, 32302, 57010, 57410, 12155, 55342, 32055, 55565, 56462, 32293, 57985, 3165, 55700, 57688, 55775, 32261, 1027, 57217, 7801, 56149, 4411, 1619, 55676, 57429, 10051, 56149, 1151, 58004, 29039, 57970, 32426, 29605, 2211, 57175, 882, 45071, 57111, 57206, 32158, 55904, 56242, 44491, 58005, 57207, 31994, 32138, 1658, 20507, 1995, 55640, 32016, 58028, 56519, 57182, 55909, 56226, 3782, 55912, 57568, 57721, 13043, 57982, 870, 57861, 57774, 32476, 57057, 55808, 32078, 57371, 32466, 32697, 56146, 56037, 56767, 56188, 55558, 2060, 57496, 1505, 1605, 22285, 56264, 56391, 17210, 32281, 57363, 55512, 58065, 57523, 57925, 12110, 55801, 32229, 57277, 24382, 57613, 55391, 1460, 43789, 17466, 56489, 2495, 58068, 57344, 12082, 57633, 56097, 58062, 4807, 17397, 56144, 56221, 10266, 32130, 58039, 57191, 39578, 32377, 49899, 57344, 56623, 32224, 32294, 27802, 58042, 42892, 55527, 57467, 57761, 57943, 58047, 32600, 7801, 1986, 32380, 57617, 55575, 57971, 1407, 32293, 57938, 32055, 25343, 56308, 55928, 32172, 29196, 56251, 55414, 32438, 57411, 56316, 55620, 55523, 883, 55629, 2036, 910, 6999, 13117, 2002, 55567, 32044, 57472, 1071, 1024, 25002, 32449, 14268, 22240, 55614, 9503, 6189, 32120, 55469, 52039, 56916, 55755, 28216, 55572, 16869, 57162, 57581, 58022, 1231, 55427, 56310, 56147, 7077, 57469, 58099, 53160, 57912, 58174, 9699, 58176, 57468, 16996, 55534, 32207, 57741, 32380, 6284, 58184, 32541, 32121, 978, 56250, 6584, 56774, 57743, 55769, 57197, 57838, 55488, 57239, 32600, 9223, 45637, 32611, 58197, 55543, 58190, 56716, 56770, 57744, 11127, 32281, 58204, 58192, 56285, 58199, 56264, 58197, 32146, 58195, 55722, 3513, 56250, 58199, 58218, 57733, 39719, 56774, 56701, 32342, 47691, 58201, 58210, 58215, 58221, 58207, 56796, 4032, 58203, 58229, 6446, 58239, 58198, 58197, 31490, 58241, 58194, 58225, 57090, 17542, 57461, 55585, 56482, 1225, 48747, 55655, 56404, 50512, 57474, 50135, 55767, 22185, 56194, 1017, 56608, 55921, 55805, 56168, 29136, 32394, 57624, 56348, 3031, 56169, 58260, 57936, 737, 45936, 56438, 1289, 57464, 56743, 55801, 32377, 1630, 29167, 55353, 56703, 32150, 3028, 8730, 57674, 57178, 56649, 56071, 1445, 57762, 57534, 55836, 3071, 32150, 17419, 39281, 859, 58291, 57128, 32960, 55932, 58301, 55328, 58042, 57865, 1900, 58300, 58295, 1314, 57674, 56709, 32035, 57671, 32682, 2017, 57763, 1668, 55638, 1066, 32219, 57367, 57899, 316, 582, 58052, 5505, 32454, 25211, 57813, 56646, 55371, 17210, 58045, 40178, 57182, 32562, 56596, 8730, 6587, 58341, 32243, 32515, 55384, 56328, 56265, 56733, 57201, 57237, 32129, 57364, 58353, 56124, 55466, 55377, 55632, 57448, 32200, 55375, 55467, 55333, 11188, 57999, 893, 58322, 57765, 1066, 55982, 32399, 44603, 32, 32639, 32728, 58033, 32173, 56170, 56700, 57514, 55817, 57535, 56666, 32461, 55944, 58376, 8937, 56118, 6509, 55828, 58305, 55831, 55371, 21316, 32356, 56715, 32302, 58396, 1628, 56583, 57024, 32087, 55804, 56200, 57580, 55491, 55709, 32588, 56651, 39248, 32380, 56717, 32662, 56042, 56343, 57230, 32524, 57555, 55390, 55893, 1348, 32547, 56885, 55864, 57557, 8941, 58391, 57631, 433, 58387, 56081, 57697, 57178, 1353, 58401, 56959, 57457, 57727, 12098, 36774, 56189, 58407, 21963, 57283, 26154, 58418, 56103, 43270, 55902, 7801, 55581, 57584, 56724, 56923, 32344, 58406, 58419, 14461, 56584, 57895, 58460, 58442, 58397, 56721, 2744, 55923, 55491, 56180, 32332, 55813, 57046, 58330, 56165, 55332, 543, 13285, 56876, 55504, 56942, 46536, 32219, 7660, 55930, 57828, 56666, 55380, 9413, 54346, 57606, 57276, 32572, 17210, 55626, 32177, 32325, 32556, 57990, 8918, 32584, 55547, 56959, 57721, 4875, 58023, 32150, 57867, 57441, 55986, 1374, 55880, 32656, 32038, 57372, 3295, 58511, 32044, 56788, 55812, 32118, 58324, 58248, 32504, 56298, 32121, 32504, 43844, 55612, 55548, 32060, 1031, 13128, 890, 57674, 6840, 32342, 16866, 56105, 4334, 58156, 32674, 3692, 56210, 57697, 58001, 56703, 4817, 56220, 32051, 55359, 58287, 55632, 1028, 55787, 58535, 10720, 57125, 56170, 56353, 23714, 56769, 1136, 1233, 32120, 4773, 58565, 56740, 1220, 21943, 58540, 31999, 55461, 55993, 1798, 56974, 32614, 55670, 56107, 56418, 32672, 58402, 5822, 56180, 55333, 56226, 57554, 55986, 58284, 976, 58330, 1024, 57235, 32008, 1485, 56719, 32069, 58596, 56571, 58551, 58538, 914, 55534, 1850, 56482, 58020, 35494, 56644, 58107, 55882, 11855, 58471, 58581, 29605, 57961, 58579, 25388, 55767, 58587, 32314, 57721, 5995, 58559, 58592, 57335, 902, 58595, 58374, 58207, 58599, 56040, 5818, 4496, 1104, 32219, 1518, 57642, 32315, 1054, 57125, 56225, 58476, 898, 58478, 16869, 58017, 55538, 4875, 55692, 56762, 56163, 56288, 57153, 55653, 28405, 32130, 55381, 58389, 58092, 57777, 57554, 32584, 2006, 57618, 58389, 20358, 57790, 493, 839, 57448, 56253, 32042, 56519, 55869, 55416, 959, 32044, 57667, 493, 1890, 55404, 55794, 55398, 5995, 55934, 58659, 58674, 58662, 1075, 57806, 56638, 490, 54147, 3782, 32105, 2027, 57699, 32656, 6773, 55709, 32036, 8675, 28990, 56470, 58673, 56752, 58689, 32744, 57654, 737, 32741, 57910, 55432, 55577, 58658, 582, 32075, 4032, 2752, 58693, 55440, 57166, 32202, 56573, 2017, 57756, 26783, 56462, 1129, 582, 16417, 13741, 1737, 32189, 2038, 14143, 1027, 32383, 1214, 4390, 9990, 32658, 55905, 32604, 58740, 57982, 32481, 12823, 58647, 56064, 15477, 56849, 4917, 32281, 11188, 56266, 58577, 56125, 56997, 56264, 55930, 55681, 5836, 57289, 58761, 29813, 55629, 32426, 57828, 57918, 32479, 1877, 55748, 56266, 57115, 56332, 56369, 57262, 6022, 35009, 55629, 32326, 38897, 3419, 6965, 55513, 32125, 56291, 1464, 57667, 58778, 5407, 1096, 49663, 56443, 1850, 57869, 974, 56227, 56443, 55676, 56128, 55755, 56076, 57508, 32506, 58799, 21099, 57045, 57897, 58794, 55660, 32412, 57431, 58053, 32019, 32581, 22781, 12165, 1656, 32393, 58817, 32039, 58064, 5822, 1139, 57004, 56007, 869, 2752, 55986, 3946, 57354, 32634, 58249, 58039, 57940, 3516, 56549, 17033, 57316, 55632, 58561, 2476, 57377, 58486, 890, 32002, 58109, 58480, 58042, 42043, 57758, 58293, 24701, 57523, 6608, 58735, 55433, 20970, 55398, 58643, 16873, 58675, 55462, 58863, 55799, 32532, 32937, 56857, 1668, 43789, 32706, 58872, 58253, 58862, 57422, 32139, 56163, 1725, 58691, 56420, 1536, 32572, 58036, 58505, 56175, 57342, 32002, 1357, 57806, 9403, 57520, 5111, 58715, 27084, 32150, 2738, 56220, 58369, 8966, 57903, 32656, 32594, 58772, 1104, 58511, 32662, 56920, 55518, 9093, 57226, 1007, 58511, 56625, 56392, 58904, 1649, 6965, 58907, 44739, 57214, 32633, 7762, 58882, 3165, 55443, 6189, 57010, 949, 56588, 8021, 56330, 57763, 26797, 49397, 55828, 58916, 5137, 55719, 1454, 32083, 55483, 56140, 58941, 32651, 55972, 5505, 9205, 46849, 55912, 55608, 5505, 32644, 5836, 58014, 56769, 13040, 55880, 32223, 56717, 1214, 46849, 56506, 58948, 32233, 55832, 58634, 56740, 58953, 58967, 32172, 58969, 32243, 58944, 969, 58377, 2027, 56739, 55788, 2070, 58542, 898, 32715, 58963, 56733, 55525, 56482, 55695, 57439, 58939, 4567, 58985, 58753, 57953, 58989, 58495, 58898, 58593, 57999, 58557, 32620, 57461, 56173, 1200, 57699, 55617, 55560, 22273, 58748, 56066, 25388, 32264, 974, 48543, 57715, 55668, 58914, 27283, 58545, 56650, 1289, 57076, 59019, 1390, 55390, 1007, 32189, 32221, 45101, 58823, 57402, 32722, 59030, 56902, 13353, 56686, 55654, 58906, 840, 58832, 56808, 5411, 58855, 56864, 3627, 57674, 10691, 48543, 893, 55427, 58132, 57405, 1037, 56534, 19756, 57785, 1526, 58647, 25129, 58650, 32224, 58094, 16976, 57931, 59063, 3809, 31388, 32133, 32510, 58818, 55332, 55410, 58363, 58829, 21014, 47386, 56339, 1728, 59032, 57897, 32475, 26314, 59081, 5407, 58994, 56266, 56307, 56867, 57439, 58888, 9160, 59087, 56733, 58105, 56862, 56214, 31839, 32885, 1017, 58316, 1024, 57661, 56267, 57921, 32145, 1502, 59104, 57538, 4807, 32572, 1413, 32639, 24221, 55527, 3920, 55932, 55772, 17150, 55986, 9337, 58686, 55782, 58986, 57224, 59122, 37483, 55932, 55469, 23946, 59121, 3451, 59123, 56283, 9381, 55488, 59127, 8918, 55767, 46077, 1118, 2041, 32047, 58640, 42043, 32256, 58875, 55951, 32118, 55773, 870, 59114, 7795, 58873, 840, 55417, 55752, 59047, 12455, 56715, 58339, 2055, 57831, 56996, 59161, 55543, 56028, 50085, 59165, 59151, 32656, 9355, 59155, 57940, 58631, 56386, 32333, 57781, 2880, 59151, 32596, 59178, 6537, 32002, 7515, 57412, 57979, 11734, 58686, 58693, 56741, 49775, 32082, 59115, 59174, 58835, 56123, 57513, 58478, 57777, 55381, 32083, 32206, 55441, 898, 55877, 1670, 58492, 58435, 58992, 36725, 58033, 56739, 58975, 56388, 6007, 55891, 58974, 56303, 57999, 48444, 58964, 59137, 58953, 5137, 55902, 8807, 1304, 58339, 58512, 29193, 32069, 57378, 32270, 58403, 58568, 59218, 58947, 58971, 59238, 57791, 58976, 1306, 58589, 25211, 57878, 58293, 52767, 59056, 55465, 1505, 55405, 32014, 57371, 56166, 5767, 58399, 58536, 59150, 1956, 59118, 59051, 56264, 58992, 57864, 58528, 56337, 59257, 56000, 59259, 57458, 59261, 57110, 32430, 27230, 55986, 59269, 1956, 32486, 57448, 58133, 6022, 58399, 20407, 3429, 58342, 59260, 893, 55932, 2995, 58650, 57721, 59278, 59263, 11664, 59016, 59283, 56000, 47546, 55937, 59170, 1956, 32634, 2098, 56107, 32453, 58216, 57245, 56456, 59103, 55715, 56264, 32172, 55606, 32015, 57661, 59172, 1200, 58920, 898, 59121, 55793, 13105, 32481, 5896, 32512, 56800, 19874, 58960, 32033, 32461, 32667, 24524, 55977, 32224, 59332, 1551, 55799, 57363, 56357, 57674, 8618, 32043, 59098, 9503, 58893, 55989, 3011, 55457, 57586, 55359, 2473, 32230, 56494, 2999, 55986, 9302, 56070, 44749, 58523, 57674, 11188, 56172, 58330, 32342, 23946, 32008, 55755, 56932, 3855, 56388, 56097, 55422, 58107, 59374, 57084, 59376, 1470, 57412, 58792, 4411, 58832, 56558, 8517, 57439, 58289, 57138, 32008, 7080, 58173, 11936, 57627, 32550, 57881, 59324, 57763, 59395, 8867, 32215, 57448, 31737, 57680, 1386, 13454, 59233, 32426, 57410, 1919, 57046, 32219, 1562, 59314, 58632, 16869, 57469, 57611, 59049, 57182, 56071, 56937, 32018, 59176, 59420, 58162, 58759, 56676, 58136, 56047, 32710, 56732, 36916, 59125, 57306, 57859, 2556, 59429, 58790, 58138, 14532, 57855, 55623, 57046, 55868, 32720, 59008, 57847, 58505, 58519, 3292, 55767, 4752, 56253, 58042, 56952, 57206, 58546, 58552, 55485, 1115, 56534, 32026, 32195, 55973, 58812, 32562, 32572, 55548, 56264, 56835, 17223, 56387, 8872, 55766, 55543, 32581, 24279, 57721, 59363, 59468, 59451, 32605, 58290, 56427, 32444, 27891, 32150, 58249, 1654, 57584, 56942, 4110, 57085, 58743, 58031, 8475, 57813, 5946, 56180, 56588, 32091, 58770, 58612, 56107, 56854, 57344, 57973, 798, 13563, 56671, 57853, 58069, 56021, 56661, 59398, 2498, 1060, 1995, 58763, 59133, 37483, 59517, 20579, 59426, 59136, 59428, 32724, 59430, 58613, 59438, 32018, 59444, 2509, 5836, 5241, 32496, 57003, 55962, 32658, 55997, 57124, 56429, 14532, 58777, 3629, 9289, 4420, 58511, 55536, 56559, 59481, 32057, 8730, 55882, 59532, 31520, 58824, 57511, 32288, 55366, 56331, 21014, 55713, 58150, 58015, 2055, 56266, 56006, 59072, 32128, 978, 41885, 56819, 4053, 32691, 56050, 57105, 57777, 1006, 56387, 879, 57711, 59539, 56348, 32111, 1545, 14743, 55709, 32611, 32512, 58349, 6694, 58150, 55353, 56332, 32499, 56984, 56679, 14963, 1850, 21316, 57059, 32300, 55737, 56275, 59601, 58260, 32532, 1877, 55985, 10280, 55342, 58730, 56277, 32547, 55801, 58727, 58896, 1900, 32264, 2044, 56067, 32116, 58806, 55802, 58909, 32050, 33862, 55819, 2098, 46015, 36701, 58617, 55572, 56353, 58262, 59498, 56839, 59505, 8093, 11367, 58636, 59387, 55747, 11428, 58654, 59101, 8966, 59001, 55507, 9302, 57513, 59048, 1485, 1209, 58293, 1993, 59652, 59648, 36160, 55932, 57582, 25886, 58908, 32057, 57298, 43963, 57226, 58505, 58992, 55507, 58912, 55794, 59448, 57245, 57514, 6412, 32125, 58600, 58656, 58729, 57721, 58853, 57563, 59451, 32062, 55603, 58666, 58728, 58716, 34448, 1605, 1551, 32219, 35480, 58657, 1487, 32224, 58331, 1761, 32382, 8437, 58686, 25625, 56476, 58684, 55879, 59139, 56770, 58149, 29870, 59102, 59506, 55518, 1033, 55587, 32722, 59106, 58961, 51033, 26220, 59394, 58995, 56328, 1772, 57188, 59409, 32441, 56827, 57480, 55716, 32440, 56831, 55540, 55332, 29165, 1049, 56189, 59734, 55575, 2036, 27050, 56496, 24443, 14085, 32732, 55376, 57869, 59125, 57734, 55376, 1761, 29165, 58615, 56996, 35009, 32600, 59732, 32630, 55612, 3949, 56251, 56008, 56723, 55389, 30706, 56102, 57513, 59530, 32556, 58623, 35330, 55999, 32456, 59346, 48835, 13285, 59692, 32697, 56187, 3927, 32150, 8475, 56495, 58887, 32057, 16996, 58307, 1388, 59553, 57928, 56039, 32209, 56058, 58570, 1263, 58774, 58352, 32229, 59725, 47691, 56245, 1134, 58759, 1656, 48001, 59593, 56428, 41224, 32608, 32050, 56931, 2607, 32261, 1240, 32128, 59072, 20642, 59665, 58402, 32203, 2082, 3857, 59742, 32210, 57501, 4325, 58014, 31997, 55359, 24497, 9498, 25002, 32530, 56503, 25994, 59802, 32032, 9107, 32594, 56064, 49849, 57583, 56481, 32708, 2744, 59357, 57609, 4371, 32486, 59395, 57895, 56072, 56585, 8618, 55851, 55667, 58765, 58307, 55515, 57696, 59712, 56432, 58300, 59860, 57453, 56148, 50582, 32175, 59458, 55702, 59433, 59724, 1214, 58388, 59522, 55681, 13857, 58917, 59876, 55488, 56872, 58945, 58633, 59282, 32440, 27891, 13857, 387, 56365, 59557, 56868, 1136, 56176, 55488, 59378, 57776, 58008, 56338, 1857, 55831, 32711, 4382, 55353, 58302, 32671, 59889, 59589, 58767, 57201, 32138, 32051, 59515, 59420, 59518, 59895, 59835, 56257, 58593, 59523, 4976, 56953, 57879, 55728, 57397, 59559, 32365, 59771, 3350, 56622, 32365, 59775, 46005, 56135, 892, 59729, 58893, 59714, 32662, 58934, 58902, 59787, 56071, 32515, 36724, 55465, 1198, 7200, 32592, 59795, 32068, 2036, 58775, 59799, 59015, 46507, 59633, 55946, 50085, 53803, 58723, 59896, 32034, 58881, 32281, 59590, 27653, 56103, 56376, 56353, 17150, 7080, 21099, 59951, 55483, 57950, 57243, 5127, 57616, 9553, 55808, 59188, 4790, 57428, 59098, 25583, 31122, 58644, 37602, 58593, 4800, 57853, 32581, 56559, 59277, 8618, 57219, 56263, 43670, 55973, 55782, 59975, 32018, 13250, 58624, 56770, 32444, 56279, 57940, 59952, 44355, 55785, 55344, 1314, 58260, 56391, 29605, 56563, 59305, 59253, 56770, 59939, 57132, 8334, 58980, 59724, 56578, 58695, 32359, 59214, 32056, 57379, 59289, 37713, 57438, 58589, 59337, 32271, 55543, 59501, 57281, 1488, 3021, 59085, 56128, 59780, 32674, 58089, 32284, 1379, 1656, 56155, 59817, 56580, 951, 41885, 56326, 58830, 32386, 59418, 56325, 59378, 56132, 1028, 32609, 31997, 55879, 58770, 5107, 59898, 56391, 59453, 59587, 7660, 59965, 21014, 32064, 59630, 1628, 55866, 58963, 59229, 58776, 55997, 59583, 56017, 59597, 32242, 60060, 55710, 59970, 59373, 59635, 57109, 56329, 57265, 9093, 10686, 7070, 55846, 57357, 10498, 17110, 59505, 59109, 2060, 60103, 13370, 59525, 5742, 14085, 55572, 59955, 1413, 56551, 58617, 58263, 43332, 56734, 17670, 56301, 32481, 59183, 893, 543, 11009, 58724, 59552, 58726, 5111, 55422, 57114, 58717, 58530, 1761, 55522, 58265, 9518, 59581, 57755, 60130, 56642, 59613, 59777, 59687, 58469, 18681, 59845, 56599, 32334, 58219, 59661, 58654, 56413, 56120, 57322, 55558, 57672, 26161, 55713, 56594, 56328, 56552, 28990, 41995, 55600, 55462, 60116, 4219, 58824, 1798, 56098, 59142, 2043, 60153, 57057, 13946, 2959, 56909, 55361, 57169, 59416, 60163, 20396, 60181, 6077, 55452, 55984, 57085, 60187, 10679, 57686, 57353, 13128, 55722, 56112, 57129, 1619, 57967, 56910, 55483, 58679, 60198, 57733, 32383, 55592, 9160, 31116, 964, 57011, 1200, 45780, 58651, 55760, 1056, 11160, 4807, 32490, 55341, 26233, 60154, 58351, 32025, 55939, 56611, 32025, 5822, 55396, 56328, 57088, 10561, 3040, 27376, 32128, 60230, 60117, 57131, 56116, 60237, 59251, 60170, 58738, 56548, 47503, 55570, 32609, 55447, 55400, 8924, 58182, 8618, 55875, 32503, 56179, 57639, 55507, 56589, 56998, 57135, 60157, 58179, 57135, 60162, 56913, 19037, 58179, 59702, 59306, 11681, 57643, 8837, 45894, 31388, 55341, 60184, 60155, 57794, 57431, 4871, 58575, 55419, 5946, 3955, 59750, 5976, 5569, 60190, 55909, 57981, 32325, 60192, 55437, 32428, 60196, 60090, 58161, 56386, 4334, 55484, 32233, 57962, 58931, 60211, 56021, 60208, 57844, 60303, 9160, 58326, 60215, 57475, 26894, 6284, 10109, 55853, 60225, 32312, 60316, 5824, 49722, 56371, 60235, 31965, 56540, 57779, 56778, 60236, 57190, 60239, 55853, 60170, 58846, 55464, 60245, 55804, 58270, 893, 55443, 4919, 58602, 57306, 3031, 28405, 1726, 59185, 5767, 55532, 60154, 56602, 59793, 58771, 56293, 32032, 56545, 32055, 56031, 44603, 56443, 60285, 58051, 57116, 55774, 56038, 21943, 57108, 56157, 56443, 3018, 57120, 56581, 56376, 2060, 56517, 56033, 56640, 56621, 56556, 56174, 59786, 1009, 56430, 7098, 59703, 56300, 6486, 55629, 22185, 39760, 3970, 57941, 6007, 56125, 58149, 1435, 56137, 56581, 11681, 58964, 55629, 57881, 19543, 60397, 55384, 59965, 58951, 56892, 55581, 56759, 32433, 1737, 55982, 57780, 6537, 55427, 57119, 57084, 34455, 58008, 56740, 55380, 57875, 59005, 56589, 55653, 8369, 56622, 13641, 59830, 57369, 5809, 53869, 55906, 60222, 56541, 60251, 56325, 11670, 1516, 1363, 56573, 57714, 60437, 57397, 55685, 58368, 59912, 55731, 3906, 32544, 58048, 6694, 56259, 13951, 59564, 32611, 59571, 9192, 55577, 56406, 55979, 56950, 54932, 56579, 55488, 2038, 58821, 8326, 32542, 56069, 29033, 56297, 55584, 37039, 57639, 56017, 60274, 60472, 55703, 58135, 59736, 56184, 55340, 59590, 58793, 3860, 58840, 1033, 56050, 32394, 55531, 55474, 8837, 2000, 58881, 56936, 57325, 60280, 39417, 37039, 55984, 32562, 60354, 56064, 1866, 59665, 55473, 32083, 57304, 59792, 59946, 57568, 57864, 58057, 32223, 56245, 36644, 60365, 27595, 55775, 60361, 59793, 56008, 56054, 60356, 56716, 56327, 57809, 55858, 60066, 48820, 1681, 32454, 60363, 59796, 59874, 55355, 60442, 59948, 56564, 32252, 55999, 60357, 60237, 60523, 60541, 55774, 56545, 57197, 60241, 32380, 55803, 26154, 56509, 56016, 32579, 56622, 58159, 56372, 56565, 56790, 55355, 32047, 60560, 32259, 57241, 58269, 57799, 32718, 58464, 32229, 60179, 6211, 60563, 32209, 60571, 16568, 58737, 58414, 56445, 57074, 56041, 60552, 1772, 55739, 59589, 60577, 14876, 60177, 32435, 60515, 7497, 57874, 55397, 56408, 44550, 56694, 31782, 59904, 57415, 8912, 59007, 56394, 59007, 60469, 12246, 56689, 56319, 3366, 55360, 56679, 57018, 58990, 60594, 60371, 56231, 32499, 32317, 55405, 60543, 56713, 56678, 59890, 32545, 56054, 57038, 57074, 60535, 55962, 56507, 56024, 56336, 55459, 46201, 56430, 56023, 56590, 57592, 60358, 60281, 26751, 5241, 55747, 60571, 56868, 60485, 58861, 60515, 56277, 55414, 56210, 58759, 60177, 56114, 56539, 57875, 55424, 56893, 59469, 57474, 56256, 59236, 877, 60492, 28030, 59536, 56830, 56128, 32172, 60664, 32224, 32586, 58064, 32229, 57533, 56305, 55893, 60298, 1074, 60675, 55572, 57033, 56383, 32430, 60252, 60625, 57484, 57099, 60416, 3043, 14024, 56155, 60524, 60579, 56515, 60356, 17120, 57151, 55696, 56906, 25650, 60488, 55998, 56570, 27725, 58462, 32725, 60027, 3071, 56329, 60320, 60376, 56192, 60619, 59500, 55890, 32229, 56492, 60402, 19673, 60656, 55581, 60718, 56437, 56334, 11660, 60400, 55964, 60404, 32616, 56650, 58394, 55989, 55743, 32424, 55743, 56479, 56582, 14963, 56026, 14687, 60388, 55546, 59079, 11753, 60438, 59796, 60738, 59673, 60627, 32562, 60735, 60551, 56565, 60747, 10065, 32322, 58285, 56591, 18669, 60577, 59908, 55332, 60749, 32550, 55988, 10568, 21820, 55795, 56915, 55792, 56922, 55345, 51863, 56089, 8918, 58595, 57419, 56905, 58668, 60547, 57160, 60654, 47206, 32158, 58963, 60028, 5872, 56298, 32725, 58038, 60721, 59642, 32504, 9403, 55778, 60549, 55333, 58311, 56563, 56776, 56058, 58419, 57113, 59726, 60551, 60711, 60557, 1649, 56833, 56759, 56872, 56403, 55620, 55422, 59655, 58123, 58538, 17223, 56264, 57716, 3553, 55398, 58022, 1078, 56017, 56415, 60100, 56288, 56936, 57573, 57437, 59601, 32454, 60752, 59137, 56444, 55882, 60289, 10679, 60495, 57557, 3255, 32577, 18617, 56001, 59763, 60581, 60389, 32426, 57882, 56837, 57342, 60758, 56343, 60756, 57120, 60590, 59881, 60545, 56043, 60368, 60706, 56417, 56569, 58597, 60847, 58125, 56674, 60517, 56054, 974, 58723, 60709, 5650, 14517, 59223, 59032, 32022, 60871, 59638, 14514, 60530, 60049, 56034, 32435, 60631, 3366, 48194, 60746, 60735, 60864, 58600, 58829, 57625, 57115, 57810, 58823, 59595, 57671, 60206, 58958, 55917, 56286, 57579, 59829, 57501, 59028, 56341, 3407, 55382, 60796, 59389, 60241, 32060, 58215, 60478, 55859, 12858, 59344, 6871, 60142, 57659, 59552, 54928, 60415, 58139, 55605, 56804, 56564, 55601, 56252, 4990, 60615, 55748, 57887, 59799, 60158, 60049, 60296, 58237, 8054, 28216, 57201, 60199, 56143, 46015, 60644, 60939, 56910, 58963, 48835, 59799, 60699, 56454, 55692, 57900, 31462, 56963, 56985, 59493, 56238, 57658, 2650, 49566, 58711, 51888, 57557, 47020, 56527, 59866, 60179, 57502, 60142, 32278, 60909, 58364, 55887, 56328, 60573, 57115, 56920, 58286, 55858, 59841, 60583, 60892, 19680, 32720, 1726, 55932, 57124, 42043, 56563, 60617, 32179, 32412, 57620, 32275, 57194, 60355, 55368, 55951, 56906, 32335, 57709, 57820, 13105, 58657, 10657, 4817, 5744, 55329, 3689, 60882, 32302, 60440, 55329, 1670, 56893, 56595, 56152, 58035, 60061, 56152, 56551, 56353, 14402, 59029, 32212, 56728, 60735, 60879, 58342, 56047, 15112, 22729, 56421, 2057, 13241, 60545, 60185, 18669, 58964, 56475, 6494, 57190, 57165, 48747, 56750, 32725, 18060, 58504, 32272, 59429, 60608, 5577, 60067, 58342, 56899, 61035, 57493, 60556, 60587, 55603, 32121, 61062, 58351, 60578, 60435, 55488, 57049, 58564, 24279, 61065, 8730, 60444, 55546, 60814, 6509, 57944, 60753, 5147, 46536, 57562, 11146, 60455, 60055, 60017, 60707, 57734, 57881, 55801, 61089, 32158, 56533, 56227, 57066, 56359, 57013, 2098, 32085, 55525, 60958, 6537, 60471, 57814, 60925, 58581, 59335, 33835, 26224, 56930, 56937, 57159, 60629, 58793, 60490, 32619, 8475, 60493, 5166, 56424, 5535, 60497, 56423, 60235, 61124, 57171, 4434, 32605, 56376, 2995, 60076, 59162, 56792, 60512, 56395, 32209, 60857, 57527, 55919, 60590, 32233, 57933, 55951, 60931, 56192, 56665, 60349, 32009, 56096, 55601, 60937, 56789, 56487, 60934, 57855, 60980, 59811, 60569, 57064, 28405, 1664, 61155, 60575, 60908, 58598, 56419, 56093, 56439, 46812, 57874, 60789, 56487, 36017, 56473, 1931, 60598, 44550, 58311, 57085, 60513, 57880, 57929, 56975, 61170, 56006, 60971, 59039, 59090, 56978, 60890, 58317, 60555, 56375, 55831, 57532, 32508, 1605, 56868, 57232, 897, 61161, 32182, 56936, 57822, 32242, 60647, 32015, 6249, 55866, 32044, 59687, 60319, 55622, 57926, 60708, 3629, 60690, 60661, 60063, 32186, 55747, 1464, 57026, 32493, 61222, 61207, 60671, 26177, 57992, 55930, 26003, 58170, 59336, 55991, 52746, 57627, 59149, 56514, 27147, 58791, 60685, 14021, 57245, 58598, 60771, 61044, 14906, 56901, 32725, 60515, 17564, 60650, 12761, 57906, 60699, 61074, 36175, 55919, 57213, 58520, 60873, 60714, 60628, 60237, 56600, 55625, 32229, 60551, 57050, 32068, 61032, 61271, 32164, 60849, 16437, 60541, 32463, 60409, 11747, 56016, 60066, 59721, 14532, 57069, 61276, 1484, 60855, 60529, 55355, 57827, 60634, 57109, 56581, 60057, 57781, 60278, 32502, 60631, 57635, 60633, 55356, 57021, 60578, 57933, 55702, 57119, 60907, 58172, 56442, 60773, 55955, 56769, 61266, 60271, 60173, 56639, 57132, 57648, 57372, 59923, 60790, 905, 60787, 60472, 61323, 60337, 57747, 58697, 60472, 61051, 3993, 57725, 13040, 58349, 32661, 58609, 56471, 59428, 56615, 32293, 58047, 57994, 61188, 57947, 1284, 61110, 60727, 29652, 58741, 60300, 57158, 57290, 32572, 57875, 58967, 32399, 60079, 32383, 59520, 5505, 58511, 60170, 60732, 61267, 16220, 55624, 56061, 56976, 2959, 55982, 61176, 32467, 56909, 32362, 57216, 55525, 61278, 61060, 32562, 60692, 57833, 55733, 55739, 56173, 58279, 56311, 49569, 55413, 2041, 55767, 60735, 56994, 60846, 60834, 57697, 60370, 32055, 60724, 58342, 60726, 61116, 60409, 32668, 61400, 58200, 59066, 60875, 58349, 58928, 55794, 58385, 57518, 58513, 57521, 55874, 57524, 61269, 57144, 61196, 55919, 57595, 56518, 57532, 57537, 55889, 32259, 57533, 55849, 56380, 59251, 57542, 909, 57544, 57535, 57546, 57537, 57548, 57556, 55549, 32383, 1485, 58675, 58421, 60496, 55825, 58857, 58431, 57562, 58513, 55882, 57566, 55885, 55892, 59935, 61427, 48486, 55892, 60501, 55900, 57576, 61436, 57578, 57575, 59110, 57582, 58092, 55802, 61420, 57586, 58265, 57589, 55915, 56062, 59560, 61474, 61423, 32376, 32754, 32756, 25789, 57600, 40591, 57602, 16390, 55325, 20565, 58379, 58163, 59534, 2017, 32382, 55544, 55628, 57776, 57156, 56240, 60340, 32671, 55606, 55793, 55801, 55883, 57658, 61502, 57120, 57815, 32592, 61168, 60982, 59152, 3002, 56168, 57882, 59717, 57620, 32550, 60592, 49762, 57851, 60217, 61214, 60421, 61193, 56693, 56855, 60217, 15628, 9413, 60249, 56236, 34145, 59421, 60501, 56359, 6509, 56669, 57425, 56769, 60515, 32429, 60923, 1822, 58394, 61542, 56876, 56488, 56873, 57837, 57308, 32380, 11188, 61547, 57514, 6007, 59355, 32664, 2030, 32195, 46536, 55882, 56911, 14119, 57151, 32128, 56955, 2959, 61564, 55574, 58601, 58002, 32190, 1460, 57976, 31547, 300, 37712, 57615, 56360, 56683, 56863, 57664, 60446, 57214, 32233, 58343, 32404, 1428, 57076, 56257, 61146, 56927, 61107, 32614, 58170, 61458, 56961, 58359, 25336, 60596, 56368, 6575, 32080, 55992, 57150, 32434, 58984, 57888, 56820, 55647, 57806, 56406, 55465, 56384, 59843, 10051, 57969, 32493, 32347, 3949, 58601, 61618, 58043, 60188, 55636, 60232, 59164, 57592, 56264, 56078, 55438, 58445, 61630, 57071, 57934, 32447, 56092, 55722, 61601, 56493, 58008, 32332, 56835, 1261, 13130, 60428, 58122, 58001, 59831, 5127, 17050, 56679, 1502, 6249, 32439, 58450, 55369, 60611, 19756, 59737, 56826, 61224, 54114, 60668, 59964, 60487, 56508, 61119, 60669, 57867, 44355, 56886, 32658, 57372, 61634, 57176, 32210, 61674, 58003, 60565, 57935, 32554, 56521, 61402, 61108, 60481, 56516, 56256, 59167, 59696, 55546, 60296, 55458, 6694, 57889, 56988, 57692, 56769, 56461, 59202, 60196, 29845, 58229, 58363, 61702, 58864, 58098, 54095, 57713, 1261, 60482, 55342, 58078, 58324, 56117, 59327, 1869, 60811, 56490, 32136, 1056, 58615, 59841, 7102, 32667, 58237, 8754, 57579, 9627, 59315, 56670, 56904, 32656, 2057, 32062, 56781, 59688, 59112, 35398, 55421, 60991, 57714, 9503, 57156, 56132, 60994, 56260, 58740, 59286, 60658, 58492, 56919, 56409, 55459, 60774, 32032, 5778, 58704, 59098, 60230, 6537, 59277, 12803, 55709, 56857, 60716, 61095, 23296, 60817, 56221, 57427, 5396, 57590, 55369, 56887, 3450, 55527, 55590, 61776, 57964, 32664, 17820, 55460, 16414, 57080, 59382, 56071, 1388, 57162, 32486, 56187, 57965, 57049, 4649, 58900, 60806, 56618, 57021, 58095, 32302, 61799, 32556, 57440, 3970, 58377, 5818, 59684, 1658, 57982, 1017, 57767, 56835, 59344, 57118, 58609, 3509, 32639, 857, 56558, 59636, 32154, 60423, 57207, 60863, 60183, 55732, 60873, 56423, 61781, 59743, 7080, 3016, 56826, 61587, 32290, 60707, 55681, 61835, 59428, 57922, 59838, 56992, 914, 56908, 56678, 56333, 60731, 58904, 1485, 57649, 58894, 1252, 59760, 4567, 32634, 9104, 60281, 58377, 8437, 61530, 56974, 60679, 56933, 61851, 34216, 32609, 56535, 61320, 2107, 4114, 61368, 55956, 9633, 55366, 55629, 56231, 61128, 57987, 55372, 55439, 59281, 32126, 57538, 1399, 56339, 2400, 61818, 58001, 55430, 58848, 6753, 32572, 58917, 55824, 31163, 56395, 61811, 56845, 1263, 55673, 59377, 1376, 32539, 5857, 57248, 2020, 61530, 59892, 56922, 59895, 55347, 56468, 61080, 32725, 61453, 61150, 57431, 60821, 61504, 47952, 57218, 58138, 55558, 61722, 29196, 57885, 32125, 60228, 56699, 57212, 60222, 61891, 24400, 56444, 58589, 9186, 57305, 60117, 12858, 59142, 61593, 61816, 58042, 60918, 58064, 58595, 61098, 60606, 24974, 58854, 61949, 1818, 56755, 60688, 49866, 49775, 32596, 58436, 21607, 3380, 59770, 58629, 12502, 32322, 57051, 3946, 61333, 59676, 55573, 57934, 24193, 61174, 59263, 32614, 56822, 902, 57007, 42192, 32611, 58394, 55614, 57194, 32236, 56324, 61399, 61545, 61978, 59586, 61606, 32442, 55939, 58305, 59951, 60999, 56283, 56207, 32100, 61995, 61988, 55653, 58436, 55945, 61990, 7168, 57043, 55653, 61654, 55408, 11693, 55950, 55591, 56579, 55143, 6129, 61994, 58097, 19401, 51033, 61341, 56746, 61687, 61837, 33665, 57008, 11664, 60463, 62010, 61979, 61209, 62009, 56547, 1035, 60159, 1216, 56422, 61974, 61721, 56989, 12333, 61676, 55590, 54272, 1542, 60389, 61804, 59881, 60683, 45933, 21736, 57878, 32033, 62048, 56407, 55810, 56039, 55558, 17542, 954, 57087, 3451, 58559, 10123, 61833, 32224, 62061, 60992, 62063, 6920, 55873, 56417, 60952, 58209, 43630, 59435, 32383, 32430, 55649, 58412, 60550, 58456, 54635, 57553, 57339, 62079, 39871, 60660, 3193, 55688, 61588, 61080, 56818, 57016, 56061, 5781, 58704, 61614, 61527, 56577, 61679, 32499, 58231, 55942, 62100, 57180, 32437, 56325, 56366, 32469, 57685, 60276, 60049, 61983, 62111, 56858, 55958, 60589, 62066, 55788, 4699, 55762, 61905, 61271, 56866, 7520, 61054, 57526, 61411, 5105, 60528, 61414, 57759, 61416, 57559, 56769, 61419, 57669, 55471, 61477, 57571, 55719, 55839, 57533, 61457, 61475, 1647, 61430, 57540, 56264, 61433, 55856, 61423, 61437, 55895, 57782, 58427, 61441, 55867, 62083, 19499, 61440, 58423, 57522, 55875, 58389, 62131, 58168, 58350, 57664, 61774, 57569, 61457, 62170, 61460, 61729, 62152, 61464, 56282, 58166, 58497, 62167, 57585, 16444, 58385, 61473, 61425, 61431, 62139, 57535, 61479, 7364, 57598, 61482, 49602, 53089, 55323, 45806, 16761, 7012, 3330, 3379, 54891, 47931, 54255, 45199, 10334, 8454, 48536, 7984, 31016, 27690, 42227, 3193, 30372, 8394, 4050, 8074, 1035, 30645, 6858, 3052, 2739, 10114, 21666, 44145, 10002, 27588, 49266, 15667, 24610, 7914, 6659, 11647, 17654, 7948, 32969, 22188, 43248, 30311, 44230, 27439, 2975, 22228, 29469, 11954, 47624, 17816, 11403, 21329, 8801, 50034, 48010, 19098, 10722, 15313, 54149, 26882, 3331, 43276, 6364, 14054, 19693, 1138, 55038, 36163, 13489, 23274, 34167, 50130, 19046, 46264, 3255, 5167, 47656, 2272, 9188, 53214, 2491, 2052, 19133, 9070, 4791, 14047, 11770, 47915, 40288, 19823, 48880, 5832, 31166, 4155, 1652, 1278, 43381, 19761, 13147, 8485, 26951, 6711, 48923, 539, 12112, 27890, 3415, 13130, 35551, 9273, 48702, 12191, 7079, 49184, 7086, 15584, 34431, 16768, 33712, 48880, 44668, 37254, 6317, 4475, 10542, 38275, 12675, 27865, 33799, 37344, 14181, 4905, 54226, 9202, 2144, 33430, 10315, 8605, 13185, 11722, 14637, 11228, 3048, 54282, 32743, 3183, 11167, 1363, 44210, 32799, 15811, 25706, 8654, 21669, 4231, 1559, 54287, 6033, 5830, 25549, 54622, 24686, 17013, 55001, 62193, 50574, 57601, 53994, 18604, 883, 2286, 17361, 27064, 32207, 945, 5091, 3443, 11914, 2859, 6698, 4229, 50863, 47667, 1099, 14502, 9547, 20604, 35313, 19387, 38212, 9188, 44451, 45458, 45702, 11928, 3314, 53112, 20879, 30309, 15197, 62351, 24601, 20692, 4229, 34361, 26866, 43384, 1036, 33738, 15076, 50387, 54571, 33876, 48107, 38201, 41521, 16026, 13064, 35950, 43227, 25047, 43252, 12226, 5149, 39986, 11692, 19697, 16549, 9649, 12209, 29550, 49927, 8161, 2884, 29257, 13140, 26205, 37574, 2411, 44752, 47957, 48464, 48975, 52202, 48706, 10310, 62229, 30976, 1556, 43416, 30338, 8484, 3810, 46605, 6877, 10275, 1120, 27822, 18606, 62299, 8356, 4198, 13150, 8452, 28384, 11728, 17057, 3963, 31102, 11506, 15250, 46827, 1434, 28186, 48866, 17662, 6808, 47557, 977, 9742, 15220, 46263, 17098, 15147, 7024, 43844, 7969, 8079, 35119, 47660, 50197, 11016, 44630, 51871, 48507, 14790, 12392, 49998, 21383, 30763, 47920, 11734, 12225, 21794, 29578, 51292, 11648, 54151, 12472, 52604, 36449, 9495, 49829, 51621, 31209, 5526, 30947, 43524, 50561, 53733, 46711, 46145, 52046, 53985, 44344, 49231, 43349, 45798, 43436, 45801, 54460, 46722, 43205, 48862, 13392, 16753, 15523, 9529, 51588, 18049, 15603, 27545, 53780, 22230, 42497, 8967, 53718, 12985, 10069, 62542, 1420, 31995, 34084, 29297, 4500, 62536, 8163, 24401, 31553, 3508, 45324, 3008, 5536, 62541, 1790, 13592, 10922, 3360, 24588, 49759, 1790, 28054, 35083, 20483, 21940, 5213, 34000, 40167, 2751, 5747, 46041, 49761, 44004, 3530, 9198, 4636, 17382, 36058, 51154, 5887, 4304, 34108, 62551, 11733, 62534, 5206, 4869, 2469, 15603, 45387, 965, 35133, 5883, 4998, 24701, 51973, 6327, 35189, 4421, 19382, 6861, 4457, 7115, 9388, 28455, 1790, 9605, 41228, 44953, 1680, 14714, 5786, 4345, 13776, 39251, 4432, 10434, 33866, 28954, 8936, 10085, 12896, 54458, 5051, 4335, 19893, 5987, 33981, 36961, 2133, 26784, 11557, 32918, 25661, 11309, 34108, 51197, 6712, 9318, 53310, 62545, 62567, 1141, 9142, 1616, 4475, 54847, 13141, 14718, 1478, 5004, 11948, 43999, 5190, 27835, 8991, 44358, 21594, 13097, 15031, 30056, 49821, 19327, 39145, 51785, 46236, 4206, 15603, 62591, 45649, 50652, 51982, 44047, 51984, 17510, 34232, 52611, 12668, 1090, 44926, 14921, 37525, 43789, 51048, 24957, 40014, 3091, 6366, 37215, 2921, 5311, 2755, 32126, 4964, 6132, 5679, 12073, 3403, 16525, 3688, 8740, 8804, 50420, 51767, 19028, 11640, 8175, 42181, 4990, 8789, 35935, 11628, 10169, 1294, 43163, 1775, 12795, 10260, 17547, 1304, 38975, 17435, 11299, 10521, 49378, 3293, 20440, 21045, 44000, 14256, 44257, 589, 27661, 33436, 15181, 46865, 10420, 30828, 30660, 6003, 50051, 9029, 22022, 60425, 21941, 55171, 34032, 4452, 36155, 16125, 55261, 30265, 39861, 6993, 59956, 48111, 13873, 22865, 25209, 28930, 22402, 1678, 6492, 30028, 62655, 51521, 27745, 54292, 20924, 9745, 4032, 47416, 55171, 13281, 39866, 34440, 23136, 35806, 6649, 49620, 44384, 2149, 36813, 12028, 15131, 45060, 15644, 1023, 45558, 14094, 44286, 6171, 30059, 31494, 11620, 397, 45112, 8979, 34994, 35050, 7347, 48494, 7806, 28384, 42881, 48181, 2404, 36849, 46537, 33965, 7084, 12361, 1201, 45638, 56900, 33662, 8838, 46074, 8622, 8094, 17213, 1144, 10221, 13047, 35005, 11957, 3507, 14363, 35344, 38201, 45162, 20955, 15611, 43371, 52755, 15047, 22200, 17174, 40049, 19621, 11497, 53497, 14147, 25709, 12014, 50044, 18991, 8487, 11801, 20522, 38545, 3630, 25542, 5136, 1103, 14991, 7972, 5636, 21878, 54340, 5980, 7672, 19805, 28020, 1186, 19133, 6010, 19269, 54044, 35723, 2480, 43415, 3347, 9656, 53568, 54765, 35205, 6032, 9103, 47169, 24233, 6606, 46225, 39715, 26788, 6226, 6750, 26898, 19726, 47468, 5018, 3292, 9781, 4094, 47042, 15347, 9514, 33717, 2097, 19826, 11785, 20442, 1631, 54454, 43574, 24486, 41992, 42500, 16502, 29640, 3379, 7087, 9016, 18192, 61900, 50523, 39979, 53228, 8911, 9192, 2630, 30365, 30044, 49634, 13543, 6688, 33906, 2912, 43934, 48078, 36993, 25663, 17387, 43889, 47896, 5002, 37419, 13849, 31826, 9018, 54125, 48268, 55322, 50764, 23024, 43661, 38362, 42299, 10555, 50406, 9942, 49059, 31301, 4954, 27913, 20483, 40101, 49096, 62955, 28572, 9062, 3440, 24496, 12365, 12406, 4637, 9434, 62957, 48811, 5182, 7383, 32775, 30978, 7479, 6667, 25381, 45196, 51459, 2745, 47371, 2480, 6804, 6916, 39129, 46941, 12179, 16980, 2649, 44125, 37867, 50220, 6493, 11724, 6235, 11505, 50237, 52717, 17176, 38790, 27652, 971, 10009, 6811, 2591, 30135, 4114, 2015, 1237, 23870, 22538, 27282, 45092, 1786, 22390, 15046, 20351, 45297, 13350, 62968, 20483, 6811, 7252, 52144, 14846, 62957, 63016, 1687, 6493, 10760, 11505, 13111, 28130, 53972, 13714, 10891, 20667, 24598, 62981, 1508, 15770, 22746, 11023, 54088, 62995, 52721, 2660, 48205, 26117, 6494, 3659, 1803, 43941, 3826, 11339, 33610, 36728, 2496, 50636, 9439, 28484, 50290, 18103, 5122, 53493, 36971, 30289, 5411, 49844, 44516, 13624, 29209, 25606, 3438, 1249, 10535, 31249, 19667, 2962, 28050, 2310, 16026, 3353, 1683, 7204, 45396, 10664, 18036, 1996, 38082, 2962, 43194, 80, 41785, 109, 101, 110, 43039, 42523, 43202, 41791, 49113, 39114, 49115, 19618, 42383, 13743, 33599, 18858, 26265, 19998, 36365, 18973, 24682, 12459, 14134, 18977, 26273, 6421, 26275, 22232, 22129, 13792, 26450, 13765, 35598, 36482, 18581, 11383, 25838, 21187, 41745, 18955, 13776, 1696, 27403, 35392, 44103, 41331, 18295, 44534, 31705, 32835, 3017, 41752, 13790, 17887, 63141, 30265, 19814, 38649, 13797, 19244, 29430, 11998, 5270, 29387, 14152, 55147, 55006, 33616, 10970, 55010, 22520, 12630, 55047, 5671, 47252, 62424, 19630, 48960, 55021, 54582, 10083, 29028, 55026, 5147, 50634, 35953, 1648, 16179, 28967, 49041, 26181, 12325, 27866, 1675, 55037, 33813, 50165, 27322, 55041, 4699, 55043, 32077, 55045, 9318, 55105, 39984, 25912, 55051, 41373, 30677, 47143, 51643, 43225, 33795, 55116, 55060, 16531, 14969, 15207, 39953, 55066, 11002, 55068, 4206, 40316, 12111, 55072, 1439, 46773, 11499, 55076, 1629, 5214, 54026, 44855, 27349, 1150, 12171, 62795, 21820, 1853, 51913, 36100, 1926, 7649, 26746, 43968, 51781, 47799, 29094, 2156, 18272, 6010, 55099, 63200, 55102, 5486, 13715, 877, 63173, 2648, 55017, 2064, 1073, 55110, 20959, 55112, 43626, 23098, 46371, 44535, 42367, 15301, 55119, 28788, 52816, 30722, 12253, 18044, 4504, 55127, 3449, 19135, 24992, 37036, 55132, 1646, 40132, 1517, 55136, 27877, 50406, 41683, 55269, 9201, 7061, 7922, 55145, 6375, 63165, 17252, 55149, 5572, 7654, 55152, 35172, 47262, 5153, 10421, 38576, 2537, 47295, 43546, 11980, 31127, 55164, 45441, 10262, 8057, 45013, 8174, 29571, 55172, 1375, 55174, 22416, 55176, 39805, 54832, 47153, 55181, 17855, 35919, 25693, 5805, 26803, 6340, 25802, 7764, 2072, 55192, 54589, 52211, 52937, 3271, 4665, 25767, 55200, 2061, 55202, 45497, 50370, 53071, 53576, 9445, 3437, 2453, 18050, 4698, 5833, 4486, 51471, 55216, 15136, 55218, 7798, 55300, 14608, 25950, 23333, 35536, 14534, 49826, 15656, 47398, 14744, 6484, 12045, 49349, 17928, 8935, 2065, 8364, 55237, 58891, 28597, 48256, 4683, 15205, 11130, 9663, 13605, 11698, 51158, 8379, 6504, 1627, 9312, 11376, 5865, 53311, 43934, 5658, 21682, 2275, 44997, 51670, 30367, 55263, 15116, 6709, 19888, 54695, 2100, 5848, 3020, 13185, 5200, 55272, 31155, 6887, 63278, 2109, 333, 55278, 2042, 55280, 7421, 54684, 50840, 9712, 14529, 4857, 12295, 55288, 47131, 2564, 37419, 21311, 3386, 14986, 30679, 3948, 11667, 48566, 15088, 1921, 16179, 24595, 6749, 32993, 48890, 1046, 55308, 6118, 2994, 55311, 5782, 55313, 4743, 2033, 44524, 52956, 43547, 9104, 58469, 55326, 59366, 57159, 55330, 59966, 60033, 55334, 41248, 56805, 57097, 61712, 31792, 55344, 61058, 32221, 61645, 59307, 57131, 61588, 60979, 60776, 60491, 61165, 61188, 61599, 55367, 56166, 62093, 55373, 59868, 63490, 55751, 56439, 55382, 62081, 61555, 1289, 61440, 56438, 7080, 15456, 51605, 55422, 7214, 55538, 55502, 55401, 24668, 55404, 32179, 55448, 57915, 11160, 55624, 55423, 63516, 55506, 55417, 32658, 57775, 55421, 59429, 61581, 56413, 55428, 61957, 57306, 56984, 55435, 13285, 60292, 55439, 32195, 4110, 56235, 485, 32400, 57642, 60335, 55505, 52905, 32385, 32577, 61666, 48007, 57162, 55421, 56987, 17033, 55464, 32486, 61596, 56941, 61683, 32055, 60267, 60491, 12862, 57804, 55693, 56367, 59770, 60201, 57950, 55486, 56194, 60464, 7990, 32264, 5767, 60407, 55778, 55495, 18681, 55518, 55499, 914, 55501, 60248, 55504, 57843, 902, 59118, 56558, 1413, 56763, 62180, 57339, 55526, 56671, 59613, 55519, 56385, 56173, 55523, 15477, 62052, 55515, 55528, 32656, 56227, 32544, 55430, 59676, 15874, 61778, 55538, 55586, 57441, 59144, 55627, 55737, 55547, 57550, 61619, 55389, 55546, 57840, 55555, 29244, 55557, 55636, 8021, 62069, 63566, 55543, 58494, 61177, 56367, 63560, 63533, 55572, 57471, 6251, 56007, 55578, 2738, 58695, 53953, 58526, 55697, 59937, 61306, 60803, 31462, 57078, 58031, 61706, 60259, 61370, 58178, 61501, 57230, 55610, 61776, 61523, 60914, 56992, 58125, 60592, 61366, 56664, 63616, 58782, 61368, 56789, 56010, 56177, 55636, 56402, 2135, 58032, 56756, 55644, 55947, 32725, 61151, 61996, 56213, 55654, 32062, 55656, 32008, 58311, 56544, 63586, 55664, 60824, 57481, 57914, 55663, 7775, 55671, 57045, 55674, 9007, 58802, 56526, 55679, 1997, 59877, 57736, 39954, 57998, 56521, 3692, 60313, 56328, 55691, 50766, 55694, 58067, 8058, 55790, 1233, 55550, 56411, 60597, 60963, 60479, 58261, 55707, 60384, 59217, 56270, 56782, 56895, 56192, 56806, 62141, 55721, 56355, 55724, 55730, 1261, 61827, 60831, 26740, 3857, 63740, 32697, 61789, 58770, 56884, 63710, 55734, 55740, 56943, 60877, 55744, 61604, 60088, 60687, 55751, 60257, 61753, 55757, 58326, 5737, 63571, 57817, 59474, 55768, 57733, 61614, 61963, 55775, 58362, 57117, 55779, 56850, 60009, 58155, 57742, 14443, 61521, 55788, 63646, 61608, 61506, 61050, 60508, 914, 55799, 32195, 55801, 60912, 59540, 55806, 14876, 55808, 60507, 55449, 63788, 19821, 55814, 62128, 57516, 63577, 55821, 61415, 7106, 62134, 57611, 57526, 63735, 55834, 62140, 61474, 62143, 57595, 58040, 62154, 62147, 56282, 57541, 62137, 8363, 61435, 57978, 62177, 55862, 61445, 5619, 55866, 57552, 61444, 62156, 61558, 62163, 45933, 57561, 63805, 57759, 61452, 62169, 57592, 55888, 61423, 57593, 57573, 63811, 48930, 57535, 57084, 63847, 61466, 58167, 60432, 57144, 58037, 55897, 63817, 56063, 63814, 61461, 61774, 57977, 55890, 58469, 55925, 57474, 56176, 56438, 4752, 61713, 60990, 58668, 60315, 57523, 60011, 60224, 63875, 55438, 57964, 56082, 55724, 63795, 62011, 56087, 56431, 55715, 57491, 62116, 58342, 60257, 55963, 56389, 55966, 57153, 25650, 55970, 57734, 58419, 60503, 55976, 61687, 60604, 32481, 61761, 59321, 56819, 56672, 61166, 56372, 56331, 56003, 60692, 60893, 56014, 55904, 56340, 63640, 56831, 61794, 56336, 61041, 56022, 55707, 60717, 60881, 45894, 56842, 60756, 56575, 56029, 60702, 56032, 63907, 55622, 61828, 56037, 59678, 59948, 60866, 60553, 58173, 60869, 59596, 56622, 56024, 63943, 62115, 56553, 59949, 57929, 62145, 1769, 58636, 55463, 55836, 60353, 61098, 55507, 63498, 59251, 56378, 32312, 63962, 63880, 56975, 63882, 56882, 55601, 63967, 56987, 56091, 58845, 61316, 1681, 61151, 60172, 35286, 57909, 56317, 58407, 59841, 32240, 60491, 60675, 57697, 60294, 32506, 61172, 61716, 55977, 56128, 60937, 57281, 61679, 56211, 56085, 32335, 56133, 56882, 56132, 56439, 57612, 56136, 60195, 61304, 56141, 56860, 63728, 60920, 63796, 60417, 24497, 58049, 41354, 60726, 58054, 56085, 56158, 56154, 61405, 61420, 61555, 5818, 57056, 43387, 63878, 57126, 56464, 60135, 60378, 56220, 59951, 57184, 56140, 56798, 61928, 32960, 56186, 61557, 55696, 63628, 1536, 61147, 57936, 56125, 55452, 64043, 63767, 61633, 56202, 60777, 56151, 32658, 56213, 32302, 57843, 56211, 64054, 33871, 56215, 58239, 3356, 60770, 61770, 63622, 56223, 64035, 61707, 57927, 56230, 56053, 60930, 1488, 56234, 59841, 1379, 58036, 58185, 56241, 55756, 58339, 32229, 61208, 60780, 63728, 56132, 61592, 57383, 951, 61689, 60451, 58574, 14093, 56562, 56182, 60225, 56267, 56995, 63730, 56563, 56273, 57622, 32252, 61176, 56811, 57001, 61988, 62107, 61140, 4917, 56289, 63493, 60351, 58526, 64113, 60471, 56294, 64009, 57066, 63899, 61863, 10055, 57029, 61874, 55377, 56996, 57039, 57277, 64127, 56319, 61659, 56322, 62028, 56285, 60735, 32614, 60765, 63921, 61409, 15330, 56351, 60764, 56005, 60908, 32424, 56441, 56346, 58777, 60517, 63911, 63915, 64138, 64014, 56054, 60604, 64154, 60049, 61517, 56426, 55678, 55480, 61203, 56371, 57067, 60736, 56636, 61306, 57073, 61598, 57147, 55594, 58744, 61589, 57488, 58311, 61339, 64176, 57103, 57089, 56401, 32504, 62051, 56405, 20579, 56006, 56609, 60291, 57688, 60799, 56997, 56416, 56640, 61686, 56420, 63936, 60840, 56345, 57281, 63623, 56894, 55714, 55610, 60717, 56505, 56451, 63960, 64205, 60638, 47527, 56446, 58532, 59372, 60954, 55978, 60262, 61914, 56456, 55683, 16897, 57340, 61691, 58361, 57549, 56657, 58275, 56469, 32280, 56472, 57695, 56368, 14743, 56476, 59724, 61034, 60370, 61803, 57687, 35518, 57835, 55732, 60717, 57956, 61720, 60717, 61830, 59869, 64040, 58177, 56328, 60396, 56015, 55549, 59895, 56835, 56508, 64252, 56045, 64257, 60825, 61240, 60778, 56517, 62105, 56525, 56999, 32078, 61022, 56221, 64161, 56528, 56536, 49054, 3009, 59421, 56535, 61700, 9015, 57870, 62868, 56543, 64209, 56546, 56236, 60243, 61299, 32700, 60264, 56554, 64236, 56666, 62137, 55788, 60227, 56562, 32154, 61877, 56566, 60774, 56006, 60524, 56572, 59552, 26279, 64259, 57199, 62017, 60054, 56556, 56583, 36774, 55987, 60767, 55601, 63891, 60853, 56593, 56354, 63666, 61730, 39248, 64319, 60349, 32362, 64088, 64150, 61930, 56409, 32281, 60225, 56563, 56828, 56616, 60556, 56618, 61343, 61194, 56623, 64264, 58036, 32665, 60379, 60772, 61067, 59724, 63960, 64187, 56637, 57129, 60543, 56641, 56357, 60916, 63850, 49826, 56648, 58991, 60148, 61128, 30634, 56656, 58134, 56659, 59417, 57194, 60039, 56011, 64291, 13452, 55333, 61732, 57772, 63934, 56565, 55952, 56677, 60609, 60088, 56822, 56158, 56966, 32267, 63682, 60637, 63682, 56705, 57683, 64105, 56696, 56825, 56851, 60895, 28855, 58211, 61551, 56704, 63665, 56915, 32015, 12342, 55639, 64398, 58467, 57358, 64403, 58440, 57459, 57565, 63500, 61671, 60279, 56729, 63481, 56726, 56876, 60460, 56742, 61725, 60030, 59192, 37660, 61091, 1225, 56541, 61832, 56748, 60905, 61745, 56757, 56753, 64427, 56756, 9503, 56758, 61927, 56184, 60213, 55153, 64173, 58311, 58958, 56683, 63649, 32296, 56776, 61761, 56257, 56776, 64150, 56869, 56289, 57208, 61262, 60560, 64103, 55620, 60415, 58224, 56797, 57127, 64037, 56818, 61315, 61659, 56805, 64448, 63697, 56809, 60997, 57141, 56781, 56815, 61719, 62092, 60237, 56821, 56681, 56823, 56320, 57015, 61744, 56756, 61663, 56831, 60808, 57162, 61667, 32259, 61047, 36916, 56872, 59692, 61041, 56844, 798, 58277, 56848, 57319, 58838, 56700, 59505, 57435, 57467, 61826, 62124, 58495, 57706, 60171, 57924, 60947, 57202, 61339, 57738, 57714, 64410, 8924, 56999, 32390, 57223, 58803, 56642, 56466, 32360, 59766, 61776, 61216, 56890, 63875, 13621, 59066, 63886, 16839, 56897, 64298, 56432, 64481, 59036, 61144, 59354, 57322, 57940, 61375, 56911, 32486, 56913, 55834, 56707, 56916, 63867, 58118, 64547, 58180, 58457, 53715, 56926, 57966, 56935, 12742, 56938, 60301, 61112, 57822, 32596, 63502, 51674, 63558, 56943, 19876, 56736, 61721, 1220, 56948, 46487, 64569, 4649, 56953, 3295, 61567, 57107, 56952, 58504, 60675, 56962, 61965, 56451, 61003, 57689, 61487, 57653, 56465, 5127, 60343, 58758, 63655, 56509, 55474, 64086, 56981, 60156, 58839, 56985, 61755, 64093, 56261, 56990, 61751, 55619, 61394, 56946, 63882, 56272, 64521, 64107, 57063, 64107, 61508, 56058, 57993, 57012, 32499, 63475, 64116, 61659, 57020, 56144, 56302, 63981, 64483, 57027, 57653, 57759, 64483, 57032, 61240, 57505, 57511, 61243, 57040, 1435, 57042, 56324, 63699, 1541, 61054, 57049, 56349, 64539, 57794, 56355, 57054, 64156, 64517, 59602, 63506, 57062, 57094, 61552, 56370, 57066, 57419, 57068, 57217, 64168, 63862, 64174, 56319, 61615, 58031, 64665, 56314, 57498, 60688, 57272, 64179, 9015, 55510, 32711, 60056, 64270, 2461, 32154, 63475, 64452, 57100, 57155, 57265, 64446, 63683, 57107, 56783, 64024, 57112, 57815, 57115, 56838, 32209, 60916, 56793, 57031, 32094, 32326, 60992, 64036, 59328, 64463, 56697, 56805, 63993, 19882, 55524, 57139, 56599, 12658, 57142, 59386, 64292, 57611, 64171, 56978, 62004, 50399, 57041, 64685, 55642, 60645, 57961, 57161, 32595, 57163, 39281, 60851, 56839, 64414, 60226, 56843, 57090, 57173, 64678, 61144, 57177, 58394, 59175, 57181, 32442, 22725, 59431, 56181, 59308, 57188, 56801, 60023, 60937, 56704, 61983, 57106, 57197, 61470, 64755, 58357, 57203, 59313, 59665, 58006, 64683, 57210, 60900, 61584, 61262, 60307, 55525, 62053, 58350, 58204, 64410, 59182, 32461, 55794, 57167, 59095, 56303, 57231, 58146, 58444, 58464, 61869, 61339, 58223, 57241, 58651, 798, 57244, 57214, 56438, 57247, 59724, 57356, 60202, 57393, 59558, 57255, 56039, 57257, 55961, 64636, 57401, 58779, 57406, 57265, 13262, 60906, 56770, 59874, 57011, 58355, 61737, 57359, 57493, 64671, 57273, 30057, 57280, 32412, 57324, 57284, 8612, 57287, 2093, 57289, 64793, 58995, 57293, 61928, 32100, 3011, 58507, 64548, 56042, 57782, 57303, 32392, 55747, 57307, 64498, 2259, 57311, 32066, 6129, 57314, 57859, 58931, 64842, 63776, 57792, 57912, 57323, 59919, 57841, 58835, 57328, 2982, 57330, 8038, 55934, 55406, 63958, 44556, 58661, 57339, 29193, 32342, 57342, 1021, 59311, 57069, 40403, 57353, 59822, 58656, 55520, 55567, 3692, 60025, 61822, 58869, 61923, 32412, 57492, 57361, 58077, 57366, 1528, 58534, 59194, 57371, 64581, 5179, 57375, 56150, 32295, 58097, 57927, 54147, 57387, 57383, 55483, 56562, 64902, 57382, 10370, 57390, 64796, 29710, 57510, 32315, 10219, 63798, 21786, 57399, 32094, 58089, 57500, 61745, 56125, 57267, 57408, 57270, 32164, 57417, 64915, 57360, 32259, 57494, 1109, 56248, 57421, 59344, 59466, 61539, 56071, 55536, 58011, 57430, 63611, 57433, 58258, 61522, 58183, 57438, 57465, 63867, 1155, 57443, 9093, 58262, 55654, 2070, 57449, 64844, 57451, 60193, 58339, 63714, 60226, 56721, 13947, 32130, 22273, 32236, 55612, 57129, 64949, 55541, 59946, 61247, 55573, 57472, 43903, 60216, 57476, 55871, 1207, 58149, 32310, 57487, 56319, 57485, 64824, 64938, 57391, 57429, 10183, 57414, 57276, 64818, 15654, 57496, 64814, 47346, 57404, 57266, 61250, 64635, 57037, 64805, 57509, 64803, 56927, 64800, 1284, 63802, 61413, 61450, 62132, 63807, 61448, 63809, 64022, 63811, 63863, 57531, 55919, 63815, 61472, 57537, 63819, 56110, 62149, 63822, 61434, 59254, 57577, 57574, 55842, 61439, 58422, 57551, 61443, 57554, 63833, 55572, 63835, 57560, 903, 63838, 62167, 57565, 63841, 57568, 61456, 61478, 57592, 62174, 61465, 62176, 65032, 56276, 62179, 57583, 61469, 64292, 61471, 62184, 63861, 63860, 62187, 57528, 61478, 57597, 61481, 42525, 63108, 39556, 54609, 2533, 57604, 55835, 59062, 57694, 56406, 64082, 64003, 56490, 57928, 57056, 58119, 2400, 64294, 57621, 63985, 63554, 57643, 63985, 32644, 1630, 57630, 58389, 32258, 58806, 63596, 63732, 57637, 61103, 60350, 60336, 57626, 57645, 64156, 61869, 57650, 65084, 57959, 1468, 57656, 57304, 57658, 64872, 58103, 57662, 57525, 62169, 61922, 32018, 61916, 59129, 57912, 58042, 57771, 57677, 63883, 13603, 57680, 62109, 60688, 57684, 57084, 63722, 50578, 60338, 7077, 56262, 32305, 9503, 65079, 61397, 60513, 57700, 64950, 57702, 55605, 59784, 64507, 48272, 59017, 57710, 56128, 61742, 61711, 5894, 65154, 58699, 61820, 59483, 57764, 59590, 26679, 58717, 59789, 56719, 55657, 65145, 57731, 58314, 61727, 57735, 64219, 55737, 64243, 4420, 63707, 55737, 58236, 6997, 56105, 61519, 32490, 32044, 12537, 57752, 58629, 1314, 57756, 3516, 61808, 26751, 59181, 59682, 58323, 57724, 63982, 56530, 57019, 32243, 61574, 64372, 60468, 61343, 56132, 57891, 59927, 60412, 57848, 57783, 57758, 954, 57786, 61657, 62450, 1488, 64863, 64853, 60166, 57795, 62159, 55809, 60465, 60983, 23722, 56123, 55997, 57804, 55465, 57833, 32668, 60979, 1428, 57807, 57814, 61995, 56355, 61592, 60406, 57820, 64558, 57823, 55445, 60407, 56387, 65236, 4434, 57830, 13105, 65247, 59497, 61681, 61550, 58193, 63618, 57841, 55792, 63586, 56740, 57938, 1284, 57849, 1111, 57852, 57858, 57855, 45339, 58118, 57854, 58842, 57861, 65262, 60350, 57698, 57730, 64515, 57869, 65184, 64515, 57873, 60782, 57876, 32433, 13414, 60673, 64422, 57883, 55405, 64425, 1536, 65289, 61038, 60905, 5723, 18679, 62053, 57895, 56179, 57897, 61879, 59579, 63528, 57902, 56629, 60205, 65221, 57907, 56438, 63979, 16518, 61153, 55667, 57915, 59954, 60973, 64509, 56680, 61841, 58771, 56867, 60720, 60708, 60604, 57930, 60657, 13912, 58647, 61682, 64954, 61795, 4382, 61694, 64086, 58113, 60449, 3632, 58595, 65262, 55567, 64771, 11152, 57952, 61138, 64771, 64243, 55639, 19381, 61954, 61868, 61693, 56497, 56495, 64556, 3360, 61792, 56189, 58121, 5378, 56105, 57975, 60727, 63844, 58310, 60287, 59162, 65302, 56061, 65368, 57989, 63632, 59697, 65370, 64761, 56412, 57997, 55592, 61036, 58007, 24497, 60938, 57642, 58020, 65380, 1074, 58010, 65384, 64564, 59692, 58350, 61631, 49297, 58025, 58021, 58497, 56021, 64691, 65384, 57921, 58028, 1670, 58030, 55546, 58027, 47858, 64268, 58037, 60785, 56228, 63952, 59188, 61624, 60839, 58046, 65337, 59895, 58055, 55632, 58593, 58816, 64517, 58056, 61897, 56147, 57269, 57011, 58091, 58825, 32216, 58067, 65428, 2752, 5013, 32580, 55928, 58081, 8634, 64362, 9381, 61714, 61720, 31988, 58082, 65441, 58085, 65428, 2286, 60048, 58086, 58063, 58093, 58410, 57586, 65409, 433, 64249, 58101, 57384, 55715, 32164, 1070, 32539, 58107, 58291, 58345, 1473, 55771, 65189, 61342, 60449, 58115, 56625, 56420, 58119, 55550, 65359, 60816, 59894, 60813, 55380, 55659, 56438, 58129, 56585, 963, 32437, 58122, 57417, 46331, 57458, 32018, 13168, 58141, 32600, 4334, 58144, 59698, 56339, 976, 1793, 58149, 11146, 64585, 57806, 55692, 60813, 55452, 59205, 64522, 55470, 58160, 56934, 58795, 33874, 58165, 51354, 58167, 63529, 61234, 16745, 63942, 60262, 60259, 62114, 65524, 61310, 5541, 58182, 17542, 59229, 32202, 56835, 55545, 61397, 58206, 2999, 58213, 60436, 65181, 58196, 58245, 65538, 58200, 62073, 58238, 59726, 58234, 57358, 65181, 58228, 60804, 58217, 58215, 65543, 64458, 64847, 58076, 65536, 27094, 58245, 65181, 58226, 1542, 65551, 58230, 62073, 65565, 30928, 65536, 32362, 62102, 65546, 6885, 65542, 58199, 58244, 58193, 63768, 45637, 64437, 24551, 58250, 22442, 58873, 21455, 32695, 58256, 60310, 58259, 55543, 58275, 58264, 58385, 19221, 56169, 65090, 58271, 58267, 61672, 58274, 62121, 1017, 543, 58277, 57639, 64461, 59325, 65288, 57090, 58284, 60768, 55354, 55518, 58289, 58321, 64460, 62015, 63959, 58314, 58303, 58297, 32488, 56263, 65343, 58309, 58304, 64461, 61334, 65625, 5407, 57980, 60513, 63596, 57732, 58315, 60648, 63781, 64293, 3026, 65162, 65197, 57766, 61532, 1528, 58328, 56170, 65420, 58332, 61150, 58769, 57808, 19390, 55695, 58339, 58345, 9411, 63766, 58340, 65657, 6002, 63470, 57220, 64097, 64759, 57271, 64818, 65382, 58354, 60679, 64223, 55777, 60976, 25336, 55767, 58367, 55473, 65196, 58371, 57725, 58112, 58659, 59839, 60964, 59365, 63776, 65010, 62130, 61725, 58388, 57521, 11188, 60164, 63809, 64741, 55728, 58466, 65167, 1956, 65696, 58402, 63981, 58405, 60568, 61657, 61884, 32118, 60385, 59251, 62081, 64109, 65703, 1027, 58449, 57024, 65034, 61446, 26967, 64870, 9077, 64224, 62162, 65692, 20396, 62165, 65689, 58434, 61452, 61981, 58465, 58516, 32562, 64403, 65730, 61870, 57234, 43270, 32240, 58417, 65736, 3627, 58452, 32221, 32099, 55802, 62081, 59233, 58416, 65704, 56856, 58461, 36774, 61220, 65751, 65697, 59272, 58468, 63299, 17346, 55325, 5767, 58471, 32083, 58473, 10109, 58475, 57422, 3317, 58478, 32133, 56715, 55406, 58482, 58603, 56236, 58485, 60988, 32463, 1054, 55887, 58491, 59062, 16912, 60612, 55544, 58498, 32121, 58494, 58501, 11626, 56028, 58504, 59664, 64835, 19390, 56543, 59669, 59765, 59156, 65790, 55762, 44928, 58518, 59675, 59487, 58522, 65082, 64181, 59327, 60472, 1670, 55355, 59479, 61123, 58533, 29026, 61944, 58899, 58539, 57747, 58541, 55441, 58543, 58740, 56470, 59457, 64395, 58549, 59903, 58007, 58553, 43704, 58556, 57721, 59145, 60014, 34216, 55875, 58563, 32317, 57999, 58598, 65840, 32120, 25984, 58571, 65820, 58573, 32315, 15093, 48272, 58546, 60116, 58614, 61926, 58584, 58580, 58619, 58963, 58588, 11922, 56804, 58625, 58594, 5524, 58597, 34160, 60865, 7801, 59292, 58604, 56925, 58607, 5737, 55704, 65852, 64746, 59892, 59810, 58616, 65877, 58586, 65859, 58621, 58589, 59404, 64702, 37612, 55903, 58627, 65865, 58600, 65867, 60892, 59884, 38787, 58751, 9553, 55554, 56460, 59476, 64004, 65766, 58070, 58645, 57363, 61971, 58649, 58483, 58652, 61807, 60173, 58714, 61691, 1129, 58377, 58688, 2752, 58663, 32730, 61096, 57756, 58685, 37483, 490, 58670, 61872, 61757, 65917, 58676, 58830, 56681, 59439, 490, 58681, 56409, 55447, 65923, 8918, 65916, 58707, 65918, 58690, 61717, 3165, 58693, 55418, 58454, 56971, 65145, 58699, 65707, 58559, 32575, 32444, 60788, 58706, 64867, 58676, 58709, 57960, 58711, 32399, 58713, 59680, 59690, 58718, 60017, 58721, 63538, 59638, 23842, 60128, 59206, 58895, 65914, 58748, 55341, 64710, 58735, 60834, 58739, 57669, 32325, 58340, 64173, 2535, 65983, 2496, 58731, 1488, 58750, 58636, 58756, 56733, 60914, 65994, 42164, 57390, 60113, 58766, 1348, 59857, 59601, 60875, 55552, 59496, 60068, 2098, 58786, 59797, 32459, 60085, 59381, 32499, 31994, 57742, 59541, 1066, 58785, 3830, 59067, 58789, 60002, 32068, 59035, 59424, 58795, 56275, 58798, 64090, 58947, 65383, 64520, 5411, 55681, 64920, 16939, 56227, 32411, 59624, 58812, 32610, 58814, 57353, 32712, 60897, 58819, 8807, 60466, 32596, 59569, 59602, 58827, 64231, 66052, 58832, 56799, 59822, 58835, 32440, 58837, 56608, 58860, 56734, 8021, 58842, 27206, 55875, 55834, 59352, 2461, 58849, 6587, 58851, 59653, 59485, 4371, 61025, 32399, 61638, 58859, 56934, 32502, 59343, 58064, 58620, 65849, 66085, 2752, 58868, 64477, 3627, 32198, 32586, 58876, 43381, 59116, 56491, 58863, 55443, 58881, 65944, 61552, 59651, 58886, 58511, 59092, 59303, 55238, 55790, 48835, 59617, 65976, 58999, 61770, 58901, 59390, 57513, 32184, 58919, 53287, 63906, 58506, 58910, 58508, 56799, 61515, 58915, 65798, 1017, 66120, 56010, 66122, 59674, 58923, 63605, 8608, 55977, 63540, 6170, 58930, 56430, 21014, 60765, 58935, 1037, 58937, 57525, 58939, 32290, 58968, 32651, 5179, 55539, 61421, 5655, 58463, 59968, 32233, 59234, 55747, 58966, 57538, 58956, 59778, 65709, 66130, 65425, 66161, 58965, 59240, 58946, 38787, 57234, 58949, 66152, 66174, 32079, 66155, 58659, 58979, 57354, 58731, 32044, 65822, 61608, 60010, 64411, 58590, 58998, 59329, 58917, 59094, 59169, 66190, 61391, 14251, 60505, 9160, 58291, 59470, 59010, 32264, 61854, 55646, 32612, 59004, 58731, 59012, 1383, 59014, 56997, 61915, 65824, 2982, 58511, 66215, 57725, 55388, 59024, 65126, 60134, 1066, 61028, 59038, 63640, 57897, 32008, 59035, 56147, 66230, 59039, 58920, 59041, 40144, 55934, 59045, 55540, 59159, 59296, 58341, 59717, 59053, 55951, 59055, 51596, 59231, 65214, 59059, 57504, 65869, 57456, 59882, 13461, 5105, 56893, 66022, 9517, 59070, 56471, 59891, 2922, 65672, 59076, 32616, 56300, 3993, 60044, 24382, 1078, 61434, 66227, 59086, 3857, 59088, 10055, 59090, 60730, 64870, 59093, 66275, 59095, 66196, 59345, 60342, 32635, 58042, 59108, 58023, 32715, 31994, 59107, 64873, 9160, 57581, 59112, 61512, 59195, 58253, 59985, 5443, 59826, 59132, 58668, 59124, 58753, 57734, 61361, 57126, 54844, 57952, 57721, 59138, 61694, 60060, 59137, 66309, 56560, 32095, 60942, 59144, 65901, 56541, 9079, 58285, 59294, 66298, 59154, 66300, 61884, 59158, 59019, 66327, 56704, 59515, 59302, 32064, 3028, 64415, 59298, 58375, 58849, 6773, 59174, 56202, 65189, 57791, 56241, 59179, 59176, 59182, 66349, 59184, 46731, 59187, 66313, 66318, 59191, 56945, 59489, 56460, 66329, 3920, 59197, 57550, 1284, 59200, 55566, 32223, 2067, 63616, 5137, 59207, 57796, 61561, 58350, 59211, 59238, 66178, 66154, 65708, 66177, 66272, 58948, 11118, 58963, 60403, 59220, 59226, 28873, 32044, 36644, 59389, 66150, 59233, 66387, 66162, 59225, 61454, 58942, 66163, 66152, 59242, 59216, 59244, 12326, 32172, 6920, 59248, 44595, 59250, 55853, 61789, 60995, 65419, 57651, 59958, 59270, 56513, 58399, 59262, 66167, 57785, 56924, 59267, 63969, 65756, 65817, 66428, 59140, 5737, 60228, 61763, 66428, 59280, 65487, 57037, 59288, 55632, 59384, 60119, 66439, 59290, 31999, 46536, 66434, 58399, 57193, 62106, 56093, 66439, 59300, 32709, 66341, 57326, 46892, 32057, 59013, 59308, 58923, 60104, 59312, 24443, 55384, 60589, 66294, 59318, 66133, 26314, 66313, 59323, 59399, 55275, 66103, 56173, 66248, 60003, 59349, 59333, 13120, 59335, 66479, 59338, 17680, 64072, 58042, 66089, 59345, 60046, 59348, 59337, 60434, 66071, 32697, 59874, 58434, 59357, 57806, 3627, 55498, 65300, 3356, 59362, 66223, 58381, 66312, 59368, 63467, 56541, 66232, 59896, 59378, 61283, 59375, 59380, 66230, 57721, 65874, 59385, 56650, 59643, 56769, 66118, 59071, 8675, 61598, 2036, 57831, 59682, 59913, 59400, 64840, 55906, 59771, 60578, 2995, 61880, 59727, 57746, 32170, 59412, 59845, 55546, 59415, 3880, 56661, 66244, 66027, 59422, 65189, 66549, 60112, 63680, 61840, 32145, 59503, 59432, 58995, 56486, 57682, 59720, 66556, 66024, 59440, 59445, 1772, 59443, 64849, 59446, 60818, 65803, 57214, 57760, 59482, 65616, 64575, 59456, 58611, 59870, 66549, 32732, 59463, 60662, 59460, 32521, 59467, 59752, 66207, 60772, 66587, 63767, 65835, 66235, 65813, 63767, 59452, 59483, 49213, 58854, 55812, 32440, 59489, 59625, 65719, 32706, 58345, 57079, 66007, 57834, 59499, 66609, 59960, 59504, 66289, 59507, 2110, 55536, 60821, 40009, 65117, 62135, 55748, 57831, 60086, 57642, 59519, 58668, 59880, 59524, 25004, 59526, 58845, 66557, 27110, 59773, 61272, 64849, 57829, 59535, 61815, 61014, 66013, 66018, 6509, 66013, 59545, 65534, 59548, 60961, 64747, 13975, 59453, 59554, 64849, 1064, 59557, 56927, 58320, 63736, 59891, 59563, 64710, 32614, 59433, 59568, 66657, 61065, 23745, 60644, 61250, 59575, 66312, 14807, 1857, 63681, 32406, 59831, 14473, 64149, 59800, 32086, 66254, 61915, 65662, 55459, 59593, 66679, 60894, 1060, 56446, 55993, 59600, 56585, 11855, 58827, 59746, 66693, 66310, 65785, 59111, 59478, 32469, 55631, 59551, 61515, 66113, 59681, 59620, 56028, 63956, 58810, 5407, 59389, 59626, 56426, 65811, 32259, 60078, 57109, 66557, 59634, 58788, 66720, 59957, 55976, 64540, 59642, 32682, 63601, 59645, 60272, 59647, 7080, 59649, 59290, 32572, 57397, 66076, 66600, 55799, 66737, 1284, 66107, 66280, 59998, 61885, 56562, 65793, 59666, 25755, 59668, 66129, 58513, 55932, 59672, 905, 66572, 58520, 58182, 59006, 59679, 59689, 27084, 57763, 59654, 66754, 56277, 59686, 1551, 66707, 59690, 60144, 59693, 56236, 59695, 57991, 56389, 58682, 59700, 56433, 59043, 32394, 59358, 12589, 59706, 58686, 60990, 59710, 58921, 59316, 5378, 59782, 66789, 61862, 66292, 59719, 59718, 59722, 59953, 55733, 59726, 66567, 59728, 5107, 9403, 59731, 61395, 63470, 61108, 57965, 14517, 60076, 60813, 55527, 66043, 64761, 59745, 66692, 64516, 66188, 59750, 66693, 65854, 58583, 63575, 55441, 59762, 56946, 61854, 56017, 59758, 59764, 1348, 1753, 59767, 59925, 66024, 56526, 65708, 59530, 59895, 60046, 59691, 61064, 66805, 48835, 59782, 65200, 976, 66744, 64253, 63959, 59789, 61492, 59791, 6987, 63950, 59792, 66011, 58015, 66681, 15055, 59833, 59804, 49635, 55368, 32610, 59808, 50318, 59828, 59812, 7033, 66815, 59816, 59891, 34158, 55715, 55942, 59578, 22000, 66815, 32100, 59826, 4337, 59828, 9503, 61572, 1526, 66864, 59319, 39281, 59832, 64967, 59839, 65774, 57604, 3040, 61616, 5742, 59100, 59478, 59848, 32588, 66528, 55397, 58764, 66004, 59855, 30669, 66003, 8326, 59859, 64960, 66288, 59311, 65634, 59865, 58339, 58547, 32449, 60417, 63495, 66188, 59565, 58060, 58434, 66629, 59878, 3125, 66928, 66254, 58125, 61882, 57708, 58762, 61586, 59917, 60057, 58819, 59893, 5246, 56052, 58107, 60069, 29026, 59899, 59822, 65828, 32280, 56020, 58309, 59888, 60180, 66005, 4371, 1619, 59911, 59163, 59324, 66928, 66891, 57426, 59919, 59877, 4875, 59922, 64120, 64916, 9633, 25971, 61251, 65886, 59929, 66971, 59936, 59776, 55452, 61785, 66846, 59781, 5113, 60161, 66851, 59942, 44461, 55563, 59946, 59950, 66858, 59948, 66924, 57916, 58760, 66721, 66418, 66610, 59638, 59962, 55745, 59964, 59739, 60704, 2085, 59969, 59826, 59972, 55423, 66841, 59676, 1536, 32504, 55369, 60909, 60973, 66765, 64940, 59456, 65675, 1037, 33745, 737, 58656, 58672, 18920, 66650, 870, 59995, 32062, 62164, 60990, 1445, 60000, 64456, 66636, 66839, 60005, 30979, 1185, 56554, 66821, 60012, 57942, 66699, 60016, 2752, 32154, 60019, 66415, 15687, 57884, 32387, 60025, 56355, 60027, 60721, 60024, 66178, 33950, 60032, 63904, 57304, 57478, 60036, 55351, 59333, 59144, 60040, 64886, 32072, 57481, 66273, 60045, 57480, 60047, 65098, 62115, 60051, 32668, 60053, 60039, 66669, 66939, 32616, 66241, 60061, 57412, 61221, 25735, 61876, 65248, 66945, 55431, 60071, 8730, 60073, 32135, 67002, 58115, 66723, 60080, 64966, 60516, 66013, 60085, 59420, 66691, 60089, 60300, 57501, 59039, 59631, 67109, 61497, 60097, 65693, 60673, 32682, 58679, 60106, 55369, 66289, 56021, 67120, 63996, 56781, 11941, 32512, 32509, 66630, 60114, 59637, 2744, 59029, 67020, 58342, 12315, 60121, 65166, 63543, 60124, 13624, 32305, 11855, 59453, 58727, 60131, 55593, 60133, 58788, 64030, 6773, 60528, 60138, 13128, 60140, 67014, 59981, 63904, 66769, 56762, 65758, 17689, 57604, 19680, 66465, 32503, 66147, 64847, 60152, 60272, 60154, 65309, 55636, 65313, 61695, 64318, 56055, 65693, 65309, 55472, 60268, 60752, 56093, 61823, 64638, 28216, 60176, 60161, 60575, 64493, 64007, 60275, 64735, 60838, 32135, 33862, 58044, 64188, 60194, 60673, 61168, 66933, 56934, 58202, 60677, 59439, 60203, 58202, 64769, 58205, 32357, 60210, 61377, 60503, 65589, 61528, 4875, 55869, 4802, 63874, 55937, 64160, 61932, 32316, 64240, 60229, 57780, 2075, 61355, 65251, 60499, 1995, 60327, 60375, 60329, 58761, 60760, 64285, 65476, 63533, 59935, 67239, 59676, 24497, 61448, 60253, 59707, 1800, 67170, 55962, 32154, 63993, 67174, 60261, 64752, 32614, 64288, 64320, 64712, 63561, 15650, 61364, 63977, 60273, 61008, 32697, 61153, 13353, 48194, 63928, 60359, 60282, 65855, 60547, 61809, 60290, 67197, 60290, 65136, 32340, 60294, 60300, 61693, 60012, 60299, 60943, 9654, 60205, 60212, 67211, 60209, 59834, 60900, 67215, 32515, 60311, 63711, 25114, 55935, 60222, 60317, 63878, 60781, 60320, 67227, 60326, 60323, 60655, 67232, 3839, 64750, 32390, 60765, 60330, 60084, 56066, 59179, 64600, 60335, 67317, 6537, 65138, 66445, 32025, 61199, 55847, 23946, 60345, 55515, 59193, 55465, 64323, 55636, 60476, 55454, 60502, 60891, 56437, 67275, 64489, 32068, 60533, 61586, 64297, 61276, 60369, 60556, 60371, 61402, 60374, 55616, 64236, 60378, 57469, 60381, 66318, 60390, 61771, 60387, 60082, 67358, 56130, 60393, 1225, 60395, 61066, 61280, 60399, 56159, 61042, 60403, 60724, 13307, 57819, 57159, 67373, 63904, 65210, 59717, 60925, 64247, 60418, 32026, 60420, 4429, 59620, 60175, 60425, 65534, 61649, 60429, 58764, 60421, 59389, 60225, 60434, 32399, 60436, 60363, 60448, 61011, 61070, 63938, 46315, 1149, 60506, 2055, 63745, 64214, 61911, 64202, 60453, 55524, 61086, 66669, 11693, 60463, 64416, 57046, 61837, 60464, 56241, 58253, 32428, 61579, 61099, 67335, 56030, 65102, 64114, 60477, 61107, 60480, 64195, 57896, 60484, 57158, 60119, 64255, 66952, 61117, 55696, 61665, 61121, 65257, 55893, 60558, 60355, 65210, 61124, 56235, 60214, 61130, 60506, 62055, 6987, 60510, 56688, 56924, 65633, 59063, 60388, 32600, 64297, 59254, 60520, 64642, 60544, 60703, 55635, 60526, 60573, 61290, 55962, 60532, 67404, 55572, 60635, 60039, 60745, 61876, 56053, 60540, 60703, 56577, 60884, 56277, 60545, 55596, 60777, 67237, 56042, 59965, 60586, 64305, 60806, 66176, 64052, 63485, 64392, 55819, 60565, 67501, 61428, 61160, 61165, 67473, 61165, 65981, 1065, 64261, 60585, 64837, 60583, 58487, 63940, 59228, 67051, 61139, 57870, 60613, 21908, 64230, 60464, 61973, 60600, 57730, 60602, 57730, 65325, 55722, 64718, 67190, 64132, 56868, 64187, 60929, 55459, 57884, 60619, 32190, 60621, 67468, 66015, 67512, 60763, 59420, 59576, 61296, 61104, 61082, 32025, 67547, 63847, 64282, 32252, 64782, 60642, 56678, 60644, 67438, 61138, 61001, 65637, 61210, 63996, 60652, 61523, 55397, 61216, 57932, 58149, 61890, 61220, 61226, 61120, 60665, 61225, 60663, 59964, 1275, 58830, 66835, 60674, 63557, 67206, 30863, 57573, 64637, 57954, 60302, 60681, 61244, 61585, 57238, 67573, 60660, 67338, 60693, 59927, 61379, 62004, 60698, 56982, 64729, 56938, 60692, 63742, 64112, 61837, 64373, 64927, 61062, 61828, 64314, 63895, 56433, 56487, 60722, 64585, 67375, 67620, 60728, 60725, 67370, 60408, 60405, 66279, 56184, 60732, 60522, 60885, 56327, 64290, 60754, 31174, 60741, 56338, 60767, 9629, 60745, 60501, 60855, 14868, 60530, 63754, 60269, 56865, 60754, 11747, 60861, 67639, 44928, 65981, 64140, 34415, 60882, 61037, 4870, 60743, 61173, 58910, 64064, 57903, 56151, 56942, 55955, 57946, 64052, 61255, 37483, 60780, 67569, 67425, 61327, 57918, 56168, 61254, 67676, 60792, 66111, 63774, 60796, 60015, 61897, 64190, 56781, 32592, 60802, 57815, 61399, 60331, 67353, 56832, 59350, 65347, 60644, 61078, 61177, 61346, 63721, 60820, 55431, 9186, 28203, 59516, 56083, 57943, 56287, 55693, 61863, 67609, 57940, 67655, 56203, 61397, 65366, 64197, 67447, 63597, 60844, 63918, 61958, 60796, 67650, 61173, 64695, 57869, 60743, 60854, 60861, 67488, 67463, 63932, 58375, 67726, 67659, 61125, 67489, 67513, 60552, 63936, 56606, 56048, 61032, 56352, 60863, 61406, 67647, 64489, 61033, 61014, 67615, 60897, 59179, 61298, 60889, 60526, 64301, 67755, 53252, 67504, 60750, 64142, 60899, 67290, 57861, 61461, 60903, 57575, 64431, 55642, 64608, 56342, 67494, 64837, 63792, 56865, 60915, 67381, 61945, 872, 64010, 57008, 61553, 8716, 64353, 60926, 58097, 2536, 60933, 58343, 3527, 60933, 64764, 56975, 64752, 67208, 60940, 1488, 60942, 67799, 57895, 61358, 6755, 67803, 61235, 58884, 57879, 57052, 64214, 61002, 67605, 57638, 55571, 60960, 64078, 32051, 60415, 60965, 55536, 61441, 60968, 55480, 58339, 63489, 63968, 2026, 56370, 65673, 3227, 61511, 55699, 56712, 67833, 61328, 57604, 60985, 56040, 60987, 59497, 60990, 64701, 1314, 32154, 61747, 57281, 64469, 67691, 67733, 61658, 61003, 60489, 60820, 63830, 32306, 56298, 61015, 64303, 61012, 60793, 60628, 61072, 56386, 12333, 57931, 61020, 57058, 61022, 56451, 61024, 57025, 61027, 67269, 64411, 61031, 60361, 67744, 61060, 57814, 55988, 61039, 60703, 63922, 61400, 61248, 61318, 55462, 57116, 32932, 66671, 25583, 61052, 62123, 61055, 1414, 57807, 55713, 60452, 60879, 57276, 61062, 67518, 56728, 60396, 61067, 57586, 67398, 67403, 56011, 1746, 5744, 32674, 60396, 61076, 60446, 67409, 61914, 55713, 61302, 61084, 32686, 60456, 3721, 60458, 56535, 63785, 67417, 15976, 61094, 64275, 67425, 67531, 61105, 60325, 60474, 67431, 61106, 61816, 58967, 61510, 61348, 67437, 61113, 32630, 67440, 61116, 32658, 63562, 67444, 61836, 57840, 56511, 67491, 67310, 59746, 67272, 60309, 61130, 66025, 58348, 56725, 63556, 61238, 61136, 55659, 67563, 67463, 61140, 57074, 61142, 62041, 32248, 61839, 56555, 58104, 61149, 64665, 61152, 64854, 61158, 63757, 59309, 67982, 65753, 55722, 67507, 61164, 60621, 61166, 50285, 61109, 56129, 61171, 60654, 67662, 60599, 60596, 32556, 61149, 61180, 67529, 59422, 61098, 56595, 61186, 67542, 67775, 67535, 64595, 66043, 67759, 62098, 67497, 66156, 62142, 61198, 3927, 60640, 6324, 61203, 56208, 60645, 61207, 67564, 62030, 32012, 67904, 65282, 60710, 67571, 60658, 61219, 65702, 61669, 61223, 61026, 32022, 68036, 61228, 66657, 60195, 57993, 64125, 56061, 3011, 67809, 68045, 61239, 57039, 57954, 55629, 67593, 3857, 64792, 65521, 64258, 60647, 64536, 61251, 61001, 61253, 58705, 67671, 15154, 56982, 61258, 61454, 56515, 64683, 60883, 55405, 56094, 56590, 61266, 67793, 57525, 60170, 62123, 61273, 56349, 61275, 67644, 60695, 67624, 61281, 62157, 56047, 56634, 59811, 63929, 7089, 60368, 67474, 2700, 8993, 61293, 23208, 60556, 67550, 3634, 61029, 60521, 56332, 63580, 32114, 914, 58628, 64625, 57238, 63962, 63724, 1473, 67664, 61311, 49216, 64299, 59717, 61046, 68074, 11378, 61046, 65108, 61322, 65455, 60475, 67678, 56294, 67680, 61329, 56391, 61331, 59103, 61968, 56182, 63500, 61337, 61333, 57281, 64379, 65470, 56450, 68008, 60975, 67701, 57984, 60483, 57749, 56625, 58747, 65243, 61354, 32322, 31209, 61801, 67100, 61360, 57332, 66733, 61364, 57611, 68077, 67793, 64317, 61371, 30655, 56279, 61374, 32433, 61376, 64766, 60891, 61163, 64695, 67735, 68096, 6149, 61384, 58770, 58735, 65111, 61460, 67147, 66197, 67723, 56173, 64099, 61396, 60837, 67348, 67692, 61043, 61688, 58811, 67373, 60761, 56725, 11666, 66257, 67656, 66140, 58384, 62130, 65012, 55823, 65014, 62164, 57663, 64716, 65018, 61478, 65018, 65022, 65062, 63818, 17196, 61431, 63821, 13452, 65029, 65622, 59142, 63826, 58420, 65039, 61442, 55868, 65038, 65721, 65040, 61417, 65042, 62166, 56413, 65046, 63822, 68069, 55887, 32562, 65050, 57568, 65052, 56282, 65054, 63811, 58408, 1471, 65518, 65059, 56239, 62183, 60528, 62185, 65021, 58041, 62188, 60983, 65068, 57599, 62194, 50763, 61485, 55324, 26794, 32221, 66268, 1088, 64255, 58758, 61494, 4420, 64723, 32164, 64962, 56257, 63993, 67928, 61920, 57943, 65609, 64108, 61509, 65944, 61511, 65682, 61514, 63791, 64711, 61518, 65283, 6711, 55787, 67304, 56540, 68292, 60217, 20813, 63781, 56438, 55452, 4496, 67837, 1237, 3451, 58795, 61579, 61537, 61150, 64938, 57680, 61001, 61546, 59959, 8966, 61687, 67786, 57459, 65177, 57238, 56702, 32449, 68317, 1726, 55443, 61556, 57969, 32094, 32095, 66376, 32542, 61563, 64720, 32243, 58740, 61568, 67603, 61571, 66678, 65127, 57027, 57881, 64356, 67426, 64647, 33871, 61920, 58085, 61261, 7218, 59762, 56605, 64669, 61591, 65927, 67819, 67940, 60162, 61596, 62170, 67831, 67523, 65079, 57731, 67000, 61605, 61976, 61608, 63655, 56381, 61612, 20579, 61614, 63651, 65214, 61617, 65150, 61885, 55880, 56352, 65357, 56868, 67195, 60578, 55556, 61628, 58041, 65328, 57934, 61633, 68388, 55438, 61637, 6608, 64083, 64105, 61641, 57490, 18060, 56730, 68397, 32127, 32210, 60428, 4711, 32479, 55720, 59505, 61655, 27286, 57056, 64464, 1374, 61661, 32390, 68038, 16596, 67577, 65310, 59889, 8832, 68418, 64774, 61673, 57202, 32284, 64739, 61678, 68425, 64653, 63509, 61682, 56480, 68194, 56518, 67202, 59354, 64020, 61690, 57991, 67208, 61694, 68369, 61697, 64295, 13312, 58729, 32293, 56419, 61703, 66624, 68448, 61717, 6630, 65455, 56426, 12862, 58641, 63476, 23624, 61719, 68348, 61706, 65347, 57037, 61925, 8326, 65183, 60037, 32630, 2738, 61465, 65524, 64371, 62146, 4869, 61736, 65440, 58727, 61739, 2755, 61741, 67844, 61711, 64536, 32245, 63655, 56438, 61749, 1021, 63721, 61843, 59434, 56635, 61586, 65100, 32042, 59874, 67858, 60411, 56778, 61762, 28957, 58094, 61766, 55406, 61534, 27288, 64032, 56438, 67017, 29189, 60904, 61776, 68474, 56577, 61172, 65353, 57965, 61783, 55434, 61456, 63682, 58536, 58164, 64728, 61791, 64248, 61794, 67701, 61797, 68156, 65453, 56058, 61802, 32611, 57300, 61512, 44355, 65213, 59098, 67195, 61898, 67164, 61813, 59562, 64353, 893, 61888, 61820, 57109, 61822, 67388, 64350, 63948, 60164, 67738, 55614, 68381, 32312, 57886, 56788, 61366, 60712, 67926, 61838, 65240, 14119, 61841, 59008, 59209, 61845, 60609, 61847, 64461, 55529, 1818, 62100, 61852, 61896, 58917, 61856, 57279, 56204, 58659, 61860, 58028, 58169, 59393, 56352, 68578, 61866, 1185, 57961, 68591, 61835, 32175, 58170, 67482, 56157, 60503, 57993, 56821, 61882, 10109, 55417, 57582, 1468, 61888, 55359, 61890, 65951, 61893, 3125, 61895, 1528, 58917, 55534, 61900, 62075, 1385, 61904, 58188, 26251, 61908, 67354, 68116, 61912, 58967, 61343, 61086, 55884, 61917, 61778, 64021, 68237, 59614, 67035, 61626, 65484, 56759, 61848, 64327, 61405, 65664, 55417, 5816, 1383, 61936, 32203, 55566, 60422, 31999, 35712, 68356, 60964, 58536, 59621, 61946, 57646, 56166, 63682, 1054, 60815, 63682, 61387, 61955, 66887, 55430, 61980, 65607, 67815, 56019, 57761, 61964, 61961, 56151, 32572, 20358, 61969, 32294, 61971, 8807, 56635, 62037, 61569, 6974, 68282, 64348, 32960, 68688, 67850, 68689, 55702, 61999, 61990, 64512, 58292, 64443, 58125, 62006, 61998, 61985, 64688, 62001, 65729, 32229, 67603, 64134, 62007, 60649, 55663, 64755, 62012, 68168, 68315, 2459, 68714, 62018, 68696, 57238, 61987, 62023, 64134, 32550, 68565, 13575, 62025, 62008, 55663, 62032, 32066, 57913, 59006, 49722, 68685, 64094, 1209, 56868, 63648, 62043, 4504, 61399, 68537, 62052, 59773, 56407, 17424, 64183, 67591, 61187, 63787, 65275, 24551, 62059, 55567, 62118, 60489, 68561, 32082, 8906, 62062, 65291, 56898, 56799, 55613, 56975, 62102, 37713, 57682, 62076, 59372, 16817, 60148, 58755, 60148, 5117, 62159, 68775, 58349, 57771, 68456, 67298, 62090, 58114, 57940, 68164, 62095, 45696, 62097, 68299, 65108, 58208, 55769, 68428, 57649, 64339, 65711, 65134, 56521, 67798, 61508, 62114, 67178, 57132, 68761, 3165, 56551, 5767, 61821, 67895, 64623, 67895, 62127, 56163, 68203, 55819, 68234, 58389, 61447, 68208, 65119, 68210, 68257, 60536, 65064, 57287, 62144, 61429, 68217, 62148, 68347, 68221, 61457, 62153, 57287, 65716, 58428, 63831, 68229, 62161, 68231, 63808, 63837, 68540, 58435, 65047, 56380, 65049, 57571, 65051, 65055, 54140, 65031, 68246, 63852, 62180, 57584, 61470, 68252, 57588, 65063, 62186, 63859, 65066, 57571, 68259, 43035, 117, 114, 346, 110, 426, 43201, 39047, 43043, 52253, 63109, 52255, 10514, 12054, 16199, 2354, 16201, 35585, 31598, 22189, 16205, 8139, 35228, 2989, 53172, 16211, 43399, 16214, 3158, 16216, 6731, 11721, 30328, 12817, 5994, 16223, 19314, 55176, 3461, 8009, 1403, 16231, 30649, 34403, 9457, 37543, 35260, 43540, 16240, 16247, 14126, 11572, 28478, 30853, 19327, 33770, 8968, 13641, 68901, 13884, 10078, 16995, 24174, 6569, 16259, 18081, 28507, 25284, 26290, 15805, 16267, 6195, 17843, 19199, 10957, 34610, 22494, 10952, 24356, 30366, 43016, 23739, 17883, 34644, 16284, 34562, 21234, 34553, 18156, 25097, 47947, 55321, 62195, 62951, 45806, 62599, 20481, 26889, 3831, 1765, 23364, 48383, 3642, 8425, 34167, 1145, 12543, 21671, 16568, 45855, 46491, 16125, 45038, 34414, 16577, 19967, 11106, 14843, 945, 15141, 29352, 31101, 24279, 62723, 5743, 14981, 35873, 17743, 47456, 34870, 18299, 12242, 27113, 9443, 37190, 38776, 24051, 4737, 38018, 15990, 23134, 11729, 50381, 22330, 26797, 2203, 5650, 44841, 36404, 46815, 2084, 36161, 46815, 7227, 28185, 14813, 11317, 34422, 3444, 48364, 1257, 14724, 7058, 34413, 10591, 47083, 15175, 54201, 31413, 4668, 5751, 29505, 9916, 50203, 22540, 4364, 4189, 48665, 37598, 2955, 3329, 17624, 4013, 42299, 29084, 63046, 2018, 50542, 22874, 2932, 398, 1420, 30796, 35045, 48983, 43486, 11751, 41305, 13350, 16861, 14792, 25942, 13902, 52428, 3761, 1126, 9527, 17677, 37287, 54428, 9880, 48451, 3457, 31189, 2175, 5779, 37162, 47239, 904, 20876, 15134, 50990, 51413, 20922, 46472, 7118, 14825, 7167, 4685, 40681, 46362, 53912, 9625, 39125, 35428, 69003, 29953, 50220, 33546, 34681, 33533, 36191, 28210, 3694, 34806, 2739, 35822, 50695, 24066, 21157, 24835, 11174, 5209, 2047, 12162, 27054, 1525, 40445, 52725, 22904, 7719, 54098, 5511, 9171, 16746, 8094, 52418, 13526, 51436, 47062, 3170, 17204, 5190, 4312, 8851, 1091, 15620, 30378, 11071, 22235, 38842, 3173, 20573, 30957, 6988, 34749, 18405, 24128, 31124, 34823, 18412, 45894, 28120, 8902, 29966, 3287, 42574, 9140, 2647, 2421, 29996, 1429, 34874, 53992, 62364, 45805, 54464, 48341, 43128, 20486, 2071, 15890, 12861, 29107, 45593, 38002, 41532, 14350, 41603, 34868, 45593, 10645, 14608, 54408, 49261, 47133, 48706, 16324, 16167, 48301, 27222, 28197, 22163, 8224, 27742, 13860, 9621, 22210, 14950, 15068, 7359, 47465, 2673, 1909, 31352, 2741, 14942, 7744, 49106, 47576, 27009, 19386, 32815, 11839, 2011, 54342, 33704, 8915, 49153, 63046, 19881, 63451, 8009, 4656, 21442, 62751, 13594, 54553, 20510, 62233, 47406, 14185, 62230, 11477, 14505, 5770, 43807, 50987, 6556, 8629, 49341, 12805, 9081, 28144, 24879, 34829, 69107, 34777, 27852, 38012, 12010, 16892, 62930, 3132, 37660, 2065, 47188, 24483, 51448, 14706, 17677, 32977, 2747, 11120, 36695, 39680, 44208, 16611, 46324, 35035, 50982, 11454, 44147, 30759, 1098, 62225, 2311, 43702, 13557, 15220, 46405, 49971, 1572, 9440, 49308, 27148, 22368, 21276, 16956, 40211, 22834, 47905, 17606, 5020, 2742, 9757, 62308, 6254, 11264, 6570, 15592, 46175, 11913, 35497, 62497, 49692, 50255, 43748, 54637, 39600, 29948, 30002, 12333, 49034, 11315, 49048, 20495, 11129, 41971, 22224, 28942, 42181, 37724, 53784, 4995, 12358, 4389, 5330, 45657, 4381, 21034, 1866, 1930, 25981, 24548, 15102, 17870, 6024, 50724, 68997, 34763, 8501, 63258, 6733, 13858, 5701, 16671, 27589, 37541, 36589, 19054, 41579, 69161, 5745, 20679, 24894, 3653, 35750, 31244, 41599, 6411, 52101, 42835, 24079, 69257, 40494, 36619, 12866, 10208, 3463, 56737, 10332, 44615, 10120, 38000, 50651, 44175, 49237, 51983, 52406, 17510, 49138, 6052, 31446, 18957, 18459, 17462, 14037, 1748, 39766, 18396, 69394, 7992, 31093, 69347, 10488, 9851, 12553, 9910, 18529, 69399, 25948, 34907, 34790, 6986, 27102, 13524, 2831, 35083, 19034, 26048, 29543, 3353, 3149, 41272, 54891, 8792, 25336, 1362, 39586, 1231, 21616, 12743, 6377, 17474, 8733, 8381, 9755, 34219, 42058, 8973, 7341, 3149, 49567, 18193, 9508, 43870, 35195, 27784, 5506, 4236, 14938, 35691, 7956, 3018, 3246, 8459, 17702, 1381, 3093, 12553, 28203, 33519, 18551, 69451, 32854, 10094, 69454, 17385, 69456, 14026, 46900, 34915, 34783, 55320, 62949, 68960, 68263, 62197, 29279, 31093, 8350, 54038, 8474, 11126, 41601, 928, 4249, 12445, 19280, 69482, 9672, 44889, 7037, 4695, 49408, 13264, 51695, 42403, 44094, 41601, 36346, 17986, 30769, 41555, 26322, 35891, 57822, 24071, 69465, 17886, 6394, 22731, 41506, 18704, 20202, 28557, 26345, 30153, 10852, 37399, 21179, 28557, 7174, 18560, 2684, 69166, 3895, 31364, 69359, 50634, 52051, 19636, 15662, 50498, 3074, 4793, 44549, 17667, 63423, 52921, 36495, 9653, 8344, 55275, 17123, 38226, 896, 48436, 45203, 34983, 35838, 9605, 11960, 23120, 29873, 8785, 6382, 68881, 17572, 13123, 10665, 9142, 42303, 22416, 12630, 16799, 1690, 25796, 4795, 10416, 29116, 52921, 35399, 54178, 37269, 37271, 69547, 948, 69549, 10024, 34219, 40441, 27659, 69456, 1072, 9308, 13796, 44558, 29752, 10097, 42978, 41532, 7741, 44801, 4869, 6708, 38179, 20047, 69540, 39688, 9474, 52448, 4739, 20201, 44916, 28952, 20396, 9708, 51035, 3000, 69597, 43505, 47656, 30810, 956, 21437, 12313, 23768, 5957, 42988, 30940, 24037, 28149, 13498, 5323, 6488, 69357, 20799, 29930, 3024, 7217, 11597, 31186, 24647, 5805, 17577, 5843, 21369, 21997, 2163, 17942, 3997, 28939, 39704, 28028, 25418, 7849, 8982, 9039, 33640, 2488, 30135, 20047, 16057, 45997, 26709, 1439, 20768, 7849, 48476, 69647, 9142, 3710, 7550, 3329, 8149, 44104, 40415, 1105, 7291, 35464, 36585, 41503, 3197, 45706, 11007, 18919, 4506, 30155, 53744, 48539, 51852, 40701, 44921, 24561, 38960, 2709, 62258, 6866, 2134, 6670, 44930, 5688, 44901, 39315, 7779, 40170, 9300, 44937, 37313, 48703, 10009, 8939, 44943, 9653, 45447, 36044, 19173, 44949, 7667, 69703, 49089, 52594, 1522, 16491, 50996, 387, 10185, 25149, 44962, 24102, 38241, 44966, 23787, 44969, 52412, 45138, 44973, 24452, 1408, 44976, 38462, 6463, 17827, 5831, 36022, 44983, 7383, 12009, 43764, 16965, 21790, 14470, 15046, 44992, 28045, 44995, 936, 44997, 963, 2827, 6426, 32349, 45002, 24242, 44624, 22841, 13377, 45008, 5160, 46248, 7038, 31339, 33852, 26732, 16154, 5144, 5217, 34360, 13064, 47314, 45023, 62598, 52144, 11752, 45027, 22198, 19397, 7079, 45032, 26895, 55156, 11905, 53949, 5785, 45039, 49028, 29349, 9288, 45043, 53713, 25973, 69281, 11853, 33704, 11145, 47074, 16151, 22188, 25937, 20861, 10126, 21327, 45058, 8627, 45060, 23884, 20444, 28571, 13327, 52316, 19389, 68773, 27210, 5669, 58018, 35782, 3177, 29349, 67162, 18799, 3753, 22801, 29718, 39360, 11325, 6056, 15369, 11647, 50255, 4006, 23630, 69511, 61038, 4282, 4344, 5547, 14445, 38267, 10213, 1408, 4002, 23493, 54729, 7943, 4689, 1128, 4320, 3916, 41318, 35397, 28271, 69835, 22308, 21634, 69839, 21440, 5952, 38708, 52719, 54067, 69846, 5628, 62978, 69527, 19039, 35889, 3300, 48117, 2097, 4098, 46354, 47355, 41894, 21854, 2345, 14098, 37197, 20837, 2002, 3219, 42236, 6561, 35690, 69870, 4341, 69872, 27409, 3626, 69875, 28125, 52887, 1436, 58670, 13009, 48565, 7663, 46411, 4816, 41985, 69863, 23316, 69677, 54606, 42825, 45366, 42625, 45952, 20358, 52314, 69671, 15403, 48238, 42984, 46908, 20191, 25719, 62449, 43567, 37008, 15867, 38738, 42982, 24682, 69103, 29940, 32764, 41488, 19401, 2697, 5017, 11097, 10714, 43587, 30634, 69834, 26954, 10878, 19401, 35755, 8766, 15724, 26954, 12139, 3012, 36854, 40594, 1998, 69927, 36569, 3254, 41439, 69627, 69900, 38012, 25820, 1455, 43272, 17164, 17355, 21761, 10473, 64043, 69899, 36304, 29985, 55001, 33064, 77, 101, 33071, 817, 42522, 39046, 43042, 36894, 68877, 65072, 42007, 797, 13813, 41952, 41724, 39637, 39617, 39612, 18945, 10369, 2230, 54424, 53328, 8184, 8763, 9990, 40705, 15615, 12246, 2004, 9347, 10043, 7530, 4554, 68978, 38841, 9006, 15711, 32862, 4294, 11377, 16983, 7807, 48554, 9244, 28308, 36954, 69361, 13889, 43929, 18226, 46695, 53998, 35641, 19253, 21308, 28376, 6369, 53764, 18227, 31546, 26853, 38362, 6309, 1777, 17200, 49250, 24971, 57722, 4120, 4993, 1036, 2591, 1489, 6340, 15464, 19197, 6212, 16270, 30631, 20362, 55047, 29085, 16848, 34994, 37118, 8856, 23224, 42335, 50051, 5401, 54296, 33129, 33097, 16080, 17336, 62642, 29096, 8002, 44627, 38081, 25728, 26716, 37814, 7112, 3055, 69861, 1047, 1777, 16436, 27869, 30364, 49474, 7206, 30734, 44369, 20861, 5150, 26033, 3815, 3084, 16073, 33946, 53196, 44709, 45035, 4568, 24478, 3461, 21650, 53569, 22382, 45337, 15686, 28975, 17808, 15769, 15691, 18170, 70105, 28973, 48089, 10984, 18708, 22531, 15702, 70101, 62948, 55003, 62950, 69475, 37371, 52710, 2855, 39661, 39617, 15279, 39664, 18236, 30274, 19845, 17016, 18208, 22172, 30455, 38362, 55473, 17805, 6263, 10981, 9448, 22526, 17907, 13167, 48803, 10985, 24698, 8468, 19813, 36670, 27649, 25995, 7667, 21855, 34542, 31037, 13612, 23197, 57837, 20694, 15717, 31178, 38719, 14072, 16709, 37746, 30591, 34991, 21126, 1611, 45346, 3129, 6211, 5485, 3013, 46536, 11804, 10254, 46784, 19283, 27595, 25697, 12055, 1701, 39767, 31644, 20024, 20015, 5516, 31484, 9674, 40489, 13833, 8133, 5834, 14918, 22431, 21845, 24234, 13220, 16999, 33873, 6474, 4755, 70169, 1701, 28871, 53996, 29481, 3303, 28948, 30186, 70133, 5002, 55287, 25738, 39847, 2030, 11054, 19252, 21342, 22909, 38628, 63298, 69171, 61484, 62365, 18015, 18286, 18322, 33553, 34916, 18309, 35698, 33545, 34890, 69254, 19189, 69460, 34750, 15932, 18525, 34836, 70228, 18361, 69186, 18545, 33560, 70233, 5943, 33506, 69461, 5180, 5328, 33484, 34930, 33499, 37702, 33489, 69253, 34713, 33505, 70235, 34953, 42940, 7319, 70251, 35870, 70229, 69367, 33530, 70256, 34746, 33518, 69450, 43134, 1151, 18357, 70227, 69471, 18428, 68994, 70231, 69402, 70270, 41681, 70261, 33552, 35694, 41746, 18326, 25531, 18558, 33559, 33531, 70245, 18317, 70282, 18407, 70262, 33497, 53168, 70265, 70278, 70290, 70268, 34776, 70234, 70271, 2168, 18524, 42412, 70285, 34690, 70277, 34741, 34868, 70244, 70257, 70304, 70294, 18497, 70297, 70286, 70253, 70242, 70255, 69410, 34830, 70293, 37674, 18355, 18553, 70319, 70310, 33487, 18503, 70301, 70324, 70292, 33493, 33520, 18437, 25241, 22239, 10996, 35431, 4237, 19202, 37927, 33399, 33335, 40174, 13797, 10907, 16088, 18018, 70280, 12127, 36226, 41681, 13769, 21233, 5290, 36623, 63138, 23495, 70332, 13993, 18810, 68884, 2308, 20191, 70362, 13990, 70288, 17787, 18960, 35601, 41328, 9130, 70337, 25257, 18347, 22133, 53731, 36348, 18888, 10403, 70378, 41757, 6730, 4991, 13475, 41961, 48259, 30577, 42023, 22111, 34553, 9837, 9920, 33194, 22699, 40653, 36514, 9838, 42715, 42153, 48266, 51849, 52122, 69474, 70223, 18730, 6248, 16074, 32765, 20669, 32767, 16792, 30542, 20127, 30533, 32782, 16812, 2306, 17954, 16088, 19126, 16090, 52682, 16566, 16093, 2213, 38280, 26173, 1285, 16099, 10551, 16101, 30538, 32766, 32777, 70417, 30594, 30532, 30569, 30545, 30481, 4168, 13723, 20093, 26599, 21186, 30143, 26515, 41505, 36223, 21173, 69513, 36278, 36302, 20107, 2679, 36628, 26531, 23839, 26470, 41575, 17893, 37129, 25294, 29976, 28321, 34644, 24006, 42931, 30632, 54985, 10950, 14213, 16135, 30630, 18158, 30633, 70477, 16260, 42157, 15939, 35139, 2144, 27123, 5057, 52007, 12119, 1366, 16172, 3934, 7580, 45212, 16178, 1203, 18659, 42693, 42186, 29406, 42246, 69678, 51851, 53746, 41294, 19997, 23761, 36286, 26664, 70451, 38106, 26622, 70454, 36267, 30140, 69519, 70458, 36313, 41485, 70462, 36208, 29943, 30883, 7199, 2662, 70467, 36294, 20240, 9843, 38636, 17958, 10999, 9902, 17978, 19284, 17964, 18183, 11098, 18186, 25507, 17971, 10651, 19600, 50478, 10024, 63161, 17962, 15771, 18001, 18951, 19657, 28112, 17987, 33262, 17275, 19719, 50037, 17791, 2679, 17995, 21021, 19587, 18004, 19171, 30248, 39704, 17793, 19716, 10764, 18006, 54528, 19309, 20377, 8495, 42694, 30576, 42696, 42702, 22934, 9815, 4529, 42693, 42690, 26428, 15938, 40549, 2320, 40721, 30581, 40497, 42712, 18761, 5305, 5335, 18755, 70592, 18758, 70594, 42808, 22967, 54595, 46579, 49227, 53736, 45357, 46584, 54601, 49232, 53741, 41774, 45363, 69902, 43655, 46220, 42625, 42795, 7458, 70586, 9823, 35593, 70121, 42117, 7301, 2215, 42700, 70588, 25068, 42704, 2386, 2222, 18754, 41723, 40428, 70593, 22939, 12709, 18762, 21546, 70638, 4156, 42941, 45350, 52042, 42722, 53982, 62519, 70607, 45794, 51737, 52094, 53988, 50570, 42822, 70114, 61483, 45804, 54463, 18799, 25336, 1213, 25338, 28850, 31186, 2134, 15731, 25344, 54342, 1847, 7556, 12064, 43778, 8659, 13269, 25353, 22038, 70674, 2981, 35973, 11170, 25360, 51805, 52509, 17677, 39297, 25366, 5992, 2966, 48287, 36451, 23356, 21832, 9256, 2869, 25378, 54494, 64745, 25382, 37525, 62660, 8966, 6468, 25387, 9527, 27152, 26245, 54263, 21616, 34866, 35154, 8581, 23541, 36686, 1540, 18974, 15515, 25404, 31118, 63274, 29256, 11110, 5746, 7939, 6582, 1361, 25414, 10071, 4475, 25417, 49395, 2056, 63114, 7014, 27702, 14235, 8610, 4691, 25427, 13321, 8902, 26336, 8523, 8640, 6807, 3361, 25436, 466, 25438, 26707, 1815, 33063, 125];

    function getIconModal() {
        if (!modal) {
            _icons = JSON.parse(LZWDecompress(_icons));
            var content = '';

            for (var k in _icons) {
                content += '<div class="n2-form-tab "><div class="n2-h2 n2-content-box-title-bg">' + k + '</div><div class="n2-description">';

                for (var i = 0; i < _icons[k].length; i++) {
                    content += '<div class="n2-icon">' + _icons[k][i] + '</div>';
                }
                content += '</div></div>';
            }

            modal = new NextendModal({
                zero: {
                    size: [
                        1200,
                        600
                    ],
                    title: 'Icons',
                    back: false,
                    close: true,
                    content: content,
                    fn: {
                        show: function () {

                            var icons = this.content.find('.n2-icon');
                            icons.on('click', $.proxy(function (e) {
                                var node = $(e.currentTarget).clone(),
                                    svg = node.find('svg');

                                if (svg[0].hasChildNodes()) {
                                    var children = svg[0].childNodes;
                                    for (var i = 0; i < children.length; i++) {
                                        children[i].setAttribute("data-style", "{style}");
                                    }
                                }
                                callback(node.html());
                                this.hide(e);
                            }, this));
                        }
                    }
                }
            }, false);
            modal.setCustomClass('n2-icons-modal');
        }
        return modal;
    }

    function NextendElementIconManager(id) {
        this.element = $('#' + id);
        this.button = $('#' + id + '_edit').on('click', $.proxy(this.openModal, this));

        this.preview = this.element.parent().find('img');

        this.element.on('nextendChange', $.proxy(this.makePreview, this));


        NextendElement.prototype.constructor.apply(this, arguments);
    };


    NextendElementIconManager.prototype = Object.create(NextendElement.prototype);
    NextendElementIconManager.prototype.constructor = NextendElementIconManager;

    NextendElementIconManager.prototype.insideChange = function (value) {
        this.element.val(value);

        this.triggerInsideChange();
    };

    NextendElementIconManager.prototype.openModal = function (e) {
        e.preventDefault();
        callback = $.proxy(this.setIcon, this);
        getIconModal().show();
    };

    NextendElementIconManager.prototype.val = function (value) {
        this.element.val(value);
        this.triggerOutsideChange();
    };

    NextendElementIconManager.prototype.setIcon = function (svg) {
        this.val(svg);
    };

    NextendElementIconManager.prototype.makePreview = function () {
        this.preview.attr('src', 'data:image/svg+xml;base64,' + Base64.encode(this.element.val()));
    };

    scope.NextendElementIconManager = NextendElementIconManager;


})(n2, window);

function LZWDecompress(compressed) {
    "use strict";
    // Build the dictionary.
    var i,
        dictionary = [],
        w,
        result,
        k,
        entry = "",
        dictSize = 256;
    for (i = 0; i < 256; i += 1) {
        dictionary[i] = String.fromCharCode(i);
    }

    w = String.fromCharCode(compressed[0]);
    result = w;
    for (i = 1; i < compressed.length; i += 1) {
        k = compressed[i];
        if (dictionary[k]) {
            entry = dictionary[k];
        } else {
            if (k === dictSize) {
                entry = w + w.charAt(0);
            } else {
                return null;
            }
        }

        result += entry;

        // Add w+entry[0] to the dictionary.
        dictionary[dictSize++] = w + entry.charAt(0);

        w = entry;
    }
    return result;
}
(function ($, scope, undefined) {

    function NextendElementImage(id, parameters) {
        this.element = $('#' + id);

        this.field = this.element.data('field');

        this.parameters = parameters;

        this.preview = $('#' + id + '_preview')
            .on('click', $.proxy(this.open, this));

        this.element.on('nextendChange', $.proxy(this.makePreview, this));

        this.button = $('#' + id + '_button').on('click', $.proxy(this.open, this));

        this.element.siblings('.n2-form-element-clear')
            .on('click', $.proxy(this.clear, this));
    };


    NextendElementImage.prototype = Object.create(NextendElement.prototype);
    NextendElementImage.prototype.constructor = NextendElementImage;

    NextendElementImage.prototype.clear = function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.val('');
    };

    NextendElementImage.prototype.val = function (value) {
        this.element.val(value);
        this.triggerOutsideChange();
    };

    NextendElementImage.prototype.makePreview = function () {
        var image = this.element.val();
        if (image.substr(0, 1) == '{') {
            this.preview.css('background-image', '');
        } else {
            this.preview.css('background-image', 'url(' + nextend.imageHelper.fixed(image) + ')');
        }
    };

    NextendElementImage.prototype.open = function (e) {
        e.preventDefault();
        nextend.imageHelper.openLightbox($.proxy(this.val, this));
    };

    NextendElementImage.prototype.edit = function (e) {
        e.preventDefault();
        e.stopPropagation();
        var imageSrc = nextend.imageHelper.fixed(this.element.val()),
            image = $('<img src="' + imageSrc + '" />');

        window.nextend.getFeatherEditor().done($.proxy(function () {
            nextend.featherEditor.launch({
                image: image.get(0),
                hiresUrl: imageSrc,
                onSave: $.proxy(this.aviarySave, this),
                onSaveHiRes: $.proxy(this.aviarySave, this)
            });
        }, this));
    };

    NextendElementImage.prototype.aviarySave = function (id, src) {

        NextendAjaxHelper.ajax({
            type: "POST",
            url: NextendAjaxHelper.makeAjaxUrl(window.nextend.featherEditor.ajaxUrl, {
                nextendaction: 'saveImage'
            }),
            data: {
                aviaryUrl: src
            },
            dataType: 'json'
        })
            .done($.proxy(function (response) {
                this.val(nextend.imageHelper.make(response.data.image));
                nextend.featherEditor.close();
            }, this));
    };

    scope.NextendElementImage = NextendElementImage;
})(n2, window);
;
(function ($, scope) {

    function NextendElementImageManager(id, parameters) {
        this.element = $('#' + id);
        $('#' + id + '_manage').on('click', $.proxy(this.show, this));

        this.parameters = parameters;

        NextendElement.prototype.constructor.apply(this, arguments);
    };


    NextendElementImageManager.prototype = Object.create(NextendElement.prototype);
    NextendElementImageManager.prototype.constructor = NextendElementImageManager;


    NextendElementImageManager.prototype.show = function (e) {
        e.preventDefault();
        nextend.imageManager.show(this.element.val(), $.proxy(this.save, this));
    };

    NextendElementImageManager.prototype.save = function () {

    };

    NextendElementImageManager.prototype.insideChange = function (value) {
        this.element.val(value);

        this.triggerInsideChange();
    };

    scope.NextendElementImageManager = NextendElementImageManager;

})(n2, window);
;
(function ($, scope) {

    function NextendElementList(id, multiple) {

        this.separator = '||';

        this.element = $('#' + id).on('change', $.proxy(this.onHiddenChange, this));

        this.select = $('#' + id + '_select').on('change', $.proxy(this.onChange, this));

        this.multiple = multiple;

        NextendElement.prototype.constructor.apply(this, arguments);
    };


    NextendElementList.prototype = Object.create(NextendElement.prototype);
    NextendElementList.prototype.constructor = NextendElementList;

    NextendElementList.prototype.onHiddenChange = function () {
        var value = this.element.val();
        if (value && value != this.select.val()) {
            this.insideChange(value);
        }
    };

    NextendElementList.prototype.onChange = function () {
        var value = this.select.val();
        if (value !== null && typeof value === 'object') {
            value = value.join(this.separator);
        }
        this.element.val(value);

        this.triggerOutsideChange();
    };

    NextendElementList.prototype.insideChange = function (value) {
        if (typeof value === 'array') {
            this.select.val(value.split(this.separator));
        } else {
            this.select.val(value);
        }

        this.element.val(value);

        this.triggerInsideChange();
    };

    scope.NextendElementList = NextendElementList;

})(n2, window);

;
(function ($, scope) {

    function NextendElementMirror(id) {
        this.element = $('#' + id).on('nextendChange', $.proxy(this.onChange, this));
        this.tr = this.element.closest('tr').nextAll();
        this.onChange();
    }

    NextendElementMirror.prototype.onChange = function () {
        var value = parseInt(this.element.val());

        if (value) {
            this.tr.css('display', 'none');
        } else {
            this.tr.css('display', '');
        }

    };

    scope.NextendElementMirror = NextendElementMirror;

})(n2, window);

;
(function ($, scope) {

    function NextendElementMixed(id, elements, separator) {

        this.element = $('#' + id);

        this.elements = [];
        for (var i = 0; i < elements.length; i++) {
            this.elements.push($('#' + elements[i])
                .on('outsideChange', $.proxy(this.onFieldChange, this)));
        }

        this.separator = separator;

        NextendElement.prototype.constructor.apply(this, arguments);
    };


    NextendElementMixed.prototype = Object.create(NextendElement.prototype);
    NextendElementMixed.prototype.constructor = NextendElementMixed;


    NextendElementMixed.prototype.onFieldChange = function () {
        this.element.val(this.getValue());

        this.triggerOutsideChange();
    };

    NextendElementMixed.prototype.insideChange = function (value) {
        this.element.val(value);

        var values = value.split(this.separator);

        for (var i = 0; i < this.elements.length; i++) {
            this.elements[i].data('field').insideChange(values[i]);
        }

        this.triggerInsideChange();
    };

    NextendElementMixed.prototype.getValue = function () {
        var values = [];
        for (var i = 0; i < this.elements.length; i++) {
            values.push(this.elements[i].val());
        }

        return values.join(this.separator);
    };

    scope.NextendElementMixed = NextendElementMixed;

})(n2, window);
(function ($, scope) {

    function NextendElementNumber(id, min, max) {
        this.min = min;
        this.max = max;

        this.element = $('#' + id).on({
            focus: $.proxy(this.focus, this),
            blur: $.proxy(this.blur, this),
            change: $.proxy(this.change, this)
        });
        this.parent = this.element.parent();

        NextendElement.prototype.constructor.apply(this, arguments);
    };


    NextendElementNumber.prototype = Object.create(NextendElement.prototype);
    NextendElementNumber.prototype.constructor = NextendElementNumber;


    NextendElementNumber.prototype.focus = function () {
        this.parent.addClass('focus');

        this.element.on('keypress.n2-text', $.proxy(function (e) {
            if (e.which == 13) {
                this.element.off('keypress.n2-text');
                this.element.trigger('blur');
            }
        }, this));
    };

    NextendElementNumber.prototype.blur = function () {
        this.parent.removeClass('focus');
    };

    NextendElementNumber.prototype.change = function () {
        var validated = this.validate(this.element.val());
        if (validated === true) {
            this.triggerOutsideChange();
        } else {
            this.element.val(validated).trigger('change');
        }
    };

    NextendElementNumber.prototype.insideChange = function (value) {
        var validated = this.validate(value);
        if (validated === true) {
            this.element.val(value);
        } else {
            this.element.val(validated);
        }

        this.triggerInsideChange();
    };

    NextendElementNumber.prototype.validate = function (value) {
        var validatedValue = parseFloat(value);
        if (isNaN(validatedValue)) {
            validatedValue = 0;
        }
        validatedValue = Math.max(this.min, Math.min(this.max, validatedValue));
        if (validatedValue != value) {
            return validatedValue;
        }
        return true;
    };

    scope.NextendElementNumber = NextendElementNumber;
})(n2, window);
;
(function ($, scope) {

    function NextendElementOnoff(id) {
        this.element = $('#' + id);

        this.onoff = this.element.parent()
            .on('click', $.proxy(this.switch, this));

        NextendElement.prototype.constructor.apply(this, arguments);
    };


    NextendElementOnoff.prototype = Object.create(NextendElement.prototype);
    NextendElementOnoff.prototype.constructor = NextendElementOnoff;


    NextendElementOnoff.prototype.switch = function () {
        var value = parseInt(this.element.val());
        if (value) {
            value = 0;
        } else {
            value = 1;
        }
        this.element.val(value);
        this.setSelected(value);

        this.triggerOutsideChange();
    };

    NextendElementOnoff.prototype.insideChange = function (value) {
        value = parseInt(value);
        this.element.val(value);
        this.setSelected(value);

        this.triggerInsideChange();
    };

    NextendElementOnoff.prototype.setSelected = function (state) {
        if (state) {
            this.onoff.addClass('n2-onoff-on');
        } else {
            this.onoff.removeClass('n2-onoff-on');
        }
    };

    scope.NextendElementOnoff = NextendElementOnoff;

})(n2, window);

(function ($, scope) {

    function NextendElementRadio(id, values) {
        this.element = $('#' + id);

        this.values = values;

        this.parent = this.element.parent();

        this.options = this.parent.find('.n2-radio-option');

        for (var i = 0; i < this.options.length; i++) {
            this.options.eq(i).on('click', $.proxy(this.click, this));
        }

        NextendElement.prototype.constructor.apply(this, arguments);
    };

    NextendElementRadio.prototype = Object.create(NextendElement.prototype);
    NextendElementRadio.prototype.constructor = NextendElementRadio;

    NextendElementRadio.prototype.click = function (e) {
        this.changeSelectedIndex(this.options.index(e.currentTarget));
    };

    NextendElementRadio.prototype.changeSelectedIndex = function (index) {
        var value = this.values[index];

        this.element.val(value);

        this.setSelected(index);

        this.triggerOutsideChange();
    };

    NextendElementRadio.prototype.insideChange = function (value, option) {
        var index = $.inArray(value, this.values);
        if (index == '-1') {
            index = this.partialSearch(value);
        }

        if (index == '-1' && typeof option !== 'undefined') {
            index = this.addOption(value, option);
        }

        if (index != '-1') {
            this.element.val(this.values[index]);
            this.setSelected(index);

            this.triggerInsideChange();
        } else {
            // It will reset the state if the preferred value not available
            this.options.eq(0).trigger('click');
        }
    };

    NextendElementRadio.prototype.setSelected = function (index) {
        this.options.removeClass('n2-active');
        this.options.eq(index).addClass('n2-active');
    };

    NextendElementRadio.prototype.partialSearch = function (text) {
        text = text.replace(/^.*[\\\/]/, '');
        for (var i = 0; i < this.values.length; i++) {
            if (this.values[i].indexOf(text) != -1) return i;
        }
        return -1;
    };

    NextendElementRadio.prototype.addOption = function (value, option) {
        var i = this.values.push(value) - 1;
        option.appendTo(this.parent)
            .on('click', $.proxy(this.click, this));
        this.options = this.options.add(option);
        return i;
    };

    NextendElementRadio.prototype.addTabOption = function (value, label) {
        var i = this.values.push(value) - 1;
        var option = $('<div class="n2-radio-option n2-h4 n2-last">' + label + '</div>')
            .insertAfter(this.options.last().removeClass('n2-last'))
            .on('click', $.proxy(this.click, this));
        this.options = this.options.add(option);
        return i;
    };
    NextendElementRadio.prototype.removeTabOption = function (value) {
        var i = $.inArray(value, this.values);
        var option = this.options.eq(i);
        this.options = this.options.not(option);
        option.remove();
        if (i == 0) {
            this.options.eq(0).addClass('n2-first');
        }
        if (i == this.options.length) {
            this.options.eq(this.options.length - 1).addClass('n2-last');
        }

        this.values.splice(i, 1);
    };

    NextendElementRadio.prototype.moveTab = function (originalIndex, targetIndex) {

    };

    scope.NextendElementRadio = NextendElementRadio;

})(n2, window);
(function ($, scope) {

    function NextendElementRichText(id) {

        NextendElementText.prototype.constructor.apply(this, arguments);

        this.parent.find('.n2-textarea-rich-bold').on('click', $.proxy(this.bold, this));
        this.parent.find('.n2-textarea-rich-italic').on('click', $.proxy(this.italic, this));
        this.parent.find('.n2-textarea-rich-link').on('click', $.proxy(this.link, this));

    };


    NextendElementRichText.prototype = Object.create(NextendElementText.prototype);
    NextendElementRichText.prototype.constructor = NextendElementRichText;


    NextendElementRichText.prototype.bold = function () {
        this.wrapText('<b>', '</b>');
    };

    NextendElementRichText.prototype.italic = function () {
        this.wrapText('<i>', '</i>');
    };

    NextendElementRichText.prototype.link = function () {
        this.wrapText('<a href="">', '</a>');
    };

    NextendElementRichText.prototype.list = function () {
        this.wrapText('', "\n<ul>\n<li>#1 Item</li>\n<li>#2 Item</li>\n</ul>\n");
    };


    NextendElementRichText.prototype.wrapText = function (openTag, closeTag) {
        var textArea = this.element;
        var len = textArea.val().length;
        var start = textArea[0].selectionStart;
        var end = textArea[0].selectionEnd;
        var selectedText = textArea.val().substring(start, end);
        var replacement = openTag + selectedText + closeTag;
        textArea.val(textArea.val().substring(0, start) + replacement + textArea.val().substring(end, len));
        this.triggerOutsideChange();
        this.element.focus();
    };

    scope.NextendElementRichText = NextendElementRichText;
})(n2, window);
;
(function ($, scope) {

    function NextendElementSkin(id, preId, skins, fixedMode) {
        this.element = $('#' + id);

        this.preId = preId;

        this.skins = skins;

        this.list = this.element.data('field');

        this.fixedMode = fixedMode;

        this.firstOption = this.list.select.find('option').eq(0);

        this.originalText = this.firstOption.text();

        this.element.on('nextendChange', $.proxy(this.onSkinSelect, this));

        NextendElement.prototype.constructor.apply(this, arguments);
    };


    NextendElementSkin.prototype = Object.create(NextendElement.prototype);
    NextendElementSkin.prototype.constructor = NextendElementSkin;


    NextendElementSkin.prototype.onSkinSelect = function () {
        var skin = this.element.val();
        if (skin != '0') {
            skin = this.skins[skin];
            for (var k in skin) {
                if (skin.hasOwnProperty(k)) {
                    var el = $('#' + this.preId + k);
                    if (el.length) {
                        var field = el.data('field');
                        field.insideChange(skin[k]);
                    }
                }
            }

            if (!this.fixedMode) {
                this.changeFirstOptionText(n2_('Done'));
                this.list.insideChange('0');
                setTimeout($.proxy(this.changeFirstOptionText, this, this.originalText), 3000);
            }

        }
    };

    NextendElementSkin.prototype.changeFirstOptionText = function (text) {
        this.firstOption.text(text);
    };

    NextendElementSkin.prototype.insideChange = function (value) {
        this.element.val(value);
        this.list.select.val(value);
    };

    scope.NextendElementSkin = NextendElementSkin;
})(n2, window);

;
(function ($, scope) {

    function NextendElementStyle(id, parameters) {
        this.element = $('#' + id);

        this.parameters = parameters;

        this.defaultSetId = parameters.set;

        this.element.parent()
            .on('click', $.proxy(this.show, this));

        this.element.siblings('.n2-form-element-clear')
            .on('click', $.proxy(this.clear, this));

        this.name = this.element.siblings('input');

        nextend.styleManager.$.on('visualDelete', $.proxy(this.styleDeleted, this));

        this.updateName(this.element.val());
        NextendElement.prototype.constructor.apply(this, arguments);
    };


    NextendElementStyle.prototype = Object.create(NextendElement.prototype);
    NextendElementStyle.prototype.constructor = NextendElementStyle;


    NextendElementStyle.prototype.show = function (e) {
        e.preventDefault();
        if (this.parameters.font != '') {
            nextend.styleManager.setConnectedFont(this.parameters.font);
        }
        if (this.parameters.font2 != '') {
            nextend.styleManager.setConnectedFont2(this.parameters.font2);
        }
        if (this.parameters.style2 != '') {
            nextend.styleManager.setConnectedStyle(this.parameters.style2);
        }
        if (this.defaultSetId) {
            nextend.styleManager.changeSetById(this.defaultSetId);
        }
        nextend.styleManager.show(this.element.val(), $.proxy(this.save, this), {
            previewMode: this.parameters.previewmode,
            previewHTML: this.parameters.preview
        });
    };

    NextendElementStyle.prototype.clear = function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.val('');
    };

    NextendElementStyle.prototype.save = function (e, value) {

        nextend.styleManager.addVisualUsage(this.parameters.previewmode, value, window.nextend.pre);

        this.val(value);
    };

    NextendElementStyle.prototype.val = function (value) {
        this.element.val(value);
        this.updateName(value);
        this.triggerOutsideChange();
    };

    NextendElementStyle.prototype.insideChange = function (value) {
        this.element.val(value);

        this.updateName(value);

        this.triggerInsideChange();
    };

    NextendElementStyle.prototype.updateName = function (value) {
        $.when(nextend.styleManager.getVisual(value))
            .done($.proxy(function (style) {
                this.name.val(style.name);
            }, this));
    };
    NextendElementStyle.prototype.styleDeleted = function (e, id) {
        if (id == this.element.val()) {
            this.insideChange('');
        }
    };
    NextendElementStyle.prototype.renderStyle = function () {
        var style = this.element.val();
        nextend.styleManager.addVisualUsage(this.parameters.previewmode, style, '');
        return nextend.styleManager.getClass(style, this.parameters.previewmode);
    };

    scope.NextendElementStyle = NextendElementStyle;

})(n2, window);
;
(function ($, scope) {

    function NextendElementSubform(id, target, tab, originalValue) {
        this.id = id;

        this.element = $('#' + id);

        this.target = $('#' + target);

        this.tab = tab;

        this.originalValue = originalValue;

        this.form = this.element.closest('form').data('form');

        this.list = this.element.data('field');

        this.element.on('nextendChange', $.proxy(this.loadSubform, this));

        NextendElement.prototype.constructor.apply(this, arguments);
    };


    NextendElementSubform.prototype = Object.create(NextendElement.prototype);
    NextendElementSubform.prototype.constructor = NextendElementSubform;

    NextendElementSubform.prototype.loadSubform = function () {
        var value = this.element.val();
        if (value == 'disabled') {
            this.target.html('');
        } else {
            var values = [];
            if (value == this.originalValue) {
                values = this.form.values;
            }

            var data = {
                id: this.id,
                values: values,
                tab: this.tab,
                value: value
            };

            NextendAjaxHelper.ajax({
                type: "POST",
                url: NextendAjaxHelper.makeAjaxUrl(this.form.url),
                data: data,
                dataType: 'json'
            }).done($.proxy(this.load, this));
        }
    };

    NextendElementSubform.prototype.load = function (response) {
        this.target.html(response.data.html);
        eval(response.data.scripts);
    };

    scope.NextendElementSubform = NextendElementSubform;

})(n2, window);

;
(function ($, scope) {

    function NextendElementSubformImage(id, options) {

        this.element = $('#' + id);

        this.options = $('#' + options).find('.n2-subform-image-option');

        this.subform = this.element.data('field');

        this.active = this.getIndex(this.options.filter('.n2-active').get(0));

        for (var i = 0; i < this.options.length; i++) {
            this.options.eq(i).on('click', $.proxy(this.selectOption, this));
        }

        NextendElement.prototype.constructor.apply(this, arguments);
    };

    NextendElementSubformImage.prototype = Object.create(NextendElement.prototype);
    NextendElementSubformImage.prototype.constructor = NextendElementSubformImage;


    NextendElementSubformImage.prototype.selectOption = function (e) {
        var index = this.getIndex(e.currentTarget);
        if (index != this.active) {

            this.options.eq(index).addClass('n2-active');
            this.options.eq(this.active).removeClass('n2-active');

            this.active = index;

            var value = this.subform.list.select.find('option').eq(index).val();
            this.subform.list.insideChange(value);
        }
    };

    NextendElementSubformImage.prototype.getIndex = function (option) {
        return $.inArray(option, this.options);
    };
    scope.NextendElementSubformImage = NextendElementSubformImage;

})(n2, window);
;
(function ($, scope) {

    function NextendElementSwitcher(id, values) {

        this.element = $('#' + id);

        this.options = this.element.parent().find('.n2-switcher-unit');

        this.active = this.options.index(this.options.filter('.n2-active'));

        this.values = values;

        for (var i = 0; i < this.options.length; i++) {
            this.options.eq(i).on('click', $.proxy(this.switch, this, i));
        }

        NextendElement.prototype.constructor.apply(this, arguments);
    };

    NextendElementSwitcher.prototype = Object.create(NextendElement.prototype);
    NextendElementSwitcher.prototype.constructor = NextendElementSwitcher;


    NextendElementSwitcher.prototype.switch = function (i, e) {
        this.element.val(this.values[i]);
        this.setSelected(i);

        this.triggerOutsideChange();
    };

    NextendElementSwitcher.prototype.insideChange = function (value) {
        var i = $.inArray(value, this.values);

        this.element.val(this.values[i]);
        this.setSelected(i);

        this.triggerInsideChange();
    };

    NextendElementSwitcher.prototype.setSelected = function (i) {
        this.options.eq(this.active).removeClass('n2-active');
        this.options.eq(i).addClass('n2-active');
        this.active = i;
    };

    scope.NextendElementSwitcher = NextendElementSwitcher;

})(n2, window);

(function ($, scope, undefined) {

    var ajaxUrl = '',
        modal = null,
        cache = {},
        callback = function (url) {
        },
        lastValue = '';

    function NextendElementUrl(id, parameters) {
        this.element = $('#' + id);

        this.field = this.element.data('field');

        this.parameters = parameters;

        ajaxUrl = this.parameters.url;

        this.button = $('#' + id + '_button').on('click', $.proxy(this.open, this));

        this.element.siblings('.n2-form-element-clear')
            .on('click', $.proxy(this.clear, this));
    };

    NextendElementUrl.prototype = Object.create(NextendElement.prototype);
    NextendElementUrl.prototype.constructor = NextendElementUrl;

    NextendElementUrl.prototype.clear = function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.val('#');
    };

    NextendElementUrl.prototype.val = function (value) {
        this.element.val(value);
        this.triggerOutsideChange();
    };

    NextendElementUrl.prototype.open = function (e) {
        e.preventDefault();
        callback = $.proxy(this.insert, this);
        lastValue = this.element.val();
        this.getModal().show();
    };

    NextendElementUrl.prototype.insert = function (url) {
        this.val(url);
    };

    NextendElementUrl.prototype.getModal = function () {
        if (!modal) {
            var getLinks = function (search) {
                if (typeof cache[search] == 'undefined') {
                    cache[search] = $.ajax({
                        type: "POST",
                        url: NextendAjaxHelper.makeAjaxUrl(ajaxUrl),
                        data: {
                            keyword: search
                        },
                        dataType: 'json'
                    });
                }
                return cache[search];
            };

            var parameters = this.parameters;

            var lightbox = {
                    size: [
                        500,
                        590
                    ],
                    title: n2_('Lightbox'),
                    back: 'zero',
                    close: true,
                    content: '<form class="n2-form"></form>',
                    controls: ['<a href="#" class="n2-button n2-button-big n2-button-green n2-uc n2-h4">' + n2_('Insert') + '</a>'],
                    fn: {
                        show: function () {
                            var button = this.controls.find('.n2-button'),
                                chooseImages = $('<a href="#" class="n2-button n2-button-medium n2-button-green n2-uc n2-h5" style="float:right; margin-right: 20px;">' + n2_('Choose images') + '</a>'),
                                form = this.content.find('.n2-form').on('submit', function (e) {
                                    e.preventDefault();
                                    button.trigger('click');
                                }).append(this.createTextarea(n2_('Content list') + " - " + n2_('One per line'), 'n2-link-resource', 'width: 446px;height: 100px;')).append(chooseImages).append(this.createInputUnit(n2_('Autoplay duration'), 'n2-link-autoplay', 'ms', 'width: 40px;')),
                                resourceField = this.content.find('#n2-link-resource').focus(),
                                autoplayField = this.content.find('#n2-link-autoplay').val(0);

                            chooseImages.on('click', function (e) {
                                e.preventDefault();
                                nextend.imageHelper.openMultipleLightbox(function (images) {
                                    var value = resourceField.val().replace(/\n$/, '');

                                    for (var i = 0; i < images.length; i++) {
                                        value += "\n" + images[i].image;
                                    }
                                    resourceField.val(value.replace(/^\n/, ''));
                                });
                            });

                            var matches = lastValue.match(/lightbox\[(.*?)\]/);
                            if (matches && matches.length == 2) {
                                var parts = matches[1].split(',');
                                if (parseInt(parts[parts.length - 1]) > 0) {
                                    autoplayField.val(parseInt(parts[parts.length - 1]));
                                    parts.pop();
                                }
                                resourceField.val(parts.join("\n"));
                            }

                            this.content.append(this.createHeading(n2_('Examples')));
                            this.createTable([
                                [n2_('Image'), 'http://smartslider3.com/image.jpg'],
                                ['YouTube', 'https://www.youtube.com/watch?v=MKmIwHAFjSU'],
                                ['Vimeo', 'https://vimeo.com/144598279'],
                                ['Iframe', 'http://smartslider3.com']
                            ], ['', '']).appendTo(this.content);

                            button.on('click', $.proxy(function (e) {
                                e.preventDefault();
                                var link = resourceField.val();
                                if (link != '') {
                                    var autoplay = '';
                                    if (autoplayField.val() > 0) {
                                        autoplay = ',' + autoplayField.val();
                                    }
                                    callback('lightbox[' + link.split("\n").filter(Boolean).join(',') + autoplay + ']');
                                }
                                this.hide(e);
                            }, this));
                        }
                    }
                },
                links = {
                    size: [
                        600,
                        430
                    ],
                    title: n2_('Link'),
                    back: 'zero',
                    close: true,
                    content: '<div class="n2-form"></div>',
                    fn: {
                        show: function () {

                            this.content.find('.n2-form').append(this.createInput(n2_('Keyword'), 'n2-links-keyword', 'width:546px;'));
                            var search = $('#n2-links-keyword'),
                                heading = this.createHeading('').appendTo(this.content),
                                result = this.createResult().appendTo(this.content),
                                searchString = '';

                            search.on('keyup', $.proxy(function () {
                                searchString = search.val();
                                getLinks(searchString).done($.proxy(function (r) {
                                    if (search.val() == searchString) {
                                        var links = r.data;
                                        if (searchString == '') {
                                            heading.html(n2_('No search term specified. Showing recent items.'));
                                        } else {
                                            heading.html(n2_printf(n2_('Showing items match for "%s"'), searchString));
                                        }

                                        var data = [],
                                            modal = this;
                                        for (var i = 0; i < links.length; i++) {
                                            data.push([links[i].title, links[i].info, $('<div class="n2-button n2-button-green n2-button-x-small n2-uc n2-h5">' + n2_('Select') + '</div>')
                                                .on('click', {permalink: links[i].link}, function (e) {
                                                    callback(e.data.permalink);
                                                    modal.hide();
                                                })]);
                                        }
                                        result.html('');
                                        this.createTable(data, ['width:100%;', '', '']).appendTo(this.createTableWrap().appendTo(result));
                                    }
                                }, this));
                            }, this))
                                .trigger('keyup').focus();
                        }
                    }
                };
            links.back = false;
            modal = new NextendModal({
                zero: links
            }, false);
        
            modal.setCustomClass('n2-url-modal');
        }
        return modal;
    };

    scope.NextendElementUrl = NextendElementUrl;

})(n2, window);
var fixto = (function ($, window, document) {

    // Start Computed Style. Please do not modify this module here. Modify it from its own repo. See address below.

    /*! Computed Style - v0.1.0 - 2012-07-19
     * https://github.com/bbarakaci/computed-style
     * Copyright (c) 2012 Burak Barakaci; Licensed MIT */
    var computedStyle = (function () {
        var computedStyle = {
            getAll: function (element) {
                return document.defaultView.getComputedStyle(element);
            },
            get: function (element, name) {
                return this.getAll(element)[name];
            },
            toFloat: function (value) {
                return parseFloat(value, 10) || 0;
            },
            getFloat: function (element, name) {
                return this.toFloat(this.get(element, name));
            },
            _getAllCurrentStyle: function (element) {
                return element.currentStyle;
            }
        };

        if (document.documentElement.currentStyle) {
            computedStyle.getAll = computedStyle._getAllCurrentStyle;
        }

        return computedStyle;

    }());

    // End Computed Style. Modify whatever you want to.

    var mimicNode = (function () {
        /*
         Class Mimic Node
         Dependency : Computed Style
         Tries to mimick a dom node taking his styles, dimensions. May go to his repo if gets mature.
         */

        function MimicNode(element) {
            this.element = element;
            this.replacer = document.createElement('div');
            this.replacer.style.visibility = 'hidden';
            this.hide();
            element.parentNode.insertBefore(this.replacer, element);
        }

        MimicNode.prototype = {
            replace: function () {
                var rst = this.replacer.style;
                var styles = computedStyle.getAll(this.element);

                // rst.width = computedStyle.width(this.element) + 'px';
                // rst.height = this.element.offsetHeight + 'px';

                // Setting offsetWidth
                rst.width = this._width();
                rst.height = this._height();

                // Adobt margins
                rst.marginTop = styles.marginTop;
                rst.marginBottom = styles.marginBottom;
                rst.marginLeft = styles.marginLeft;
                rst.marginRight = styles.marginRight;

                // Adopt positioning
                rst.cssFloat = styles.cssFloat;
                rst.styleFloat = styles.styleFloat; //ie8;
                rst.position = styles.position;
                rst.top = styles.top;
                rst.right = styles.right;
                rst.bottom = styles.bottom;
                rst.left = styles.left;
                // rst.borderStyle = styles.borderStyle;

                rst.display = styles.display;

            },

            hide: function () {
                this.replacer.style.display = 'none';
            },

            _width: function () {
                return this.element.getBoundingClientRect().width + 'px';
            },

            _widthOffset: function () {
                return this.element.offsetWidth + 'px';
            },

            _height: function () {
                return this.element.getBoundingClientRect().height + 'px';
            },

            _heightOffset: function () {
                return this.element.offsetHeight + 'px';
            },

            destroy: function () {
                $(this.replacer).remove();

                // set properties to null to break references
                for (var prop in this) {
                    if (this.hasOwnProperty(prop)) {
                        this[prop] = null;
                    }
                }
            }
        };

        var bcr = document.documentElement.getBoundingClientRect();
        if (!bcr.width) {
            MimicNode.prototype._width = MimicNode.prototype._widthOffset;
            MimicNode.prototype._height = MimicNode.prototype._heightOffset;
        }

        return {
            MimicNode: MimicNode,
            computedStyle: computedStyle
        };
    }());

    // Class handles vendor prefixes
    function Prefix() {
        // Cached vendor will be stored when it is detected
        this._vendor = null;

        //this._dummy = document.createElement('div');
    }

    Prefix.prototype = {

        _vendors: {
            webkit: {cssPrefix: '-webkit-', jsPrefix: 'Webkit'},
            moz: {cssPrefix: '-moz-', jsPrefix: 'Moz'},
            ms: {cssPrefix: '-ms-', jsPrefix: 'ms'},
            opera: {cssPrefix: '-o-', jsPrefix: 'O'}
        },

        _prefixJsProperty: function (vendor, prop) {
            return vendor.jsPrefix + prop[0].toUpperCase() + prop.substr(1);
        },

        _prefixValue: function (vendor, value) {
            return vendor.cssPrefix + value;
        },

        _valueSupported: function (prop, value, dummy) {
            // IE8 will throw Illegal Argument when you attempt to set a not supported value.
            try {
                dummy.style[prop] = value;
                return dummy.style[prop] === value;
            }
            catch (er) {
                return false;
            }
        },

        /**
         * Returns true if the property is supported
         * @param {string} prop Property name
         * @returns {boolean}
         */
        propertySupported: function (prop) {
            // Supported property will return either inine style value or an empty string.
            // Undefined means property is not supported.
            return document.documentElement.style[prop] !== undefined;
        },

        /**
         * Returns prefixed property name for js usage
         * @param {string} prop Property name
         * @returns {string|null}
         */
        getJsProperty: function (prop) {
            // Try native property name first.
            if (this.propertySupported(prop)) {
                return prop;
            }

            // Prefix it if we know the vendor already
            if (this._vendor) {
                return this._prefixJsProperty(this._vendor, prop);
            }

            // We don't know the vendor, try all the possibilities
            var prefixed;
            for (var vendor in this._vendors) {
                prefixed = this._prefixJsProperty(this._vendors[vendor], prop);
                if (this.propertySupported(prefixed)) {
                    // Vendor detected. Cache it.
                    this._vendor = this._vendors[vendor];
                    return prefixed;
                }
            }

            // Nothing worked
            return null;
        },

        /**
         * Returns supported css value for css property. Could be used to check support or get prefixed value string.
         * @param {string} prop Property
         * @param {string} value Value name
         * @returns {string|null}
         */
        getCssValue: function (prop, value) {
            // Create dummy element to test value
            var dummy = document.createElement('div');

            // Get supported property name
            var jsProperty = this.getJsProperty(prop);

            // Try unprefixed value 
            if (this._valueSupported(jsProperty, value, dummy)) {
                return value;
            }

            var prefixedValue;

            // If we know the vendor already try prefixed value
            if (this._vendor) {
                prefixedValue = this._prefixValue(this._vendor, value);
                if (this._valueSupported(jsProperty, prefixedValue, dummy)) {
                    return prefixedValue;
                }
            }

            // Try all vendors
            for (var vendor in this._vendors) {
                prefixedValue = this._prefixValue(this._vendors[vendor], value);
                if (this._valueSupported(jsProperty, prefixedValue, dummy)) {
                    // Vendor detected. Cache it.
                    this._vendor = this._vendors[vendor];
                    return prefixedValue;
                }
            }
            // No support for value
            return null;
        }
    };

    var prefix = new Prefix();

    // We will need this frequently. Lets have it as a global until we encapsulate properly.
    var transformJsProperty = prefix.getJsProperty('transform');

    // Will hold if browser creates a positioning context for fixed elements.
    var fixedPositioningContext;

    // Checks if browser creates a positioning context for fixed elements.
    // Transform rule will create a positioning context on browsers who follow the spec.
    // Ie for example will fix it according to documentElement
    // TODO: Other css rules also effects. perspective creates at chrome but not in firefox. transform-style preserve3d effects.
    function checkFixedPositioningContextSupport() {
        var support = false;
        var parent = document.createElement('div');
        var child = document.createElement('div');
        parent.appendChild(child);
        parent.style[transformJsProperty] = 'translate(0)';
        // Make sure there is space on top of parent
        parent.style.marginTop = '10px';
        parent.style.visibility = 'hidden';
        child.style.position = 'fixed';
        child.style.top = 0;
        document.body.appendChild(parent);
        var rect = child.getBoundingClientRect();
        // If offset top is greater than 0 meand transformed element created a positioning context.
        if (rect.top > 0) {
            support = true;
        }
        // Remove dummy content
        document.body.removeChild(parent);
        return support;
    }

    // It will return null if position sticky is not supported
    var nativeStickyValue = prefix.getCssValue('position', 'sticky');

    // It will return null if position fixed is not supported
    var fixedPositionValue = prefix.getCssValue('position', 'fixed');

    // Dirty business
    var ie = navigator.appName === 'Microsoft Internet Explorer';
    var ieversion;

    if (ie) {
        ieversion = parseFloat(navigator.appVersion.split("MSIE")[1]);
    }

    function FixTo(child, parent, options) {
        this.child = child;
        this._$child = $(child);
        this.parent = parent;
        this.options = {
            className: 'fixto-fixed',
            top: 0
        };
        this._setOptions(options);
    }

    FixTo.prototype = {
        // Returns the total outerHeight of the elements passed to mind option. Will return 0 if none.
        _mindtop: function () {
            var top = 0;
            if (this._$mind) {
                var el;
                var rect;
                var height;
                for (var i = 0, l = this._$mind.length; i < l; i++) {
                    el = this._$mind[i];
                    rect = el.getBoundingClientRect();
                    if (rect.height) {
                        top += rect.height;
                    }
                    else {
                        var styles = computedStyle.getAll(el);
                        top += el.offsetHeight + computedStyle.toFloat(styles.marginTop) + computedStyle.toFloat(styles.marginBottom);
                    }
                }
            }
            return top;
        },

        // Public method to stop the behaviour of this instance.        
        stop: function () {
            this._stop();
            this._running = false;
        },

        // Public method starts the behaviour of this instance.
        start: function () {

            // Start only if it is not running not to attach event listeners multiple times.
            if (!this._running) {
                this._start();
                this._running = true;
            }
        },

        //Public method to destroy fixto behaviour
        destroy: function () {
            this.stop();

            this._destroy();

            // Remove jquery data from the element
            this._$child.removeData('fixto-instance');

            // set properties to null to break references
            for (var prop in this) {
                if (this.hasOwnProperty(prop)) {
                    this[prop] = null;
                }
            }
        },

        _setOptions: function (options) {
            $.extend(this.options, options);
            if (this.options.mind) {
                this._$mind = $(this.options.mind);
            }
            if (this.options.zIndex) {
                this.child.style.zIndex = this.options.zIndex;
            }
        },

        setOptions: function (options) {
            this._setOptions(options);
            this.refresh();
        },

        // Methods could be implemented by subclasses

        _stop: function () {

        },

        _start: function () {

        },

        _destroy: function () {

        },

        refresh: function () {

        }
    };

    // Class FixToContainer
    function FixToContainer(child, parent, options) {
        FixTo.call(this, child, parent, options);
        this._replacer = new mimicNode.MimicNode(child);
        this._ghostNode = this._replacer.replacer;

        this._saveStyles();

        this._saveViewportHeight();

        // Create anonymous functions and keep references to register and unregister events.
        this._proxied_onscroll = this._bind(this._onscroll, this);
        this._proxied_onresize = this._bind(this._onresize, this);

        this.start();
    }

    FixToContainer.prototype = new FixTo();

    $.extend(FixToContainer.prototype, {

        // Returns an anonymous function that will call the given function in the given context
        _bind: function (fn, context) {
            return function () {
                return fn.call(context);
            };
        },

        // at ie8 maybe only in vm window resize event fires everytime an element is resized.
        _toresize: ieversion === 8 ? document.documentElement : window,

        _onscroll: function _onscroll() {
            this._scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            this._parentBottom = (this.parent.offsetHeight + this._fullOffset('offsetTop', this.parent)) - computedStyle.getFloat(this.parent, 'paddingBottom');
            if (!this.fixed) {

                var childStyles = computedStyle.getAll(this.child);

                if (
                    this._scrollTop < this._parentBottom &&
                    this._scrollTop > (this._fullOffset('offsetTop', this.child) - this.options.top - this._mindtop()) &&
                    this._viewportHeight > (this.child.offsetHeight + computedStyle.toFloat(childStyles.marginTop) + computedStyle.toFloat(childStyles.marginBottom))
                ) {

                    this._fix();
                    this._adjust();
                }
            } else {
                if (this._scrollTop > this._parentBottom || this._scrollTop < (this._fullOffset('offsetTop', this._ghostNode) - this.options.top - this._mindtop())) {
                    this._unfix();
                    return;
                }
                this._adjust();
            }
        },

        _adjust: function _adjust() {
            var top = 0;
            var mindTop = this._mindtop();
            var diff = 0;
            var childStyles = computedStyle.getAll(this.child);
            var context = null;

            if (fixedPositioningContext) {
                // Get positioning context.
                context = this._getContext();
                if (context) {
                    // There is a positioning context. Top should be according to the context.
                    top = Math.abs(context.getBoundingClientRect().top);
                }
            }

            diff = (this._parentBottom - this._scrollTop) - (this.child.offsetHeight + computedStyle.toFloat(childStyles.marginBottom) + mindTop + this.options.top);

            if (diff > 0) {
                diff = 0;
            }

            this.child.style.top = (diff + mindTop + top + this.options.top) - computedStyle.toFloat(childStyles.marginTop) + 'px';
        },

        // Calculate cumulative offset of the element.
        // Optionally according to context
        _fullOffset: function _fullOffset(offsetName, elm, context) {
            var offset = elm[offsetName];
            var offsetParent = elm.offsetParent;

            // Add offset of the ascendent tree until we reach to the document root or to the given context
            while (offsetParent !== null && offsetParent !== context) {
                offset = offset + offsetParent[offsetName];
                offsetParent = offsetParent.offsetParent;
            }

            return offset;
        },

        // Get positioning context of the element.
        // We know that the closest parent that a transform rule applied will create a positioning context.
        _getContext: function () {
            var parent;
            var element = this.child;
            var context = null;
            var styles;

            // Climb up the treee until reaching the context
            while (!context) {
                parent = element.parentNode;
                if (parent === document.documentElement) {
                    return null;
                }

                styles = computedStyle.getAll(parent);
                // Element has a transform rule
                if (styles[transformJsProperty] !== 'none') {
                    context = parent;
                    break;
                }
                element = parent;
            }
            return context;
        },

        _fix: function _fix() {
            var child = this.child;
            var childStyle = child.style;
            var childStyles = computedStyle.getAll(child);
            var left = child.getBoundingClientRect().left;
            var width = childStyles.width;

            this._saveStyles();

            if (document.documentElement.currentStyle) {
                // Function for ie<9. When hasLayout is not triggered in ie7, he will report currentStyle as auto, clientWidth as 0. Thus using offsetWidth.
                // Opera also falls here 
                width = (child.offsetWidth) - (computedStyle.toFloat(childStyles.paddingLeft) + computedStyle.toFloat(childStyles.paddingRight) + computedStyle.toFloat(childStyles.borderLeftWidth) + computedStyle.toFloat(childStyles.borderRightWidth)) + 'px';
            }

            // Ie still fixes the container according to the viewport.
            if (fixedPositioningContext) {
                var context = this._getContext();
                if (context) {
                    // There is a positioning context. Left should be according to the context.
                    left = child.getBoundingClientRect().left - context.getBoundingClientRect().left;
                }
            }

            this._replacer.replace();

            childStyle.left = (left - computedStyle.toFloat(childStyles.marginLeft)) + 'px';
            childStyle.width = width;

            childStyle.position = 'fixed';
            childStyle.top = this._mindtop() + this.options.top - computedStyle.toFloat(childStyles.marginTop) + 'px';
            this._$child.addClass(this.options.className);
            this.fixed = true;
        },

        _unfix: function _unfix() {
            var childStyle = this.child.style;
            this._replacer.hide();
            childStyle.position = this._childOriginalPosition;
            childStyle.top = this._childOriginalTop;
            childStyle.width = this._childOriginalWidth;
            childStyle.left = this._childOriginalLeft;
            this._$child.removeClass(this.options.className);
            this.fixed = false;
        },

        _saveStyles: function () {
            var childStyle = this.child.style;
            this._childOriginalPosition = childStyle.position;
            this._childOriginalTop = childStyle.top;
            this._childOriginalWidth = childStyle.width;
            this._childOriginalLeft = childStyle.left;
        },

        _onresize: function () {
            this.refresh();
        },

        _saveViewportHeight: function () {
            // ie8 doesn't support innerHeight
            this._viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        },

        _stop: function () {
            // Unfix the container immediately.
            this._unfix();
            // remove event listeners
            $(window).unbind('scroll', this._proxied_onscroll);
            $(this._toresize).unbind('resize', this._proxied_onresize);
        },

        _start: function () {
            // Trigger onscroll to have the effect immediately.
            this._onscroll();

            // Attach event listeners
            $(window).bind('scroll', this._proxied_onscroll);
            $(this._toresize).bind('resize', this._proxied_onresize);
        },

        _destroy: function () {
            // Destroy mimic node instance
            this._replacer.destroy();
        },

        refresh: function () {
            this._saveViewportHeight();
            this._unfix();
            this._onscroll();
        }
    });

    function NativeSticky(child, parent, options) {
        FixTo.call(this, child, parent, options);
        this.start();
    }

    NativeSticky.prototype = new FixTo();

    $.extend(NativeSticky.prototype, {
        _start: function () {

            var childStyles = computedStyle.getAll(this.child);

            this._childOriginalPosition = childStyles.position;
            this._childOriginalTop = childStyles.top;

            this.child.style.position = nativeStickyValue;
            this.refresh();
        },

        _stop: function () {
            this.child.style.position = this._childOriginalPosition;
            this.child.style.top = this._childOriginalTop;
        },

        refresh: function () {
            this.child.style.top = this._mindtop() + this.options.top + 'px';
        }
    });


    var fixTo = function fixTo(childElement, parentElement, options) {
        var _nativeStickyValue = nativeStickyValue;
        if (_nativeStickyValue == '-webkit-sticky' && $(parentElement).css('display') == 'table-cell') {
            _nativeStickyValue = false;
        }

        if ((_nativeStickyValue && !options) || (_nativeStickyValue && options && options.useNativeSticky !== false)) {
            // Position sticky supported and user did not disabled the usage of it.
            return new NativeSticky(childElement, parentElement, options);
        }
        else if (fixedPositionValue) {
            // Position fixed supported

            if (fixedPositioningContext === undefined) {
                // We don't know yet if browser creates fixed positioning contexts. Check it.
                fixedPositioningContext = checkFixedPositioningContextSupport();
            }

            return new FixToContainer(childElement, parentElement, options);
        }
        else {
            return 'Neither fixed nor sticky positioning supported';
        }
    };

    /*
     No support for ie lt 8
     */

    if (ieversion < 8) {
        fixTo = function () {
            return 'not supported';
        };
    }

    // Let it be a jQuery Plugin
    $.fn.fixTo = function (targetSelector, options) {

        var $targets = $(targetSelector);

        var i = 0;
        return this.each(function () {

            // Check the data of the element.
            var instance = $(this).data('fixto-instance');

            // If the element is not bound to an instance, create the instance and save it to elements data.
            if (!instance) {
                $(this).data('fixto-instance', fixTo(this, $targets[i], options));
            }
            else {
                // If we already have the instance here, expect that targetSelector parameter will be a string
                // equal to a public methods name. Run the method on the instance without checking if
                // it exists or it is a public method or not. Cause nasty errors when necessary.
                var method = targetSelector;
                instance[method].call(instance, options);
            }
            i++;
        });
    };

    /*
     Expose
     */

    return {
        FixToContainer: FixToContainer,
        fixTo: fixTo,
        computedStyle: computedStyle,
        mimicNode: mimicNode
    };


}(n2, window, document));
/*
 * ----------------------------- JSTORAGE -------------------------------------
 * Simple local storage wrapper to save data on the browser side, supporting
 * all major browsers - IE6+, Firefox2+, Safari4+, Chrome4+ and Opera 10.5+
 *
 * Author: Andris Reinman, andris.reinman@gmail.com
 * Project homepage: www.jstorage.info
 *
 * Licensed under Unlicense:
 *
 * This is free and unencumbered software released into the public domain.
 *
 * Anyone is free to copy, modify, publish, use, compile, sell, or
 * distribute this software, either in source code form or as a compiled
 * binary, for any purpose, commercial or non-commercial, and by any
 * means.
 *
 * In jurisdictions that recognize copyright laws, the author or authors
 * of this software dedicate any and all copyright interest in the
 * software to the public domain. We make this dedication for the benefit
 * of the public at large and to the detriment of our heirs and
 * successors. We intend this dedication to be an overt act of
 * relinquishment in perpetuity of all present and future rights to this
 * software under copyright law.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
 * OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 *
 * For more information, please refer to <http://unlicense.org/>
 */

/* global ActiveXObject: false */
/* jshint browser: true */

(function() {
    'use strict';

    var
    /* jStorage version */
        JSTORAGE_VERSION = '0.4.12',

    /* detect a dollar object or create one if not found */
        $ = window.n2 || window.$ || (window.$ = {}),

    /* check for a JSON handling support */
        JSON = {
            parse: window.JSON && (window.JSON.parse || window.JSON.decode) ||
                String.prototype.evalJSON && function(str) {
                    return String(str).evalJSON();
                } ||
                $.parseJSON ||
                $.evalJSON,
            stringify: Object.toJSON ||
                window.JSON && (window.JSON.stringify || window.JSON.encode) ||
                $.toJSON
        };

    // Break if no JSON support was found
    if (typeof JSON.parse !== 'function' || typeof JSON.stringify !== 'function') {
        throw new Error('No JSON support found, include //cdnjs.cloudflare.com/ajax/libs/json2/20110223/json2.js to page');
    }

    var
    /* This is the object, that holds the cached values */
        _storage = {
            __jstorage_meta: {
                CRC32: {}
            }
        },

    /* Actual browser storage (localStorage or globalStorage['domain']) */
        _storage_service = {
            jStorage: '{}'
        },

    /* DOM element for older IE versions, holds userData behavior */
        _storage_elm = null,

    /* How much space does the storage take */
        _storage_size = 0,

    /* which backend is currently used */
        _backend = false,

    /* onchange observers */
        _observers = {},

    /* timeout to wait after onchange event */
        _observer_timeout = false,

    /* last update time */
        _observer_update = 0,

    /* pubsub observers */
        _pubsub_observers = {},

    /* skip published items older than current timestamp */
        _pubsub_last = +new Date(),

    /* Next check for TTL */
        _ttl_timeout,

        /**
         * XML encoding and decoding as XML nodes can't be JSON'ized
         * XML nodes are encoded and decoded if the node is the value to be saved
         * but not if it's as a property of another object
         * Eg. -
         *   $.jStorage.set('key', xmlNode);        // IS OK
         *   $.jStorage.set('key', {xml: xmlNode}); // NOT OK
         */
            _XMLService = {

            /**
             * Validates a XML node to be XML
             * based on jQuery.isXML function
             */
            isXML: function(elm) {
                var documentElement = (elm ? elm.ownerDocument || elm : 0).documentElement;
                return documentElement ? documentElement.nodeName !== 'HTML' : false;
            },

            /**
             * Encodes a XML node to string
             * based on http://www.mercurytide.co.uk/news/article/issues-when-working-ajax/
             */
            encode: function(xmlNode) {
                if (!this.isXML(xmlNode)) {
                    return false;
                }
                try { // Mozilla, Webkit, Opera
                    return new XMLSerializer().serializeToString(xmlNode);
                } catch (E1) {
                    try { // IE
                        return xmlNode.xml;
                    } catch (E2) {}
                }
                return false;
            },

            /**
             * Decodes a XML node from string
             * loosely based on http://outwestmedia.com/jquery-plugins/xmldom/
             */
            decode: function(xmlString) {
                var dom_parser = ('DOMParser' in window && (new DOMParser()).parseFromString) ||
                        (window.ActiveXObject && function(_xmlString) {
                            var xml_doc = new ActiveXObject('Microsoft.XMLDOM');
                            xml_doc.async = 'false';
                            xml_doc.loadXML(_xmlString);
                            return xml_doc;
                        }),
                    resultXML;
                if (!dom_parser) {
                    return false;
                }
                resultXML = dom_parser.call('DOMParser' in window && (new DOMParser()) || window, xmlString, 'text/xml');
                return this.isXML(resultXML) ? resultXML : false;
            }
        };


    ////////////////////////// PRIVATE METHODS ////////////////////////

    /**
     * Initialization function. Detects if the browser supports DOM Storage
     * or userData behavior and behaves accordingly.
     */
    function _init() {
        /* Check if browser supports localStorage */
        var localStorageReallyWorks = false;
        if ('localStorage' in window) {
            try {
                window.localStorage.setItem('_tmptest', 'tmpval');
                localStorageReallyWorks = true;
                window.localStorage.removeItem('_tmptest');
            } catch (BogusQuotaExceededErrorOnIos5) {
                // Thanks be to iOS5 Private Browsing mode which throws
                // QUOTA_EXCEEDED_ERRROR DOM Exception 22.
            }
        }

        if (localStorageReallyWorks) {
            try {
                if (window.localStorage) {
                    _storage_service = window.localStorage;
                    _backend = 'localStorage';
                    _observer_update = _storage_service.jStorage_update;
                }
            } catch (E3) { /* Firefox fails when touching localStorage and cookies are disabled */ }
        }
        /* Check if browser supports globalStorage */
        else if ('globalStorage' in window) {
            try {
                if (window.globalStorage) {
                    if (window.location.hostname == 'localhost') {
                        _storage_service = window.globalStorage['localhost.localdomain'];
                    } else {
                        _storage_service = window.globalStorage[window.location.hostname];
                    }
                    _backend = 'globalStorage';
                    _observer_update = _storage_service.jStorage_update;
                }
            } catch (E4) { /* Firefox fails when touching localStorage and cookies are disabled */ }
        }
        /* Check if browser supports userData behavior */
        else {
            _storage_elm = document.createElement('link');
            if (_storage_elm.addBehavior) {

                /* Use a DOM element to act as userData storage */
                _storage_elm.style.behavior = 'url(#default#userData)';

                /* userData element needs to be inserted into the DOM! */
                document.getElementsByTagName('head')[0].appendChild(_storage_elm);

                try {
                    _storage_elm.load('jStorage');
                } catch (E) {
                    // try to reset cache
                    _storage_elm.setAttribute('jStorage', '{}');
                    _storage_elm.save('jStorage');
                    _storage_elm.load('jStorage');
                }

                var data = '{}';
                try {
                    data = _storage_elm.getAttribute('jStorage');
                } catch (E5) {}

                try {
                    _observer_update = _storage_elm.getAttribute('jStorage_update');
                } catch (E6) {}

                _storage_service.jStorage = data;
                _backend = 'userDataBehavior';
            } else {
                _storage_elm = null;
                return;
            }
        }

        // Load data from storage
        _load_storage();

        // remove dead keys
        _handleTTL();

        // start listening for changes
        _setupObserver();

        // initialize publish-subscribe service
        _handlePubSub();

        // handle cached navigation
        if ('addEventListener' in window) {
            window.addEventListener('pageshow', function(event) {
                if (event.persisted) {
                    _storageObserver();
                }
            }, false);
        }
    }

    /**
     * Reload data from storage when needed
     */
    function _reloadData() {
        var data = '{}';

        if (_backend == 'userDataBehavior') {
            _storage_elm.load('jStorage');

            try {
                data = _storage_elm.getAttribute('jStorage');
            } catch (E5) {}

            try {
                _observer_update = _storage_elm.getAttribute('jStorage_update');
            } catch (E6) {}

            _storage_service.jStorage = data;
        }

        _load_storage();

        // remove dead keys
        _handleTTL();

        _handlePubSub();
    }

    /**
     * Sets up a storage change observer
     */
    function _setupObserver() {
        if (_backend == 'localStorage' || _backend == 'globalStorage') {
            if ('addEventListener' in window) {
                window.addEventListener('storage', _storageObserver, false);
            } else {
                document.attachEvent('onstorage', _storageObserver);
            }
        } else if (_backend == 'userDataBehavior') {
            setInterval(_storageObserver, 1000);
        }
    }

    /**
     * Fired on any kind of data change, needs to check if anything has
     * really been changed
     */
    function _storageObserver() {
        var updateTime;
        // cumulate change notifications with timeout
        clearTimeout(_observer_timeout);
        _observer_timeout = setTimeout(function() {

            if (_backend == 'localStorage' || _backend == 'globalStorage') {
                updateTime = _storage_service.jStorage_update;
            } else if (_backend == 'userDataBehavior') {
                _storage_elm.load('jStorage');
                try {
                    updateTime = _storage_elm.getAttribute('jStorage_update');
                } catch (E5) {}
            }

            if (updateTime && updateTime != _observer_update) {
                _observer_update = updateTime;
                _checkUpdatedKeys();
            }

        }, 25);
    }

    /**
     * Reloads the data and checks if any keys are changed
     */
    function _checkUpdatedKeys() {
        var oldCrc32List = JSON.parse(JSON.stringify(_storage.__jstorage_meta.CRC32)),
            newCrc32List;

        _reloadData();
        newCrc32List = JSON.parse(JSON.stringify(_storage.__jstorage_meta.CRC32));

        var key,
            updated = [],
            removed = [];

        for (key in oldCrc32List) {
            if (oldCrc32List.hasOwnProperty(key)) {
                if (!newCrc32List[key]) {
                    removed.push(key);
                    continue;
                }
                if (oldCrc32List[key] != newCrc32List[key] && String(oldCrc32List[key]).substr(0, 2) == '2.') {
                    updated.push(key);
                }
            }
        }

        for (key in newCrc32List) {
            if (newCrc32List.hasOwnProperty(key)) {
                if (!oldCrc32List[key]) {
                    updated.push(key);
                }
            }
        }

        _fireObservers(updated, 'updated');
        _fireObservers(removed, 'deleted');
    }

    /**
     * Fires observers for updated keys
     *
     * @param {Array|String} keys Array of key names or a key
     * @param {String} action What happened with the value (updated, deleted, flushed)
     */
    function _fireObservers(keys, action) {
        keys = [].concat(keys || []);

        var i, j, len, jlen;

        if (action == 'flushed') {
            keys = [];
            for (var key in _observers) {
                if (_observers.hasOwnProperty(key)) {
                    keys.push(key);
                }
            }
            action = 'deleted';
        }
        for (i = 0, len = keys.length; i < len; i++) {
            if (_observers[keys[i]]) {
                for (j = 0, jlen = _observers[keys[i]].length; j < jlen; j++) {
                    _observers[keys[i]][j](keys[i], action);
                }
            }
            if (_observers['*']) {
                for (j = 0, jlen = _observers['*'].length; j < jlen; j++) {
                    _observers['*'][j](keys[i], action);
                }
            }
        }
    }

    /**
     * Publishes key change to listeners
     */
    function _publishChange() {
        var updateTime = (+new Date()).toString();

        if (_backend == 'localStorage' || _backend == 'globalStorage') {
            try {
                _storage_service.jStorage_update = updateTime;
            } catch (E8) {
                // safari private mode has been enabled after the jStorage initialization
                _backend = false;
            }
        } else if (_backend == 'userDataBehavior') {
            _storage_elm.setAttribute('jStorage_update', updateTime);
            _storage_elm.save('jStorage');
        }

        _storageObserver();
    }

    /**
     * Loads the data from the storage based on the supported mechanism
     */
    function _load_storage() {
        /* if jStorage string is retrieved, then decode it */
        if (_storage_service.jStorage) {
            try {
                _storage = JSON.parse(String(_storage_service.jStorage));
            } catch (E6) {
                _storage_service.jStorage = '{}';
            }
        } else {
            _storage_service.jStorage = '{}';
        }
        _storage_size = _storage_service.jStorage ? String(_storage_service.jStorage).length : 0;

        if (!_storage.__jstorage_meta) {
            _storage.__jstorage_meta = {};
        }
        if (!_storage.__jstorage_meta.CRC32) {
            _storage.__jstorage_meta.CRC32 = {};
        }
    }

    /**
     * This functions provides the 'save' mechanism to store the jStorage object
     */
    function _save() {
        _dropOldEvents(); // remove expired events
        try {
            _storage_service.jStorage = JSON.stringify(_storage);
            // If userData is used as the storage engine, additional
            if (_storage_elm) {
                _storage_elm.setAttribute('jStorage', _storage_service.jStorage);
                _storage_elm.save('jStorage');
            }
            _storage_size = _storage_service.jStorage ? String(_storage_service.jStorage).length : 0;
        } catch (E7) { /* probably cache is full, nothing is saved this way*/ }
    }

    /**
     * Function checks if a key is set and is string or numberic
     *
     * @param {String} key Key name
     */
    function _checkKey(key) {
        if (typeof key != 'string' && typeof key != 'number') {
            throw new TypeError('Key name must be string or numeric');
        }
        if (key == '__jstorage_meta') {
            throw new TypeError('Reserved key name');
        }
        return true;
    }

    /**
     * Removes expired keys
     */
    function _handleTTL() {
        var curtime, i, TTL, CRC32, nextExpire = Infinity,
            changed = false,
            deleted = [];

        clearTimeout(_ttl_timeout);

        if (!_storage.__jstorage_meta || typeof _storage.__jstorage_meta.TTL != 'object') {
            // nothing to do here
            return;
        }

        curtime = +new Date();
        TTL = _storage.__jstorage_meta.TTL;

        CRC32 = _storage.__jstorage_meta.CRC32;
        for (i in TTL) {
            if (TTL.hasOwnProperty(i)) {
                if (TTL[i] <= curtime) {
                    delete TTL[i];
                    delete CRC32[i];
                    delete _storage[i];
                    changed = true;
                    deleted.push(i);
                } else if (TTL[i] < nextExpire) {
                    nextExpire = TTL[i];
                }
            }
        }

        // set next check
        if (nextExpire != Infinity) {
            _ttl_timeout = setTimeout(_handleTTL, Math.min(nextExpire - curtime, 0x7FFFFFFF));
        }

        // save changes
        if (changed) {
            _save();
            _publishChange();
            _fireObservers(deleted, 'deleted');
        }
    }

    /**
     * Checks if there's any events on hold to be fired to listeners
     */
    function _handlePubSub() {
        var i, len;
        if (!_storage.__jstorage_meta.PubSub) {
            return;
        }
        var pubelm,
            _pubsubCurrent = _pubsub_last,
            needFired = [];

        for (i = len = _storage.__jstorage_meta.PubSub.length - 1; i >= 0; i--) {
            pubelm = _storage.__jstorage_meta.PubSub[i];
            if (pubelm[0] > _pubsub_last) {
                _pubsubCurrent = pubelm[0];
                needFired.unshift(pubelm);
            }
        }

        for (i = needFired.length - 1; i >= 0; i--) {
            _fireSubscribers(needFired[i][1], needFired[i][2]);
        }

        _pubsub_last = _pubsubCurrent;
    }

    /**
     * Fires all subscriber listeners for a pubsub channel
     *
     * @param {String} channel Channel name
     * @param {Mixed} payload Payload data to deliver
     */
    function _fireSubscribers(channel, payload) {
        if (_pubsub_observers[channel]) {
            for (var i = 0, len = _pubsub_observers[channel].length; i < len; i++) {
                // send immutable data that can't be modified by listeners
                try {
                    _pubsub_observers[channel][i](channel, JSON.parse(JSON.stringify(payload)));
                } catch (E) {}
            }
        }
    }

    /**
     * Remove old events from the publish stream (at least 2sec old)
     */
    function _dropOldEvents() {
        if (!_storage.__jstorage_meta.PubSub) {
            return;
        }

        var retire = +new Date() - 2000;

        for (var i = 0, len = _storage.__jstorage_meta.PubSub.length; i < len; i++) {
            if (_storage.__jstorage_meta.PubSub[i][0] <= retire) {
                // deleteCount is needed for IE6
                _storage.__jstorage_meta.PubSub.splice(i, _storage.__jstorage_meta.PubSub.length - i);
                break;
            }
        }

        if (!_storage.__jstorage_meta.PubSub.length) {
            delete _storage.__jstorage_meta.PubSub;
        }

    }

    /**
     * Publish payload to a channel
     *
     * @param {String} channel Channel name
     * @param {Mixed} payload Payload to send to the subscribers
     */
    function _publish(channel, payload) {
        if (!_storage.__jstorage_meta) {
            _storage.__jstorage_meta = {};
        }
        if (!_storage.__jstorage_meta.PubSub) {
            _storage.__jstorage_meta.PubSub = [];
        }

        _storage.__jstorage_meta.PubSub.unshift([+new Date(), channel, payload]);

        _save();
        _publishChange();
    }


    /**
     * JS Implementation of MurmurHash2
     *
     *  SOURCE: https://github.com/garycourt/murmurhash-js (MIT licensed)
     *
     * @author <a href='mailto:gary.court@gmail.com'>Gary Court</a>
     * @see http://github.com/garycourt/murmurhash-js
     * @author <a href='mailto:aappleby@gmail.com'>Austin Appleby</a>
     * @see http://sites.google.com/site/murmurhash/
     *
     * @param {string} str ASCII only
     * @param {number} seed Positive integer only
     * @return {number} 32-bit positive integer hash
     */

    function murmurhash2_32_gc(str, seed) {
        var
            l = str.length,
            h = seed ^ l,
            i = 0,
            k;

        while (l >= 4) {
            k =
                ((str.charCodeAt(i) & 0xff)) |
                    ((str.charCodeAt(++i) & 0xff) << 8) |
                    ((str.charCodeAt(++i) & 0xff) << 16) |
                    ((str.charCodeAt(++i) & 0xff) << 24);

            k = (((k & 0xffff) * 0x5bd1e995) + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16));
            k ^= k >>> 24;
            k = (((k & 0xffff) * 0x5bd1e995) + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16));

            h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16)) ^ k;

            l -= 4;
            ++i;
        }

        switch (l) {
            case 3:
                h ^= (str.charCodeAt(i + 2) & 0xff) << 16;
            /* falls through */
            case 2:
                h ^= (str.charCodeAt(i + 1) & 0xff) << 8;
            /* falls through */
            case 1:
                h ^= (str.charCodeAt(i) & 0xff);
                h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16));
        }

        h ^= h >>> 13;
        h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16));
        h ^= h >>> 15;

        return h >>> 0;
    }

    ////////////////////////// PUBLIC INTERFACE /////////////////////////

    $.jStorage = {
        /* Version number */
        version: JSTORAGE_VERSION,

        /**
         * Sets a key's value.
         *
         * @param {String} key Key to set. If this value is not set or not
         *              a string an exception is raised.
         * @param {Mixed} value Value to set. This can be any value that is JSON
         *              compatible (Numbers, Strings, Objects etc.).
         * @param {Object} [options] - possible options to use
         * @param {Number} [options.TTL] - optional TTL value, in milliseconds
         * @return {Mixed} the used value
         */
        set: function(key, value, options) {
            _checkKey(key);

            options = options || {};

            // undefined values are deleted automatically
            if (typeof value == 'undefined') {
                this.deleteKey(key);
                return value;
            }

            if (_XMLService.isXML(value)) {
                value = {
                    _is_xml: true,
                    xml: _XMLService.encode(value)
                };
            } else if (typeof value == 'function') {
                return undefined; // functions can't be saved!
            } else if (value && typeof value == 'object') {
                // clone the object before saving to _storage tree
                value = JSON.parse(JSON.stringify(value));
            }

            _storage[key] = value;

            _storage.__jstorage_meta.CRC32[key] = '2.' + murmurhash2_32_gc(JSON.stringify(value), 0x9747b28c);

            this.setTTL(key, options.TTL || 0); // also handles saving and _publishChange

            _fireObservers(key, 'updated');
            return value;
        },

        /**
         * Looks up a key in cache
         *
         * @param {String} key - Key to look up.
         * @param {mixed} def - Default value to return, if key didn't exist.
         * @return {Mixed} the key value, default value or null
         */
        get: function(key, def) {
            _checkKey(key);
            if (key in _storage) {
                if (_storage[key] && typeof _storage[key] == 'object' && _storage[key]._is_xml) {
                    return _XMLService.decode(_storage[key].xml);
                } else {
                    return _storage[key];
                }
            }
            return typeof(def) == 'undefined' ? null : def;
        },

        /**
         * Deletes a key from cache.
         *
         * @param {String} key - Key to delete.
         * @return {Boolean} true if key existed or false if it didn't
         */
        deleteKey: function(key) {
            _checkKey(key);
            if (key in _storage) {
                delete _storage[key];
                // remove from TTL list
                if (typeof _storage.__jstorage_meta.TTL == 'object' &&
                    key in _storage.__jstorage_meta.TTL) {
                    delete _storage.__jstorage_meta.TTL[key];
                }

                delete _storage.__jstorage_meta.CRC32[key];

                _save();
                _publishChange();
                _fireObservers(key, 'deleted');
                return true;
            }
            return false;
        },

        /**
         * Sets a TTL for a key, or remove it if ttl value is 0 or below
         *
         * @param {String} key - key to set the TTL for
         * @param {Number} ttl - TTL timeout in milliseconds
         * @return {Boolean} true if key existed or false if it didn't
         */
        setTTL: function(key, ttl) {
            var curtime = +new Date();
            _checkKey(key);
            ttl = Number(ttl) || 0;
            if (key in _storage) {

                if (!_storage.__jstorage_meta.TTL) {
                    _storage.__jstorage_meta.TTL = {};
                }

                // Set TTL value for the key
                if (ttl > 0) {
                    _storage.__jstorage_meta.TTL[key] = curtime + ttl;
                } else {
                    delete _storage.__jstorage_meta.TTL[key];
                }

                _save();

                _handleTTL();

                _publishChange();
                return true;
            }
            return false;
        },

        /**
         * Gets remaining TTL (in milliseconds) for a key or 0 when no TTL has been set
         *
         * @param {String} key Key to check
         * @return {Number} Remaining TTL in milliseconds
         */
        getTTL: function(key) {
            var curtime = +new Date(),
                ttl;
            _checkKey(key);
            if (key in _storage && _storage.__jstorage_meta.TTL && _storage.__jstorage_meta.TTL[key]) {
                ttl = _storage.__jstorage_meta.TTL[key] - curtime;
                return ttl || 0;
            }
            return 0;
        },

        /**
         * Deletes everything in cache.
         *
         * @return {Boolean} Always true
         */
        flush: function() {
            _storage = {
                __jstorage_meta: {
                    CRC32: {}
                }
            };
            _save();
            _publishChange();
            _fireObservers(null, 'flushed');
            return true;
        },

        /**
         * Returns a read-only copy of _storage
         *
         * @return {Object} Read-only copy of _storage
         */
        storageObj: function() {
            function F() {}
            F.prototype = _storage;
            return new F();
        },

        /**
         * Returns an index of all used keys as an array
         * ['key1', 'key2',..'keyN']
         *
         * @return {Array} Used keys
         */
        index: function() {
            var index = [],
                i;
            for (i in _storage) {
                if (_storage.hasOwnProperty(i) && i != '__jstorage_meta') {
                    index.push(i);
                }
            }
            return index;
        },

        /**
         * How much space in bytes does the storage take?
         *
         * @return {Number} Storage size in chars (not the same as in bytes,
         *                  since some chars may take several bytes)
         */
        storageSize: function() {
            return _storage_size;
        },

        /**
         * Which backend is currently in use?
         *
         * @return {String} Backend name
         */
        currentBackend: function() {
            return _backend;
        },

        /**
         * Test if storage is available
         *
         * @return {Boolean} True if storage can be used
         */
        storageAvailable: function() {
            return !!_backend;
        },

        /**
         * Register change listeners
         *
         * @param {String} key Key name
         * @param {Function} callback Function to run when the key changes
         */
        listenKeyChange: function(key, callback) {
            _checkKey(key);
            if (!_observers[key]) {
                _observers[key] = [];
            }
            _observers[key].push(callback);
        },

        /**
         * Remove change listeners
         *
         * @param {String} key Key name to unregister listeners against
         * @param {Function} [callback] If set, unregister the callback, if not - unregister all
         */
        stopListening: function(key, callback) {
            _checkKey(key);

            if (!_observers[key]) {
                return;
            }

            if (!callback) {
                delete _observers[key];
                return;
            }

            for (var i = _observers[key].length - 1; i >= 0; i--) {
                if (_observers[key][i] == callback) {
                    _observers[key].splice(i, 1);
                }
            }
        },

        /**
         * Subscribe to a Publish/Subscribe event stream
         *
         * @param {String} channel Channel name
         * @param {Function} callback Function to run when the something is published to the channel
         */
        subscribe: function(channel, callback) {
            channel = (channel || '').toString();
            if (!channel) {
                throw new TypeError('Channel not defined');
            }
            if (!_pubsub_observers[channel]) {
                _pubsub_observers[channel] = [];
            }
            _pubsub_observers[channel].push(callback);
        },

        /**
         * Publish data to an event stream
         *
         * @param {String} channel Channel name
         * @param {Mixed} payload Payload to deliver
         */
        publish: function(channel, payload) {
            channel = (channel || '').toString();
            if (!channel) {
                throw new TypeError('Channel not defined');
            }

            _publish(channel, payload);
        },

        /**
         * Reloads the data from browser storage
         */
        reInit: function() {
            _reloadData();
        },

        /**
         * Removes reference from global objects and saves it as jStorage
         *
         * @param {Boolean} option if needed to save object as simple 'jStorage' in windows context
         */
        noConflict: function(saveInGlobal) {
            delete window.$.jStorage;

            if (saveInGlobal) {
                window.jStorage = this;
            }

            return this;
        }
    };

    // Initialize jStorage
    _init();

})();
/**
 * @preserve jQuery DateTimePicker plugin v2.4.1
 * @homepage http://xdsoft.net/jqplugins/datetimepicker/
 * (c) 2014, Chupurnov Valeriy.
 */
/*global document,window,jQuery,setTimeout,clearTimeout*/

(function(jQuery){
    var module, define;
(function ($) {
    'use strict';
    var default_options  = {
        i18n: {
            ar: { // Arabic
                months: [
                    "كانون الثاني", "شباط", "آذار", "نيسان", "مايو", "حزيران", "تموز", "آب", "أيلول", "تشرين الأول", "تشرين الثاني", "كانون الأول"
                ],
                dayOfWeek: [
                    "ن", "ث", "ع", "خ", "ج", "س", "ح"
                ]
            },
            ro: { // Romanian
                months: [
                    "ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"
                ],
                dayOfWeek: [
                    "l", "ma", "mi", "j", "v", "s", "d"
                ]
            },
            id: { // Indonesian
                months: [
                    "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"
                ],
                dayOfWeek: [
                    "Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"
                ]
            },
            bg: { // Bulgarian
                months: [
                    "Януари", "Февруари", "Март", "Април", "Май", "Юни", "Юли", "Август", "Септември", "Октомври", "Ноември", "Декември"
                ],
                dayOfWeek: [
                    "Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"
                ]
            },
            fa: { // Persian/Farsi
                months: [
                    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
                ],
                dayOfWeek: [
                    'یکشنبه', 'دوشنبه', 'سه شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'
                ]
            },
            ru: { // Russian
                months: [
                    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
                ],
                dayOfWeek: [
                    "Вск", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"
                ]
            },
            uk: { // Ukrainian
                months: [
                    'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
                ],
                dayOfWeek: [
                    "Ндл", "Пнд", "Втр", "Срд", "Чтв", "Птн", "Сбт"
                ]
            },
            en: { // English
                months: [
                    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
                ],
                dayOfWeek: [
                    "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
                ]
            },
            el: { // Ελληνικά
                months: [
                    "Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος", "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"
                ],
                dayOfWeek: [
                    "Κυρ", "Δευ", "Τρι", "Τετ", "Πεμ", "Παρ", "Σαβ"
                ]
            },
            de: { // German
                months: [
                    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
                ],
                dayOfWeek: [
                    "So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"
                ]
            },
            nl: { // Dutch
                months: [
                    "januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"
                ],
                dayOfWeek: [
                    "zo", "ma", "di", "wo", "do", "vr", "za"
                ]
            },
            tr: { // Turkish
                months: [
                    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
                ],
                dayOfWeek: [
                    "Paz", "Pts", "Sal", "Çar", "Per", "Cum", "Cts"
                ]
            },
            fr: { //French
                months: [
                    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
                ],
                dayOfWeek: [
                    "Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"
                ]
            },
            es: { // Spanish
                months: [
                    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
                ],
                dayOfWeek: [
                    "Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"
                ]
            },
            th: { // Thai
                months: [
                    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
                ],
                dayOfWeek: [
                    'อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'
                ]
            },
            pl: { // Polish
                months: [
                    "styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec", "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień"
                ],
                dayOfWeek: [
                    "nd", "pn", "wt", "śr", "cz", "pt", "sb"
                ]
            },
            pt: { // Portuguese
                months: [
                    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
                ],
                dayOfWeek: [
                    "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"
                ]
            },
            ch: { // Simplified Chinese
                months: [
                    "一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"
                ],
                dayOfWeek: [
                    "日", "一", "二", "三", "四", "五", "六"
                ]
            },
            se: { // Swedish
                months: [
                    "Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September",  "Oktober", "November", "December"
                ],
                dayOfWeek: [
                    "Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör"
                ]
            },
            kr: { // Korean
                months: [
                    "1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"
                ],
                dayOfWeek: [
                    "일", "월", "화", "수", "목", "금", "토"
                ]
            },
            it: { // Italian
                months: [
                    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
                ],
                dayOfWeek: [
                    "Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"
                ]
            },
            da: { // Dansk
                months: [
                    "January", "Februar", "Marts", "April", "Maj", "Juni", "July", "August", "September", "Oktober", "November", "December"
                ],
                dayOfWeek: [
                    "Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"
                ]
            },
            no: { // Norwegian
                months: [
                    "Januar", "Februar", "Mars", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Desember"
                ],
                dayOfWeek: [
                    "Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"
                ]
            },
            ja: { // Japanese
                months: [
                    "1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"
                ],
                dayOfWeek: [
                    "日", "月", "火", "水", "木", "金", "土"
                ]
            },
            vi: { // Vietnamese
                months: [
                    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
                ],
                dayOfWeek: [
                    "CN", "T2", "T3", "T4", "T5", "T6", "T7"
                ]
            },
            sl: { // Slovenščina
                months: [
                    "Januar", "Februar", "Marec", "April", "Maj", "Junij", "Julij", "Avgust", "September", "Oktober", "November", "December"
                ],
                dayOfWeek: [
                    "Ned", "Pon", "Tor", "Sre", "Čet", "Pet", "Sob"
                ]
            },
            cs: { // Čeština
                months: [
                    "Leden", "Únor", "Březen", "Duben", "Květen", "Červen", "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"
                ],
                dayOfWeek: [
                    "Ne", "Po", "Út", "St", "Čt", "Pá", "So"
                ]
            },
            hu: { // Hungarian
                months: [
                    "Január", "Február", "Március", "Április", "Május", "Június", "Július", "Augusztus", "Szeptember", "Október", "November", "December"
                ],
                dayOfWeek: [
                    "Va", "Hé", "Ke", "Sze", "Cs", "Pé", "Szo"
                ]
            },
            az: { //Azerbaijanian (Azeri)
                months: [
                    "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"
                ],
                dayOfWeek: [
                    "B", "Be", "Ça", "Ç", "Ca", "C", "Ş"
                ]
            },
            bs: { //Bosanski
                months: [
                    "Januar", "Februar", "Mart", "April", "Maj", "Jun", "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"
                ],
                dayOfWeek: [
                    "Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"
                ]
            },
            ca: { //Català
                months: [
                    "Gener", "Febrer", "Març", "Abril", "Maig", "Juny", "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"
                ],
                dayOfWeek: [
                    "Dg", "Dl", "Dt", "Dc", "Dj", "Dv", "Ds"
                ]
            },
            'en-GB': { //English (British)
                months: [
                    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
                ],
                dayOfWeek: [
                    "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
                ]
            },
            et: { //"Eesti"
                months: [
                    "Jaanuar", "Veebruar", "Märts", "Aprill", "Mai", "Juuni", "Juuli", "August", "September", "Oktoober", "November", "Detsember"
                ],
                dayOfWeek: [
                    "P", "E", "T", "K", "N", "R", "L"
                ]
            },
            eu: { //Euskara
                months: [
                    "Urtarrila", "Otsaila", "Martxoa", "Apirila", "Maiatza", "Ekaina", "Uztaila", "Abuztua", "Iraila", "Urria", "Azaroa", "Abendua"
                ],
                dayOfWeek: [
                    "Ig.", "Al.", "Ar.", "Az.", "Og.", "Or.", "La."
                ]
            },
            fi: { //Finnish (Suomi)
                months: [
                    "Tammikuu", "Helmikuu", "Maaliskuu", "Huhtikuu", "Toukokuu", "Kesäkuu", "Heinäkuu", "Elokuu", "Syyskuu", "Lokakuu", "Marraskuu", "Joulukuu"
                ],
                dayOfWeek: [
                    "Su", "Ma", "Ti", "Ke", "To", "Pe", "La"
                ]
            },
            gl: { //Galego
                months: [
                    "Xan", "Feb", "Maz", "Abr", "Mai", "Xun", "Xul", "Ago", "Set", "Out", "Nov", "Dec"
                ],
                dayOfWeek: [
                    "Dom", "Lun", "Mar", "Mer", "Xov", "Ven", "Sab"
                ]
            },
            hr: { //Hrvatski
                months: [
                    "Siječanj", "Veljača", "Ožujak", "Travanj", "Svibanj", "Lipanj", "Srpanj", "Kolovoz", "Rujan", "Listopad", "Studeni", "Prosinac"
                ],
                dayOfWeek: [
                    "Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"
                ]
            },
            ko: { //Korean (한국어)
                months: [
                    "1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"
                ],
                dayOfWeek: [
                    "일", "월", "화", "수", "목", "금", "토"
                ]
            },
            lt: { //Lithuanian (lietuvių)
                months: [
                    "Sausio", "Vasario", "Kovo", "Balandžio", "Gegužės", "Birželio", "Liepos", "Rugpjūčio", "Rugsėjo", "Spalio", "Lapkričio", "Gruodžio"
                ],
                dayOfWeek: [
                    "Sek", "Pir", "Ant", "Tre", "Ket", "Pen", "Šeš"
                ]
            },
            lv: { //Latvian (Latviešu)
                months: [
                    "Janvāris", "Februāris", "Marts", "Aprīlis ", "Maijs", "Jūnijs", "Jūlijs", "Augusts", "Septembris", "Oktobris", "Novembris", "Decembris"
                ],
                dayOfWeek: [
                    "Sv", "Pr", "Ot", "Tr", "Ct", "Pk", "St"
                ]
            },
            mk: { //Macedonian (Македонски)
                months: [
                    "јануари", "февруари", "март", "април", "мај", "јуни", "јули", "август", "септември", "октомври", "ноември", "декември"
                ],
                dayOfWeek: [
                    "нед", "пон", "вто", "сре", "чет", "пет", "саб"
                ]
            },
            mn: { //Mongolian (Монгол)
                months: [
                    "1-р сар", "2-р сар", "3-р сар", "4-р сар", "5-р сар", "6-р сар", "7-р сар", "8-р сар", "9-р сар", "10-р сар", "11-р сар", "12-р сар"
                ],
                dayOfWeek: [
                    "Дав", "Мяг", "Лха", "Пүр", "Бсн", "Бям", "Ням"
                ]
            },
            'pt-BR': { //Português(Brasil)
                months: [
                    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
                ],
                dayOfWeek: [
                    "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"
                ]
            },
            sk: { //Slovenčina
                months: [
                    "Január", "Február", "Marec", "Apríl", "Máj", "Jún", "Júl", "August", "September", "Október", "November", "December"
                ],
                dayOfWeek: [
                    "Ne", "Po", "Ut", "St", "Št", "Pi", "So"
                ]
            },
            sq: { //Albanian (Shqip)
                months: [
                    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
                ],
                dayOfWeek: [
                    "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
                ]
            },
            'sr-YU': { //Serbian (Srpski)
                months: [
                    "Januar", "Februar", "Mart", "April", "Maj", "Jun", "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"
                ],
                dayOfWeek: [
                    "Ned", "Pon", "Uto", "Sre", "čet", "Pet", "Sub"
                ]
            },
            sr: { //Serbian Cyrillic (Српски)
                months: [
                    "јануар", "фебруар", "март", "април", "мај", "јун", "јул", "август", "септембар", "октобар", "новембар", "децембар"
                ],
                dayOfWeek: [
                    "нед", "пон", "уто", "сре", "чет", "пет", "суб"
                ]
            },
            sv: { //Svenska
                months: [
                    "Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"
                ],
                dayOfWeek: [
                    "Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör"
                ]
            },
            'zh-TW': { //Traditional Chinese (繁體中文)
                months: [
                    "一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"
                ],
                dayOfWeek: [
                    "日", "一", "二", "三", "四", "五", "六"
                ]
            },
            zh: { //Simplified Chinese (简体中文)
                months: [
                    "一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"
                ],
                dayOfWeek: [
                    "日", "一", "二", "三", "四", "五", "六"
                ]
            },
            he: { //Hebrew (עברית)
                months: [
                    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
                ],
                dayOfWeek: [
                    'א\'', 'ב\'', 'ג\'', 'ד\'', 'ה\'', 'ו\'', 'שבת'
                ]
            }
        },
        value: '',
        lang: 'en',

        format:	'Y/m/d H:i',
        formatTime:	'H:i',
        formatDate:	'Y/m/d',

        startDate:	false, // new Date(), '1986/12/08', '-1970/01/05','-1970/01/05',
        step: 60,
        monthChangeSpinner: true,

        closeOnDateSelect: false,
        closeOnWithoutClick: true,
        closeOnInputClick: true,

        timepicker: true,
        datepicker: true,
        weeks: false,

        defaultTime: false,	// use formatTime format (ex. '10:00' for formatTime:	'H:i')
        defaultDate: false,	// use formatDate format (ex new Date() or '1986/12/08' or '-1970/01/05' or '-1970/01/05')

        minDate: false,
        maxDate: false,
        minTime: false,
        maxTime: false,

        allowTimes: [],
        opened: false,
        initTime: true,
        inline: false,
        theme: '',

        onSelectDate: function () {},
        onSelectTime: function () {},
        onChangeMonth: function () {},
        onChangeYear: function () {},
        onChangeDateTime: function () {},
        onShow: function () {},
        onClose: function () {},
        onGenerate: function () {},

        withoutCopyright: true,
        inverseButton: false,
        hours12: false,
        next:	'xdsoft_next',
        prev : 'xdsoft_prev',
        dayOfWeekStart: 0,
        parentID: 'body',
        timeHeightInTimePicker: 25,
        timepickerScrollbar: true,
        todayButton: true,
        defaultSelect: true,

        scrollMonth: true,
        scrollTime: true,
        scrollInput: true,

        lazyInit: false,
        mask: false,
        validateOnBlur: true,
        allowBlank: true,
        yearStart: 1950,
        yearEnd: 2050,
        style: '',
        id: '',
        fixed: false,
        roundTime: 'round', // ceil, floor
        className: '',
        weekends: [],
        disabledDates : [],
        yearOffset: 0,
        beforeShowDay: null,

        enterLikeTab: true
    };
    // fix for ie8
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (obj, start) {
            var i, j;
            for (i = (start || 0), j = this.length; i < j; i += 1) {
                if (this[i] === obj) { return i; }
            }
            return -1;
        };
    }
    Date.prototype.countDaysInMonth = function () {
        return new Date(this.getFullYear(), this.getMonth() + 1, 0).getDate();
    };
    $.fn.xdsoftScroller = function (percent) {
        return this.each(function () {
            var timeboxparent = $(this),
                pointerEventToXY = function (e) {
                    var out = {x: 0, y: 0},
                        touch;
                    if (e.type === 'touchstart' || e.type === 'touchmove' || e.type === 'touchend' || e.type === 'touchcancel') {
                        touch  = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
                        out.x = touch.clientX;
                        out.y = touch.clientY;
                    } else if (e.type === 'mousedown' || e.type === 'mouseup' || e.type === 'mousemove' || e.type === 'mouseover' || e.type === 'mouseout' || e.type === 'mouseenter' || e.type === 'mouseleave') {
                        out.x = e.clientX;
                        out.y = e.clientY;
                    }
                    return out;
                },
                move = 0,
                timebox,
                parentHeight,
                height,
                scrollbar,
                scroller,
                maximumOffset = 100,
                start = false,
                startY = 0,
                startTop = 0,
                h1 = 0,
                touchStart = false,
                startTopScroll = 0,
                calcOffset = function () {};
            if (percent === 'hide') {
                timeboxparent.find('.xdsoft_scrollbar').hide();
                return;
            }
            if (!$(this).hasClass('xdsoft_scroller_box')) {
                timebox = timeboxparent.children().eq(0);
                parentHeight = timeboxparent[0].clientHeight;
                height = timebox[0].offsetHeight;
                scrollbar = $('<div class="xdsoft_scrollbar"></div>');
                scroller = $('<div class="xdsoft_scroller"></div>');
                scrollbar.append(scroller);

                timeboxparent.addClass('xdsoft_scroller_box').append(scrollbar);
                calcOffset = function calcOffset(event) {
                    var offset = pointerEventToXY(event).y - startY + startTopScroll;
                    if (offset < 0) {
                        offset = 0;
                    }
                    if (offset + scroller[0].offsetHeight > h1) {
                        offset = h1 - scroller[0].offsetHeight;
                    }
                    timeboxparent.trigger('scroll_element.xdsoft_scroller', [maximumOffset ? offset / maximumOffset : 0]);
                };

                scroller
                    .on('touchstart.xdsoft_scroller mousedown.xdsoft_scroller', function (event) {
                        if (!parentHeight) {
                            timeboxparent.trigger('resize_scroll.xdsoft_scroller', [percent]);
                        }

                        startY = pointerEventToXY(event).y;
                        startTopScroll = parseInt(scroller.css('margin-top'), 10);
                        h1 = scrollbar[0].offsetHeight;

                        if (event.type === 'mousedown') {
                            if (document) {
                                $(document.body).addClass('xdsoft_noselect');
                            }
                            $([document.body, window]).on('mouseup.xdsoft_scroller', function arguments_callee() {
                                $([document.body, window]).off('mouseup.xdsoft_scroller', arguments_callee)
                                    .off('mousemove.xdsoft_scroller', calcOffset)
                                    .removeClass('xdsoft_noselect');
                            });
                            $(document.body).on('mousemove.xdsoft_scroller', calcOffset);
                        } else {
                            touchStart = true;
                            event.stopPropagation();
                            event.preventDefault();
                        }
                    })
                    .on('touchmove', function (event) {
                        if (touchStart) {
                            event.preventDefault();
                            calcOffset(event);
                        }
                    })
                    .on('touchend touchcancel', function (event) {
                        touchStart =  false;
                        startTopScroll = 0;
                    });

                timeboxparent
                    .on('scroll_element.xdsoft_scroller', function (event, percentage) {
                        if (!parentHeight) {
                            timeboxparent.trigger('resize_scroll.xdsoft_scroller', [percentage, true]);
                        }
                        percentage = percentage > 1 ? 1 : (percentage < 0 || isNaN(percentage)) ? 0 : percentage;

                        scroller.css('margin-top', maximumOffset * percentage);

                        setTimeout(function () {
                            timebox.css('marginTop', -parseInt((timebox[0].offsetHeight - parentHeight) * percentage, 10));
                        }, 10);
                    })
                    .on('resize_scroll.xdsoft_scroller', function (event, percentage, noTriggerScroll) {
                        var percent, sh;
                        parentHeight = timeboxparent[0].clientHeight;
                        height = timebox[0].offsetHeight;
                        percent = parentHeight / height;
                        sh = percent * scrollbar[0].offsetHeight;
                        if (percent > 1) {
                            scroller.hide();
                        } else {
                            scroller.show();
                            scroller.css('height', parseInt(sh > 10 ? sh : 10, 10));
                            maximumOffset = scrollbar[0].offsetHeight - scroller[0].offsetHeight;
                            if (noTriggerScroll !== true) {
                                timeboxparent.trigger('scroll_element.xdsoft_scroller', [percentage || Math.abs(parseInt(timebox.css('marginTop'), 10)) / (height - parentHeight)]);
                            }
                        }
                    });

                timeboxparent.on('mousewheel', function (event) {
                    var top = Math.abs(parseInt(timebox.css('marginTop'), 10));

                    top = top - (event.deltaY * 20);
                    if (top < 0) {
                        top = 0;
                    }

                    timeboxparent.trigger('scroll_element.xdsoft_scroller', [top / (height - parentHeight)]);
                    event.stopPropagation();
                    return false;
                });

                timeboxparent.on('touchstart', function (event) {
                    start = pointerEventToXY(event);
                    startTop = Math.abs(parseInt(timebox.css('marginTop'), 10));
                });

                timeboxparent.on('touchmove', function (event) {
                    if (start) {
                        event.preventDefault();
                        var coord = pointerEventToXY(event);
                        timeboxparent.trigger('scroll_element.xdsoft_scroller', [(startTop - (coord.y - start.y)) / (height - parentHeight)]);
                    }
                });

                timeboxparent.on('touchend touchcancel', function (event) {
                    start = false;
                    startTop = 0;
                });
            }
            timeboxparent.trigger('resize_scroll.xdsoft_scroller', [percent]);
        });
    };

    $.fn.datetimepicker = function (opt) {
        var KEY0 = 48,
            KEY9 = 57,
            _KEY0 = 96,
            _KEY9 = 105,
            CTRLKEY = 17,
            DEL = 46,
            ENTER = 13,
            ESC = 27,
            BACKSPACE = 8,
            ARROWLEFT = 37,
            ARROWUP = 38,
            ARROWRIGHT = 39,
            ARROWDOWN = 40,
            TAB = 9,
            F5 = 116,
            AKEY = 65,
            CKEY = 67,
            VKEY = 86,
            ZKEY = 90,
            YKEY = 89,
            ctrlDown	=	false,
            options = ($.isPlainObject(opt) || !opt) ? $.extend(true, {}, default_options, opt) : $.extend(true, {}, default_options),

            lazyInitTimer = 0,
            createDateTimePicker,
            destroyDateTimePicker,

            lazyInit = function (input) {
                input
                    .on('open.xdsoft focusin.xdsoft mousedown.xdsoft', function initOnActionCallback(event) {
                        if (input.is(':disabled') || input.data('xdsoft_datetimepicker')) {
                            return;
                        }
                        clearTimeout(lazyInitTimer);
                        lazyInitTimer = setTimeout(function () {

                            if (!input.data('xdsoft_datetimepicker')) {
                                createDateTimePicker(input);
                            }
                            input
                                .off('open.xdsoft focusin.xdsoft mousedown.xdsoft', initOnActionCallback)
                                .trigger('open.xdsoft');
                        }, 100);
                    });
            };

        createDateTimePicker = function (input) {
            var datetimepicker = $('<div ' + (options.id ? 'id="' + options.id + '"' : '') + ' ' + (options.style ? 'style="' + options.style + '"' : '') + ' class="xdsoft_datetimepicker xdsoft_' + options.theme + ' xdsoft_noselect ' + (options.weeks ? ' xdsoft_showweeks' : '') + options.className + '"></div>'),
                xdsoft_copyright = $('<div class="xdsoft_copyright"><a target="_blank" href="http://xdsoft.net/jqplugins/datetimepicker/">xdsoft.net</a></div>'),
                datepicker = $('<div class="xdsoft_datepicker active"></div>'),
                mounth_picker = $('<div class="xdsoft_mounthpicker"><button type="button" class="xdsoft_prev"></button><button type="button" class="xdsoft_today_button"></button>' +
                '<div class="xdsoft_label xdsoft_month"><span></span><i></i></div>' +
                '<div class="xdsoft_label xdsoft_year"><span></span><i></i></div>' +
                '<button type="button" class="xdsoft_next"></button></div>'),
                calendar = $('<div class="xdsoft_calendar"></div>'),
                timepicker = $('<div class="xdsoft_timepicker active"><button type="button" class="xdsoft_prev"></button><div class="xdsoft_time_box"></div><button type="button" class="xdsoft_next"></button></div>'),
                timeboxparent = timepicker.find('.xdsoft_time_box').eq(0),
                timebox = $('<div class="xdsoft_time_variant"></div>'),
            /*scrollbar = $('<div class="xdsoft_scrollbar"></div>'),
             scroller = $('<div class="xdsoft_scroller"></div>'),*/
                monthselect = $('<div class="xdsoft_select xdsoft_monthselect"><div></div></div>'),
                yearselect = $('<div class="xdsoft_select xdsoft_yearselect"><div></div></div>'),
                triggerAfterOpen = false,
                XDSoft_datetime,
            //scroll_element,
                xchangeTimer,
                timerclick,
                current_time_index,
                setPos,
                timer = 0,
                timer1 = 0,
                _xdsoft_datetime;

            mounth_picker
                .find('.xdsoft_month span')
                .after(monthselect);
            mounth_picker
                .find('.xdsoft_year span')
                .after(yearselect);

            mounth_picker
                .find('.xdsoft_month,.xdsoft_year')
                .on('mousedown.xdsoft', function (event) {
                    var select = $(this).find('.xdsoft_select').eq(0),
                        val = 0,
                        top = 0,
                        visible = select.is(':visible'),
                        items,
                        i;

                    mounth_picker
                        .find('.xdsoft_select')
                        .hide();
                    if (_xdsoft_datetime.currentTime) {
                        val = _xdsoft_datetime.currentTime[$(this).hasClass('xdsoft_month') ? 'getMonth' : 'getFullYear']();
                    }

                    select[visible ? 'hide' : 'show']();
                    for (items = select.find('div.xdsoft_option'), i = 0; i < items.length; i += 1) {
                        if (items.eq(i).data('value') === val) {
                            break;
                        } else {
                            top += items[0].offsetHeight;
                        }
                    }

                    select.xdsoftScroller(top / (select.children()[0].offsetHeight - (select[0].clientHeight)));
                    event.stopPropagation();
                    return false;
                });

            mounth_picker
                .find('.xdsoft_select')
                .xdsoftScroller()
                .on('mousedown.xdsoft', function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                })
                .on('mousedown.xdsoft', '.xdsoft_option', function (event) {
                    var year = _xdsoft_datetime.currentTime.getFullYear();
                    if (_xdsoft_datetime && _xdsoft_datetime.currentTime) {
                        _xdsoft_datetime.currentTime[$(this).parent().parent().hasClass('xdsoft_monthselect') ? 'setMonth' : 'setFullYear']($(this).data('value'));
                    }

                    $(this).parent().parent().hide();

                    datetimepicker.trigger('xchange.xdsoft');
                    if (options.onChangeMonth && $.isFunction(options.onChangeMonth)) {
                        options.onChangeMonth.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'));
                    }

                    if (year !== _xdsoft_datetime.currentTime.getFullYear() && $.isFunction(options.onChangeYear)) {
                        options.onChangeYear.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'));
                    }
                });

            datetimepicker.setOptions = function (_options) {
                options = $.extend(true, {}, options, _options);

                if (_options.allowTimes && $.isArray(_options.allowTimes) && _options.allowTimes.length) {
                    options.allowTimes = $.extend(true, [], _options.allowTimes);
                }

                if (_options.weekends && $.isArray(_options.weekends) && _options.weekends.length) {
                    options.weekends = $.extend(true, [], _options.weekends);
                }

                if (_options.disabledDates && $.isArray(_options.disabledDates) && _options.disabledDates.length) {
                    options.disabledDates = $.extend(true, [], _options.disabledDates);
                }

                if ((options.open || options.opened) && (!options.inline)) {
                    input.trigger('open.xdsoft');
                }

                if (options.inline) {
                    triggerAfterOpen = true;
                    datetimepicker.addClass('xdsoft_inline');
                    input.after(datetimepicker).hide();
                }

                if (options.inverseButton) {
                    options.next = 'xdsoft_prev';
                    options.prev = 'xdsoft_next';
                }

                if (options.datepicker) {
                    datepicker.addClass('active');
                } else {
                    datepicker.removeClass('active');
                }

                if (options.timepicker) {
                    timepicker.addClass('active');
                } else {
                    timepicker.removeClass('active');
                }

                if (options.value) {
                    if (input && input.val) {
                        input.val(options.value);
                    }
                    _xdsoft_datetime.setCurrentTime(options.value);
                }

                if (isNaN(options.dayOfWeekStart)) {
                    options.dayOfWeekStart = 0;
                } else {
                    options.dayOfWeekStart = parseInt(options.dayOfWeekStart, 10) % 7;
                }

                if (!options.timepickerScrollbar) {
                    timeboxparent.xdsoftScroller('hide');
                }

                if (options.minDate && /^-(.*)$/.test(options.minDate)) {
                    options.minDate = _xdsoft_datetime.strToDateTime(options.minDate).dateFormat(options.formatDate);
                }

                if (options.maxDate &&  /^\+(.*)$/.test(options.maxDate)) {
                    options.maxDate = _xdsoft_datetime.strToDateTime(options.maxDate).dateFormat(options.formatDate);
                }

                mounth_picker
                    .find('.xdsoft_today_button')
                    .css('visibility', !options.todayButton ? 'hidden' : 'visible');

                if (options.mask) {
                    var e,
                        getCaretPos = function (input) {
                            try {
                                if (document.selection && document.selection.createRange) {
                                    var range = document.selection.createRange();
                                    return range.getBookmark().charCodeAt(2) - 2;
                                }
                                if (input.setSelectionRange) {
                                    return input.selectionStart;
                                }
                            } catch (e) {
                                return 0;
                            }
                        },
                        setCaretPos = function (node, pos) {
                            node = (typeof node === "string" || node instanceof String) ? document.getElementById(node) : node;
                            if (!node) {
                                return false;
                            }
                            if (node.createTextRange) {
                                var textRange = node.createTextRange();
                                textRange.collapse(true);
                                textRange.moveEnd('character', pos);
                                textRange.moveStart('character', pos);
                                textRange.select();
                                return true;
                            }
                            if (node.setSelectionRange) {
                                node.setSelectionRange(pos, pos);
                                return true;
                            }
                            return false;
                        },
                        isValidValue = function (mask, value) {
                            var reg = mask
                                .replace(/([\[\]\/\{\}\(\)\-\.\+]{1})/g, '\\$1')
                                .replace(/_/g, '{digit+}')
                                .replace(/([0-9]{1})/g, '{digit$1}')
                                .replace(/\{digit([0-9]{1})\}/g, '[0-$1_]{1}')
                                .replace(/\{digit[\+]\}/g, '[0-9_]{1}');
                            return (new RegExp(reg)).test(value);
                        };
                    input.off('keydown.xdsoft');

                    if (options.mask === true) {
                        options.mask = options.format
                            .replace(/Y/g, '9999')
                            .replace(/F/g, '9999')
                            .replace(/m/g, '19')
                            .replace(/d/g, '39')
                            .replace(/H/g, '29')
                            .replace(/i/g, '59')
                            .replace(/s/g, '59');
                    }

                    if ($.type(options.mask) === 'string') {
                        if (!isValidValue(options.mask, input.val())) {
                            input.val(options.mask.replace(/[0-9]/g, '_'));
                        }

                        input.on('keydown.xdsoft', function (event) {
                            var val = this.value,
                                key = event.which,
                                pos,
                                digit;

                            if (((key >= KEY0 && key <= KEY9) || (key >= _KEY0 && key <= _KEY9)) || (key === BACKSPACE || key === DEL)) {
                                pos = getCaretPos(this);
                                digit = (key !== BACKSPACE && key !== DEL) ? String.fromCharCode((_KEY0 <= key && key <= _KEY9) ? key - KEY0 : key) : '_';

                                if ((key === BACKSPACE || key === DEL) && pos) {
                                    pos -= 1;
                                    digit = '_';
                                }

                                while (/[^0-9_]/.test(options.mask.substr(pos, 1)) && pos < options.mask.length && pos > 0) {
                                    pos += (key === BACKSPACE || key === DEL) ? -1 : 1;
                                }

                                val = val.substr(0, pos) + digit + val.substr(pos + 1);
                                if ($.trim(val) === '') {
                                    val = options.mask.replace(/[0-9]/g, '_');
                                } else {
                                    if (pos === options.mask.length) {
                                        event.preventDefault();
                                        return false;
                                    }
                                }

                                pos += (key === BACKSPACE || key === DEL) ? 0 : 1;
                                while (/[^0-9_]/.test(options.mask.substr(pos, 1)) && pos < options.mask.length && pos > 0) {
                                    pos += (key === BACKSPACE || key === DEL) ? -1 : 1;
                                }

                                if (isValidValue(options.mask, val)) {
                                    this.value = val;
                                    setCaretPos(this, pos);
                                } else if ($.trim(val) === '') {
                                    this.value = options.mask.replace(/[0-9]/g, '_');
                                } else {
                                    input.trigger('error_input.xdsoft');
                                }
                            } else {
                                if (([AKEY, CKEY, VKEY, ZKEY, YKEY].indexOf(key) !== -1 && ctrlDown) || [ESC, ARROWUP, ARROWDOWN, ARROWLEFT, ARROWRIGHT, F5, CTRLKEY, TAB, ENTER].indexOf(key) !== -1) {
                                    return true;
                                }
                            }

                            event.preventDefault();
                            return false;
                        });
                    }
                }
                if (options.validateOnBlur) {
                    input
                        .off('blur.xdsoft')
                        .on('blur.xdsoft', function () {
                            if (options.allowBlank && !$.trim($(this).val()).length) {
                                $(this).val(null);
                                datetimepicker.data('xdsoft_datetime').empty();
                            } else if (!Date.parseDate($(this).val(), options.format)) {
                                $(this).val((_xdsoft_datetime.now()).dateFormat(options.format));
                                datetimepicker.data('xdsoft_datetime').setCurrentTime($(this).val());
                            } else {
                                datetimepicker.data('xdsoft_datetime').setCurrentTime($(this).val());
                            }
                            datetimepicker.trigger('changedatetime.xdsoft');
                        });
                }
                options.dayOfWeekStartPrev = (options.dayOfWeekStart === 0) ? 6 : options.dayOfWeekStart - 1;

                datetimepicker
                    .trigger('xchange.xdsoft')
                    .trigger('afterOpen.xdsoft');
            };

            datetimepicker
                .data('options', options)
                .on('mousedown.xdsoft', function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                    yearselect.hide();
                    monthselect.hide();
                    return false;
                });

            //scroll_element = timepicker.find('.xdsoft_time_box');
            timeboxparent.append(timebox);
            timeboxparent.xdsoftScroller();

            datetimepicker.on('afterOpen.xdsoft', function () {
                timeboxparent.xdsoftScroller();
            });

            datetimepicker
                .append(datepicker)
                .append(timepicker);

            if (options.withoutCopyright !== true) {
                datetimepicker
                    .append(xdsoft_copyright);
            }

            datepicker
                .append(mounth_picker)
                .append(calendar);

            $(options.parentID)
                .append(datetimepicker);

            XDSoft_datetime = function () {
                var _this = this;
                _this.now = function (norecursion) {
                    var d = new Date(),
                        date,
                        time;

                    if (!norecursion && options.defaultDate) {
                        date = _this.strToDate(options.defaultDate);
                        d.setFullYear(date.getFullYear());
                        d.setMonth(date.getMonth());
                        d.setDate(date.getDate());
                    }

                    if (options.yearOffset) {
                        d.setFullYear(d.getFullYear() + options.yearOffset);
                    }

                    if (!norecursion && options.defaultTime) {
                        time = _this.strtotime(options.defaultTime);
                        d.setHours(time.getHours());
                        d.setMinutes(time.getMinutes());
                    }

                    return d;
                };

                _this.isValidDate = function (d) {
                    if (Object.prototype.toString.call(d) !== "[object Date]") {
                        return false;
                    }
                    return !isNaN(d.getTime());
                };

                _this.setCurrentTime = function (dTime) {
                    _this.currentTime = (typeof dTime === 'string') ? _this.strToDateTime(dTime) : _this.isValidDate(dTime) ? dTime : _this.now();
                    datetimepicker.trigger('xchange.xdsoft');
                };

                _this.empty = function () {
                    _this.currentTime = null;
                };

                _this.getCurrentTime = function (dTime) {
                    return _this.currentTime;
                };

                _this.nextMonth = function () {
                    var month = _this.currentTime.getMonth() + 1,
                        year;
                    if (month === 12) {
                        _this.currentTime.setFullYear(_this.currentTime.getFullYear() + 1);
                        month = 0;
                    }

                    year = _this.currentTime.getFullYear();

                    _this.currentTime.setDate(
                        Math.min(
                            new Date(_this.currentTime.getFullYear(), month + 1, 0).getDate(),
                            _this.currentTime.getDate()
                        )
                    );
                    _this.currentTime.setMonth(month);

                    if (options.onChangeMonth && $.isFunction(options.onChangeMonth)) {
                        options.onChangeMonth.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'));
                    }

                    if (year !== _this.currentTime.getFullYear() && $.isFunction(options.onChangeYear)) {
                        options.onChangeYear.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'));
                    }

                    datetimepicker.trigger('xchange.xdsoft');
                    return month;
                };

                _this.prevMonth = function () {
                    var month = _this.currentTime.getMonth() - 1;
                    if (month === -1) {
                        _this.currentTime.setFullYear(_this.currentTime.getFullYear() - 1);
                        month = 11;
                    }
                    _this.currentTime.setDate(
                        Math.min(
                            new Date(_this.currentTime.getFullYear(), month + 1, 0).getDate(),
                            _this.currentTime.getDate()
                        )
                    );
                    _this.currentTime.setMonth(month);
                    if (options.onChangeMonth && $.isFunction(options.onChangeMonth)) {
                        options.onChangeMonth.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'));
                    }
                    datetimepicker.trigger('xchange.xdsoft');
                    return month;
                };

                _this.getWeekOfYear = function (datetime) {
                    var onejan = new Date(datetime.getFullYear(), 0, 1);
                    return Math.ceil((((datetime - onejan) / 86400000) + onejan.getDay() + 1) / 7);
                };

                _this.strToDateTime = function (sDateTime) {
                    var tmpDate = [], timeOffset, currentTime;

                    if (sDateTime && sDateTime instanceof Date && _this.isValidDate(sDateTime)) {
                        return sDateTime;
                    }

                    tmpDate = /^(\+|\-)(.*)$/.exec(sDateTime);
                    if (tmpDate) {
                        tmpDate[2] = Date.parseDate(tmpDate[2], options.formatDate);
                    }
                    if (tmpDate  && tmpDate[2]) {
                        timeOffset = tmpDate[2].getTime() - (tmpDate[2].getTimezoneOffset()) * 60000;
                        currentTime = new Date((_xdsoft_datetime.now()).getTime() + parseInt(tmpDate[1] + '1', 10) * timeOffset);
                    } else {
                        currentTime = sDateTime ? Date.parseDate(sDateTime, options.format) : _this.now();
                    }

                    if (!_this.isValidDate(currentTime)) {
                        currentTime = _this.now();
                    }

                    return currentTime;
                };

                _this.strToDate = function (sDate) {
                    if (sDate && sDate instanceof Date && _this.isValidDate(sDate)) {
                        return sDate;
                    }

                    var currentTime = sDate ? Date.parseDate(sDate, options.formatDate) : _this.now(true);
                    if (!_this.isValidDate(currentTime)) {
                        currentTime = _this.now(true);
                    }
                    return currentTime;
                };

                _this.strtotime = function (sTime) {
                    if (sTime && sTime instanceof Date && _this.isValidDate(sTime)) {
                        return sTime;
                    }
                    var currentTime = sTime ? Date.parseDate(sTime, options.formatTime) : _this.now(true);
                    if (!_this.isValidDate(currentTime)) {
                        currentTime = _this.now(true);
                    }
                    return currentTime;
                };

                _this.str = function () {
                    return _this.currentTime.dateFormat(options.format);
                };
                _this.currentTime = this.now();
            };

            _xdsoft_datetime = new XDSoft_datetime();

            mounth_picker
                .find('.xdsoft_today_button')
                .on('mousedown.xdsoft', function () {
                    datetimepicker.data('changed', true);
                    _xdsoft_datetime.setCurrentTime(0);
                    datetimepicker.trigger('afterOpen.xdsoft');
                }).on('dblclick.xdsoft', function () {
                    input.val(_xdsoft_datetime.str());
                    datetimepicker.trigger('close.xdsoft');
                });
            mounth_picker
                .find('.xdsoft_prev,.xdsoft_next')
                .on('mousedown.xdsoft', function () {
                    var $this = $(this),
                        timer = 0,
                        stop = false;

                    (function arguments_callee1(v) {
                        var month =  _xdsoft_datetime.currentTime.getMonth();
                        if ($this.hasClass(options.next)) {
                            _xdsoft_datetime.nextMonth();
                        } else if ($this.hasClass(options.prev)) {
                            _xdsoft_datetime.prevMonth();
                        }
                        if (options.monthChangeSpinner) {
                            if (!stop) {
                                timer = setTimeout(arguments_callee1, v || 100);
                            }
                        }
                    }(500));

                    $([document.body, window]).on('mouseup.xdsoft', function arguments_callee2() {
                        clearTimeout(timer);
                        stop = true;
                        $([document.body, window]).off('mouseup.xdsoft', arguments_callee2);
                    });
                });

            timepicker
                .find('.xdsoft_prev,.xdsoft_next')
                .on('mousedown.xdsoft', function () {
                    var $this = $(this),
                        timer = 0,
                        stop = false,
                        period = 110;
                    (function arguments_callee4(v) {
                        var pheight = timeboxparent[0].clientHeight,
                            height = timebox[0].offsetHeight,
                            top = Math.abs(parseInt(timebox.css('marginTop'), 10));
                        if ($this.hasClass(options.next) && (height - pheight) - options.timeHeightInTimePicker >= top) {
                            timebox.css('marginTop', '-' + (top + options.timeHeightInTimePicker) + 'px');
                        } else if ($this.hasClass(options.prev) && top - options.timeHeightInTimePicker >= 0) {
                            timebox.css('marginTop', '-' + (top - options.timeHeightInTimePicker) + 'px');
                        }
                        timeboxparent.trigger('scroll_element.xdsoft_scroller', [Math.abs(parseInt(timebox.css('marginTop'), 10) / (height - pheight))]);
                        period = (period > 10) ? 10 : period - 10;
                        if (!stop) {
                            timer = setTimeout(arguments_callee4, v || period);
                        }
                    }(500));
                    $([document.body, window]).on('mouseup.xdsoft', function arguments_callee5() {
                        clearTimeout(timer);
                        stop = true;
                        $([document.body, window])
                            .off('mouseup.xdsoft', arguments_callee5);
                    });
                });

            xchangeTimer = 0;
            // base handler - generating a calendar and timepicker
            datetimepicker
                .on('xchange.xdsoft', function (event) {
                    clearTimeout(xchangeTimer);
                    xchangeTimer = setTimeout(function () {
                        var table =	'',
                            start = new Date(_xdsoft_datetime.currentTime.getFullYear(), _xdsoft_datetime.currentTime.getMonth(), 1, 12, 0, 0),
                            i = 0,
                            j,
                            today = _xdsoft_datetime.now(),
                            maxDate = false,
                            minDate = false,
                            d,
                            y,
                            m,
                            w,
                            classes = [],
                            customDateSettings,
                            newRow = true,
                            time = '',
                            h = '',
                            line_time;

                        while (start.getDay() !== options.dayOfWeekStart) {
                            start.setDate(start.getDate() - 1);
                        }

                        table += '<table><thead><tr>';

                        if (options.weeks) {
                            table += '<th></th>';
                        }

                        for (j = 0; j < 7; j += 1) {
                            table += '<th>' + options.i18n[options.lang].dayOfWeek[(j + options.dayOfWeekStart) % 7] + '</th>';
                        }

                        table += '</tr></thead>';
                        table += '<tbody>';

                        if (options.maxDate !== false) {
                            maxDate = _xdsoft_datetime.strToDate(options.maxDate);
                            maxDate = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate(), 23, 59, 59, 999);
                        }

                        if (options.minDate !== false) {
                            minDate = _xdsoft_datetime.strToDate(options.minDate);
                            minDate = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
                        }

                        while (i < _xdsoft_datetime.currentTime.countDaysInMonth() || start.getDay() !== options.dayOfWeekStart || _xdsoft_datetime.currentTime.getMonth() === start.getMonth()) {
                            classes = [];
                            i += 1;

                            d = start.getDate();
                            y = start.getFullYear();
                            m = start.getMonth();
                            w = _xdsoft_datetime.getWeekOfYear(start);

                            classes.push('xdsoft_date');

                            if (options.beforeShowDay && $.isFunction(options.beforeShowDay.call)) {
                                customDateSettings = options.beforeShowDay.call(datetimepicker, start);
                            } else {
                                customDateSettings = null;
                            }

                            if ((maxDate !== false && start > maxDate) || (minDate !== false && start < minDate) || (customDateSettings && customDateSettings[0] === false)) {
                                classes.push('xdsoft_disabled');
                            } else if (options.disabledDates.indexOf(start.dateFormat(options.formatDate)) !== -1) {
                                classes.push('xdsoft_disabled');
                            }

                            if (customDateSettings && customDateSettings[1] !== "") {
                                classes.push(customDateSettings[1]);
                            }

                            if (_xdsoft_datetime.currentTime.getMonth() !== m) {
                                classes.push('xdsoft_other_month');
                            }

                            if ((options.defaultSelect || datetimepicker.data('changed')) && _xdsoft_datetime.currentTime.dateFormat(options.formatDate) === start.dateFormat(options.formatDate)) {
                                classes.push('xdsoft_current');
                            }

                            if (today.dateFormat(options.formatDate) === start.dateFormat(options.formatDate)) {
                                classes.push('xdsoft_today');
                            }

                            if (start.getDay() === 0 || start.getDay() === 6 || ~options.weekends.indexOf(start.dateFormat(options.formatDate))) {
                                classes.push('xdsoft_weekend');
                            }

                            if (options.beforeShowDay && $.isFunction(options.beforeShowDay)) {
                                classes.push(options.beforeShowDay(start));
                            }

                            if (newRow) {
                                table += '<tr>';
                                newRow = false;
                                if (options.weeks) {
                                    table += '<th>' + w + '</th>';
                                }
                            }

                            table += '<td data-date="' + d + '" data-month="' + m + '" data-year="' + y + '"' + ' class="xdsoft_date xdsoft_day_of_week' + start.getDay() + ' ' + classes.join(' ') + '">' +
                            '<div>' + d + '</div>' +
                            '</td>';

                            if (start.getDay() === options.dayOfWeekStartPrev) {
                                table += '</tr>';
                                newRow = true;
                            }

                            start.setDate(d + 1);
                        }
                        table += '</tbody></table>';

                        calendar.html(table);

                        mounth_picker.find('.xdsoft_label span').eq(0).text(options.i18n[options.lang].months[_xdsoft_datetime.currentTime.getMonth()]);
                        mounth_picker.find('.xdsoft_label span').eq(1).text(_xdsoft_datetime.currentTime.getFullYear());

                        // generate timebox
                        time = '';
                        h = '';
                        m = '';
                        line_time = function line_time(h, m) {
                            var now = _xdsoft_datetime.now();
                            now.setHours(h);
                            h = parseInt(now.getHours(), 10);
                            now.setMinutes(m);
                            m = parseInt(now.getMinutes(), 10);
                            var optionDateTime = new Date(_xdsoft_datetime.currentTime)
                            optionDateTime.setHours(h);
                            optionDateTime.setMinutes(m);
                            classes = [];
                            if((options.minDateTime !== false && options.minDateTime > optionDateTime) || (options.maxTime !== false && _xdsoft_datetime.strtotime(options.maxTime).getTime() < now.getTime()) || (options.minTime !== false && _xdsoft_datetime.strtotime(options.minTime).getTime() > now.getTime())) {
                                classes.push('xdsoft_disabled');
                            }
                            if ((options.initTime || options.defaultSelect || datetimepicker.data('changed')) && parseInt(_xdsoft_datetime.currentTime.getHours(), 10) === parseInt(h, 10) && (options.step > 59 || Math[options.roundTime](_xdsoft_datetime.currentTime.getMinutes() / options.step) * options.step === parseInt(m, 10))) {
                                if (options.defaultSelect || datetimepicker.data('changed')) {
                                    classes.push('xdsoft_current');
                                } else if (options.initTime) {
                                    classes.push('xdsoft_init_time');
                                }
                            }
                            if (parseInt(today.getHours(), 10) === parseInt(h, 10) && parseInt(today.getMinutes(), 10) === parseInt(m, 10)) {
                                classes.push('xdsoft_today');
                            }
                            time += '<div class="xdsoft_time ' + classes.join(' ') + '" data-hour="' + h + '" data-minute="' + m + '">' + now.dateFormat(options.formatTime) + '</div>';
                        };

                        if (!options.allowTimes || !$.isArray(options.allowTimes) || !options.allowTimes.length) {
                            for (i = 0, j = 0; i < (options.hours12 ? 12 : 24); i += 1) {
                                for (j = 0; j < 60; j += options.step) {
                                    h = (i < 10 ? '0' : '') + i;
                                    m = (j < 10 ? '0' : '') + j;
                                    line_time(h, m);
                                }
                            }
                        } else {
                            for (i = 0; i < options.allowTimes.length; i += 1) {
                                h = _xdsoft_datetime.strtotime(options.allowTimes[i]).getHours();
                                m = _xdsoft_datetime.strtotime(options.allowTimes[i]).getMinutes();
                                line_time(h, m);
                            }
                        }

                        timebox.html(time);

                        opt = '';
                        i = 0;

                        for (i = parseInt(options.yearStart, 10) + options.yearOffset; i <= parseInt(options.yearEnd, 10) + options.yearOffset; i += 1) {
                            opt += '<div class="xdsoft_option ' + (_xdsoft_datetime.currentTime.getFullYear() === i ? 'xdsoft_current' : '') + '" data-value="' + i + '">' + i + '</div>';
                        }
                        yearselect.children().eq(0)
                            .html(opt);

                        for (i = 0, opt = ''; i <= 11; i += 1) {
                            opt += '<div class="xdsoft_option ' + (_xdsoft_datetime.currentTime.getMonth() === i ? 'xdsoft_current' : '') + '" data-value="' + i + '">' + options.i18n[options.lang].months[i] + '</div>';
                        }
                        monthselect.children().eq(0).html(opt);
                        $(datetimepicker)
                            .trigger('generate.xdsoft');
                    }, 10);
                    event.stopPropagation();
                })
                .on('afterOpen.xdsoft', function () {
                    if (options.timepicker) {
                        var classType, pheight, height, top;
                        if (timebox.find('.xdsoft_current').length) {
                            classType = '.xdsoft_current';
                        } else if (timebox.find('.xdsoft_init_time').length) {
                            classType = '.xdsoft_init_time';
                        }
                        if (classType) {
                            pheight = timeboxparent[0].clientHeight;
                            height = timebox[0].offsetHeight;
                            top = timebox.find(classType).index() * options.timeHeightInTimePicker + 1;
                            if ((height - pheight) < top) {
                                top = height - pheight;
                            }
                            timeboxparent.trigger('scroll_element.xdsoft_scroller', [parseInt(top, 10) / (height - pheight)]);
                        } else {
                            timeboxparent.trigger('scroll_element.xdsoft_scroller', [0]);
                        }
                    }
                });

            timerclick = 0;
            calendar
                .on('click.xdsoft', 'td', function (xdevent) {
                    xdevent.stopPropagation();  // Prevents closing of Pop-ups, Modals and Flyouts in Bootstrap
                    timerclick += 1;
                    var $this = $(this),
                        currentTime = _xdsoft_datetime.currentTime;

                    if (currentTime === undefined || currentTime === null) {
                        _xdsoft_datetime.currentTime = _xdsoft_datetime.now();
                        currentTime = _xdsoft_datetime.currentTime;
                    }

                    if ($this.hasClass('xdsoft_disabled')) {
                        return false;
                    }

                    currentTime.setDate(1);
                    currentTime.setFullYear($this.data('year'));
                    currentTime.setMonth($this.data('month'));
                    currentTime.setDate($this.data('date'));

                    datetimepicker.trigger('select.xdsoft', [currentTime]);

                    input.val(_xdsoft_datetime.str());
                    if ((timerclick > 1 || (options.closeOnDateSelect === true || (options.closeOnDateSelect === 0 && !options.timepicker))) && !options.inline) {
                        datetimepicker.trigger('close.xdsoft');
                    }

                    if (options.onSelectDate &&	$.isFunction(options.onSelectDate)) {
                        options.onSelectDate.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'), xdevent);
                    }

                    datetimepicker.data('changed', true);
                    datetimepicker.trigger('xchange.xdsoft');
                    datetimepicker.trigger('changedatetime.xdsoft');
                    setTimeout(function () {
                        timerclick = 0;
                    }, 200);
                });

            timebox
                .on('click.xdsoft', 'div', function (xdevent) {
                    xdevent.stopPropagation();
                    var $this = $(this),
                        currentTime = _xdsoft_datetime.currentTime;

                    if (currentTime === undefined || currentTime === null) {
                        _xdsoft_datetime.currentTime = _xdsoft_datetime.now();
                        currentTime = _xdsoft_datetime.currentTime;
                    }

                    if ($this.hasClass('xdsoft_disabled')) {
                        return false;
                    }
                    currentTime.setHours($this.data('hour'));
                    currentTime.setMinutes($this.data('minute'));
                    datetimepicker.trigger('select.xdsoft', [currentTime]);

                    datetimepicker.data('input').val(_xdsoft_datetime.str());
                    if (!options.inline) {
                        datetimepicker.trigger('close.xdsoft');
                    }

                    if (options.onSelectTime && $.isFunction(options.onSelectTime)) {
                        options.onSelectTime.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'), xdevent);
                    }
                    datetimepicker.data('changed', true);
                    datetimepicker.trigger('xchange.xdsoft');
                    datetimepicker.trigger('changedatetime.xdsoft');
                });


            datepicker
                .on('mousewheel.xdsoft', function (event) {
                    if (!options.scrollMonth) {
                        return true;
                    }
                    if (event.deltaY < 0) {
                        _xdsoft_datetime.nextMonth();
                    } else {
                        _xdsoft_datetime.prevMonth();
                    }
                    return false;
                });

            input
                .on('mousewheel.xdsoft', function (event) {
                    if (!options.scrollInput) {
                        return true;
                    }
                    if (!options.datepicker && options.timepicker) {
                        current_time_index = timebox.find('.xdsoft_current').length ? timebox.find('.xdsoft_current').eq(0).index() : 0;
                        if (current_time_index + event.deltaY >= 0 && current_time_index + event.deltaY < timebox.children().length) {
                            current_time_index += event.deltaY;
                        }
                        if (timebox.children().eq(current_time_index).length) {
                            timebox.children().eq(current_time_index).trigger('mousedown');
                        }
                        return false;
                    }
                    if (options.datepicker && !options.timepicker) {
                        datepicker.trigger(event, [event.deltaY, event.deltaX, event.deltaY]);
                        if (input.val) {
                            input.val(_xdsoft_datetime.str());
                        }
                        datetimepicker.trigger('changedatetime.xdsoft');
                        return false;
                    }
                });

            datetimepicker
                .on('changedatetime.xdsoft', function (event) {
                    if (options.onChangeDateTime && $.isFunction(options.onChangeDateTime)) {
                        var $input = datetimepicker.data('input');
                        options.onChangeDateTime.call(datetimepicker, _xdsoft_datetime.currentTime, $input, event);
                        delete options.value;
                        $input.trigger('change');
                    }
                })
                .on('generate.xdsoft', function () {
                    if (options.onGenerate && $.isFunction(options.onGenerate)) {
                        options.onGenerate.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'));
                    }
                    if (triggerAfterOpen) {
                        datetimepicker.trigger('afterOpen.xdsoft');
                        triggerAfterOpen = false;
                    }
                })
                .on('click.xdsoft', function (xdevent) {
                    xdevent.stopPropagation();
                });

            current_time_index = 0;

            setPos = function () {
                var offset = datetimepicker.data('input').offset(), top = offset.top + datetimepicker.data('input')[0].offsetHeight - 1, left = offset.left, position = "absolute";
                if (options.fixed) {
                    top -= $(window).scrollTop();
                    left -= $(window).scrollLeft();
                    position = "fixed";
                } else {
                    if (top + datetimepicker[0].offsetHeight > $(window).height() + $(window).scrollTop()) {
                        top = offset.top - datetimepicker[0].offsetHeight + 1;
                    }
                    if (top < 0) {
                        top = 0;
                    }
                    if (left + datetimepicker[0].offsetWidth > $(window).width()) {
                        left = $(window).width() - datetimepicker[0].offsetWidth;
                    }
                }
                datetimepicker.css({
                    left: left,
                    top: top,
                    position: position
                });
            };
            datetimepicker
                .on('open.xdsoft', function (event) {
                    var onShow = true;
                    if (options.onShow && $.isFunction(options.onShow)) {
                        onShow = options.onShow.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'), event);
                    }
                    if (onShow !== false) {
                        datetimepicker.show();
                        setPos();
                        $(window)
                            .off('resize.xdsoft', setPos)
                            .on('resize.xdsoft', setPos);

                        if (options.closeOnWithoutClick) {
                            $([document.body, window]).on('mousedown.xdsoft', function arguments_callee6() {
                                datetimepicker.trigger('close.xdsoft');
                                $([document.body, window]).off('mousedown.xdsoft', arguments_callee6);
                            });
                        }
                    }
                })
                .on('close.xdsoft', function (event) {
                    var onClose = true;
                    mounth_picker
                        .find('.xdsoft_month,.xdsoft_year')
                        .find('.xdsoft_select')
                        .hide();
                    if (options.onClose && $.isFunction(options.onClose)) {
                        onClose = options.onClose.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'), event);
                    }
                    if (onClose !== false && !options.opened && !options.inline) {
                        datetimepicker.hide();
                    }
                    event.stopPropagation();
                })
                .on('toggle.xdsoft', function (event) {
                    if (datetimepicker.is(':visible')) {
                        datetimepicker.trigger('close.xdsoft');
                    } else {
                        datetimepicker.trigger('open.xdsoft');
                    }
                })
                .data('input', input);

            timer = 0;
            timer1 = 0;

            datetimepicker.data('xdsoft_datetime', _xdsoft_datetime);
            datetimepicker.setOptions(options);

            function getCurrentValue() {

                var ct = false, time;

                if (options.startDate) {
                    ct = _xdsoft_datetime.strToDate(options.startDate);
                } else {
                    ct = options.value || ((input && input.val && input.val()) ? input.val() : '');
                    if (ct) {
                        ct = _xdsoft_datetime.strToDateTime(ct);
                    } else if (options.defaultDate) {
                        ct = _xdsoft_datetime.strToDate(options.defaultDate);
                        if (options.defaultTime) {
                            time = _xdsoft_datetime.strtotime(options.defaultTime);
                            ct.setHours(time.getHours());
                            ct.setMinutes(time.getMinutes());
                        }
                    }
                }

                if (ct && _xdsoft_datetime.isValidDate(ct)) {
                    datetimepicker.data('changed', true);
                } else {
                    ct = '';
                }

                return ct || 0;
            }

            _xdsoft_datetime.setCurrentTime(getCurrentValue());

            input
                .data('xdsoft_datetimepicker', datetimepicker)
                .on('open.xdsoft focusin.xdsoft mousedown.xdsoft', function (event) {
                    if (input.is(':disabled') || (input.data('xdsoft_datetimepicker').is(':visible') && options.closeOnInputClick)) {
                        return;
                    }
                    clearTimeout(timer);
                    timer = setTimeout(function () {
                        if (input.is(':disabled')) {
                            return;
                        }

                        triggerAfterOpen = true;
                        _xdsoft_datetime.setCurrentTime(getCurrentValue());

                        datetimepicker.trigger('open.xdsoft');
                    }, 100);
                })
                .on('keydown.xdsoft', function (event) {
                    var val = this.value, elementSelector,
                        key = event.which;
                    if ([ENTER].indexOf(key) !== -1 && options.enterLikeTab) {
                        elementSelector = $("input:visible,textarea:visible");
                        datetimepicker.trigger('close.xdsoft');
                        elementSelector.eq(elementSelector.index(this) + 1).focus();
                        return false;
                    }
                    if ([TAB].indexOf(key) !== -1) {
                        datetimepicker.trigger('close.xdsoft');
                        return true;
                    }
                });
        };
        destroyDateTimePicker = function (input) {
            var datetimepicker = input.data('xdsoft_datetimepicker');
            if (datetimepicker) {
                datetimepicker.data('xdsoft_datetime', null);
                datetimepicker.remove();
                input
                    .data('xdsoft_datetimepicker', null)
                    .off('.xdsoft');
                $(window).off('resize.xdsoft');
                $([window, document.body]).off('mousedown.xdsoft');
                if (input.unmousewheel) {
                    input.unmousewheel();
                }
            }
        };
        $(document)
            .off('keydown.xdsoftctrl keyup.xdsoftctrl')
            .on('keydown.xdsoftctrl', function (e) {
                if (e.keyCode === CTRLKEY) {
                    ctrlDown = true;
                }
            })
            .on('keyup.xdsoftctrl', function (e) {
                if (e.keyCode === CTRLKEY) {
                    ctrlDown = false;
                }
            });
        return this.each(function () {
            var datetimepicker = $(this).data('xdsoft_datetimepicker');
            if (datetimepicker) {
                if ($.type(opt) === 'string') {
                    switch (opt) {
                        case 'show':
                            $(this).select().focus();
                            datetimepicker.trigger('open.xdsoft');
                            break;
                        case 'hide':
                            datetimepicker.trigger('close.xdsoft');
                            break;
                        case 'toggle':
                            datetimepicker.trigger('toggle.xdsoft');
                            break;
                        case 'destroy':
                            destroyDateTimePicker($(this));
                            break;
                        case 'reset':
                            this.value = this.defaultValue;
                            if (!this.value || !datetimepicker.data('xdsoft_datetime').isValidDate(Date.parseDate(this.value, options.format))) {
                                datetimepicker.data('changed', false);
                            }
                            datetimepicker.data('xdsoft_datetime').setCurrentTime(this.value);
                            break;
                    }
                } else {
                    datetimepicker
                        .setOptions(opt);
                }
                return 0;
            }
            if ($.type(opt) !== 'string') {
                if (!options.lazyInit || options.open || options.inline) {
                    createDateTimePicker($(this));
                } else {
                    lazyInit($(this));
                }
            }
        });
    };
    $.fn.datetimepicker.defaults = default_options;
}(jQuery));
(function () {
    /*! Copyright (c) 2013 Brandon Aaron (http://brandon.aaron.sh)
     * Licensed under the MIT License (LICENSE.txt).
     *
     * Version: 3.1.12
     *
     * Requires: jQuery 1.2.2+
     */
    !function(a){"function"==typeof define&&define.amd?define(["jQuery"],a):"object"==typeof exports?module.exports=a:a(jQuery)}(function(a){function b(b){var g=b||window.event,h=i.call(arguments,1),j=0,l=0,m=0,n=0,o=0,p=0;if(b=a.event.fix(g),b.type="mousewheel","detail"in g&&(m=-1*g.detail),"wheelDelta"in g&&(m=g.wheelDelta),"wheelDeltaY"in g&&(m=g.wheelDeltaY),"wheelDeltaX"in g&&(l=-1*g.wheelDeltaX),"axis"in g&&g.axis===g.HORIZONTAL_AXIS&&(l=-1*m,m=0),j=0===m?l:m,"deltaY"in g&&(m=-1*g.deltaY,j=m),"deltaX"in g&&(l=g.deltaX,0===m&&(j=-1*l)),0!==m||0!==l){if(1===g.deltaMode){var q=a.data(this,"mousewheel-line-height");j*=q,m*=q,l*=q}else if(2===g.deltaMode){var r=a.data(this,"mousewheel-page-height");j*=r,m*=r,l*=r}if(n=Math.max(Math.abs(m),Math.abs(l)),(!f||f>n)&&(f=n,d(g,n)&&(f/=40)),d(g,n)&&(j/=40,l/=40,m/=40),j=Math[j>=1?"floor":"ceil"](j/f),l=Math[l>=1?"floor":"ceil"](l/f),m=Math[m>=1?"floor":"ceil"](m/f),k.settings.normalizeOffset&&this.getBoundingClientRect){var s=this.getBoundingClientRect();o=b.clientX-s.left,p=b.clientY-s.top}return b.deltaX=l,b.deltaY=m,b.deltaFactor=f,b.offsetX=o,b.offsetY=p,b.deltaMode=0,h.unshift(b,j,l,m),e&&clearTimeout(e),e=setTimeout(c,200),(a.event.dispatch||a.event.handle).apply(this,h)}}function c(){f=null}function d(a,b){return k.settings.adjustOldDeltas&&"mousewheel"===a.type&&b%120===0}var e,f,g=["wheel","mousewheel","DOMMouseScroll","MozMousePixelScroll"],h="onwheel"in document||document.documentMode>=9?["wheel"]:["mousewheel","DomMouseScroll","MozMousePixelScroll"],i=Array.prototype.slice;if(a.event.fixHooks)for(var j=g.length;j;)a.event.fixHooks[g[--j]]=a.event.mouseHooks;var k=a.event.special.mousewheel={version:"3.1.12",setup:function(){if(this.addEventListener)for(var c=h.length;c;)this.addEventListener(h[--c],b,!1);else this.onmousewheel=b;a.data(this,"mousewheel-line-height",k.getLineHeight(this)),a.data(this,"mousewheel-page-height",k.getPageHeight(this))},teardown:function(){if(this.removeEventListener)for(var c=h.length;c;)this.removeEventListener(h[--c],b,!1);else this.onmousewheel=null;a.removeData(this,"mousewheel-line-height"),a.removeData(this,"mousewheel-page-height")},getLineHeight:function(b){var c=a(b),d=c["offsetParent"in a.fn?"offsetParent":"parent"]();return d.length||(d=a("body")),parseInt(d.css("fontSize"),10)||parseInt(c.css("fontSize"),10)||16},getPageHeight:function(b){return a(b).height()},settings:{adjustOldDeltas:!0,normalizeOffset:!0}};a.fn.extend({mousewheel:function(a){return a?this.bind("mousewheel",a):this.trigger("mousewheel")},unmousewheel:function(a){return this.unbind("mousewheel",a)}})});

// Parse and Format Library
//http://www.xaprb.com/blog/2005/12/12/javascript-closures-for-runtime-efficiency/
    /*
     * Copyright (C) 2004 Baron Schwartz <baron at sequent dot org>
     *
     * This program is free software; you can redistribute it and/or modify it
     * under the terms of the GNU Lesser General Public License as published by the
     * Free Software Foundation, version 2.1.
     *
     * This program is distributed in the hope that it will be useful, but WITHOUT
     * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
     * FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more
     * details.
     */
    Date.parseFunctions={count:0};Date.parseRegexes=[];Date.formatFunctions={count:0};Date.prototype.dateFormat=function(b){if(b=="unixtime"){return parseInt(this.getTime()/1000);}if(Date.formatFunctions[b]==null){Date.createNewFormat(b);}var a=Date.formatFunctions[b];return this[a]();};Date.createNewFormat=function(format){var funcName="format"+Date.formatFunctions.count++;Date.formatFunctions[format]=funcName;var code="Date.prototype."+funcName+" = function() {return ";var special=false;var ch="";for(var i=0;i<format.length;++i){ch=format.charAt(i);if(!special&&ch=="\\"){special=true;}else{if(special){special=false;code+="'"+String.escape(ch)+"' + ";}else{code+=Date.getFormatCode(ch);}}}eval(code.substring(0,code.length-3)+";}");};Date.getFormatCode=function(a){switch(a){case"d":return"String.leftPad(this.getDate(), 2, '0') + ";case"D":return"Date.dayNames[this.getDay()].substring(0, 3) + ";case"j":return"this.getDate() + ";case"l":return"Date.dayNames[this.getDay()] + ";case"S":return"this.getSuffix() + ";case"w":return"this.getDay() + ";case"z":return"this.getDayOfYear() + ";case"W":return"this.getWeekOfYear() + ";case"F":return"Date.monthNames[this.getMonth()] + ";case"m":return"String.leftPad(this.getMonth() + 1, 2, '0') + ";case"M":return"Date.monthNames[this.getMonth()].substring(0, 3) + ";case"n":return"(this.getMonth() + 1) + ";case"t":return"this.getDaysInMonth() + ";case"L":return"(this.isLeapYear() ? 1 : 0) + ";case"Y":return"this.getFullYear() + ";case"y":return"('' + this.getFullYear()).substring(2, 4) + ";case"a":return"(this.getHours() < 12 ? 'am' : 'pm') + ";case"A":return"(this.getHours() < 12 ? 'AM' : 'PM') + ";case"g":return"((this.getHours() %12) ? this.getHours() % 12 : 12) + ";case"G":return"this.getHours() + ";case"h":return"String.leftPad((this.getHours() %12) ? this.getHours() % 12 : 12, 2, '0') + ";case"H":return"String.leftPad(this.getHours(), 2, '0') + ";case"i":return"String.leftPad(this.getMinutes(), 2, '0') + ";case"s":return"String.leftPad(this.getSeconds(), 2, '0') + ";case"O":return"this.getGMTOffset() + ";case"T":return"this.getTimezone() + ";case"Z":return"(this.getTimezoneOffset() * -60) + ";default:return"'"+String.escape(a)+"' + ";}};Date.parseDate=function(a,c){if(c=="unixtime"){return new Date(!isNaN(parseInt(a))?parseInt(a)*1000:0);}if(Date.parseFunctions[c]==null){Date.createParser(c);}var b=Date.parseFunctions[c];return Date[b](a);};Date.createParser=function(format){var funcName="parse"+Date.parseFunctions.count++;var regexNum=Date.parseRegexes.length;var currentGroup=1;Date.parseFunctions[format]=funcName;var code="Date."+funcName+" = function(input) {\nvar y = -1, m = -1, d = -1, h = -1, i = -1, s = -1, z = -1;\nvar d = new Date();\ny = d.getFullYear();\nm = d.getMonth();\nd = d.getDate();\nvar results = input.match(Date.parseRegexes["+regexNum+"]);\nif (results && results.length > 0) {";var regex="";var special=false;var ch="";for(var i=0;i<format.length;++i){ch=format.charAt(i);if(!special&&ch=="\\"){special=true;}else{if(special){special=false;regex+=String.escape(ch);}else{obj=Date.formatCodeToRegex(ch,currentGroup);currentGroup+=obj.g;regex+=obj.s;if(obj.g&&obj.c){code+=obj.c;}}}}code+="if (y > 0 && z > 0){\nvar doyDate = new Date(y,0);\ndoyDate.setDate(z);\nm = doyDate.getMonth();\nd = doyDate.getDate();\n}";code+="if (y > 0 && m >= 0 && d > 0 && h >= 0 && i >= 0 && s >= 0)\n{return new Date(y, m, d, h, i, s);}\nelse if (y > 0 && m >= 0 && d > 0 && h >= 0 && i >= 0)\n{return new Date(y, m, d, h, i);}\nelse if (y > 0 && m >= 0 && d > 0 && h >= 0)\n{return new Date(y, m, d, h);}\nelse if (y > 0 && m >= 0 && d > 0)\n{return new Date(y, m, d);}\nelse if (y > 0 && m >= 0)\n{return new Date(y, m);}\nelse if (y > 0)\n{return new Date(y);}\n}return null;}";Date.parseRegexes[regexNum]=new RegExp("^"+regex+"$");eval(code);};Date.formatCodeToRegex=function(b,a){switch(b){case"D":return{g:0,c:null,s:"(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat)"};case"j":case"d":return{g:1,c:"d = parseInt(results["+a+"], 10);\n",s:"(\\d{1,2})"};case"l":return{g:0,c:null,s:"(?:"+Date.dayNames.join("|")+")"};case"S":return{g:0,c:null,s:"(?:st|nd|rd|th)"};case"w":return{g:0,c:null,s:"\\d"};case"z":return{g:1,c:"z = parseInt(results["+a+"], 10);\n",s:"(\\d{1,3})"};case"W":return{g:0,c:null,s:"(?:\\d{2})"};case"F":return{g:1,c:"m = parseInt(Date.monthNumbers[results["+a+"].substring(0, 3)], 10);\n",s:"("+Date.monthNames.join("|")+")"};case"M":return{g:1,c:"m = parseInt(Date.monthNumbers[results["+a+"]], 10);\n",s:"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"};case"n":case"m":return{g:1,c:"m = parseInt(results["+a+"], 10) - 1;\n",s:"(\\d{1,2})"};case"t":return{g:0,c:null,s:"\\d{1,2}"};case"L":return{g:0,c:null,s:"(?:1|0)"};case"Y":return{g:1,c:"y = parseInt(results["+a+"], 10);\n",s:"(\\d{4})"};case"y":return{g:1,c:"var ty = parseInt(results["+a+"], 10);\ny = ty > Date.y2kYear ? 1900 + ty : 2000 + ty;\n",s:"(\\d{1,2})"};case"a":return{g:1,c:"if (results["+a+"] == 'am') {\nif (h == 12) { h = 0; }\n} else { if (h < 12) { h += 12; }}",s:"(am|pm)"};case"A":return{g:1,c:"if (results["+a+"] == 'AM') {\nif (h == 12) { h = 0; }\n} else { if (h < 12) { h += 12; }}",s:"(AM|PM)"};case"g":case"G":case"h":case"H":return{g:1,c:"h = parseInt(results["+a+"], 10);\n",s:"(\\d{1,2})"};case"i":return{g:1,c:"i = parseInt(results["+a+"], 10);\n",s:"(\\d{2})"};case"s":return{g:1,c:"s = parseInt(results["+a+"], 10);\n",s:"(\\d{2})"};case"O":return{g:0,c:null,s:"[+-]\\d{4}"};case"T":return{g:0,c:null,s:"[A-Z]{3}"};case"Z":return{g:0,c:null,s:"[+-]\\d{1,5}"};default:return{g:0,c:null,s:String.escape(b)};}};Date.prototype.getTimezone=function(){return this.toString().replace(/^.*? ([A-Z]{3}) [0-9]{4}.*$/,"$1").replace(/^.*?\(([A-Z])[a-z]+ ([A-Z])[a-z]+ ([A-Z])[a-z]+\)$/,"$1$2$3");};Date.prototype.getGMTOffset=function(){return(this.getTimezoneOffset()>0?"-":"+")+String.leftPad(Math.floor(Math.abs(this.getTimezoneOffset())/60),2,"0")+String.leftPad(Math.abs(this.getTimezoneOffset())%60,2,"0");};Date.prototype.getDayOfYear=function(){var a=0;Date.daysInMonth[1]=this.isLeapYear()?29:28;for(var b=0;b<this.getMonth();++b){a+=Date.daysInMonth[b];}return a+this.getDate();};Date.prototype.getWeekOfYear=function(){var b=this.getDayOfYear()+(4-this.getDay());var a=new Date(this.getFullYear(),0,1);var c=(7-a.getDay()+4);return String.leftPad(Math.ceil((b-c)/7)+1,2,"0");};Date.prototype.isLeapYear=function(){var a=this.getFullYear();return((a&3)==0&&(a%100||(a%400==0&&a)));};Date.prototype.getFirstDayOfMonth=function(){var a=(this.getDay()-(this.getDate()-1))%7;return(a<0)?(a+7):a;};Date.prototype.getLastDayOfMonth=function(){var a=(this.getDay()+(Date.daysInMonth[this.getMonth()]-this.getDate()))%7;return(a<0)?(a+7):a;};Date.prototype.getDaysInMonth=function(){Date.daysInMonth[1]=this.isLeapYear()?29:28;return Date.daysInMonth[this.getMonth()];};Date.prototype.getSuffix=function(){switch(this.getDate()){case 1:case 21:case 31:return"st";case 2:case 22:return"nd";case 3:case 23:return"rd";default:return"th";}};String.escape=function(a){return a.replace(/('|\\)/g,"\\$1");};String.leftPad=function(d,b,c){var a=new String(d);if(c==null){c=" ";}while(a.length<b){a=c+a;}return a;};Date.daysInMonth=[31,28,31,30,31,30,31,31,30,31,30,31];Date.monthNames=["January","February","March","April","May","June","July","August","September","October","November","December"];Date.dayNames=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];Date.y2kYear=50;Date.monthNumbers={Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};Date.patterns={ISO8601LongPattern:"Y-m-d H:i:s",ISO8601ShortPattern:"Y-m-d",ShortDatePattern:"n/j/Y",LongDatePattern:"l, F d, Y",FullDateTimePattern:"l, F d, Y g:i:s A",MonthDayPattern:"F d",ShortTimePattern:"g:i A",LongTimePattern:"g:i:s A",SortableDateTimePattern:"Y-m-d\\TH:i:s",UniversalSortableDateTimePattern:"Y-m-d H:i:sO",YearMonthPattern:"F, Y"};
}());
})(n2);
;
(function (factory) {
    factory(n2);
}
(function ($) {
    "use strict";

    var pluginName = "tinyscrollbar", defaults =
        {
            axis: 'y'    // Vertical or horizontal scrollbar? ( x || y ).
            , wheel: true   // Enable or disable the mousewheel;
            , wheelSpeed: 40     // How many pixels must the mouswheel scroll at a time.
            , wheelLock: true   // Lock default scrolling window when there is no more content.
            , scrollInvert: false  // Enable invert style scrolling
            , trackSize: false  // Set the size of the scrollbar to auto or a fixed number.
            , thumbSize: false  // Set the size of the thumb to auto or a fixed number
        }
        ;

    function Plugin($container, options) {
        this.options = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;

        var self = this, $viewport = $container.find(".viewport"), $overview = $container.find(".overview"), $scrollbar = $container.find(".scrollbar"), $track = $scrollbar.find(".track"), $thumb = $scrollbar.find(".thumb"), mousePosition = 0, isHorizontal = this.options.axis === 'x', hasTouchEvents = ("ontouchstart" in document.documentElement), wheelEvent = ("onwheel" in document || document.documentMode >= 9) ? "wheel" :
                (document.onmousewheel !== undefined ? "mousewheel" : "DOMMouseScroll"), sizeLabel = isHorizontal ? "width" : "height", posiLabel = isHorizontal ? (nextend.isRTL() ? "right" : "left") : "top"
            ;

        this.contentPosition = 0;
        this.viewportSize = 0;
        this.contentSize = 0;
        this.contentRatio = 0;
        this.trackSize = 0;
        this.trackRatio = 0;
        this.thumbSize = 0;
        this.thumbPosition = 0;

        function initialize() {
            self.update();
            setEvents();

            return self;
        }

        this.update = function (scrollTo) {
            var sizeLabelCap = sizeLabel.charAt(0).toUpperCase() + sizeLabel.slice(1).toLowerCase();
            this.viewportSize = $viewport[0]['offset' + sizeLabelCap];
            this.contentSize = $overview.width();
            this.contentRatio = this.viewportSize / this.contentSize;
            this.trackSize = $scrollbar.parent().width() || this.viewportSize;
            this.thumbSize = Math.min(this.trackSize, Math.max(0, (this.options.thumbSize || (this.trackSize * this.contentRatio))));
            this.trackRatio = this.options.thumbSize ? (this.contentSize - this.viewportSize) / (this.trackSize - this.thumbSize) : (this.contentSize / this.trackSize);
            mousePosition = $track.offset().top;

            $scrollbar.toggleClass("disable", this.contentRatio >= 1);
            switch (scrollTo) {
                case "bottom":
                    this.contentPosition = this.contentSize - this.viewportSize;
                    break;

                case "relative":
                    this.contentPosition = Math.min(Math.max(this.contentSize - this.viewportSize, 0), Math.max(0, this.contentPosition));
                    break;

                default:
                    this.contentPosition = parseInt(scrollTo, 10) || 0;
            }

            setSize();

            $container.trigger('scrollUpdate');

            return self;
        };

        function setSize() {
            $thumb.css(posiLabel, self.contentPosition / self.trackRatio);
            $overview.css(posiLabel, -self.contentPosition);
            $scrollbar.css(sizeLabel, self.trackSize);
            $track.css(sizeLabel, self.trackSize);
            $thumb.css(sizeLabel, self.thumbSize);
        }

        function setEvents() {
            if (hasTouchEvents) {
                $viewport[0].ontouchstart = function (event) {
                    if (1 === event.touches.length) {
                        event.stopPropagation();

                        start(event.touches[0]);
                    }
                };
            }
            else {
                $thumb.bind("mousedown", start);
                $track.bind("mousedown", drag);
            }

            $(window).resize(function () {
                self.update("relative");
            });

            if (self.options.wheel) {
                $container.on('mousewheel', wheel);
            }
        }

        function start(event) {
            $("body").addClass("noSelect");

            mousePosition = isHorizontal ? event.pageX : event.pageY;
            self.thumbPosition = parseInt($thumb.css(posiLabel), 10) || 0;

            if (hasTouchEvents) {
                document.ontouchmove = function (event) {
                    event.preventDefault();
                    drag(event.touches[0]);
                };
                document.ontouchend = end;
            }
            else {
                $(document).bind("mousemove", drag);
                $(document).bind("mouseup", end);
                $thumb.bind("mouseup", end);
            }
        }

        function wheel(event) {
            if (self.contentRatio < 1) {
                var evntObj = event,
                    deltaDir = "delta" + self.options.axis.toUpperCase(),
                    wheelSpeedDelta = evntObj.deltaY;

                self.contentPosition -= wheelSpeedDelta * self.options.wheelSpeed;
                self.contentPosition = Math.min((self.contentSize - self.viewportSize), Math.max(0, self.contentPosition));

                $container.trigger("move");

                $thumb.css(posiLabel, self.contentPosition / self.trackRatio);
                $overview.css(posiLabel, -self.contentPosition);

                if (self.options.wheelLock || (self.contentPosition !== (self.contentSize - self.viewportSize) && self.contentPosition !== 0)) {
                    evntObj = $.event.fix(evntObj);
                    evntObj.preventDefault();
                }
            }
        }

        function drag(event) {
            if (self.contentRatio < 1) {
                var mousePositionNew = isHorizontal ? event.pageX : event.pageY,
                    thumbPositionDelta = mousePositionNew - mousePosition;

                if (self.options.scrollInvert && hasTouchEvents) {
                    thumbPositionDelta = mousePosition - mousePositionNew;
                }

                if (nextend.isRTL()) {
                    thumbPositionDelta *= -1;
                }

                var thumbPositionNew = Math.min((self.trackSize - self.thumbSize), Math.max(0, self.thumbPosition + thumbPositionDelta));
                self.contentPosition = thumbPositionNew * self.trackRatio;

                $container.trigger("move");

                $thumb.css(posiLabel, thumbPositionNew);
                $overview.css(posiLabel, -self.contentPosition);
            }
        }

        function end() {
            $("body").removeClass("noSelect");
            $(document).unbind("mousemove", drag);
            $(document).unbind("mouseup", end);
            $thumb.unbind("mouseup", end);
            document.ontouchmove = document.ontouchend = null;
        }

        return initialize();
    }

    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin($(this), options));
            }
        });
    };
}));

/**
 * jquery.unique-element-id.js
 *
 * A simple jQuery plugin to get a unique ID for
 * any HTML element
 *
 * Usage:
 *    $('some_element_selector').uid();
 *
 * by Jamie Rumbelow <jamie@jamierumbelow.net>
 * http://jamieonsoftware.com
 * Copyright (c)2011 Jamie Rumbelow
 *
 * Licensed under the MIT license (http://www.opensource.org/licenses/MIT)
 */

(function ($) {
    /**
     * Generate a new unqiue ID
     */
    function generateUniqueId() {

        // Return a unique ID
        return "n" + Math.floor((1 + Math.random()) * 0x1000000000000)
                .toString(16);
    }

    /**
     * Get a unique ID for an element, ensuring that the
     * element has an id="" attribute
     */
    $.fn.uid = function () {
        var id = null;
        do {
            id = generateUniqueId();
        } while ($('#' + id).length > 0)
        return id;
    };
})(n2);
(function (smartSlider, $, scope, undefined) {

    function NextendAdminSinglePane(tab, mainPane) {
        this.loadDefaults();

        this.topOffset = $('#wpadminbar, .navbar-fixed-top').height();

        this.tab = tab;
        this.mainPane = mainPane;
    }

    NextendAdminSinglePane.prototype.loadDefaults = function () {
        this.ratio = 1;
        this.excludedHeight = 0;
    };

    NextendAdminSinglePane.prototype.lateInit = function () {
        this.calibrate();

        $(window).on('resize', $.proxy(this.resize, this));
        $(window).one('load', $.proxy(this.calibrate, this));
    };

    NextendAdminSinglePane.prototype.calibrate = function () {
        this.excludedHeight = this.getExcludedHeight();
        this.resize();
    };

    NextendAdminSinglePane.prototype.getExcludedHeight = function () {
        return 0;
    };

    NextendAdminSinglePane.prototype.resize = function () {
        this.targetHeight = window.innerHeight - this.topOffset - this.excludedHeight;
        this.changeRatio(this.ratio);
    };

    NextendAdminSinglePane.prototype.changeRatio = function (ratio) {
        this.mainPane.height(this.targetHeight);
    };

    scope.NextendAdminSinglePane = NextendAdminSinglePane;

    function NextendAdminVerticalPane(tab, mainPane, bottomPane) {

        NextendAdminSinglePane.prototype.constructor.apply(this, arguments);

        if (this.key) {
            this.ratio = $.jStorage.get(this.key, this.ratio);
        }

        this.bottomPane = bottomPane;
    }

    NextendAdminVerticalPane.prototype = Object.create(NextendAdminSinglePane.prototype);
    NextendAdminVerticalPane.prototype.constructor = NextendAdminVerticalPane;

    NextendAdminVerticalPane.prototype.loadDefaults = function () {

        NextendAdminSinglePane.prototype.loadDefaults.apply(this, arguments);

        this.key = false;
        this.ratio = 0.5;
        this.originalRatio = 0.5;
    };

    NextendAdminVerticalPane.prototype.lateInit = function () {

        NextendAdminSinglePane.prototype.lateInit.apply(this, arguments);

        this.tab.find(".n2-sidebar-pane-sizer").draggable({
            axis: 'y',
            scroll: false,
            start: $.proxy(this.start, this),
            drag: $.proxy(this.drag, this)
        });
    };

    NextendAdminVerticalPane.prototype.start = function (event, ui) {
        this.originalRatio = this.ratio;
    };

    NextendAdminVerticalPane.prototype.drag = function (event, ui) {
        var ratio = this.originalRatio + ui.position.top / this.targetHeight;


        if (ratio < 0.1) {
            ratio = 0.1;
            ui.position.top = (ratio - this.originalRatio) * this.targetHeight;
        } else if (ratio > 0.9) {
            ratio = 0.9;
            ui.position.top = (ratio - this.originalRatio) * this.targetHeight;
        }

        this.changeRatio(ratio);

        ui.position.top = 0;
    };

    NextendAdminVerticalPane.prototype.changeRatio = function (ratio) {
        var h = parseInt(this.targetHeight * this.ratio);
        this.mainPane.height(h);
        this.bottomPane.height(this.targetHeight - h - 1);
        this.ratio = ratio;
        if (this.key) {
            $.jStorage.set(this.key, ratio);
        }
    };

    scope.NextendAdminVerticalPane = NextendAdminVerticalPane;

})(nextend.smartSlider, n2, window);
