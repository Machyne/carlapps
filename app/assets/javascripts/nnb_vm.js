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
    
    // ==================
    // All Date info
    // ==================    
    self.date = ko.observable(new Date());    
    self.changeDate = function(addDays) {
        return function(){
            var d = self.date();
            d.setDate(d.getDate() + addDays);
            self.date(d);
        };
    };
    $(document).ready(function(){
        console.log('hi');
        $("#datepicker").change(function(){
            var d = new Date($("#datepicker").val());
            var d2 = self.date();
            if (d.getYear()  == d2.getYear()  &&
                d.getMonth() == d2.getMonth() &&
                d.getDate()  == d2.getDate()) return;
            self.date(d);
        });
    });
    self.date.subscribe(function(){
        $('#datepicker').val(self.date().toJSON().slice(0,10));
        self.getNnbs();
    });
    self.niceDate = ko.computed(function(){return self.date().toDateString();}, self);
    
    // ==================
    // Layout of Nnbs
    // ==================
    self.nnbs = ko.observableArray([]);
    self.makeRows = function(arr){
        var ret = [];
        var arrLenght = arr.length;
        var ar3f = Math.floor(arrLenght/3);
        var c1Len = Math.ceil(arrLenght/3);
        var c2Len = (arrLenght%3)==2? ar3f + 1: ar3f;
        var c3Len = arrLenght - c1Len - c2Len;
        for (var i = 0; i < c1Len; i++) {
            if (i + 1 <= c3Len) {
                ret.push([arr[i], arr[i+c1Len], arr[i+c1Len+c2Len]]);
            }else if(i + 1 <= c2Len){
                ret.push([arr[i], arr[i+c1Len]]);
            }else{
                ret.push(arr[i]);
            };
        };
        return ret;
    };


    self.bulletin = ko.computed(function(){
        var ret = {}
        for (var i = 0; i < types.length; i++) {
            var type = types[i];
            var vals = self.nnbs().filter(function(n){return n.type() == type;});
            if(vals.length!=0) {ret[type]=vals};
        };
        return ret;
    },self);


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