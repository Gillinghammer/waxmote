var http = require('http')
  , express = require('express')
  , app = express()
  , server = http.createServer(app)
  , io = require('socket.io')(server)

app.engine('jade', require('jade').__express) //__
app.set('view engine', 'jade')

app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/assets/components/'));

app.get('/', function (req, res) {
  res.render('desktop')
})

app.get('/mobile', function (req, res) {
  res.render('mobile')
})

var count = 0
var messages = [];
var clients = {};
io.on('connection', function (socket) {
  count++
  io.emit("news", { msg: 'Someone arrived', count: count, id: socket.id })
  clients[socket.id] = socket.id

  socket.on('start', function() {
    io.emit('play')
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

  socket.on('tag-clicked', function(data) {
    console.log(data.customNameRef)
    switch(data.customNameRef) {
        case "suit":
            io.emit('suit-overlay', data)
            break;
        case "promo":
            io.emit('promo-overlay', data)
            break;
        case "share":
            io.emit('share-overlay', data)
            break;
        default:
            io.emit('share-overlay', data)
    }
  });

  socket.on("createRoom", function(roomName) {
    var hq = io.of('/hq')
    console.log(hq)
  })

  socket.on('disconnect', function() {
    console.log("user " + count + " has disconnected")
    count--
    // clients.splice(clients.indexOf(socket.id), 1);
    io.emit('news', { msg: 'Someone went home', count: count, id: socket.id })
  })
})

server.listen(3000, function() {
  console.log('Listening on port 3000...')
})