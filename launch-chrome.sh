#!/bin/bash

"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --disable-background-timer-throttling \
  --disable-renderer-backgrounding \
  --disable-backgrounding-occluded-windows \
  --disable-features=CalculateNativeWinOcclusion \
  --kiosk \
  http://localhost:8080/
