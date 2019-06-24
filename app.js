const http = require('http')
const fs = require('fs')
const cheerio = require('cheerio') // 类似jquery
const request= require('request')
let i = 0
let url = "http://www.scdzzx.net/Item/9888.aspx" // 2019-05-15

function fetchPage(x) {
    startRequest(x)
}

function startRequest(x) {
    http.get(x, function(res) {
        let html = ''
        res.setEncoding('utf-8') // 防止中文乱码

        res.on('data', function (chunk) {
            html += chunk
        })
        res.on('end', function (){
            const $ = cheerio.load(html)
            const time = $('.articleCon .property span:first-child').text().trim()
            const news_item  = {
                title: $('.articleCon h2.title').text().trim(),
                time,
                i: i+1
            }
            console.log(news_item)
            const news_title = $('.articleCon h2.title').text().trim() + '_____' + time
            savedContent($, news_title)
            savedImg($, news_title)
            i = i+1
            //下一篇文章的url
			const nextLink = "http://www.scdzzx.net" + $(".others .next a").attr('href');
			if (i <= 500) {
                fetchPage(nextLink);
            }
        })
    }).on('error',function(err){
		console.log('err:', err);
	})
    
}
//该函数的作用：在本地存储所爬取到的新闻内容
function savedContent($, news_title) {
    $('#fontzoom p').each(function(index, item){
        let x = $(this).text()
        // const y = x.substring(0,2).trim()
        // console.log(y)
        // if (y == '') {
            x = x + '\n'
            fs.appendFile('./datas/' + news_title + '.txt', x, 'utf-8', function(err){
                if (err) {
                    console.log(err)
                }
            })
        // }
    })
}
//该函数的作用：在本地存储所爬取到的图片资源
function savedImg($, news_title) {
    $('#fontzoom img').each(function(index, item){
        const img_filename = $(this).attr('src').substring($(this).attr('src').lastIndexOf('/')+1)
        const img_src =  'http://www.scdzzx.net' + $(this).attr('src')

        request.head(img_src, function (err,res,body) {
            if (err) {
                console.log(err)
            }
        })
        request(img_src).pipe(fs.createWriteStream('./img/' + img_filename))
    })
}

fetchPage(url)