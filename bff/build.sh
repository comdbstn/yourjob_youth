#!/bin/bash

export GOOGLE_CLIENT_ID=1007615852085-4jvud33esbcpkud1slis1tc0m5po8ms5.apps.googleusercontent.com
export GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET:-your-google-client-secret}
export GOOGLE_REDIRECT_URI=http://192.168.100.101:8081/api/v1/auth/callback
export backend_url="http://192.168.100.101:8082"
export firebase_enabled="false"

echo "GOOGLE_CLIENT_ID: $GOOGLE_CLIENT_ID"
echo "GOOGLE_REDIRECT_URI: $GOOGLE_REDIRECT_URI"
echo "Backend URL: $backend_url"
echo "Firebase Enabled: $firebase_enabled"

./gradlew clean build --refresh-dependencies

