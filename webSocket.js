const WebSocketServer = require('ws');
const config = require('./config');
const models = require('./models');

// подключённые клиенты
const clients = {};

const webSocketServer = new WebSocketServer.Server({
  port: +config.PORT + 1
}, () => console.log(`ws listen ${+config.PORT + 1}`));

webSocketServer.on('connection', (ws) => {

  const id = Math.random();
  clients[id] = ws;
  //console.log("новое соединение " + id);

  ws.on('message', async (data) => {
    console.log(data);
    data = JSON.parse(data);
    const userId = data.userId;
    console.log(userId);

    const user = await models.User.findById(userId);
    const login = user.login;

    if (!userId) {
      displayToClients({
        ok: false
      });
    } else {

      const post = data.post;
      const body = data.body;
      const parent = data.parent;

      if (!body) {
        displayToClients({
          ok: false,
          error: 'Пустой комментарий'
        });
        return;
      }
      try {
        if (!parent) {
          await models.Comment.create({
            post,
            body,
            owner: userId
          });
          displayToClients({
            ok: true,
            body,
            login
          })
        } else {
          const parentComment = await models.Comment.findById(parent);
          if (!parentComment) {
            displayToClients({
              ok: false
            });
          }
          const comment = await models.Comment.create({
            post,
            body,
            parent,
            owner: userId
          });

          const children = parentComment.children;
          children.push(comment.id);
          parentComment.children = children;
          await parentComment.save();
          displayToClients({
            ok: true,
            body,
            login
          })
        }
      } catch (error) {
        displayToClients({
          ok: false
        });
      }
    }
  });

  ws.on('close', () => {
    //console.log('соединение закрыто ' + id);
    delete clients[id];
  });


});

function displayToClients(data) {
    for (let key in clients) {
      clients[key].send(JSON.stringify(data));
  }
}

module.exports = webSocketServer;