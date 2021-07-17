let services = ['DisplayServer', 'FileServer', 'ProcessServer'];

for (let name of services) {
  let service = require('./services/' + name);
  service.start();
}
