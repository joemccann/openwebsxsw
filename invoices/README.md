Invoices
=

This folder contains a flat file of invoice numbers and subsequent amounts due.

The `invoices-config.json` file should look like:

`amount` is in pennies just like Stripe

```
{
  "0066":{
    "amount": 350000,
    "customer": "Foo",
    "status": "Unpaid",
    "email": "foo@foo.com",
    "name": "Sponsorship Invoice -- Foo",
    "description": "Open Web SXSW 2013"
  },
  "0067":{
    "amount": 515000,
    "customer": "Bar",
    "status": "Unpaid",
    "email": "bar@bar.com",
    "name": "Sponsorship Invoice -- Bar",
    "description": "Open Web SXSW 2013"
  }
}
```