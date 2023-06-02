const cheerio = require('cheerio');
const utils = require('../utils')

const get_jam_entries = async (id) =>{
    return await fetch(`https://itch.io/jam/${id}/entries.json`).then(res => res.json())
}

const get_jam_info = async (html,bbcode) =>{
    let $ = await cheerio.load(html);
    let jam_info = parse_jam_info($('body > script:nth-child(3)').text())
    let jam_id = jam_info['id']
    delete jam_info.id
    let description = $('meta[name=description]').attr('content')
    let description_html = $('div.jam_content.user_formatted').html();
    if (bbcode){
        description_html = utils.htmlToBBCode(description_html)
    }
    let cover_url = $('meta[property=og:image]').attr('content')
    let title = $('meta[property=og:title]').attr('content')
    let entries = await get_jam_entries(jam_id)
    let json = {
        id: jam_id,
        title: title,
        description: description,
        description_html: description_html,
        cover_url: cover_url,
        dates: jam_info,
        entries: entries['jam_games'],
    }
    return json
}

const parse_jam_info = (result) => {
    let output = JSON.parse(result.match(/{([^}]*)}/)[0])
    return output
    
}
    module.exports = {
    get_jam_info
}