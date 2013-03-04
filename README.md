Open Web SXSW
=

This is the website for the Open Web SXSW Party in Austin, Texas.


Install
-

1. Clone repo
2. `npm i`
3. Follow the instructions in the `README.md` file in the `config` directory (for Stripe integration, handling signups and CouchDB)
4. Follow the instructions in the `README.md` file in the `invoices` directory (for handling invoices)
5. `node build`
6. `node app`
7. `open http://127.0.0.1:3100`


Contributing
-

If you want to make modifications to the client side JavaScript, work out of the `openwebsxsw.js` file.

If you want to make modifications to the CSS, modify the `.styl` files, _not_ the `.css` files.

Deploying
-

OpenWebSXSW.com is proudly hosted on [Nodejitsu](http://nodejitsu.com).


License
-

MIT, mate

Copyright(c) 2013 

Joe McCann <joe@subprint.com>