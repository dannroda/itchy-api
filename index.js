const express = require('express');
require('dotenv').config()
const request = require('request');
const game = require('./src/api/game')
const user = require('./src/api/user')
const app = express();
const {Worker} = require('worker_threads');
const { type } = require('os');
app.get('/game/*/', (req,res) => {
    // let game_url = req.query.game_url;
    let game_url = req.params[0]
    let bbcode = req.query.bbcode
    request(game_url, async (error,response,html) => {
        if(!error){
            let json = await game.fetch_info(html,bbcode)
            res.send(json);
        }
    });
});

app.get('/download/*/',async (req,res) =>{
    let game_id
    let platform = req.query.platform
    if(req.params[0].startsWith('http')){
        let data = await fetch(req.params[0] + '/data.json').then(res => res.json())
        game_id = data['id']
    }else{
        game_id = req.params[0]
    }
    let data = await game.get_downloads(game_id)
    if (platform){
        let json
        let direct_download = req.query.direct
        json = data[platform]
        if(direct_download){
            res.redirect(json['url'])
        }else{
            res.send(json)
        }
    }else{
        res.send(data)
    }
})

app.get('/user/*/', async  (req,res) =>{
    let user_id = req.params[0]
    let data
    if(req.params[0].startsWith('http')){
        request(req.params[0], async (error,response,html) => {
            if(!error){
                data = await user.fetch_user_info(user.get_user_id(html))
                res.send(data)
            }
        });
        // user_id = data['id']
    }else{
        data = await user.fetch_user_info(user_id)
        res.send(data)
    }

})


app.listen(process.env.PORT || 3000);
console.log('API is running 0.0.0.0:3000');
module.exports = app;
