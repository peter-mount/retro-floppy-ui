#!/bin/bash
#
# Builds the application ready to run on a PI
#

(
  echo "Building UI"
  cd ui
  npm install && npm run build || die "Failed"
)

# Build the service
# CGO_ENABLED=0 to create a static binary
# GOOS=linux    as we run Linux ;-)
# GOARCH=arm    32 bit arm
# GOARM=6       ArmV6 for the PI0
(
  echo "Building binary"
  CGO_ENABLED=0 GOOS=linux GOARCH=arm GOARM=6 go build -o floppyui server/bin/main.go
)
