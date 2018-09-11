module.exports = function(googleSearch) {
    module.commands = ["search", "find", "google"];
    module.picture = "https://i.imgur.com/boRehwg.png";
    module.summary = "Fetch requested internet search results";
    module.require = { account: 1, textInput: true };

    const search = new googleSearch({
        key: "private key pls no steal",
        cx: "private key pls no steal"
    });

    module.function = function(request, argument, message, nm) {
        let words = message.content.split(" "),
            query = words.slice(words.indexOf(request.command) + 1, words.length);
        if (query.length < 1) return;
        
        query = query.join(" ");
        search.build({
            q: query,
            num: 1, 
        }, function(error, response) {

            if (response.items) {
                let header = "Here's what I found for **" + query + "**",
                    title = cleanTitle(response.items[0].title),
                    value = cleanValue(response.items[0].snippet) + "\n\n" + response.items[0].link;
                    thumb = (response.items[0].pagemap && response.items[0].pagemap.cse_thumbnail) ?
                        response.items[0].pagemap.cse_thumbnail[0].src : module.exports.picture;

                let embed = nm.core.embed(header, title, value, thumb);
                nm.core.speak(embed, message);
            }

            else if (!response.items)
                Speak("I couldn't find any results for " + searchTerm, message); 

            else if (response.error && response.error.errors)
                response.error.errors.forEach(function(err) {
                    console.log("Error: "+err.reason+". Search aborted!")
                })
        })
    }

    return module;
};

// make result title look nice
function cleanTitle(string) {
    let trash = ["\|", " - "], 
        cache = [];
        
    trash.forEach(function(t) {
        if (!string.includes(t)) return;
        cache = string.split(t);
        for(i = 0; i < cache.length; i++) 
            cache[i] = cache[i].trim();
    });

    return cache.length < 2 ? string : cache[0] + " - " + cache[1];
}

// make result body look nice
function cleanValue(string) {
    let cache = string;

    while (cache.includes("\n"))
        cache = cache.replace("\n", "");

    return cache;
}
