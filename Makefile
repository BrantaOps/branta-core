windows:
	ng build --base-href ./
	npm run build
	npm run package
	dotnet build installers/windows/Branta.Wix --configuration Release --arch win-64

install-deb:
	sudo dpkg -i out/make/deb/x64/branta_0.3.0_amd64.deb

remove-deb:
	sudo dpkg -r branta

snap:
	snap remove branta
	npm run snap
	snap install dist/branta_0.3.0_amd64.snap --dangerous
