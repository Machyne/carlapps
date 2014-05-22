function NnbViewModel () {
    function Nnb (data) {
        var self = this;
        self.appeared = ko.observableArray(data.appeared);
        self.contact = ko.observable(data.contact);
        var first = data.content.split(" ", 2).join(" ");
        self.content = ko.observable('<span class="first">' + first + '</span>' + data.content.slice(first.length));
        self.date = ko.observable(new Date(data.date));
        self.type = ko.observable(data.type);
    }
    var self = this;
    var types = ["events", "general", "wanted", "for sale", "lost & found", "housing", "ride share"];
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var today = new Date(new Date("05/21/14").toDateString() + " 00:00:00 GMT");

    // ================= //
    // The selected date //
    // ================= //

    /*
     * The dates in our database are in UTC time, which is equivalent to GMT time.
     * Queries can return the wrong results if they use local time.
     *
     * Since this application uses dates but not times, all Date objects should be initialized
     * to midnight GMT, and only the UTC versions of the getter and setter methods should be used.
     */

    // The selected date
    self.selectedDate = ko.observable(today);

    // So that we can get the selected date without subscribing to its updates
    self.theSelectedDate = today;

    // Function to call when the selected date changes
    // This can't be done with a ko.computed since the update to self.nnbs is asynchronous
    self.selectedDate.subscribe(function(newValue) {
        self.theSelectedDate = newValue;
        self.getNnbs();
    });

    // The mm/dd/yyyy date shown in the date picker
    // Bound to selectedDate
    self.pickerDate = ko.computed({
        read: function() {
            return pickerFormat(self.selectedDate());
        },
        write: function(value) {
            self.selectedDate(new Date(value + " 00:00:00 GMT"));
        }
    });

    self.changeDate = function(addDays) {
        return function() {
            var d = self.selectedDate();
            d.setUTCDate(d.getUTCDate() + addDays);
            self.selectedDate(d);
        };
    };

    // Two different formats for the selected date
    self.shortDate = ko.computed( function() { return self.selectedDate().toUTCString() }, self);
    self.longDate = ko.computed( function() { return longDate(self.selectedDate()) }, self);
    
    // ===================== //
    // Static date functions //
    // ===================== //

    function sameDate(d1, d2) {
        return d1.getUTCDate() == d2.getUTCDate() && d1.getUTCMonth() == d2.getUTCMonth()
                && d1.getUTCFullYear() == d2.getUTCFullYear();
    }

    function pickerFormat(date) {
        var d = date.getUTCDate(), m = date.getUTCMonth() + 1, y = date.getUTCFullYear();
        return (m < 10? "0" + m : m) + "/" + (d < 10? "0" + d : d) + "/" + y;
    }

    function longDate(date) {
        return days[date.getUTCDay()] + ", " + months[date.getUTCMonth()] + " " + date.getUTCDate() + ", " + date.getUTCFullYear();
    }

    // ========== //
    // NNB layout //
    // ========== //

    self.nnbs = ko.observableArray([]);

    // Dependencies: self.nnbs
    self.sections = ko.computed(function() {
        var ret = {}
        for (var i = 0; i < types.length; i++) {
            var type = types[i];
            var vals = self.nnbs().filter( function(n) { return n.type() == type; });
            if (type == "events") {
                var d = new Date(self.theSelectedDate);
                todayVals = vals.filter( function(n) { return sameDate(n.date(), d); });
                todayVals.length && (ret["Today"] = todayVals);
                for (var j = 1; j < 10; j++) {
                    d.setUTCDate(d.getUTCDate() + 1);
                    dateVals = vals.filter( function(n) { return sameDate(n.date(), d); });
                    dateVals.length && (ret[longDate(d)] = dateVals)
                }
            }
            else {
                vals.length && (ret[type] = vals);
            }
        };
        return ret;
    }, self);

    // Dependencies: self.sections
    self.columns = ko.computed(function() {
        var sections = self.sections();
        var section_columns = {};
        var keys = Object.keys(sections);
        for (var ki = 0; ki < keys.length; ki++) {
            var arr = sections[keys[ki]];
            var cols = new Array(3);

            // Split by number of posts
            var i1 = Math.ceil(arr.length / 3);
            var i2 = Math.ceil(arr.length * 2/ 3)
            cols[0] = arr.slice(0, i1);
            cols[1] = arr.slice(i1, i2);
            cols[2] = arr.slice(i2);

            // Split by number of characters
            // var sums = new Array(arr.length);
            // var totalLength = 0;
            // for (var i = 0; i < arr.length; i++) {
            //     totalLength += arr[i].content().length;
            //     sums[i] = totalLength;
            // }
            // var i = 0;
            // while (i < arr.length && sums[i] < totalLength / 3) i++;
            // cols[0] = arr.slice(0, ++i);
            // var j = i;
            // while (j < arr.length && sums[j] < totalLength * 2 / 3) j++;
            // cols[1] = arr.slice(i, ++j);
            // cols[2] = arr.slice(j);

            section_columns[keys[ki]] = cols;
        }
        return section_columns;
    }, self);

    self.dateLinks = ko.computed(getSectionLinks(true));
    self.otherLinks = ko.computed(getSectionLinks(false));

    // Dependencies: self.sections
    // Returns an array where each element is {"label": label, "link": link}
    function getSectionLinks(getDates) {
        var f = function() {
            var sections = self.sections();
            var keys = Object.keys(sections);
            var links = [];
            for (var i = 0; i < keys.length; i++) {
                if (getDates ^ (new Date(keys[i]) == 'Invalid Date')) {
                    links.push({
                        "label": labelForKey(keys[i]),
                        "link": "#" + linkForKey(keys[i])
                    });
                }
            };
            return links;
        }
        return f;
    }

    // Dependencies: self.sections
    self.sectionIds = ko.computed(function() {
        var sections = self.sections();
        var keys = Object.keys(sections);
        var ids = {};
        for (var i = 0; i < keys.length; i++) {
            ids[keys[i]] = linkForKey(keys[i]);
        };
        return ids;
    });

    function labelForKey(key) {
        var date = new Date(key);
        if (date == 'Invalid Date') {
            return key.replace(" and ", "+");
        } else {
            return days[date.getUTCDay()].slice(0, 3) + " " + date.getUTCDate();
        }
    }

    function linkForKey(key) {
        var date = new Date(key);
        if (date == 'Invalid Date') {
            return key.replace(/ /g, "_");
        } else {
            return days[date.getUTCDay()].slice(0, 3) + "_" + date.getUTCDate();
        }
    }


    // =============== //
    // Search Handling //
    // =============== //

    self.searchKeywords = ko.observable('');
    self.searchContact = ko.observable('');
    self.searchType = ko.observable('');
    self.clearSearch = function(){
        self.searchKeywords('');
        self.searchContact('');
        self.searchType('');
    }

    // Clear an input element on keydown of escape
    // and do the search on keydown of enter
    self.inputKeyListener = function(src, evt){
        if(evt.keyCode==27){ // esc is 27
            evt.currentTarget.value = '';
        }else if(evt.keyCode == 13){ // enter is 13
            self.getNnbs();
        }else{
            return true;
        }
    };
    self.searchIsShowing = ko.observable(false);

    // ============= //
    // Retrieve data //
    // ============= //

    function getAjaxQueryData () {
        ret = {
            appeared: self.selectedDate().toISOString()
        };
        if(self.searchKeywords()!==''){
            ret.content = self.searchKeywords().toLowerCase();
        }
        if(self.searchContact()!==''){
            ret.contact = self.searchContact();
        }
        if(self.searchType()!==''){
            ret.type = self.searchType();
        }
        return ret;
    }

    self.isLoading = ko.observable(false);
    self.getNnbs = function() {
        self.isLoading(true);
        $.get("/nnbs/", getAjaxQueryData(), 
              function(result) {
                self.isLoading(false);
                buffer = new Array(result.nnbs.length);
                $.each(result.nnbs, function(i, post) {
                    buffer[i] = new Nnb(post);
                });
                self.nnbs(buffer);
                self.initLinksToFit();
            }, 'json');
    };

    // ====================== //
    // Styling and animations //
    // ====================== //

    var trimTail = /.*\W./;

    self.initLinksToFit = function() {
        $('.web').each(function(i) {
            $(this).data("original", $(this).text());
        });
        self.trimLinksToFit();
    }

    self.trimLinksToFit = function() {
        var colWidth = $('.content .grid__item').width();
        $('.web').each(function(i) {
            var text = $(this).data("original");
            $(this).text(text);
            while ($(this).width() > colWidth) {
                var text = text.match(trimTail)[0];
                var len = text.length;
                if (text[len - 2] == '/') {
                    text = text.slice(0, len - 1);
                } else {
                    text = text.slice(0, len - 2);
                }
                $(this).text(text + "...");
            }
        });
    }

    // Throttled
    $(window).resize($.throttle(self.trimLinksToFit, 300, true));

    self.collapse = function(item, event) {
        var p = $(event.target).parent()
        if (p.data("collapsed")) {
            p.data("collapsed", false);
            p.children(".content").slideDown(300);
            p.removeClass("selected");
        } else {
            p.data("collapsed", true);
            p.children(".content").slideUp(300);
            p.addClass("selected");
        }
    };
}

ko.bindingHandlers.slideVisible = {
    init: function(element, valueAccessor) {
        var value = ko.unwrap(valueAccessor());
        $(element).toggle(value);
    },
    update: function(element, valueAccessor, allBindingsAccessor) {
        var value = ko.unwrap(valueAccessor()); 
        var duration = 300;
        if (value){
            $(element).slideDown(duration);
        }else{
            $(element).slideUp(duration);
        };
    }
};