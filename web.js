const ua = require('universal-analytics');
const express = require('express');
const expressWs = require('express-ws');
const bodyParser = require('body-parser');
const logger = require('heroku-logger');
// const cookieParser = require('cookie-parser');
const msgBuilder = require('./lib/deployMsgBuilder');

const ex = 'deployMsg';

// const http = require('http');

const mq = require('amqplib').connect(process.env.CLOUDAMQP_URL || 'amqp://localhost');

const app = express();
const wsInstance = expressWs(app);

// const router = express.Router();

app.use('/scripts', express.static(`${__dirname}/scripts`));
app.use('/dist', express.static(`${__dirname}/dist`));
app.use('/api', express.static(`${__dirname}/api`));

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());
app.set('view engine', 'ejs');
// app.use(cookieParser());

app.get('/', async (req, res) => {
  //const message = msgBuilder(req.query.template);
  // analytics
  logger.debug('+++SUNNY 1+++');
  let action = req.query.action;
  logger.debug('+++SUNNY 2+++');
  logger.debug(action);
  if(typeof action==='undefined'){
    logger.debug('+++SUNNY action==undefined +++');
    const message = await msgBuilder(process.env.GIT_REPOURL+'/tree/step0');
    const visitor = ua(process.env.UA_ID);
    logger.debug('+++SUNNY action==undefined 3 +++');
    visitor.pageview('/').send();
    console.log('web.js message = ', message);
    res.render('pages/index', { deployId:'',step:0,steps:message.steps });
  }
  else if(action=='nextstep'){
    logger.debug('+++SUNNY action==nextstep +++');
    const message = await msgBuilder(process.env.GIT_REPOURL+'/tree/step'+req.query.step);
    logger.debug('+++SUNNY action==nextstep 2 +++');
    logger.debug(req.query.step);
    res.render('pages/index', { deployId:'',step:parseInt(req.query.step),steps:message.steps });
  }
  /*else if(action=='createSO'){
    const visitor = ua(process.env.UA_ID);
    visitor.pageview('/').send();
    visitor.event('create org', {}).send();
    const message = msgBuilder(process.env.GIT_REPOURL+'/tree/step0');
    logger.debug(message);
    mq.then( (mqConn) => {
      let ok = mqConn.createChannel();
      ok = ok.then((ch) => {
        ch.assertQueue('deploys', { durable: true });
        ch.sendToQueue('deploys', new Buffer(JSON.stringify(message)));
      });
      return ok;
    }).then( () => {
      // return the deployId page
      return res.render('pages/index', { deployId: message.deployId,step:0  });
    }, (mqerr) => {
      logger.error(mqerr);
      return res.redirect('/error', {
        customError : mqerr
      });
    });
    

  }*/
  else if (action==='deploy'){
    const visitor = ua(process.env.UA_ID);
    visitor.pageview('/').send();
    visitor.event('load Data Model', {}).send();
    const message = await msgBuilder(process.env.GIT_REPOURL+'/tree/step'+req.query.step);
    console.log('web.js : deploy : query.step : ' + req.query);
    if(req.query.step>0)message.SOusername=req.query.SOusername;
    console.log('web.js : deploy : consol.log 86line : ' + message);
    mq.then( (mqConn) => {
      let ok = mqConn.createChannel();
      ok = ok.then((ch) => {
        ch.assertQueue('deploys', { durable: true });
        ch.sendToQueue('deploys', new Buffer(JSON.stringify(message)));
      });
      return ok;
    }).then( () => {
      // return the deployId page
      return res.render('pages/index', { deployId: message.deployId ,step:parseInt(req.query.step),steps:message.steps});
    }, (mqerr) => {
      logger.error(mqerr);
      return res.redirect('/error', {
        customError : mqerr
      });
    });
    
  }
});

app.get('/launch', (req, res) => {

  logger.debug('+++SUNNY launch = 1 = +++');
  const message = msgBuilder(req.query.template);
  // analytics
  logger.debug('+++SUNNY launch = 2 = +++');
  const visitor = ua(process.env.UA_ID);
  logger.debug('+++SUNNY launch = 3 = +++');
  visitor.pageview('/launch').send();
  logger.debug('+++SUNNY launch = 4 = +++');
  visitor.event('Repo', req.query.template).send();

  mq.then( (mqConn) => {
    let ok = mqConn.createChannel();
    ok = ok.then((ch) => {
      ch.assertQueue('deploys', { durable: true });
      ch.sendToQueue('deploys', new Buffer(JSON.stringify(message)));
    });
    return ok;
  }).then( () => {
    // return the deployId page
    return res.redirect(`/deploying/${message.deployId}`);
  }, (mqerr) => {
    logger.error(mqerr);
    return res.redirect('/error', {
      customError : mqerr
    });
  });
});

app.get('/sunny', (req, res) => {

  logger.debug('+++SUNNY /sunny = 1 = +++');
  let action = req.query.action;
  logger.debug('+++SUNNY /sunny = 2, query = ' + req.query.toString + '+++');
  logger.debug('+++SUNNY /sunny = 3, action = ' + action + '+++');
    console.log(message);
});

app.get('/deploying/:deployId', (req, res) => {
  // show the page with .io to subscribe to a topic
  res.render('pages/messages', { deployId: req.params.deployId });
});

app.ws('/deploying/:deployId', (ws, req) => {
    logger.debug('client connected!');
    // ws.send('welcome to the socket!');
    ws.on('close', () => logger.info('Client disconnected'));
  }
);

const port = process.env.PORT || 8443;


app.listen(port, () => {
  logger.info(`web.js : Example app listening on port ${port}!`);
});

mq.then( (mqConn) => {
  logger.debug('web.js : mq connection good');

	let ok = mqConn.createChannel();
	ok = ok.then((ch) => {
    logger.debug('web.js : channel created');
    return ch.assertExchange(ex, 'fanout', { durable: false })
    .then( (exch) => {
      logger.debug('web.js : exchange asserted');
      return ch.assertQueue('', { exclusive: true });
    }).then( (q) => {
      logger.debug('web.js : queue asserted');
      ch.bindQueue(q.queue, ex, '');
      ch.consume(q.queue, (msg) => {
        logger.debug('web.js : heard a message from the worker');
        const parsedMsg = JSON.parse(msg.content.toString());
        logger.debug(parsedMsg);
        wsInstance.getWss().clients.forEach((client) => {
          if (client.upgradeReq.url.includes(parsedMsg.deployId)) {
            client.send(msg.content.toString());
            // close connection when ALLDONE
            if (parsedMsg.content === 'ALLDONE') {
              client.close();
            }
          }
        });

        ch.ack(msg);
      }, { noAck: false });
    });
  });
  return ok;
})
.catch( (mqerr) => {
  logger.error(`MQ error ${mqerr}`);
});

