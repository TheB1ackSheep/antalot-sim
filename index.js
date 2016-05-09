var mqtt    = require('mqtt'),
    fs      = require('fs'),
    cluster = require('cluster'),
    i       = require('./log.js');
    
if (cluster.isMaster) {
  // Fork workers
  for(var i=0; i<50; i++){
    cluster.fork();
  }
  
  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
  
}else{
  
  /* MQTT OPTIONS */

  var KEY   = fs.readFileSync('./ssl/privkey.pem');
  var CERT  = fs.readFileSync('./ssl/cert.pem');
  var TRUSTED_CA_LIST = fs.readFileSync('./ssl/chain-ca.pem');

  var HOST  = 'antalot.com'
  var PORT  = 8883;

  var options = {
    protocol: 'mqtts',
    port: PORT,
    host: HOST,
    keyPath: KEY,
    certPath: CERT,
    rejectUnauthorized: true,
    CA: TRUSTED_CA_LIST
  };

  var client  = mqtt.connect(options);

  client.on('connect', function () {
    client.subscribe('presence');
    setInterval(() => {
      client.publish('presence', 'Hello mqtt');  
    }, 1000);    
  });

  client.on('message', function (topic, message) {
    // message is Buffer
    console.log(message.toString());
    client.end();
  });

}     
