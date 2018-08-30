module.exports = {

    // phrases bot will respond with when command is locked
    error: ["｡゜(｀Д´)゜｡", "ლಠ益ಠ)ლ", "(-_-;)・・・", "w(°ｏ°)w"],

    titles: ["guest", "user", "admin"],

    // returns saved users level
    level: function(author, prefs) {
        for (var id in prefs.users) {
            if (author.id == id) {
                // 1 = user, 2 = admin
                return prefs.users[id];
            }
        }
        
        return 0; // 0 = guest
    },

    // check if command is unlocked for sender
    unlocked: function(author, requirement) {
        if (!requirement) return true;
        return author >= requirement;
    }

};