const mq = require('amqplib').connect(process.env.CLOUDAMQP_URL || 'amqp://localhost');
const exec = require('child-process-promise').exec;
const fs = require('fs');
const util = require('util');
const ua = require('universal-analytics');
const lineRunner = require('./lib/lines');
const logger = require('heroku-logger');
const bufferKey = require('./lib/bufferKey');
const logResult = require('./lib/logging');
const lineParse = require('./lib/lineParse');

const setTimeoutPromise = util.promisify(setTimeout);
const ex = 'deployMsg';

logger.debug('I am a worker and I am up!');

// load helpful plugins in cloud only
let cmd='pwd';
//sfdx msm:user:password:set -p SFPL2018 -g User -l User --json
//if(process.env.DXLOGINURL)cmd='echo y | sfdx plugins:install sfdx-msm-plugin'
if(process.env.DXLOGINURL)cmd='echo y | sfdx plugins:install shane-sfdx-plugins'
exec(cmd)
// auth to the hub
.then( (result) => {
	logResult(result);
	if(process.env.DXLOGINURL){
		fs.writeFileSync('/app/tmp/devhub.key',process.env.DXLOGINURL,'utf8');
		//return exec(`sfdx force:auth:sfdxurl:store -f /app/tmp/devhub.key --setdefaultdevhubusername -a deployBotHub`);
		return exec(`sfdx force:auth:sfdxurl:store -f /app/tmp/devhub.key --set-default-dev-hub -a deployBotHub`);
	}
	else {
		return exec('pwd');
	}
})  // OK, we've got our environment prepared now.  Let's auth to our org and verify
.then( (result) => {
	if(process.env.DXLOGINURL){
		logger.debug('destroy fs key file');
		exec(`rm /app/tmp/devhub.key`);
	}
	logResult(result);
	return mq;
})
.then( (mqConn) => {
	return mqConn.createChannel();
})
.then( (ch) => {
		ch.assertQueue('deploys', { durable: true });
		ch.assertExchange(ex, 'fanout', { durable: false }, (err, ok) => {
			if (err){
				logger.error(err);
			}
			if (ok){
				logger.debug(ok);
			}
		});
		// ch.prefetch(1);

		// this consumer eats deploys, creates local folders, and chops up the tasks into steps
		ch.consume('deploys', (msg) => {
			logger.debug('worker.js : HEARD a message from the web');
			const visitor = ua(process.env.UA_ID || 0);
			// do a whole bunch of stuff here!
	
			const msgJSON = JSON.parse(msg.content.toString());
			logger.debug('worker.js : msgJSON = ' + msgJSON);
			console.log('worker.js : msgJSON = ' + msgJSON.content);
			console.log('worker.js : deployId = ' + msgJSON.deployId);
			console.log('worker.js : template = ' + msgJSON.template);
			visitor.event('Deploy Request', msgJSON.template).send();

			// clone repo into local fs
			// checkout only the specified branch, if specified
			let gitCloneCmd;
			if (msgJSON.branch){
				logger.debug('worker.js : It is a branch!');
				gitCloneCmd = `cd tmp;git clone -b ${msgJSON.branch} --single-branch https://github.com/${msgJSON.username}/${msgJSON.repo}.git ${msgJSON.deployId}`;
				logger.debug('worker.js : gitclonecmd : [' + gitCloneCmd + ']');
			} else {
				logger.debug('+++ worker.js :  +++ : It is not a branch!');
				logger.debug('+++ worker.js :  +++ : username : ' + msgJSON.username);
				logger.debug('+++ worker.js :  +++ : repo : ' + msgJSON.repo);
				logger.debug('+++ worker.js :  +++ : deployId : ' + msgJSON.deployId);
				gitCloneCmd = `cd tmp;git clone https://github.com/${msgJSON.username}/${msgJSON.repo}.git ${msgJSON.deployId}`;
			}
			exec(gitCloneCmd)
			.then( (result) => {
				// git outputs to stderr for unfathomable reasons
				logger.debug('worker.js : result.stderr : [' + result.stderr + ']');
				logger.debug('worker.js : result.stdout : [' + result.stdout + ']');
				ch.publish(ex, '', bufferKey(result.stderr, msgJSON.deployId));
				//ch.ack(msg);
				return exec(`cd tmp;cd ${msgJSON.deployId};ls`);
			})
			.then( (result) => {
				logResult(result);
				// ch.publish(ex, '', bufferKey('Cloning the repository', msgJSON.deployId));
				// ch.publish(ex, '', bufferKey(result.stdout, msgJSON.deployId));
				// grab the deploy script from the repo
				logger.debug(`worker.js : going to look in the directory tmp/${msgJSON.deployId}/orgInit.sh`);

				// use the default file if there's not one
				if (!fs.existsSync(`tmp/${msgJSON.deployId}/orgInit.sh`)) {
					const parsedLines = [];
					logger.debug('worker.js : no orgInit.sh.  Will use default');
					parsedLines.push(`cd tmp;cd ${msgJSON.deployId};sfdx force:org:create -f config/project-scratch-def.json -s -d 1`);
					parsedLines.push(`cd tmp;cd ${msgJSON.deployId};sfdx force:source:push`);
					//parsedLines.push(`cd tmp;cd ${msgJSON.deployId};sf project deploy start`);
					parsedLines.push(`cd tmp;cd ${msgJSON.deployId};sf org open`);
					//원복
					return parsedLines;
				} else { // read the lines
					logger.debug('worker.js : found a orgInit.sh');
					return lineParse(msgJSON, ch, visitor);
				}
			})
			.then( (parsedLines) => {
				logger.debug('worker.js : these are the parsed lines:');
				logger.debug('worker.js : parsedLines : ' + parsedLines);
				// some kind of error occurred, already handled
				if (!parsedLines) {
					logger.error('line parsing failed');
					ch.ack(msg);
					return;
				} else {
					logger.debug('worker.js : got back parsed lines');
					let localLineRunner = new lineRunner(msgJSON, parsedLines, ch, visitor);
					return localLineRunner.runLines();	
				}
			})
			.then( () => {
				// this is true whether we errored or not
				logger.debug('worker.js : send back to q');
				ch.publish(ex, '', bufferKey('ALLDONE', msgJSON.deployId));
				visitor.event('deploy complete', msgJSON.template).send();
				logger.debug('worker.js : deploy complete');
				ch.ack(msg);

				// clean up after a minute
				return setTimeoutPromise(1000 * 60, 'foobar');
			})
			.then(() => {
				exec(`cd tmp;rm -rf ${msgJSON.deployId}`);
			})
			.then((cleanResult) => {
				logger.debug('worker.js : cleanResult');
				logResult(cleanResult);
			})
			.catch((err) => {
				logger.error('Worker.js : Error (worker.js): ', err);
				ch.ack(msg);
				exec(`cd tmp;rm -rf ${msgJSON.deployId}`);
			});

		}, { noAck: false });
		return;
})
.catch( (reason) => {
	logger.error(reason);
});









