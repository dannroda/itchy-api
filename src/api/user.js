const cheerio = require('cheerio');
const fetch_user_info = async (user_id) =>{
    let data = await fetch(`https://itch.io/api/1/${process.env.ITCHIO_API_KEY}/users/${user_id}`).then((res) => res.json())
    return data['user']

}

const get_user_id = (html) =>{
    let $ = cheerio.load(html);
    let user_id = $('meta[name=itch:path]').attr('content').replace('users/','')
    return user_id
}

module.exports ={
    fetch_user_info,
    get_user_id
}