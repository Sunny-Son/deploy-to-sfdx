const ua = require('universal-analytics');
const express = require('express');
const expressWs = require('express-ws');
const bodyParser = require('body-parser');
const logger = require('heroku-logger');
// const cookieParser = require('cookie-parser');
const msgBuilder = require('./lib/deployMsgBuilder');

var sunnytrailhead = require('./trailhead');
var qs = require('querystring');

const { v4: uuidv4 } = require('uuid');

var _global_uuid;

var response_good  = {
  status : 200,
  ok : true,
  redirected : false,
  successmsg : null,
};

var response_bad  = {
  status : 503,
  ok : false,
  redirected : false,
  errormsg : null,
};

const ex = 'deployMsg';

//const mq = require('amqplib').connect(process.env.CLOUDAMQP_URL || 'amqp://localhost');

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
    //console.log('web.js message = ', message);
    res.render('pages/index', { deployId:'',step:0,steps:message.steps });
  }
  else if(action=='nextstep'){
    logger.debug('+++SUNNY action==nextstep +++');
    const message = await msgBuilder(process.env.GIT_REPOURL+'/tree/step'+req.query.step);
    logger.debug('+++SUNNY action==nextstep 2 +++');
    logger.debug(req.query.step);
    res.render('pages/index', { deployId:'',step:parseInt(req.query.step),steps:message.steps });
  }
});

app.get('/checkdashboard', (req, res) => {

  //https://sunny-deployer1.herokuapp.com/checkdashboard?action=check&username=sdlkfaj@example.com&password=aldkfjas
  logger.debug('+++ SUNNY /checkdashboard +++');
  let action = req.query.action;
  let _chk_username = qs.unescape(req.query.username);
  let _chk_password = qs.unescape(req.query.password);
  //logger.debug('+++SUNNY /sunny = 2, query = [' + req.query + ']+++');
  //logger.debug('+++SUNNY /sunny = 3, action = [' + action + ']+++');
  //logger.debug('+++SUNNY username = [' + _chk_username + ']+++');
  //logger.debug('+++SUNNY password = [' + _chk_password + ']+++');
  // Add to separate login
  //sunnytrailhead.login(_chk_username,_chk_password);
  //login(req.query.username,req.query.password);
  return res.render('pages/trailhead', { username: req.query.username ,password:req.query.password});
});

app.get('/trailhead', async (req, res) => {
  //logger.debug('+++SUNNY /trailhead = 1 = +++');
  let action = req.query.action;
  //logger.debug('+++SUNNY /trailhead = 2, query = [' + req.query + ']+++');
  logger.debug('+++ /trailhead, action = [' + action + ']+++');
  let _chk_username = qs.unescape(req.query.username);
  let _chk_password = qs.unescape(req.query.password);
  //var _res_id = await sunnytrailhead.login(_chk_username,_chk_password);


  if(action == 'checkTravelApprovalRecord') {
    logger.debug('+++ SUNNY : web.js : trailhead_checkTravelApprovalRecord');
    
    try {
      const result = await sunnytrailhead.trailhead_checkTravelApprovalRecord(_chk_username, _chk_password);
      //logger.debug('result : [' + result +']');
      console.log(result);
      await res.status(200).send(result);
    } catch (e) {
      console.log(e);
      res.sendStatus(503);
    }
  }
  else if(action == 'checkDashboards') {
    logger.debug('+++ SUNNY : web.js : trailhead_checkDashboards');
    try {
      const result = await sunnytrailhead.trailhead_checkDashboards(_chk_username, _chk_password);
      //logger.debug('result : [' + result +']');
      console.log(result);
      await res.status(200).send(result);
    } catch (e) {
      console.log(e);
      res.sendStatus(503);
    }
    //res.send(sunnytrailhead.trailhead_checkDashboards());
  } else if(action == 'checkReports') {
    logger.debug('+++ SUNNY : web.js : trailhead_checkReports');
    try {
      const result = await sunnytrailhead.trailhead_checkReports(_chk_username, _chk_password);
      //logger.debug('result : [' + result +']');
      console.log(result);
      await res.status(200).send(result);
    } catch (e) {
      console.log(e);
      res.sendStatus(503);
    }
    //res.send(sunnytrailhead.trailhead_checkReports());
  } else if(action == 'checkField') {
    logger.debug('+++ SUNNY : web.js : trailhead_checkField');
    try {
      const result = await sunnytrailhead.trailhead_checkField(_chk_username, _chk_password);
      //logger.debug('result : [' + result +']');
      console.log(result);
      await res.status(200).send(result);
    } catch (e) {
      console.log(e);
      res.sendStatus(503);
    }
    //res.send(sunnytrailhead.trailhead_checkReports());
  }
  //return res.render('pages/trailhead', { username: req.query.username ,password:req.query.password});
});

const port = process.env.PORT || 8443;


app.listen(port, () => {
  logger.info(`web.js : Example app listening on port ${port}!`);
});
