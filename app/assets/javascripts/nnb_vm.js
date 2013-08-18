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
    function getAjaxData () {
        return {};
    }
    self.getNnbs = function() {
        $.get("/nnbs/", getAjaxData(), 
              function(d){
                console.dir(d);
                $.each(d.nnbs, function(i, post) {
                    self.nnbs.push(new Nnb(post));
                });
            }, 'json');
    };
}