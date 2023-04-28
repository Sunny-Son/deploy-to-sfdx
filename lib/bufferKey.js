module.exports = function bufferKey(content, deployId) {
	const message = {
		deployId,
		content
	};
	//return new Buffer(JSON.stringify(message)); deprecated
	return Buffer.from(JSON.stringify(message)); 
};