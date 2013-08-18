function NnbViewModel () {
    function Nnb (data) {
        var self = this;
        self.appeared = ko.observableArray(data.appeared);
        self.contact = ko.observable(data.contact);
        self.content = ko.observable(data.content);
        self.date = ko.observable(data.date);
        self.type = ko.observable(data.type);
    }

    var self = this;
    self.nnbs = ko.observableArray([]);
    self.rows = ko.computed(function(){
        var ret = [];
        var current = [];
        $.each(self.nnbs(), function(i, nnb){
            if (i%3==0 && i!=0) {ret.push(current); current = [];};
            current.push(nnb);
        });
        ret.push(current);
        return ret;
    },self);
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