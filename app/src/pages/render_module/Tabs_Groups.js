const TabGroup = require("electron-tabs");
class Tabs_Groups {
    all_tabs_groups = [];
    constructor() {

    }

    addTheTab(pid = '') {

        console.log("==]]]]]]]]]]]]]]all_tabs_groups]]]]]]]]]]]]]]]]]]]]");
        console.log(this.all_tabs_groups);
        console.log("==]]]]]]]]]]]]]all_tabs_groups end]]]]]]]]]]]]]]]]]]]]]");

 
        let singular_object = this.all_tabs_groups.find(o => o.tb_id === pid);


        if (singular_object) {

            return singular_object.tb_obj;
        } else {
            let tb_obj = new TabGroup();
            this.all_tabs_groups.push = {'tb_id':pid,'tb_obj':tb_obj};
            console.log("==]]]]]]]]]]]]]]all_tabs_groups]]]11111111]]]]]]]]]]]]]]]]]");
            console.log(this.all_tabs_groups);
            console.log("==]]]]]]]]]]]]]all_tabs_groups end]]]111111111111]]]]]]]]]]]]]]]]]]");

            return tb_obj;
        }

    }

    inArray(needle, haystack) {
        var length = haystack.length;
        for (var i = 0; i < length; i++) {
            if (haystack[i] == needle) return true;
        }
        return false;
    }

}

module.exports = Tabs_Groups;
