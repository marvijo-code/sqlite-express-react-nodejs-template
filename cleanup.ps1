git reset --hard fresh
git clean -fd
Get-ChildItem -Path . -Filter ".aider.*" -Recurse | Remove-Item -Force -Recurse
