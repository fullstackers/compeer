[![Build Status](https://travis-ci.org/turbonetix/compeer.svg?branch=master)](https://travis-ci.org/turbonetix/compeer)
[![NPM version](https://badge.fury.io/js/compeer.svg)](http://badge.fury.io/js/compeer)
[![David DM](https://david-dm.org/turbonetix/compeer.png)](https://david-dm.org/turbonetix/compeer.png)

(WIP) Alpha

Please come check out the project on github.  The development will be fast.

An auto-discoverable, peer to peer, publish, and subscribe system.

    $ npm install compeer -g
    $ compeer

# Features

* Peer to Peer network.
* Auto discover of peers.
* Publish and Subscribe

# Installation and Environment Setup

Install node.js (See download and install instructions here: http://nodejs.org/).

Clone this repository

    > git clone git@github.com:turbonetix/compeer.git

cd into the directory and install the dependencies

    > cd compeer
    > npm install && npm shrinkwrap --dev

# Running Tests

Install coffee-script

    > npm install coffee-script -g

Tests are run using grunt.  You must first globally install the grunt-cli with npm.

    > sudo npm install -g grunt-cli

## Unit Tests

To run the tests, just run grunt

    > grunt spec

## TODO
