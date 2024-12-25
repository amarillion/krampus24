#!/bin/bash -e

# First build the project, this brings the dist folder up-to-date
npm run lint
npm test -- run
npm run build

# test using `http-server .
#  open http://localhost:8080/dist`

# Switch to gh-pages branch
git checkout gh-pages

## Remove previous version
# rm -r docs

# Remove previous version but keep README.txt
find docs ! -name 'README.txt' -type f -exec rm -f {} +

# move our dist folder to the github standard docs folder
mv dist docs
git add docs
git commit -m "Update gh-pages with latest version"

git push origin gh-pages

# Switch back
git checkout main
