var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var bodyParser = require('body-parser');
var db = [];

app.use('/', express.static('public'));
app.use(bodyParser.urlencoded({extended : false}));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});

// app.get('/', function(req, res){
//   res.sendfile(__dirname + '/main.html');
//   // res.sendfile(__dirname + '/socket.io/socket.io.js')
// })

http.listen(7727, function(){
  console.log('listening on *:7727');
});
app.get('/',function(req,res){
      res.render('login.html', {

      });
});
app.get('/home',function(req,res){
      res.render('home.html', {
        title: "NO.w.HERE",
        Country: 'korea',
        Username : db[db.length - 1].id
      });
});
app.get('/profile',function(req,res){
      res.render('profile.html', {
        title: "NO.w.HERE",
        Country: 'korea',
        Username : db[db.length - 1].id
      });
});
app.get('/settings',function(req,res){
      res.render('settings.html', {
        title: "Settings",
        Country: 'korea',
        Username : db[db.length - 1].id
      });
});
app.get('/messages',function(req,res){
      res.render('main.html', {
        title: "Settings",
        Country: 'korea',
        Username : db[db.length - 1].id
      });
});
// app.get('/main',function(req,res){
//   res.render('main.html', {
//       title: "NO.W.HERE",
//       Country: "KOREA",
//       Username : "eunsolKang"
//   });
// });

db = new Array();
app.post('/messages', function(req, res){
  if(db != ""){
    for(var i=0; i<db.length; i++)
    {
      if(req.body.id_input == db[i].id)
      {
        res.render('login.html', {

        });
      }
    }
  }
  db.push({
    id : req.body.id_input,
    pw : pw = req.body.pw_input
  });
  // db[db.length - 1].id = req.body.id_input;
  // db[db.length - 1].pw = req.body.pw_input;
  res.render('main.html', {
        title: "NO.w.HERE",
        Country: 'korea',
        Username : db[db.length - 1].id,
    });
});
app.post('/login', function(req, res){
  console.log(db)
  var id = req.body.id_input;
  var checked = false;
  for(var i=0; i<db.length; i++){
    if(id == db[i].id)
    {
      console.log('login success')
      res.render('main.html', {
            title: "NO.w.HERE",
            Country: 'korea',
            Username : db[i].id
      });
      checked = true;
    }
  }
  if(!checked)
  {
    return 0;
  }
});

var userList = [];


io.on('connection', function(socket){
  var joinedUser = false;
  var nickname;

  // 유저 입장
  socket.on('join', function(data){
    if (joinedUser) { // 이미 입장 했다면 중단
      return false;
    }

    nickname = data;
    userList.push(nickname);
    console.log(userList);
    socket.broadcast.emit('join', {
      nickname : nickname
      ,userList : userList
    });

    socket.emit('welcome', {
      nickname : nickname
      ,userList : userList
    });

    joinedUser = true;
  });


  // 메시지 전달
  socket.on('msg', function(data){

    console.log(' '+data.nickname + ' >> ' + data.opp + ' [ msg: '+data.msg+' ] ');
    io.emit('msg', {
      nickname : data.nickname
      ,msg : data.msg
      ,opp : data.opp
      ,userList : userList
    });
  });

  // 접속 종료
  socket.on('disconnect', function () {
    // 입장하지 않았다면 중단
    if ( !joinedUser) {
      console.log('--- not joinedUser left');
      return false;
    }
    // 접속자목록에서 제거
    var i = userList.indexOf(nickname);
    var tmpUserList = userList;
    userList.splice(i,1);

    socket.broadcast.emit('left', {
      nickname : nickname
      ,userList : userList
      ,tmpUserList : tmpUserList
    });
  });
});
