#!/usr/bin/env bash
 
sudo apt-get install npm
sudo apt-get install git
sudo apt-get install g++
sudo apt-get install libasound2-dev
sudo apt-get install libgconf-2-4
 
cd Desktop
git clone https://github.com/agohorel/aleph.git
cd aleph
npm run init_nix