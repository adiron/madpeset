const Parser = require('rss-parser');
const parser = new Parser();

const url = "https://trends.google.com/trends/hottrends/atom/feed?pn=p6"

console.log("Latest trending searches for Israel:");
 
let feed = parser.parseURL(url)
    .then(feed => {
        feed.items.forEach(item => {
            console.log(item.title)
        })
    });
