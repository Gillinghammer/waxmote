var http = require('http')
  , express = require('express')
  , app = express()
  , server = http.createServer(app)
  , io = require('socket.io')(server)

app.engine('jade', require('jade').__express) //__
app.set('view engine', 'jade')

app.use(express.static('views'));
app.use(express.static('public'));
app.use(express.static('app/assets/components/'));

var port = process.env.PORT || 3000;

app.get('/', function (req, res) {
  res.render('desktop')
})

app.get('/mobile', function (req, res) {
  res.render('mobile')
})

var count = 0
var messages = [];
var rooms = [];
io.on('connection', function (socket) {
  count++
  var random = Math.floor(Math.random()*900) + 100;

  socket.emit("assign room", random)
  socket.on('create room', function () {
    room = random
    rooms.push(room)
    socket.join(room);
    console.log('joined room # ', room)
  });

  socket.on('find desktop', function(room) {
    socket.join(room)
    console.log("joined same room as desktop")
  });

  socket.on("mobile-sync", function(room) {
    socket.join(room)
    io.sockets.in(room).emit("desktop-sync");
    console.log("syncing to room number: ", room)
  })

  socket.on('start', function(syncid) {
    io.sockets.in(syncid).emit("play");
  })

  socket.on('pause', function() {
    io.emit('pause')
  })

  socket.on('skip', function() {
    io.emit('seekForward')
  })

  socket.on('rewind', function() {
    io.emit('seekBackward')
  })

  socket.on('tag-clicked', function(dataArray) {
    console.log("d: ", dataArray[0])
    console.log(dataArray[1].customNameRef)
    switch(dataArray[1].customNameRef) {
        case "suit":
            io.sockets.in(dataArray[0]).emit('suit-overlay', dataArray[0])
            break;
        case "promo":
            io.sockets.in(dataArray[0]).emit('promo-overlay', dataArray[0])
            break;
        case "share":
            io.sockets.in(dataArray[0]).emit('share-overlay', dataArray[0])
            break;
        default:
            io.sockets.in(dataArray[0]).emit('share-overlay', dataArray[0])
    }
  });

  socket.on('disconnect', function() {
    console.log("user " + count + " has disconnected")
    count--
    // clients.splice(clients.indexOf(socket.id), 1);
    io.emit('news', { msg: 'Someone went home', count: count, id: socket.id })
  })
})

server.listen(port, function() {
  console.log('Listening on port ' + port + '...')
})