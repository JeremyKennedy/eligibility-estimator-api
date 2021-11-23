#!/usr/bin/env sh

# ensure operating in swagger-ui folder
test "$(basename "$PWD")" == "swagger-ui"

# clear current installation
echo "Deleting installed files..."
rm -rf "./dist/"
rm "../index.html"

# find latest version
echo "Checking latest version..."
ver="$(curl -s "https://github.com/swagger-api/swagger-ui/releases/latest" | grep -Po "\d[\d\.]*\d")"
echo "Found $ver."

# get the file
echo "Downloading..."
curl -Ls -O "https://github.com/swagger-api/swagger-ui/archive/refs/tags/v$ver.zip"
echo "Downloaded."

# unpack
echo "Unpacking..."
unzip -j -o "v$ver.zip" "swagger-ui-$ver/dist/*" -x "**.map" -d "dist"
echo "Unpacked."

# delete temp file
rm "v$ver.zip"
echo "Zip deleted."

# move index to root
mv "dist/index.html" ".."

# update data in index.html
sed -i "s|https://petstore.swagger.io/v2/swagger.json|openapi.yaml|g" "../index.html"
sed -i "s|\./|swagger-ui/dist/|g" "../index.html"
echo "index.html updated."

# print installed version to file
echo "$ver" > "SWAGGER_UI_VERSION"

# done
echo "Done! Successfully installed v$ver."
