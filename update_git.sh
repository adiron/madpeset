#!/usr/bin/env bash
cd ~/madpeset/
sudo systemctl stop bot
git pull
sudo systemctl start bot
