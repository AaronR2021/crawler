var express = require('express');
var fs=require('fs')
var get=require('request-promise')
const puppeteer = require('puppeteer');
const Meme=require('./model/user')
var CronJob = require('cron').CronJob;
const download = require('image-downloader')
var downloadAPI = require('download-url');
let {IgApiClient} = require('instagram-private-api');
var path = require('path');
var Jimp = require('jimp');

require('dotenv').config();

var indexRouter = require('./routes/index.js');

//connect to database
const db=require('./config/database');
db.authenticate().then(()=>{
  console.log('connected to database')
}).catch((err)=>console.error('error connecting to database',err))

var app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());


var index=0;

(async()=>{
  const ig=new IgApiClient();
  ig.state.generateDevice(process.env.IG_USERNAME);
  const auth = await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
  console.log(JSON.stringify(auth),'auth info>!!!!!!!!!!');

//________________________________________________________________________________________
//use job scheduler for hour to fetch url by Id, after fetching the url post on instagram
 var job = new CronJob('* 1 * * * *',async function() {

  //increment index
  index++;

  //find a meme to post
  let meme=await Meme.findOne({where:{
    id:index
  }});

  if(meme){
    memeData=meme.toJSON();
    let test=memeData;
  
    let image=null;
    test.url.toString().split('.gif').length==1?image=true:image=null;
  
     if(image){

    const options = {
      url: memeData.url,
      dest: '../../memes/meme.jpg' 
    }
    download.image(options)
      .then(async({ filename }) => { 
        // open a file called "lenna.png"
Jimp.read(path.resolve(__dirname,'./memes/meme.jpg'), (err, lenna) => {
  if (err){console.log(err)};
 if(lenna){
  lenna
  .resize(400, 400) // resize
  .quality(100) // set JPEG quality
  .write(path.resolve(__dirname,'./memes/meme-resize.jpg')); // save
 }
});
      //post image on instagram
      fs.readFile(path.resolve(__dirname,'./memes/meme-resize.jpg'),async(err,data)=>{
        if(err){
          return
        }
        else{
          const publishResult = await ig.publish.photo({
            file: data, // image buffer, you also can specify image from your disk using fs
            caption: 'Just another meme stolen from redit ")', // nice caption (optional)
          });
          console.log(publishResult)
        }
      })

      })
      .catch((err) => console.error(err))
      image=null;
    }
    else{
       //gif
      console.log('its a gif');
      var _d = new downloadAPI(memeData.url)
  _d.setPath('./memes').start('abc.mp4').then(async function(result){
  
    console.log('result: ', result);
  
    //add tags
    var my_day=new Date()
    var day_name=new Array(7);
    day_name[0]='Sunday'
    day_name[1]=' Monday'
    day_name[2]='Tuesday'
    day_name[3]='Wednesday'
    day_name[4]='Thursday'
    day_name[5]='Friday'
    day_name[6]='Saturday'
    
    let day=day_name[my_day.getDay()]
    
    let tags=[day,'memes']
    console.log(tags)
  
  
  
   //post image on instagram

   const publishResult = await ig.publish.photo({
    file: (__dirname+'/memes/abc.mp4'), // image buffer, you also can specify image from your disk using fs
    caption: 'Really nice photo from the internet! ????', // nice caption (optional)
  })
  
  },function(error){
    console.log(error)
  }) 
  
    } 

  }


}, null, true, 'America/Los_Angeles');

//________________________________________________________________________________________
var jobDeleteAndScrape=new CronJob("30 20 * * * *",function(){
  //set index to 0
  index=0;
  //delete/resets database every 20hrs 30min
  Meme.destroy({where:{id:{
    [Op.lt]:100
  }}});

//scrape database again and populate
//scrape urls 
 (async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.reddit.com/r/memes/');


  let result=await page.evaluate(async()=>{
    function delay(time) {
      return new Promise(function(resolve) { 
          setTimeout(resolve, time)
      });
   }
   
await delay(5000)
window.scrollBy({
top: 5000,
behavior: 'smooth'
})

    let arrayOfQuotes=document.querySelectorAll('img[alt="Post image"]');
    let arrayOfGifs=document.querySelectorAll('source'); 

    let quoteArray=[]; 
    
    arrayOfQuotes.forEach(async val=>{
     console.log(val)
     
     let dbval={
       url:val.getAttribute('src'),
       tags:'memes'
     }
     quoteArray.push(dbval)
    }) 

    arrayOfGifs.forEach(async val=>{
     console.log(val)
     let dbval={
      url:val.getAttribute('src'),
      tags:'memes'
    }
    quoteArray.push(dbval)
    })

    //returns an array of urls of gif/image
    return quoteArray
  })

  //save {url,tags} in database of the scraped data every 23hrs:30min
  result.forEach(async memeVal=>{
     console.log( await Meme.create(memeVal) )
  })

  await browser.close();
})();

}, null, true, 'America/Los_Angeles');

job.start();
jobDeleteAndScrape.start();


})()


app.use('/',(req,res,next)=>{
  res.send("Ready to Serve!!!");
})


app.use('/', indexRouter);

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
