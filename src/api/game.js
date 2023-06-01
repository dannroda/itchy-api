const utils = require('../utils')
const cheerio = require('cheerio');
const fetch_info = async (html,bbcode) => {
    let $ = cheerio.load(html);
    let game_id = $('meta[name=itch:path]').attr('content').replace('games/','')
    let game_downloads = await get_downloads(game_id)
    let game_description = $('div.formatted_description.user_formatted').html();
    // if (desc_format == 'bbcode'){
    if (bbcode){
        game_description = utils.htmlToBBCode(game_description)
    }
    let game_cover = $('.screenshot_list > a').attr('href');
    let game_short_desc = $('meta[name=twitter:description]').attr('content')
    let game_title = $('h1.game_title').text();
    let game_info = parse_game_info($('div.game_info_panel_widget').html())
    let json = {
        id: game_id,
        title: game_title,
        description: game_description, 
        cover_url: game_cover,
        short_desc: game_short_desc,
        download: game_downloads,
        more_info:game_info,
    };
    return json
}
const get_downloads = async (game_id) => {
    // process.env.ITCHIO_API_KEY
    let output = {}
    await fetch(`https://itch.io/api/1/${process.env.ITCHIO_API_KEY}/game/${game_id}/uploads`).then((res) => {
        return res.json()
    }).then((data) => {
        // output = data['uploads']
        data['uploads'].forEach(item => {
            if(item['type'] == 'html'){
                output['html'] = item
            }
            if(item['p_linux']){
                output['linux'] = item
            }
            if(item['p_windows']){
                output['windows'] = item
            }
            if(item['p_macos']){
                output['macos'] = item
            }
            if(item['p_android']){
                output['android'] = item
            }
        })
        return Promise.all(data['uploads'].map(item => fetch(`https://itch.io/api/1/${process.env.ITCHIO_API_KEY}/upload/${item['id']}/download`)))
    }).then(res => {
       return Promise.all(res.map(data => data.json()))
    }).then(res => {
        res.forEach((item,index) => {

            // safeguard to make sure that the url is correct
            for(const [key,value] of Object.entries(output)){
                if(value['position'] == index){
                    value['url'] = item['url']
                }
                if(value['type'] == 'html'){
                    value['embed'] = `https://itch.io/embed-upload/${value['id']}`
                }
            }
        })
    })
    // console.log(output)
    return output
}

const get_download_link = async (id) => {
    const download_url = await fetch(`https://itch.io/api/1/${process.env.ITCHIO_API_KEY}/upload/${id}/download`).then(res => res.json())
    // await axios.get(`https://itch.io/api/1/${process.env.ITCHIO_API_KEY}/upload/${id}/download`).then(res => {
    //     return res['data']['url']
    // })

    return download_url['url']
}

const parse_game_info = (html, options = {}) => {
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
                platforms.push($(e).text().toLowerCase())
            })
            output['Platforms'] = platforms

        }
        
    })
    return output
  }

module.exports = {
    fetch_info,
    get_downloads
}