### `*__*`
для исползования приложения нужен установленный Redis с стандартными настройками.

для старта приложения нужно из корня приложения выполнить команды в данном порядке.

npm i

cd socket-server

socketPort=8888 node index.js &

socketPort=9999 node index.js &

socketPort=9988 node index.js &

socketPort=8899 node index.js &

cd ..

cd queue-server

serverPort=9000 socketPort=8888 socketPort1=9999 socketPort2=9988 socketPort3=8899 node index.js &

cd ..

npm start
