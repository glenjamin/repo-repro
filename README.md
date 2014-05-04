Repo Repro
==========

Reproduce a repository at another location, triggered by HTTP.

This app is intended to be deployed to Heroku (or a similar PaaS), and act as
the endpoint for an HTTP-based post-receive hook. It will then perform whatever
sync action has been configured.

Initially we will aim for one repository per deployment, with one source and
one destination. In the future this could be expanded to multiple repositories
and multiple destinations from a single source.

Setup
-----

Get a local copy of the repo-repro repository

```bash
git clone https://github.com/glenjamin/repo-repro
cd repo-repro
```

Set the application up on a public-facing PaaS, We'll use heroku,
adapt as necessary if you're using something else.

```bash
heroku apps:create
git push heroku
```

Configure your remote source and destination repositories

```bash
heroku config:set SRC_REPO=<remote-repo-uri>
heroku config:set DEST_REPO=<remote-repo-uri>
```

Currently only HTTPS basic auth credentials are supported, include these in the
repository URI, eg. `https://user:pass@github.com/glenjamin/repo-repro`.


Enable the web hook on the source repo
```
# TODO
```

API
---

The web service exposes a number of endpoints, these all perform the same sync
action, but will produce the appropriate valid response for various web hook
implementations

`/` - Responds with text/plain 'OK' when done

`/github` - TODO


TODO
----

 * Private key based authentication
 * Multiple destinations
 * Multiple repositories in a single deploy