const ua = require('universal-analytics');
const express = require('express');
const expressWs = require('express-ws');
const bodyParser = require('body-parser');
const logger = require('heroku-logger');
// const cookieParser = require('cookie-parser');
const msgBuilder = require('./lib/deployMsgBuilder');

var sunnytrailhead = require('./trailhead');

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
    //console.log('web.js : deploy : consol.log 86line : ' + message);
    mq.then( (mqConn) => {
      let ok = mqConn.createChannel();
      ok = ok.then((ch) => {
        ch.assertQueue('deploys', { durable: true });
        //console.log('web.js : msg to mq : ' + JSON.stringify(message));
        //ch.sendToQueue('deploys', new Buffer(JSON.stringify(message))); deprecated
        ch.sendToQueue('deploys', Buffer.from(JSON.stringify(message)));
      });
      return ok;
    }).then( () => {
      // return the deployId page
      logger.debug('Ready to call index.ejs : deployId[' +  message.deployId + '],[step:' + parseInt(req.query.step) + '],[steps:' + message.steps + ']');
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
      //ch.sendToQueue('deploys', new Buffer(JSON.stringify(message))); deprecated
      ch.sendToQueue('deploys', Buffer.from(JSON.stringify(message)));
    });
    return ok;
  }).then( () => {
    logger.debug('web.js : /deploying/message.deployId}');
    // return the deployId page
    return res.redirect(`/deploying/${message.deployId}`);
  }, (mqerr) => {
    logger.error(mqerr);
    return res.redirect('/error', {
      customError : mqerr
    });
  });
});

app.get('/delete', (req, res) => {

  logger.debug('+++SUNNY /sunny = 1 = +++');
  let action = req.query.action;
  logger.debug('+++SUNNY /sunny = 2, query = ' + req.query.toString + '+++');
  logger.debug('+++SUNNY /sunny = 3, action = ' + action + '+++');
  logger.debug('+++SUNNY username = [' + req.query.username + ']');
  
});

app.get('/checkdashboard', (req, res) => {

  //https://sunny-deployer1.herokuapp.com/checkdashboard?action=check&username=sdlkfaj@example.com&password=aldkfjas
  logger.debug('+++SUNNY /sunny = 1 = +++');
  let action = req.query.action;
  logger.debug('+++SUNNY /sunny = 2, query = [' + req.query + ']+++');
  logger.debug('+++SUNNY /sunny = 3, action = [' + action + ']+++');
  logger.debug('+++SUNNY username = [' + req.query.username + ']+++');
  logger.debug('+++SUNNY password = [' + req.query.password + ']+++');
  // Add to separate login
  sunnytrailhead.login(req.query.username,req.query.password);
  return res.render('pages/trailhead', { username: req.query.username ,password:req.query.password});
});

app.get('/trailhead',  (req, res) => {

  //https://sunny-deployer1.herokuapp.com/trailhead?action=check&username=sdlkfaj@example.com&password=aldkfjas
  //https://sunny-deployer1.herokuapp.com/trailhead?action=checkdata&username=sdlkfaj@example.com&password=aldkfjas
  //https://sunny-deployer1.herokuapp.com/trailhead?action=checkTravelApprovalRecord&username=test-sv8vdb3tqsgz@example.com&password=Pe1ntiz]zijcs

  logger.debug('+++SUNNY /trailhead = 1 = +++');
  let action = req.query.action;
  logger.debug('+++SUNNY /trailhead = 2, query = [' + req.query + ']+++');
  logger.debug('+++SUNNY /trailhead = 3, action = [' + action + ']+++');
  logger.debug('+++SUNNY /trailhead username = [' + req.query.username + ']+++');
  logger.debug('+++SUNNY /trailhead password = [' + req.query.password + ']+++');
  //logger.debug('+++SUNNY /trailhead instanceurl = [' + req.query.instanceurl + ']+++');
  //if(action == 'checkTravelApprovalRecord' && req.query.username != null && req.query.password != null && req.query.instanceurl != null) {
  //  return sunnytrailhead.login(req.query.username,req.query.password,req.query.instanceurl,action);
  //if((action == 'checkTravelApprovalRecord' || action == 'checkDashboards' || action == 'checkReports') && req.query.username != null && req.query.password != null) {
    //return sunnytrailhead.login(req.query.username,req.query.password,action);
    // Add to separate login
    //res.send(sunnytrailhead.login(req.query.username,req.query.password,action));
  if(action == 'checkTravelApprovalRecord' && req.query.username != null && req.query.password != null) {
    logger.debug('+++ SUNNY : web.js : trailhead_checkTravelApprovalRecord');
    
      sunnytrailhead.trailhead_checkTravelApprovalRecord().then(result => res.send(result));
      //res.send({result: _result})
      //res.send(sunnytrailhead.trailhead_checkTravelApprovalRecord());
    
  } else if(action == 'checkDashboards' && req.query.username != null && req.query.password != null) {
    logger.debug('+++ SUNNY : web.js : trailhead_checkDashboards');
    res.send(sunnytrailhead.trailhead_checkDashboards());
  } else if(action == 'checkReports' && req.query.username != null && req.query.password != null) {
    logger.debug('+++ SUNNY : web.js : trailhead_checkReports');
    res.send(sunnytrailhead.trailhead_checkReports());
  }
  //return res.render('pages/trailhead', { username: req.query.username ,password:req.query.password});
});

app.get('/deploying/:deployId', (req, res) => {
  // show the page with .io to subscribe to a topic
  logger.debug('+++ SUNNY : DeployId/:deployId');
  res.render('pages/messages', { deployId: req.params.deployId });
});

app.ws('/deploying/:deployId', (ws, req) => {
    logger.debug('client connected!');
    //ws.send('welcome to the socket!');
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
        //logger.debug(parsedMsg);
        //console.log('parsed msg.content : ' + parsedMsg.content);
        wsInstance.getWss().clients.forEach((client) => {
            client.send(msg.content.toString());
            // close connection when ALLDONE
            if (parsedMsg.content === 'ALLDONE') {
              logger.debug('web.js : receive ALLDONE');
              client.close();
            }
        });

        ch.ack(msg);
      }, { noAck: false });
/*
      ch.consume(q.queue, (msg) => {
        logger.debug('web.js : heard a message from the worker');
        const parsedMsg = JSON.parse(msg.content.toString());
        //logger.debug(parsedMsg);
        console.log('parsed msg.content : ' + parsedMsg.content);
        wsInstance.getWss().clients.forEach((client) => {
          if (client.upgradeReq.url.includes(parsedMsg.deployId)) {
            client.send(msg.content.toString());
            // close connection when ALLDONE
            if (parsedMsg.content === 'ALLDONE') {
              logger.debug('web.js : receive ALLDONE');
              client.close();
            }
          }
        });

        ch.ack(msg);
      }, { noAck: false }); */
    });
  });
  return ok;
})
.catch( (mqerr) => {
  logger.error(`MQ error ${mqerr}`);
})
.catch( (error) => {
  logger.error(`general error ${error}`);
});

