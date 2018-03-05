#!/usr/bin/env bash

## TARGET=./test.wifi
TARGET=/etc/wpa_supplicant/wpa_supplicant.conf

echo network=\{ >> $TARGET
echo ssid=\"$1\" >> $TARGET
echo psk=\"$2\" >> $TARGET
echo \} >> $TARGET

sudo wpa_cli -i wlan0 reconfigure
