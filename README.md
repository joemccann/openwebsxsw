Open Web SXSW
=

This is the website for the Open Web SXSW Party in Austin, Texas.


Install
-

1. Clone repo
2. `npm i`
3. Follow the instructions in the `README.md` file in the `config` directory (for Stripe integration, handling signups and CouchDB)
4. Follow the instructions in the `README.md` file in the `invoices` directory (for handling invoices)
5. `node app`
6. `open http://127.0.0.1:3100`

Contributing
-

If you want to make modifications to the client side JavaScript, work out of the `openwebsxsw.js` file.

If you want to make modifications to the CSS, modify the `.styl` files, _not_ the `.css` files.

Deploying
-

OpenWebSXSW.com is proudly hosted on [Nodejitsu](http://nodejitsu.com).

To deploy, you need to pre-deploy, meaning, compress and concatenate your CSS and JS files.

`NODE_ENV=predeploy node app`

This will run smoosh.  Now you're ready to run in production.

`NODE_ENV=production node app` to verify...


License
-

MIT, mate

Copyright(c) 2013 

Joe McCann <joe@subprint.com>