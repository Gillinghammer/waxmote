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

  socket.on('create room', function () {
    room = count
    rooms.push(room)
    socket.join(room);
    console.log('joined room # ', room)
  });

  socket.on('find desktop', function(room) {
    socket.join(room)
    console.log("joined same room as desktop")
  });

  socket.on("ping-server", function(room) {
    io.sockets.in(room).emit("message", "hello");
    console.log("pinging desktop at room number: ", room)
  })

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