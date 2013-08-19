function NnbViewModel () {
    function Nnb (data) {
        var self = this;
        self.appeared = ko.observableArray(data.appeared);
        self.contact = ko.observable(data.contact);
        var first = data.content.split(" ", 2).join(" ");
        self.content = ko.observable('<span class="first">' + first + '</span>' + data.content.slice(first.length));
        self.date = ko.observable(data.date);
        self.type = ko.observable(data.type);
    }
    var self = this;
    var types = ["events", "general", "wanted", "for sale", "lost and found", "housing", "ride share"];
    self.date = ko.observable(new Date());
    self.niceDate = ko.computed(function(){return self.date().toDateString();}, self);
    self.nnbs = ko.observableArray([]);
    self.makeRows = function(arr){
        var ret = [];
        var current = [];
        $.each(arr, function(i, nnb){
            if (i%3==0 && i!=0) {ret.push(current); current = [];};
            current.push(nnb);
        });
        ret.push(current);
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
            date: new Date(),
        };
    }
    self.getNnbs = function() {
        $.get("/nnbs/", getAjaxData(), 
              function(d){
                $.each(d.nnbs, function(i, post) {
                    self.nnbs.push(new Nnb(post));
                });
            }, 'json');
    };
}