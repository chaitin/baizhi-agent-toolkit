# Security

Do not post credentials or private tool inputs in public issues. Revoke an exposed Baizhi Cloud API key in the service console immediately, create a replacement with minimal permissions, and remove the old value from your client.

For private service security or account concerns, use the support channel linked from the Baizhi Cloud console. For non-sensitive bugs in these integration manifests, use this repository's issues with redacted evidence.

Store credentials in the client's supported secret store or private user configuration. Do not commit a populated project configuration. Secret-field metadata requests secure handling by clients; it does not guarantee that every downstream client encrypts its configuration.

Keep tool approval enabled. Review the data sent and the possibility of service charges. Enable sandbox/code execution or other higher-impact tools only deliberately, with an appropriately scoped API key.

Publishing workflows use short-lived GitHub OIDC credentials. They do not require a Baizhi Cloud key or a stored GitHub personal access token. No live paid tool calls are run in public CI.
