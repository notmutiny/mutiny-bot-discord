const key = "private key pls no steal";
const cx = "private key pls no steal";

let errors = {
    limit: {
        main: function() { return ["daily search limit has been met"] },
        end: ["and Google denied your request", "and search has been aborted", "so try again tomorrow"]
    }
}

module.exports = function(googleImages, googleSearch) {
    module.commands = ["search", "find", "google"];
    module.picture = "https://i.imgur.com/boRehwg.png";
    module.summary = "Fetch requested internet search results";
    module.require = { account: 1, textInput: true };

    module.arguments = {
        "images": {
            commands: ["image", "images", "picture", "pictures"],
            summary: "Gets a random image result for search query",
        }
    };

    const images = new googleImages(cx, key);
    const search = new googleSearch({cx: cx, key: key});

    module.function = function(request, argument, message, nm) {
        let query = nm.core.cleanQuery(message.content, request, (argument ? ["of"] : null));        
        if (!query) return;

        switch (argument) {
            case "images":
                images.search(query, {safe: "high"}).then(response => {
                    response.slice(0, 5); // response not ordered
                    // response.slice(0, response.length * .75);
                    let item = nm.core.randomElement(response);
                    // randomize response to enhance usage

                    let embed = nm.core.embed(
                        "Here's a random " + (request.argument.command.substring(request.argument.command.length - 1, request.argument.command.length) != "s" ? 
                            request.argument.command : request.argument.command.substring(0, request.argument.command.length - 1)) + " for **" + query + "**",
                        cleanTitle(item.description),
                        item.parentPage,
                        item.thumbnail.url
                    );

                    // attach full-size image to bottom of embed
                    if (!embed.embed.image) embed.embed.image = {};                    
                    embed.embed.image.url = item.url;

                    nm.core.speak(embed, message);
                }).catch(error => {
                    if (error.statusCode == "403")
                        nm.core.error(request, message, errors.limit);
                });
                break;

            default:
                search.build({ q: query, num: 1 }, function(error, response) {

                    if (response.items) {
                        let header = "Here's what I found for **" + query + "**",
                            title = cleanTitle(response.items[0].title),
                            value = cleanValue(response.items[0].snippet) + "\n\n" + response.items[0].link;
                            thumb = (response.items[0].pagemap && response.items[0].pagemap.cse_thumbnail) ?
                                response.items[0].pagemap.cse_thumbnail[0].src : module.exports.picture;

                        let embed = nm.core.embed(header, title, value, thumb);
                        nm.core.speak(embed, message);
                    }

                    else if (response.error && response.error.errors)
                        nm.core.error(request, message, errors.limit);

                    else if (!response.items)
                        nm.core.speak("I couldn't find any results for " + query, message); 
                });
                break;
        }
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
