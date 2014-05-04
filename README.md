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

```bash
# Get a local copy of the repository
git clone https://github.com/glenjamin/repo-repro
cd repo-repro

# Set your app up running on a PaaS
heroku apps:create

# Configure remote repo locations
TODO

# Configure remote repo credentials
TODO

# Enable web hook on source repo
TODO

```

API
---

The web service exposes a number of endpoints, these all perform the same sync
action, but will produce the appropriate valid response for various web hook
implementations

`/` - Responds with text/plain 'OK' when done

`/github` - TODO

`/bitbucket` - TODO
