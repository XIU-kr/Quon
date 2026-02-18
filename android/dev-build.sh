#!/usr/bin/env bash
set -euo pipefail

JDK17="/c/Program Files/Java/jdk-17"

if [ -d "$JDK17" ]; then
  export JAVA_HOME="$JDK17"
  export PATH="$JAVA_HOME/bin:$PATH"
fi

echo "Using JAVA_HOME=${JAVA_HOME:-<not-set>}"

./gradlew assembleDebug "$@"
