#!/usr/bin/env bash

# Copyright 2022 Chainguard, Inc.
# SPDX-License-Identifier: Apache-2.0

set -o errexit
set -o nounset
set -o pipefail

# Relocate to the root so that this script can be run from anywhere
cd "$(dirname "$0")"/..

# Validate dependencies
validate_deps() {
	echo ">> Validating dependencies ..."

	quicktype --version >/dev/null || { echo "install quicktype: https://github.com/quicktype/quicktype#installation"; exit 1; }
}

generate_types() {
	PLUGGABLE_TYPES=(
		"HashedRekord:v0.0.1"
		"Alpine:v0.0.1"
		"Helm:v0.0.1"
		"intoto:v0.0.1"
		"JAR:v0.0.1"
		"Rekord:v0.0.1"
		"RFC3161:v0.0.1"
		"RPM:v0.0.1"
		"TUF:v0.0.1"
	)
	DIR="src/modules/api/generated/types"

	echo ">> Generating pluggable types ..."
	mkdir -p "${DIR}"
	for TYPE in "${PLUGGABLE_TYPES[@]}" ; do
			NAME=${TYPE%%:*}
			VERSION=${TYPE#*:}
			echo "... ${NAME} @ ${VERSION}"
			quicktype --lang ts --src-lang schema --top-level "${NAME}" "https://raw.githubusercontent.com/sigstore/rekor/main/pkg/types/${NAME,,}/${VERSION}/${NAME,,}_${VERSION//\./_}_schema.json" --out "src/modules/api/generated/types/${NAME,,}.ts"
	done
}

generate_api() {
	yarn openapi --input "https://raw.githubusercontent.com/sigstore/rekor/main/openapi.yaml" --output "src/modules/api/generated"
	sed -i "" "s/http/https/" "src/modules/api/generated/core/OpenAPI.ts"
}

validate_deps
generate_api
generate_types
