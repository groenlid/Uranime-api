TODO
==

* Authentication (probably http://passportjs.org/)

* Chat (probably http://socket.io/)

* Make the new urani.me have a sync options, which syncs anime between servers efficiently.

Dependencies
===

* A certificate (see below for instructions on how to create a self-signed one)
* mongodb

Create self-signed certificates
===

```sh
cd certs
openssl genrsa -out 127.0.0.1.key 2048
openssl req -new -x509 -key 127.0.0.1.key -out 127.0.0.1.cert -days 3650 -subj /CN=127.0.0.1
```

// password testtest
