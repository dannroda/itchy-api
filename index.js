const express = require('express');
const request = require('request');
const cheerio = require('cheerio');
const app = express();

app.get('/', function(req,res){
    let game_url = req.query.game_url;

    request(game_url, function(error,response,html){
        if(!error){
            let $ = cheerio.load(html);
            let game_title = $('h1.game_title').text();
            let game_description = $('div.formatted_description.user_formatted').html();
            let game_cover = $('.screenshot_list > a').attr('href');
            let game_short_desc = $('meta[name=twitter:description]').attr('content')
            let game_id = $('meta[name=itch:path]').attr('content').replace('games/','')
            let game_info = tableToJSON($('div.game_info_panel_widget').html())
            let json = {
                title: game_title,
                description: game_description,
                cover_url: game_cover,
                short_desc: game_short_desc,
                id: game_id,
                more_info:game_info
            };
            res.send(json);
        }
    });
});
function tableToJSON(html, options = {}) {
    const { useFirstRowForHeadings, headings = [] } = options

    const $ = cheerio.load(html)
    const sel = $('table tr')
    const rowCount = sel.length

    return [...sel].map(e => $(e).text())
    // return [...sel].map(e => 
    //     [...$(e).find('td')].map(e => $(e).text())
    //     )
    // return [...$(sel)].map(e => 
    //     [...$(e).find('td')].map(e => $(e).html())
    //     )
  }
  
app.listen(process.env.PORT || 8080);
console.log('API is running 0.0.0.0:8080');
module.exports = app;
