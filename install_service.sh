#!/bin/bash

sudo cp ./bot.service /lib/systemd/system/
sudo systemctl daemon-reload
sudo systemctl restart bot

