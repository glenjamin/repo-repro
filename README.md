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

Make a note of the URL for your new app - we'll refer to this has the
*Hook URL*.

Now you need to configure your remote source and destination repositories

```bash
heroku config:set SRC_REPO=<remote-repo-uri>
heroku config:set DEST_REPO=<remote-repo-uri>
```

Currently only HTTPS basic auth credentials are supported, include these in the
repository URI, eg. `https://user:pass@github.com/glenjamin/repo-repro`.


Now you just need to enable the web hook on the source repo

### Using GitHub as your source

 * Select `Settings` from your respository page
 * Select `Webhooks & Services` from the menu on the left
 * Hit the `Add Webhook` button
 * Enter your *Hook URL* in the `Payload URL` field
 * `Payload version` can be anything, `Secret` should be blank
 * Select `Just the push event.`
 * Ensure `Active` is ticked.
 * Hit the `Add Webhook` button.

Github will record the results of each hook on the `Webhooks & Services` page.

Activity will also be logged in the application log, see `heroku logs`. You will
see `Got request from GitHub Hookshot <hash>` when GitHub triggers the hook.

### Using BitBucket as your source

 * Select the `Administration` Cog ⚙ from your repository page.
 * Select `Hooks` from the menu on the left
 * Select `POST` from the hooks dropdown and click `Add Hook`
 * Enter your *Hook URL* in the dialog box

BitBucket does not appear to record the results of each hook.

Activity will be logged in the application log, see `heroku logs`. You will see
`Got request from Bitbucket.org` when BitBucket triggers the hook.

### Using a vanilla git repository as your source

In a `post-receive` hook, use cURL to trigger the *Hook URL*. In this scenario
you might be better off doing the mirroring in the hook itself.


How it Works
------------

On startup, the app claims a temporary directory to use as its local git repo.

 * `git clone --mirror <src-repo> <tmpdir>`

The app exposes a very simple HTTP endpoint which responds on any URL with the
same series of actions.

 * `git remote update`
 * `git push --mirror <dest-repo>`
 * Responds with 'OK'

TODO
----

 * Mercurial Support?
 * Private key based authentication
 * Multiple destinations
 * Multiple repositories in a single deploy