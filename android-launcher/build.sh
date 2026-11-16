#!/usr/bin/env bash
# Builds KettleHell.apk with plain Android SDK tools (no Gradle).
set -euo pipefail
cd "$(dirname "$0")"
BT="$ANDROID_HOME/build-tools/34.0.0"
JAR="$ANDROID_HOME/platforms/android-34/android.jar"
rm -rf build && mkdir -p build/classes build/dex
"$BT/aapt2" compile --dir res -o build/res.zip
"$BT/aapt2" link -o build/base.apk -I "$JAR" --manifest AndroidManifest.xml \
  --min-sdk-version 24 --target-sdk-version 34 --version-code 1 --version-name 1.0 build/res.zip
javac --release 11 -classpath "$JAR" -d build/classes $(find src -name '*.java')
"$BT/d8" --release --min-api 24 --lib "$JAR" --output build/dex $(find build/classes -name '*.class')
(cd build/dex && zip -q ../base.apk classes.dex)
"$BT/zipalign" -p -f 4 build/base.apk build/aligned.apk
"$BT/apksigner" sign --ks launcher.keystore --ks-pass pass:kettlehell --ks-key-alias kh \
  --out build/KettleHell.apk build/aligned.apk
"$BT/apksigner" verify --print-certs build/KettleHell.apk
