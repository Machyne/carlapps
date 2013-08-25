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
    var types = ["events", "general", "wanted", "for sale", "lost and found", "housing", "ride share"];
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var today = new Date(new Date().toDateString() + " 00:00:00 GMT");

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

    // ============= //
    // Retrieve data //
    // ============= //

    function getAjaxQueryData () {
        return {
            appeared: self.selectedDate().toISOString()
        };
    }

    self.getNnbs = function() {
        $.get("/nnbs/", getAjaxQueryData(), 
              function(result) {
                buffer = new Array(result.nnbs.length);
                $.each(result.nnbs, function(i, post) {
                    buffer[i] = new Nnb(post);
                });
                self.nnbs(buffer);
            }, 'json');
    };

    // ====================== //
    // Effects and animations //
    // ====================== //

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