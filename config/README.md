Stripe and CouchDB Config Files
=

You will need a Stripe account to use this invoicing system.

http://stripe.com

Your `stripe-config.json` file should look like:

```
{
  "api-key-secret-test": "YOUR-KEY",
  "api-key-secret-production": "YOUR-KEY",
  "api-key-publishable-test": "YOUR-KEY",
  "api-key-publishable-production": "YOUR-KEY"
}
```

You will need a CouchDB instance as well.

http://iriscouch.com is great.

Your `couchdb-config.json` file should look like:

```
{
  "db_name": "openwebsxsw-couch",
  "db_url": "http://SOME_URL:PORT",
  "db_secure_url": "https://SOME_URL:PORT"
}
```