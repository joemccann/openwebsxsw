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

You will need a CouchDB instance as well. Make sure you shut down the admin party when you create your CouchDB instance.

http://iriscouch.com is great.

Your `couchdb-config.json` file should look like:

```
{
  "db_name": "YOUR_DB_NAME",
  "db_url": "SOME_URL:PORT",
  "db_secure_url": "SOME_URL:PORT",
  "username": "YOUR_USERNAME",
  "password": "YOUR_PASSWORD"
}
```