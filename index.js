const express = require('express');
const axios = require('axios')
require('dotenv').config()
const request = require('request');
const cheerio = require('cheerio');
const app = express();

app.get('/', function(req,res){
    let game_url = req.query.game_url;
    let desc_format = req.query.desc_format
    request(game_url, function(error,response,html){
        if(!error){
            let $ = cheerio.load(html);
            let game_title = $('h1.game_title').text();
            let game_description = $('div.formatted_description.user_formatted').html();
            if (desc_format == 'bbcode'){
                game_description = htmlToBBCode(game_description)
            }
            let game_cover = $('.screenshot_list > a').attr('href');
            let game_short_desc = $('meta[name=twitter:description]').attr('content')
            let game_id = $('meta[name=itch:path]').attr('content').replace('games/','')
            get_downloads(game_id)
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

function get_downloads(game_id){
    // process.env.ITCHIO_API_KEY
    console.log(process.env.ITCHIO_API_KEY)
    axios.get(`https://itch.io/api/1/${process.env.ITCHIO_API_KEY}/game/${game_id}/uploads`).then(res => {
        console.log(res['data'])
    })
}

function tableToJSON(html, options = {}) {
    const $ = cheerio.load(html)
    let output = {}
    $('tbody tr').each((index,element) => {
        let items = $(element).find('td')
        output[$(items[0]).text()] = $(items[1]).text()
        if ($(items[0]).text().includes('Author')) {
            let authors = []
            $(items).find('a').each((index,element) =>{
                authors.push({
                    'username': $(element).text(),
                    'url': $(element).attr('href')
                })
                output['Authors'] = authors
            })
        }
        if ($(items[0]).text().includes('Platform')) {
            let platforms = []
            $(items).find('a').each((i,e) => {
                platforms.push($(e).text())
            })
            output['Platforms'] = platforms

        }
        
    })
    return output
  }

//Adapted from http://skeena.net/htmltobb/

var htmlToBBCode = function(html) {

    html = html.replace(/<pre(.*?)>(.*?)<\/pre>/gmi, "[code]$2[/code]");
  
      html = html.replace(/<h[1-7](.*?)>(.*?)<\/h[1-7]>/, "\n[h]$2[/h]\n");
  
      //paragraph handling:
      //- if a paragraph opens on the same line as another one closes, insert an extra blank line
      //- opening tag becomes two line breaks
      //- closing tags are just removed
      // html += html.replace(/<\/p><p/<\/p>\n<p/gi;
      // html += html.replace(/<p[^>]*>/\n\n/gi;
      // html += html.replace(/<\/p>//gi;
  
      html = html.replace(/<br(.*?)>/gi, "\n");
      html = html.replace(/<textarea(.*?)>(.*?)<\/textarea>/gmi, "\[code]$2\[\/code]");
      html = html.replace(/<b>/gi, "[b]");
      html = html.replace(/<i>/gi, "[i]");
      html = html.replace(/<u>/gi, "[u]");
      html = html.replace(/<\/b>/gi, "[/b]");
      html = html.replace(/<\/i>/gi, "[/i]");
      html = html.replace(/<\/u>/gi, "[/u]");
      html = html.replace(/<em>/gi, "[b]");
      html = html.replace(/<\/em>/gi, "[/b]");
      html = html.replace(/<strong>/gi, "[b]");
      html = html.replace(/<\/strong>/gi, "[/b]");
      html = html.replace(/<cite>/gi, "[i]");
      html = html.replace(/<\/cite>/gi, "[/i]");
      html = html.replace(/<font color="(.*?)">(.*?)<\/font>/gmi, "[color=$1]$2[/color]");
      html = html.replace(/<font color=(.*?)>(.*?)<\/font>/gmi, "[color=$1]$2[/color]");
      html = html.replace(/<link(.*?)>/gi, "");
      html = html.replace(/<li(.*?)>(.*?)<\/li>/gi, "[*]$2");
      html = html.replace(/<ul(.*?)>/gi, "[list]");
      html = html.replace(/<\/ul>/gi, "[/list]");
      html = html.replace(/<div>/gi, "\n");
      html = html.replace(/<\/div>/gi, "\n");
      html = html.replace(/<td(.*?)>/gi, " ");
      html = html.replace(/<tr(.*?)>/gi, "\n");
  
      html = html.replace(/<img(.*?)src="(.*?)"(.*?)>/gi, "[img]$2[/img]");
      html = html.replace(/<a(.*?)href="(.*?)"(.*?)>(.*?)<\/a>/gi, "[url=$2]$4[/url]");
  
      html = html.replace(/<head>(.*?)<\/head>/gmi, "");
      html = html.replace(/<object>(.*?)<\/object>/gmi, "");
      html = html.replace(/<script(.*?)>(.*?)<\/script>/gmi, "");
      html = html.replace(/<style(.*?)>(.*?)<\/style>/gmi, "");
      html = html.replace(/<title>(.*?)<\/title>/gmi, "");
      html = html.replace(/<!--(.*?)-->/gmi, "\n");
  
      html = html.replace(/\/\//gi, "/");
      html = html.replace(/http:\//gi, "http://");
  
      html = html.replace(/<(?:[^>'"]*|(['"]).*?\1)*>/gmi, "");
      html = html.replace(/\r\r/gi, ""); 
      html = html.replace(/\[img]\//gi, "[img]");
      html = html.replace(/\[url=\//gi, "[url=");
  
      html = html.replace(/(\S)\n/gi, "$1 ");
  
      return html;
  }
app.listen(process.env.PORT || 8080);
console.log('API is running 0.0.0.0:8080');
module.exports = app;
