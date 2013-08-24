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
    
    // ==================
    // All Date info
    // ==================    
    self.date = ko.observable(new Date());
    self.changeDate = function(addDays) {
        return function() {
            var d = self.date();
            d.setDate(d.getDate() + addDays);
            self.date(d);
        };
    };
    $(document).ready(function(){
        $("#datepicker").change(function() {
            var d = $("#datepicker").datepicker("getDate");
            if (sameDate(d, self.date())) return;
            self.date(d);
        });
        self.update();
    });
    self.update = function() {
        $('#datepicker').val(pickerFormat(self.date()));
        self.getNnbs();
    }
    self.date.subscribe(self.update);
    self.shortDate = ko.computed(function(){return self.date().toString()}, self);
    self.longDate = ko.computed(function(){return longDate(self.date())}, self);
    

    // ==================
    // Layout of Nnbs
    // ==================
    self.nnbs = ko.observableArray([]);

    self.sections = ko.computed(function() {
        var ret = {}
        for (var i = 0; i < types.length; i++) {
            var type = types[i];
            var vals = self.nnbs().filter(function(n){return n.type() == type;});
            if (type == "events") {
                var d = new Date(self.date());
                todayVals = vals.filter(function(n){return sameDate(n.date(), d)});
                todayVals.length && (ret["Today"] = todayVals);
                for (var j = 1; j < 10; j++) {
                    d.setDate(d.getDate() + 1);
                    dateVals = vals.filter(function(n){return sameDate(n.date(), d)});
                    dateVals.length && (ret[longDate(d)] = dateVals)
                }
            }
            else {
                vals.length && (ret[type] = vals);
            }
        };
        return ret;
    }, self);

    self.columns = ko.computed(function() {
        console.log("compute columns");
        var section_columns = {};
        var keys = Object.keys(self.sections());
        for (var ki = 0; ki < keys.length; ki++) {
            var arr = self.sections()[keys[ki]];
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

    function sameDate(d1, d2) {
        return d1.getDate() == d2.getDate() && d1.getMonth() == d2.getMonth()
                && d1.getFullYear() == d2.getFullYear();
    }

    function pickerFormat(date) {
        var d = date.getDate(), m = date.getMonth() + 1, y = date.getFullYear();
        return (m < 10? "0" + m : m) + "/" + (d < 10? "0" + d : d) + "/" + y;
    }

    function longDate(date) {
        return days[date.getDay()] + ", " + months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
    }

    // ==================
    // Load the data
    // ==================
    function getAjaxData () {
        return {
            appeared: self.date().toISOString()
        };
    }
    self.getNnbs = function() {
        $.get("/nnbs/", getAjaxData(), 
              function(d){
                self.nnbs([]);
                $.each(d.nnbs, function(i, post) {
                    self.nnbs.push(new Nnb(post));
                });
            }, 'json');
    };
}