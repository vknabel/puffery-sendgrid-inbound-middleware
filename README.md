# puffery-sendgrid-inbound-middleware

A helper middleware as Vapor cannot parse the body of Sendgrid's inbound email hooks.

## Configuration

| Env                      | Value                                          |
| ------------------------ | ---------------------------------------------- |
| `PUFFERY_NOTIFY_ADDRESS` | The URL to post the converted request body to. |

## License

Puffery is available under the [MIT](./LICENSE) license.
